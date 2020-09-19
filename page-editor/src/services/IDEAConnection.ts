import WebsocketConnection, { Events } from './WebsocketConnection';
import { RootStore } from '../context';
import IIdeProxy from 'interfaces/IIdeProxy';
import { destroy, getParent, Instance, cast } from 'mobx-state-tree';
import { ProjectStoreModel } from 'mst/ProjectStore';

export default class IDEAConnection implements IIdeProxy {
    connection: WebsocketConnection;
    type = 'IDEA';

    constructor() {
        this.connection = new WebsocketConnection(1804);
        this.connection.addListener(Events.onopen, this.onOpen.bind(this));
        this.connection.addListener(Events.onclosed, this.onClosed.bind(this));
        this.connection.addListener(Events.onmessage, this.onMessage.bind(this));
    }

    onOpen() {
        RootStore.uiStore.addIdeProxy(this.type);
        this.connection.send({ type: 'get-projects' });
    }

    onClosed() {
        RootStore.uiStore.removeIdeProxy(this.type);
    }

    onMessage(message) {
        switch (message.type) {
            case 'get-projects-response':
                RootStore.uiStore.setProjectsList(this.type, message.data);
                break;
            case 'get-project-response':
                RootStore.setProjectStore(ProjectStoreModel.create(message.data));
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
                console.log('no message type, ignored: ', message.data);
                return;
        }
    }
}
