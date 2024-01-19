/// <reference types="chrome"/>
import 'reflect-metadata';
import { injectable } from 'inversify';
import Reactor from '../utils/Reactor';

export const MessageTypes = {
    InitConnection: 'init',
    EditSelector: 'edit-selector',
    SetRootComponent: 'set-root-component',
    RemoveRootComponent: 'remove-root-component',
    ValidateSelector: 'validate-selector',
    HighlightSelector: 'highlight-selector',
    RemoveHighlighting: 'remove-highlighting',

    HighlightComponents: 'highlight-components',
    RemoveComponentsHighlighting: 'remove-components-highlighting',

    GetSelectorsList: 'get-selectors-list',
    UpdateSelectorName: 'update-selector-name',

    SelectorUpdated: 'selector-updated',
    SelectorsListUpdated: 'selectors-list-updated',

    GetUrlRequest: 'get-url-request',
    UrlChanged: 'url-changed',
    ChangeUrl: 'change-url',
};

export const MessageTargets = {
    SelectorEditorMain: 'selector-editor-main',
    SelectorEditorAuxilliary: 'selector-editor-auxilliary',
    ContentPage: 'content',
};

@injectable()
export default class SelectorEditorProxy {
    reactor: Reactor;
    acknowledgments: { [id: string]: Function } = {};
    backgroundConnection: chrome.runtime.Port | null = null;
    sourceName = 'page-editor';

    constructor() {
        this.reactor = new Reactor();
        this.reactor.registerEvent(MessageTypes.SelectorUpdated);
        this.reactor.registerEvent(MessageTypes.SelectorsListUpdated);
        this.reactor.registerEvent(MessageTypes.UrlChanged);

        this.connectToBackgroundPage();
    }

    connectToBackgroundPage() {
        debugger;
        try {
            this.backgroundConnection = chrome.runtime.connect({ name: 'content' });
        } catch (e: any) {
            console.log('PageEditor is unable to connect to background.', e);
            if (e.message != 'Extension context invalidated.') {
                setTimeout(this.connectToBackgroundPage, 1000);
            }
            return;
        }
        console.log('PageEditor has created a connection to background.');
        this.backgroundConnection.onDisconnect.addListener(() => {
            console.log('Connection to background from PageEditor has broken.');
            this.backgroundConnection = null;
            setTimeout(this.connectToBackgroundPage, 1000);
        });

        this.addBackgroundPageListeners(this.backgroundConnection);
        // we need to send tabId to identify connection in background page
        this.postMessage(MessageTypes.InitConnection);
    }

    addBackgroundPageListeners(port: chrome.runtime.Port) {
        if (!port) {
            throw new Error('Connection to background page is not available.');
        }
        port.onMessage.addListener(this.receiveMessage.bind(this));
    }

    receiveMessage(message) {
        const callback = message.acknowledgment && this.acknowledgments[message.acknowledgment];
        if (callback) {
            callback(message);
            delete this.acknowledgments[message.acknowledgment];
        } else {
            // . it is not a callback
            switch (message.type) {
                case MessageTypes.SelectorUpdated:
                    this.reactor.dispatchEvent(MessageTypes.SelectorUpdated, message.data);
                    break;
                case MessageTypes.SelectorsListUpdated:
                    this.reactor.dispatchEvent(MessageTypes.SelectorsListUpdated, message.data);
                    break;
                case MessageTypes.UrlChanged:
                    this.reactor.dispatchEvent(MessageTypes.UrlChanged, message.data);
                    break;
            }
        }
    }

    postMessage(
        type,
        data: any = undefined,
        target: string | undefined = undefined,
        callback: Function | undefined = undefined,
    ) {
        let address: string | undefined = undefined;
        if (callback) {
            // this variable will be unique callback idetifier
            address = Math.random().toString(36);

            // You create acknowledgment by identifying callback
            this.acknowledgments[address] = callback;
        }

        if (this.backgroundConnection) {
            this.backgroundConnection.postMessage({
                tabId: chrome.devtools.inspectedWindow.tabId,
                source: this.sourceName,
                target: target,
                acknowledgment: address,
                type: type,
                data: data,
            });
        } else {
            console.warn('PageEditor is unable to send message to background page. Connection is not available.');
        }
    }

    addListener(messageType: string, listener: Function) {
        this.reactor.addEventListener(messageType, listener);
    }
}
