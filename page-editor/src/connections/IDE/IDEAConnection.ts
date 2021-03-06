import 'reflect-metadata';
import { injectable } from 'inversify';
import WebsocketConnection, { Events } from '../WebsocketConnection';
import { RootStore } from 'context';
import IIdeConnection from 'connections/IDE/IIdeConnection';
import ComponentInstance from 'entities/mst/ComponentInstance';
import PageInstance from 'entities/mst/PageInstance';
import WebSite from 'entities/mst/WebSite';

@injectable()
export default class IDEAConnection implements IIdeConnection {
    connection: WebsocketConnection;
    type = 'IDEA';

    constructor() {
        this.connection = new WebsocketConnection(1804);
        this.connection.addListener(Events.onopen, this.onOpen.bind(this));
        this.connection.addListener(Events.onclosed, this.onClosed.bind(this));
        this.connection.addListener(Events.onmessage, this.onMessage.bind(this));
    }

    private static _inst: IDEAConnection | undefined;

    static instance() {
        if (IDEAConnection._inst === undefined) {
            IDEAConnection._inst = new IDEAConnection();
        }
        return IDEAConnection._inst;
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

    onOpen() {
        // TODO: move to service
        RootStore.uiStore.addIdeConnection(this.type);
        this.requestProjects();
    }

    onClosed() {
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

    onProjectDataReceived(projectData: any) {
        // TODO: move to service
        RootStore.setProjectData(this.type, projectData);
    }

    onProjectsReceived(projectsList) {
        // TODO: move to service
        RootStore.uiStore.setProjectsList(this.type, projectsList);
    }

    onMessage(message) {
        switch (message.type) {
            case 'get-projects-list-response':
                this.onProjectsReceived(message.data);
                break;
            case 'get-project-response':
                this.onProjectDataReceived(message.data);
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
            default:
                console.log('unknown message type, ignored: ', message);
                return;
        }
    }
}
