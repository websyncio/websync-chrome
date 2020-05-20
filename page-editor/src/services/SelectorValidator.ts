import SelectorEditorProxy from './SelectorEditorProxy';
import { MessageTypes } from './SelectorEditorProxy';
export const SELECTOR_VALIDATED = 'selector-validated';
import { Scss } from 'components/ScssParser';

// https://stackoverflow.com/questions/27383224/chrome-extension-long-lived-message-connection-how-to-use-callback-functions
export default class SelectorValidator {
    getNodesCount(iframesDataList, displayedOnly: boolean) {
        let count = 0;
        iframesDataList.forEach(function (iframeData) {
            count += displayedOnly ? iframeData.elements.filter((e) => e.displayed).length : iframeData.elements.length;
        });
        return count;
    }

    validate(selector: Scss, callback: Function) {
        SelectorEditorProxy.instance().sendMessage(MessageTypes.ValidateSelector, selector, (event) => {
            this.callback(event, callback);
        });
    }
    callback(data, onValidated) {
        const validationData = {
            isValid: false,
            count: 0,
            displayedCount: 0,
        };
        if (!data.isException) {
            validationData.isValid = true;
            validationData.count = this.getNodesCount(data.result, false);
            validationData.displayedCount = this.getNodesCount(data.result, true);
        }
        onValidated(validationData);
    }
}
