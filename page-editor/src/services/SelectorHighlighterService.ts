import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import SelectorEditorConnection, { MessageTargets } from '../connections/SelectorEditorConnection';
import { MessageTypes } from '../connections/SelectorEditorConnection';
import XcssSelector from 'entities/XcssSelector';
import TYPES from 'inversify.types';

// https://stackoverflow.com/questions/27383224/chrome-extension-long-lived-message-connection-how-to-use-callback-functions
@injectable()
export default class SelectorHighlighter {
    constructor(@inject(TYPES.SelectorEditorConnection) private selectorEditorConnection: SelectorEditorConnection) {}

    highlight(selector: XcssSelector) {
        this.selectorEditorConnection.postMessage(
            MessageTypes.HighlightSelector,
            selector,
            MessageTargets.SelectorEditorAuxilliary,
        );
    }

    removeHighlighting() {
        this.selectorEditorConnection.postMessage(
            MessageTypes.RemoveHighlighting,
            null,
            MessageTargets.SelectorEditorAuxilliary,
        );
    }

    highlightComponents(componentSelectors: XcssSelector[]) {
        this.selectorEditorConnection.postMessage(
            MessageTypes.HighlightComponents,
            componentSelectors,
            MessageTargets.SelectorEditorAuxilliary,
        );
    }

    removeComponentHighlighting(componentSelectors: XcssSelector[]) {
        this.selectorEditorConnection.postMessage(
            MessageTypes.RemoveComponentsHighlighting,
            componentSelectors,
            MessageTargets.SelectorEditorAuxilliary,
        );
    }
}
