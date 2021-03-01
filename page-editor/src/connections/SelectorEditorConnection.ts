/// <reference types="chrome"/>
import 'reflect-metadata';
import { injectable } from 'inversify';
import Reactor from '../utils/Reactor';

export const MessageTypes = {
    EditSelector: 'edit-selector',
    ValidateSelector: 'validate-selector',
    HighlightSelector: 'highlight-selector',
    RemoveHighlighting: 'remove-highlighting',

    GetSelectorsList: 'get-selectors-list',
    UpdateSelectorName: 'update-selector-name',

    SelectorUpdated: 'selector-updated',
    SelectorsListUpdated: 'selectors-list-updated',
};

@injectable()
export default class SelectorEditorProxy {
    reactor: Reactor;
    acknowledgments: { [id: string]: Function } = {};
    backgroundConnection: chrome.runtime.Port;

    constructor() {
        this.reactor = new Reactor();
        this.reactor.registerEvent(MessageTypes.SelectorUpdated);
        this.reactor.registerEvent(MessageTypes.SelectorsListUpdated);

        this.backgroundConnection = chrome.runtime.connect();
        this.backgroundConnection.onMessage.addListener(this.receiveMessage.bind(this));
    }

    receiveMessage(event) {
        const callback = event.data.acknowledgment && this.acknowledgments[event.data.acknowledgment];
        if (callback) {
            callback(event.data);
            delete this.acknowledgments[event.data.acknowledgment];
        } else {
            // . it is not a callback
            switch (event.data.type) {
                case MessageTypes.SelectorUpdated:
                    this.reactor.dispatchEvent(MessageTypes.SelectorUpdated, event.data.data);
                    break;
            }
        }
    }

    postMessage(type, data: any = undefined, callback: Function | undefined = undefined) {
        let address: string | undefined = undefined;
        if (callback) {
            // this variable will be unique callback idetifier
            address = Math.random().toString(36);

            // You create acknowledgment by identifying callback
            this.acknowledgments[address] = callback;
        }

        this.backgroundConnection.postMessage({
            acknowledgment: address,
            type: type,
            data: data,
        });
    }

    addListener(messageType: string, listener: Function) {
        this.reactor.addEventListener(messageType, listener);
    }
}
