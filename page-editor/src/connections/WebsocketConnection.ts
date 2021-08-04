import { w3cwebsocket as W3CWebSocket } from 'websocket';
import Reactor from '../utils/Reactor';

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
        if (this.client.readyState === 3) {
            this.connect();
        }
    }

    connect() {
        this.client = new W3CWebSocket(`ws://localhost:${this.port}/`);
        this.client.onerror = this.onError.bind(this);
        this.client.onopen = this.onOpen.bind(this);
        this.client.onclose = this.onClose.bind(this);
        this.client.onmessage = this.onMessage.bind(this);
    }

    send(message) {
        if (this.client.readyState !== 1) {
            throw new Error("Can't send message to IDE because connection is closed.");
        }
        this.client.send(JSON.stringify(message));
        console.log('Message sent:', message);
    }

    onError() {
        console.log('Connection Error');
    }

    onOpen() {
        this.reactor.dispatchEvent(Events.onopen);
    }

    onClose() {
        this.reactor.dispatchEvent(Events.onclosed);
    }

    onMessage(e) {
        console.log('Message received:', e.data);
        try {
            const messageData = JSON.parse(e.data);
            this.reactor.dispatchEvent(Events.onmessage, messageData);
        } catch (e) {
            console.log('Can not parse message: ', e);
        }
    }
}
