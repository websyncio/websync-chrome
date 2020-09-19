import { w3cwebsocket as W3CWebSocket } from 'websocket';
import Reactor from './Reactor';

export const Events = {
    onopen: 'onopen',
    onclosed: 'onclosed',
    onmessage: 'onmessage',
};

export default class IdeConnection {
    pollingTimeout: number;
    port: string;
    reactor: Reactor;
    client: W3CWebSocket;

    constructor(port, pollintTimeout = 1000) {
        this.pollingTimeout = pollintTimeout;
        this.port = port;
        this.connect();
        setTimeout(this.reconnect.bind(this), this.pollingTimeout);
        this.reactor = new Reactor();
        this.reactor.registerEvent(Events.onopen);
        this.reactor.registerEvent(Events.onclosed);
        this.reactor.registerEvent(Events.onmessage);
    }

    addListener(messageType: string, listener: Function) {
        this.reactor.addEventListener(messageType, listener);
    }

    reconnect() {
        // 0	CONNECTING	Socket has been created. The connection is not yet open.
        // 1	OPEN	The connection is open and ready to communicate.
        // 2	CLOSING	The connection is in the process of closing.
        // 3	CLOSED	The connection is closed or couldn't be opened.
        if (this.client.readyState == 3) {
            this.connect();
        }
    }

    connect() {
        const client = new W3CWebSocket(`ws://localhost:${this.port}/`);
        client.onerror = this.onError.bind(this);
        client.onopen = this.onOpen.bind(this);
        client.onclose = this.onClose.bind(this);
        client.onmessage = this.onMessage.bind(this);
    }

    send(messageObject) {
        if (this.client.readyState != 1) {
            throw new Error("Can't send message to IDE because connection is closed.");
        }
        this.client.send(JSON.stringify(messageObject));
    }

    onError() {
        console.log('Connection Error');
    }

    onOpen() {
        this.reactor.dispatchEvent(Events.onopen);
        // this.setState({ modules: [] });
        // this.setState({ isConnected: isConnection });
    }

    onClose() {
        this.reactor.dispatchEvent(Events.onclosed);
        // this.setState({ isConnected: isConnection });
    }

    onMessage(e) {
        this.reactor.dispatchEvent(Events.onmessage, e.data);
        // try {
        //     // const message = JSON.parse(e.data, Message.reviver);
        //     const message = JSON.parse(e.data);
        //     if (message.hasOwnProperty('status') && message.status !== 0) {
        //         console.log('error occured:', message.error);
        //         return;
        //     }
        //     switch (message.type) {
        //         case 'get-modules-response':
        //             console.log('Modules received: ', message.data);
        //             // return this.setState({ modules: message.data });
        //         case 'get-module-response':
        //             console.log('Module received: ', message.data);
        //             //const webSession = WebSession.fromJSON(message.data);
        //             //this.setState({ selected: webSession.module });
        //             //this.props.onSelectedProject(webSession);
        //             // this.onProjectMetadataReceived(message.data);
        //             break;
        //         case 'show-page':
        //             console.log('page is opened:', message.className);
        //             // return this.props.onSelectedPageChange(null, message.className);
        //         case 'update-component':
        //             // this.props.onComponentUpdated(message.data);
        //             return;
        //         case 'update-page':
        //             console.log('page is updated:', message.data);
        //             // this.props.onPageUpdated(message.data);
        //             return;
        //         default:
        //             console.log('no message type, ignored: ', e.data);
        //             return;
        //     }
        // } catch (ex) {
        //     console.log('Message received "' + e.data + '"');
        //     console.log(ex);
        // }
    }

    getProjectWebSession = (module: string) => {
        // this.setState({ selected: module });
        this.send(JSON.stringify({ type: 'get-module', moduleName: module }));
    };
}
