import 'reflect-metadata';
import { injectable } from 'inversify';
import WebsocketConnection, { Events } from '../WebsocketConnection';
import { RootStore } from 'context';
import IIdeConnection from 'connections/IDE/IIDEConnection';
import ComponentInstance from 'entities/mst/ComponentInstance';
import PageInstance from 'entities/mst/PageInstance';
import WebSite from 'entities/mst/WebSite';
import Reactor from 'utils/Reactor';
import { generateId } from 'utils/StringUtils';
import { BrowserMessageTypes } from './BrowserMessageTypes';
import { IDEMessageTypes } from './IDEMessageTypes';

export const EventTypes = {
    ProjectDataReceived: 'project-data-received',
    ProjectUpdated: 'project-updated',
    ProjectOpened: 'project-opened',
    ProjectClosed: 'project-closed',
    WebsiteUpdated: 'website-updated',
};

const RESPONSE_SUFFIX = 'Response';
class AsyncRequestInfo {
    responseType: string;
    id: string;
    promise: Promise<object>;
    resolve;
    reject;

    constructor(requestType: string, id: string) {
        this.responseType = requestType + RESPONSE_SUFFIX;
        this.id = id;
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}

@injectable()
export default class VSConnection implements IIdeConnection {
    connection: WebsocketConnection;
    type = 'VS';
    asyncRequests: AsyncRequestInfo[] = [];
    reactor: Reactor;

    constructor() {
        this.connection = new WebsocketConnection(1804);
        this.connection.addListener(Events.onopen, this.onSocketOpened.bind(this));
        this.connection.addListener(Events.onclosed, this.onSocketClosed.bind(this));
        this.connection.addListener(Events.onmessage, this.onMessage.bind(this));
        this.reactor = new Reactor();
        this.reactor.registerEvent(EventTypes.ProjectDataReceived);
        this.reactor.registerEvent(EventTypes.ProjectUpdated);
        this.reactor.registerEvent(EventTypes.ProjectOpened);
        this.reactor.registerEvent(EventTypes.ProjectClosed);
        this.reactor.registerEvent(EventTypes.WebsiteUpdated);
    }

    saveAsyncRequest(type: string, id: string) {
        const requestInfo = new AsyncRequestInfo(type, id);
        this.asyncRequests.push(requestInfo);
        return requestInfo;
    }

    send(type: string, data: any) {
        this.connection.send({
            type,
            data,
        });
    }

    sendAsync(type: string, data: any) {
        const asyncId = generateId();
        this.connection.send({
            type,
            data,
            asyncId,
        });
        return this.saveAsyncRequest(type, asyncId).promise;
    }

    openFileForClass(projectName: string, fullClassName: string) {
        this.send(BrowserMessageTypes.OpenFile, {
            projectName,
            fullClassName,
        });
    }

    createComponentType(projectName: string, name: string, parentType: string, baseType: string | null) {
        this.send(BrowserMessageTypes.CreateComponentType, {
            projectName,
            name: name,
            parentType: parentType,
            baseType: baseType,
        });
    }

    updateComponentInstance(projectName: string, componentInstance: ComponentInstance) {
        this.send(BrowserMessageTypes.UpdateComponentInstance, {
            projectName,
            componentInstance,
        });
    }

    addComponentInstance(projectName: string, componentInstance: ComponentInstance) {
        this.send(BrowserMessageTypes.AddComponentInstance, {
            projectName,
            componentInstance,
        });
    }

    deleteComponentInstance(projectName: string, componentInstance: ComponentInstance) {
        this.send(BrowserMessageTypes.DeleteComponentInstance, {
            projectName,
            componentInstance,
        });
    }

    updateWebSite(projectName: string, webSite: WebSite) {
        this.send(BrowserMessageTypes.UpdateWebsite, {
            projectName,
            webSite,
        });
    }

    updatePageInstance(projectName: string, pageInstance: PageInstance) {
        this.send(BrowserMessageTypes.UpdatePageInstance, {
            projectName,
            pageInstance,
        });
    }

    requestProjects() {
        this.send(BrowserMessageTypes.GetProjectNames, null);
    }

    requestProjectData(projectName: string) {
        this.send(BrowserMessageTypes.GetProject, { projectName });
    }

    async createWebsite(projectName: string, name: string, baseUrl: string): Promise<object> {
        return this.sendAsync(BrowserMessageTypes.CreateWebsite, {
            projectName,
            name: name,
            baseUrl: baseUrl,
        });
    }

    async matchUrl(projectName: string, url: string): Promise<object> {
        return this.sendAsync(BrowserMessageTypes.MatchUrl, {
            projectName,
            url,
        });
    }

    async createPageType(
        projectName: string,
        name: string,
        website: string,
        baseType: string | null,
        absoluteUrl: string,
    ): Promise<object> {
        return this.sendAsync(BrowserMessageTypes.CreatePageType, {
            projectName,
            name: name,
            baseType: baseType,
            website: website,
            absoluteUrl: absoluteUrl,
        });
    }

    onSocketOpened() {
        // TODO: move to service
        RootStore.uiStore.addIdeConnection(this.type);
        this.requestProjects();
    }

    onSocketClosed() {
        // TODO: move to service
        RootStore.uiStore.removeIdeConnection(this.type);
    }

    onProjectsReceived(projectsList) {
        // TODO: move to service
        RootStore.uiStore.setProjectsList(this.type, projectsList);
    }

    handleErrors(message) {
        if (message.Error) {
            RootStore.uiStore.showNotification(null, message.Error, true);
            setTimeout(function () {
                RootStore.uiStore.hideNotification();
            }, 5000);
        }
    }

    handleResponses(message) {
        if (!message.asyncId) {
            return;
        }
        const request = this.asyncRequests.find((r) => r.id === message.asyncId);
        if (request) {
            if (message.isSuccessful) {
                request.resolve(message.data);
            } else {
                request.reject();
            }
        } else {
            console.error(`Request with asyncId ${message.asyncId} was not found.`);
        }
        return true;
    }

    onMessage(message) {
        if (message.Type.endsWith(RESPONSE_SUFFIX)) {
            this.handleErrors(message);
            this.handleResponses(message);
        }

        switch (message.Type) {
            case IDEMessageTypes.ProjectNames:
                this.onProjectsReceived(message.Data);
                break;
            case IDEMessageTypes.Project:
                this.reactor.dispatchEvent(EventTypes.ProjectDataReceived, this.type, message.Data);
                break;
            case IDEMessageTypes.OpenFile:
                console.log('page is opened:', message.className);
                // return this.props.onSelectedPageChange(null, message.className);
                break;
            case IDEMessageTypes.UrlMatchResponse:
                console.log('url match response:', message);
                break;
            case 'update-component':
                RootStore.projectStore.updateComponentType(message.componentType);
                return;
            case 'update-page':
                RootStore.projectStore.updatePageType(message.pageType);
                return;
            case 'update-website':
                this.reactor.dispatchEvent(EventTypes.WebsiteUpdated, message.website);
                return;
            case 'update-project':
                this.reactor.dispatchEvent(EventTypes.ProjectUpdated, message.project);
                return;
            case 'project-opened':
                RootStore.uiStore.addProject(this.type, message.projectName);
                return;
            case 'project-closed':
                RootStore.uiStore.removeProject(this.type, message.projectName);
                return;
            default:
                console.log('unknown message type, ignored: ', message);
                return;
        }
    }

    addListener(messageType: string, listener: Function) {
        this.reactor.addEventListener(messageType, listener);
    }
}
