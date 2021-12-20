import 'reflect-metadata';
import { injectable } from 'inversify';
import WebsocketConnection, { Events } from '../WebsocketConnection';
import { RootStore } from 'context';
import IIdeConnection from 'connections/IDE/IIdeConnection';
import ComponentInstance from 'entities/mst/ComponentInstance';
import PageInstance from 'entities/mst/PageInstance';
import WebSite from 'entities/mst/WebSite';
import Reactor from 'utils/Reactor';
import { generateId } from 'utils/StringUtils';

export const MessageTypes = {
    ProjectDataReceived: 'project-data-received',
    ProjectUpdated: 'project-updated',
    WebsiteUpdated: 'website-updated',
};

const RESPONSE_SUFFIX = '-response';
class AsyncRequestInfo {
    responseType: string;
    id: string;
    promise: Promise<void>;
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

    completeSuccessfully() {
        this.resolve();
    }

    completeWithFailure() {
        this.reject();
    }
}

@injectable()
export default class IDEAConnection implements IIdeConnection {
    connection: WebsocketConnection;
    type = 'IDEA';
    reactor: Reactor;
    asyncRequests: AsyncRequestInfo[] = [];

    constructor() {
        this.connection = new WebsocketConnection(1804);
        this.connection.addListener(Events.onopen, this.onSocketOpened.bind(this));
        this.connection.addListener(Events.onclosed, this.onSocketClosed.bind(this));
        this.connection.addListener(Events.onmessage, this.onMessage.bind(this));
        this.reactor = new Reactor();
        this.reactor.registerEvent(MessageTypes.ProjectDataReceived);
        this.reactor.registerEvent(MessageTypes.ProjectUpdated);
        this.reactor.registerEvent(MessageTypes.WebsiteUpdated);
    }

    saveAsyncRequest(type: string, id: string) {
        const requestInfo = new AsyncRequestInfo(type, id);
        this.asyncRequests.push(requestInfo);
        return requestInfo;
    }

    async createPageType(
        projectName: string,
        name: string,
        website: string,
        baseType: string | null,
        absoluteUrl: string,
    ): Promise<void> {
        const message = {
            type: 'create-page-type',
            asyncId: generateId(),
            projectName,
            name: name,
            baseType: baseType,
            website: website,
            absoluteUrl: absoluteUrl,
        };
        this.connection.send(message);
        return this.saveAsyncRequest(message.type, message.asyncId).promise;
    }

    createWebsite(projectName: string, name: string, baseUrl: string) {
        const message = {
            type: 'create-website',
            asyncId: generateId(),
            projectName,
            name: name,
            baseUrl: baseUrl,
        };
        this.connection.send(message);
        return this.saveAsyncRequest(message.type, message.asyncId).promise;
    }

    createComponentType(projectName: string, name: string, parentType: string, baseType: string | null) {
        const message = {
            type: 'create-component-type',
            projectName,
            name: name,
            parentType: parentType,
            baseType: baseType,
        };
        this.connection.send(message);
    }

    updateComponentInstance(projectName: string, componentInstance: ComponentInstance) {
        const message = {
            type: 'update-component-instance',
            projectName,
            componentInstance,
        };
        this.connection.send(message);
    }

    addComponentInstance(projectName: string, componentInstance: ComponentInstance) {
        this.connection.send({
            type: 'add-component-instance',
            projectName,
            componentInstance,
        });
    }

    deleteComponentInstance(projectName: string, componentInstance: ComponentInstance) {
        this.connection.send({
            type: 'delete-component-instance',
            projectName,
            componentInstance,
        });
    }

    updateWebSite(projectName: string, webSite: WebSite) {
        const message = {
            type: 'update-website',
            projectName,
            webSite,
        };
        this.connection.send(message);
    }

    updatePageInstance(projectName: string, pageInstance: PageInstance) {
        const message = {
            type: 'update-page-instance',
            projectName,
            pageInstance,
        };
        this.connection.send(message);
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

    requestProjects() {
        this.connection.send({ type: 'get-projects-list' });
    }

    requestProjectData(projectName: string) {
        this.connection.send({
            type: 'get-project',
            projectName,
        });
    }

    onProjectsReceived(projectsList) {
        // TODO: move to service
        RootStore.uiStore.setProjectsList(this.type, projectsList);
    }

    handleErrors(message) {
        if (!message.isSuccessful) {
            RootStore.uiStore.showNotification(null, message.error, true);
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
                request.resolve();
            } else {
                request.reject();
            }
        } else {
            console.error(`Request with asyncId ${message.asyncId} was not found.`);
        }
        return true;
    }

    onMessage(message) {
        if (message.type.endsWith('-response')) {
            this.handleErrors(message);
            this.handleResponses(message);
        }

        switch (message.type) {
            case 'get-projects-list-response':
                this.onProjectsReceived(message.data);
                break;
            case 'get-project-response':
                this.reactor.dispatchEvent(MessageTypes.ProjectDataReceived, this.type, message.data);
                break;
            case 'show-page':
                console.log('page is opened:', message.className);
                // return this.props.onSelectedPageChange(null, message.className);
                break;
            case 'update-component':
                RootStore.projectStore.updateComponentType(message.componentType);
                return;
            case 'update-page':
                RootStore.projectStore.updatePageType(message.pageType);
                return;
            case 'update-website':
                this.reactor.dispatchEvent(MessageTypes.WebsiteUpdated, message.website);
                return;
            case 'update-project':
                this.reactor.dispatchEvent(MessageTypes.ProjectUpdated, message.project);
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
