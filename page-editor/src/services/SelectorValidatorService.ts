import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import SelectorEditorConnection, { MessageTargets, MessageTypes } from '../connections/SelectorEditorConnection';
import XcssSelector from 'entities/XcssSelector';
import TYPES from 'inversify.types';
export const SELECTOR_VALIDATED = 'selector-validated';

// https://stackoverflow.com/questions/27383224/chrome-extension-long-lived-message-connection-how-to-use-callback-functions
@injectable()
export default class SelectorValidator {
    constructor(@inject(TYPES.SelectorEditorConnection) private selectorEditorConnection: SelectorEditorConnection) {}

    getNodesCount(iframesDataList, displayedOnly: boolean) {
        let count = 0;
        iframesDataList?.forEach(function (iframeData) {
            count += displayedOnly ? iframeData.elements.filter((e) => e.displayed).length : iframeData.elements.length;
        });
        return count;
    }

    validate(selector: XcssSelector, callback: Function) {
        this.selectorEditorConnection.postMessage(
            MessageTypes.ValidateSelector,
            selector,
            MessageTargets.SelectorEditorAuxilliary,
            (event) => {
                this.callback(event, callback);
            },
        );
    }
    callback(message, onValidated) {
        const validationData = {
            isValid: false,
            count: 0,
            displayedCount: 0,
        };
        if (!message.isException) {
            validationData.isValid = true;
            validationData.count = this.getNodesCount(message.data, false);
            validationData.displayedCount = this.getNodesCount(message.data, true);
        }
        onValidated(validationData);
    }
}
