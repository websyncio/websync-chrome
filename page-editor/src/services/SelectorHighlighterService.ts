import SelectorEditorProxy from '../connections/SelectorEditorConnection';
import { MessageTypes } from '../connections/SelectorEditorConnection';

// https://stackoverflow.com/questions/27383224/chrome-extension-long-lived-message-connection-how-to-use-callback-functions
export default class SelectorHighlighter {
    highlight(selector: any) {
        SelectorEditorProxy.instance().sendMessage(MessageTypes.HighlightSelector, selector);
    }

    removeHighlighting() {
        SelectorEditorProxy.instance().sendMessage(MessageTypes.RemoveHighlighting);
    }
}
