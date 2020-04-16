export const SELECTOR_VALIDATED = 'selector-validated';

// https://stackoverflow.com/questions/27383224/chrome-extension-long-lived-message-connection-how-to-use-callback-functions
export default class SelectorValidator {
    acknowledgments: { [id: string]: Function } = {};

    private static _inst: SelectorValidator | undefined;

    static instance() {
        if (SelectorValidator._inst === undefined) {
            SelectorValidator._inst = new SelectorValidator();
            window.addEventListener(
                'message',
                SelectorValidator._inst.receiveMessage.bind(SelectorValidator._inst),
                false,
            );
        }
        return SelectorValidator._inst;
    }

    receiveMessage(event) {
        const callback = this.acknowledgments[event.data.acknowledgment];
        if (callback) {
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

            callback(validationData);
            delete this.acknowledgments[event.data.acknowledgment];
        }
    }

    getNodesCount(iframesDataList, displayedOnly: boolean) {
        let count = 0;
        iframesDataList.forEach(function (iframeData) {
            count += displayedOnly ? iframeData.elements.filter((e) => e.displayed).length : iframeData.elements.length;
        });
        return count;
    }

    validate(selector: string, onValidated: Function) {
        // this variable will be unique callback idetifier
        const address = Math.random().toString(36);

        // You create acknowledgment by identifying callback
        this.acknowledgments[address] = onValidated;

        window.parent.postMessage(
            {
                acknowledgment: address,
                type: 'validate-selector',
                selector: selector,
            },
            '*',
        );
    }
}
