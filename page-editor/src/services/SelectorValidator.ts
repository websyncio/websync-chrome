export const SELECTOR_VALIDATED = 'selector-validated';

export default class SelectorValidator {
    onValidated: Function;

    constructor(onValidated: Function) {
        this.onValidated = onValidated;
        window.addEventListener('message', this.receiveMessage.bind(this), false);
    }

    receiveMessage(event) {
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

        this.onValidated(validationData);
    }

    getNodesCount(iframesDataList, displayedOnly: boolean) {
        let count = 0;
        iframesDataList.forEach(function (iframeData) {
            count += displayedOnly ? iframeData.elements.filter((e) => e.displayed).length : iframeData.elements.length;
        });
        return count;
    }

    validate(selector: string) {
        window.parent.postMessage(
            {
                type: 'validate-selector',
                selector: selector,
            },
            '*',
        );
    }
}
