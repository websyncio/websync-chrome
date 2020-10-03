import WebsocketConnection, { Events } from './WebsocketConnection';
import { RootStore } from '../../context';
import IIdeProxy from 'interfaces/IIdeProxy';
import { destroy, getParent, Instance, cast } from 'mobx-state-tree';
import { ProjectStoreModel } from 'mst/ProjectStore';
import UIStore from 'mst/UiStore';

export default class IDEAConnection implements IIdeProxy {
    connection: WebsocketConnection;
    type = 'IDEA';
    uiStore: UIStore = RootStore.uiStore;

    constructor() {
        this.connection = new WebsocketConnection(1804);
        this.connection.addListener(Events.onopen, this.onOpen.bind(this));
        this.connection.addListener(Events.onclosed, this.onClosed.bind(this));
        this.connection.addListener(Events.onmessage, this.onMessage.bind(this));
    }

    onOpen() {
        this.uiStore.addIdeConnection(this.type);
        this.requestProjects();
    }

    onClosed() {
        this.uiStore.removeIdeConnection(this.type);
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
        this.uiStore.setProjectsList(this.type, projectsList);
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
                // this.props.onComponentUpdated(message.data);
                return;
            case 'update-page':
                console.log('page is updated:', message.data);
                // this.props.onPageUpdated(message.data);
                return;
            default:
                console.log('no message type, ignored: ', message);
                return;
        }
    }
}
