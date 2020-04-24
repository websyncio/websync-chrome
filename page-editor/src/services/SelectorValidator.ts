import SelectorEditorProxy from './SelectorEditorProxy';
import { MessageTypes } from './SelectorEditorProxy';
export const SELECTOR_VALIDATED = 'selector-validated';

// https://stackoverflow.com/questions/27383224/chrome-extension-long-lived-message-connection-how-to-use-callback-functions
export default class SelectorValidator {
    getNodesCount(iframesDataList, displayedOnly: boolean) {
        let count = 0;
        iframesDataList.forEach(function (iframeData) {
            count += displayedOnly ? iframeData.elements.filter((e) => e.displayed).length : iframeData.elements.length;
        });
        return count;
    }

    validate(selector: string, callback: Function) {
        SelectorEditorProxy.instance().sendMessage(MessageTypes.ValidateSelector, selector, (event) => {
            this.callback(event, callback);
        });
    }
    callback(event, onValidated) {
        const validationData = {
            isValid: false,
            count: 0,
            displayedCount: 0,
        };
        if (!event.data.isException) {
            validationData.isValid = true;
            validationData.count = this.getNodesCount(event.data.result, false);
            validationData.displayedCount = this.getNodesCount(event.data.result, true);
        }
        onValidated(validationData);
    }
}
