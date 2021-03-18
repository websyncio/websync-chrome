/// <reference types="chrome"/>
import 'reflect-metadata';
import { injectable } from 'inversify';
import Reactor from '../utils/Reactor';

export const MessageTypes = {
    InitConnection: 'init',
    EditSelector: 'edit-selector',
    ValidateSelector: 'validate-selector',
    HighlightSelector: 'highlight-selector',
    RemoveHighlighting: 'remove-highlighting',

    GetSelectorsList: 'get-selectors-list',
    UpdateSelectorName: 'update-selector-name',

    SelectorUpdated: 'selector-updated',
    SelectorsListUpdated: 'selectors-list-updated',
    UrlChanged: 'page-url-changed',
};

export const MessageTargets = {
    SelectorEditorMain: 'selector-editor-main',
    SelectorEditorAuxilliary: 'selector-editor-auxilliary',
};

@injectable()
export default class SelectorEditorProxy {
    reactor: Reactor;
    acknowledgments: { [id: string]: Function } = {};
    backgroundConnection: chrome.runtime.Port;
    sourceName = 'page-editor';

    constructor() {
        this.reactor = new Reactor();
        this.reactor.registerEvent(MessageTypes.SelectorUpdated);
        this.reactor.registerEvent(MessageTypes.SelectorsListUpdated);
        this.reactor.registerEvent(MessageTypes.UrlChanged);

        this.backgroundConnection = chrome.runtime.connect();
        this.backgroundConnection.onMessage.addListener(this.receiveMessage.bind(this));
        // we need to send tabId to identify connection in background page
        this.postMessage(MessageTypes.InitConnection);
    }

    receiveMessage(message) {
        console.log('selector-editor-connection received', message);

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

        this.backgroundConnection.postMessage({
            tabId: chrome.devtools.inspectedWindow.tabId,
            source: this.sourceName,
            target: target,
            acknowledgment: address,
            type: type,
            data: data,
        });
    }

    addListener(messageType: string, listener: Function) {
        this.reactor.addEventListener(messageType, listener);
    }
}
