import 'reflect-metadata';
import { injectable } from 'inversify';
import Reactor from '../utils/Reactor';

export const MessageTypes = {
    UpdateComponentSelector: 'update-component-selector',
    UpdateSelectorsList: 'update-selectors-list',
    ValidateSelector: 'validate-selector',
    HighlightSelector: 'highlight-selector',
    RemoveHighlighting: 'remove-highlighting',
    RequestSelectorsList: 'request-selectors-list',
    EditSelector: 'edit-selector',
};

@injectable()
export default class SelectorEditorProxy {
    reactor: Reactor;
    acknowledgments: { [id: string]: Function } = {};

    constructor() {
        this.reactor = new Reactor();
        this.reactor.registerEvent(MessageTypes.UpdateComponentSelector);
        this.reactor.registerEvent(MessageTypes.UpdateSelectorsList);
        window.addEventListener('message', this.receiveMessage.bind(this), false);
    }

    receiveMessage(event) {
        const callback = event.data.acknowledgment && this.acknowledgments[event.data.acknowledgment];
        if (callback) {
            callback(event.data);
            delete this.acknowledgments[event.data.acknowledgment];
        } else {
            // . it is not a callback
            switch (event.data.type) {
                case MessageTypes.UpdateComponentSelector:
                    this.reactor.dispatchEvent(MessageTypes.UpdateComponentSelector, event.data.data);
                    break;
            }
        }
    }

    sendMessage(type, data: any = undefined, callback: Function | undefined = undefined) {
        let address: string | undefined = undefined;
        if (callback) {
            // this variable will be unique callback idetifier
            address = Math.random().toString(36);

            // You create acknowledgment by identifying callback
            this.acknowledgments[address] = callback;
        }

        window.parent.postMessage(
            {
                acknowledgment: address,
                type: type,
                data: data,
            },
            '*',
        );
    }

    addListener(messageType: string, listener: Function) {
        this.reactor.addEventListener(messageType, listener);
    }
}
