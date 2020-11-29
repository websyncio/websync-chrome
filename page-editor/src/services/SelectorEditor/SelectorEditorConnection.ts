import { RootStore } from '../../context';
import SelectorEditorProxy, { MessageTypes } from './SelectorEditorProxy';

export default class SelectorEditorConnection {
    private static _inst: SelectorEditorConnection | undefined;

    constructor() {
        SelectorEditorProxy.instance().addListener(
            MessageTypes.UpdateComponentSelector,
            this.onUdpateComponenetSelector,
        );
    }

    static init() {
        if (SelectorEditorConnection._inst === undefined) {
            SelectorEditorConnection._inst = new SelectorEditorConnection();
        }
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
