import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { TYPES } from 'inversify.config';
import SelectorEditorConnection from '../connections/SelectorEditorConnection';
import { MessageTypes } from '../connections/SelectorEditorConnection';

// https://stackoverflow.com/questions/27383224/chrome-extension-long-lived-message-connection-how-to-use-callback-functions
@injectable()
export default class SelectorHighlighter {
    constructor(@inject(TYPES.SelectorEditorConnection) private selectorEditorConnection: SelectorEditorConnection) {}

    highlight(selector: any) {
        this.selectorEditorConnection.sendMessage(MessageTypes.HighlightSelector, selector);
    }

    removeHighlighting() {
        this.selectorEditorConnection.sendMessage(MessageTypes.RemoveHighlighting);
    }
}
