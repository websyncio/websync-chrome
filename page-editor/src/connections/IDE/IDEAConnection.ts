import WebsocketConnection, { Events } from './WebsocketConnection';
import { RootStore } from '../../context';
import IIdeProxy from 'connections/IDE/IIdeProxy';
import { destroy, getParent, Instance, cast } from 'mobx-state-tree';
import ProjectStore, { ProjectStoreModel } from 'entities/mst/ProjectStore';
import UIStore from 'entities/mst/UiStore';
import ComponentInstance from 'entities/mst/ComponentInstance';

export default class IDEAConnection implements IIdeProxy {
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

    updateComponentInstance(component: ComponentInstance) {
        const message = {
            projectName: RootStore.uiStore.selectedProject,
            type: 'update-component-instance',
            data: component,
        };
        this.connection.send(message);
    }

    onOpen() {
        RootStore.uiStore.addIdeConnection(this.type);
        this.requestProjects();
    }

    onClosed() {
        RootStore.uiStore.removeIdeConnection(this.type);
    }

    requestProjects() {
        this.connection.send({ type: 'get-projects' });
    }

    requestProjectData(projectName: string) {
        this.connection.send({
            type: 'get-project',
            moduleName: projectName,
        });
    }

    onProjectDataReceived(projectData: any) {
        RootStore.setProjectData(this.type, projectData);
    }

    onProjectsReceived(projectsList) {
        RootStore.uiStore.setProjectsList(this.type, projectsList);
    }

    onMessage(message) {
        switch (message.type) {
            case 'get-projects-response':
                this.onProjectsReceived(message.data);
                break;
            case 'get-project-response':
                this.onProjectDataReceived(message.data);
                break;
            case 'show-page':
                console.log('page is opened:', message.className);
            // return this.props.onSelectedPageChange(null, message.className);
            case 'update-component':
                RootStore.projectStore.updateComponentType(message.data);
                return;
            case 'update-page':
                RootStore.projectStore.updatePageType(message.data);
                return;
            default:
                console.log('unknown message type, ignored: ', message);
                return;
        }
    }
}
