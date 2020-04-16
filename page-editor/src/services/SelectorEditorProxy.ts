export default class SelectorEditorProxy {
    acknowledgments: { [id: string]: Function } = {};

    private static _inst: SelectorEditorProxy | undefined;

    static instance() {
        if (SelectorEditorProxy._inst === undefined) {
            SelectorEditorProxy._inst = new SelectorEditorProxy();
            window.addEventListener(
                'message',
                SelectorEditorProxy._inst.receiveMessage.bind(SelectorEditorProxy._inst),
                false,
            );
        }
        return SelectorEditorProxy._inst;
    }

    receiveMessage(event) {
        const callback = this.acknowledgments[event.data.acknowledgment];
        if (callback) {
            callback(event.data.result);
            delete this.acknowledgments[event.data.acknowledgment];
        }
    }

    sendMessage(type, data, callback: Function) {
        // this variable will be unique callback idetifier
        const address = Math.random().toString(36);

        // You create acknowledgment by identifying callback
        this.acknowledgments[address] = callback;

        window.parent.postMessage(
            {
                acknowledgment: address,
                type: type,
                data: data,
            },
            '*',
        );
    }
}