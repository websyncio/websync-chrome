import { RootStore } from '../../context';
import SelectorEditorProxy, { MessageTypes } from './SelectorEditorProxy';

export default class SelectorEditorConnection {
    private static _inst: SelectorEditorConnection | undefined;

    constructor() {
        SelectorEditorProxy.instance().addListener(
            MessageTypes.UpdateComponentSelector,
            this.onUdpateComponenetSelector,
        );
        SelectorEditorProxy.instance().addListener(MessageTypes.UpdateSelectorsList, this.generateBlankComponents);
    }

    static init() {
        if (SelectorEditorConnection._inst === undefined) {
            SelectorEditorConnection._inst = new SelectorEditorConnection();
            SelectorEditorConnection._inst.generateBlankComponents([
                {
                    name: 'SearchInput',
                    selector: '#search',
                },
                {
                    name: 'SendButton',
                    selector: "[type='submit']",
                },
                {
                    name: 'CancelButton',
                    selector: "button['Cancel']",
                },
                {
                    name: '',
                    selector: "button['Cancel']",
                },
            ]);
            //SelectorEditorConnection._inst.requestSelectorsList();
        }
    }

    requestSelectorsList() {
        SelectorEditorProxy.instance().sendMessage(MessageTypes.RequestSelectorsList, null, (event) => {
            this.generateBlankComponents(event.data);
        });
    }

    generateBlankComponents(data) {
        RootStore.uiStore.generateBlankComponents(data);
    }

    onUdpateComponenetSelector(data) {
        console.log('update component selector in projectStore here', data);
        if (!RootStore.uiStore.selectedPageObject) {
            throw new Error('No selected page object to update.');
        }
        RootStore.projectStore.updateComponentInitializationParameter(
            RootStore.uiStore.selectedPageObject,
            data.componentId,
            data.parameterName,
            data.parameterValueIndex,
            data.selector,
        );
    }
}
