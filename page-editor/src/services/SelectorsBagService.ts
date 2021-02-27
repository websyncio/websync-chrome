import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { RootStore } from '../context';
import SelectorEditorConnection, { MessageTypes } from '../connections/SelectorEditorConnection';
import { TYPES } from 'inversify.config';
import ISelectorsBagService from './ISelectorsBagService';
import ComponentInstance from 'entities/mst/ComponentInstance';

@injectable()
export class SelectorsBagService implements ISelectorsBagService {
    constructor(@inject(TYPES.SelectorEditorConnection) private selectorEditorConnection: SelectorEditorConnection) {
        selectorEditorConnection.addListener(MessageTypes.UpdateComponentSelector, this.onUdpateComponenetSelector);
        selectorEditorConnection.addListener(MessageTypes.UpdateSelectorsList, this.generateBlankComponents);
        this.generateBlankComponents([
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
    }

    deleteComponent(component: ComponentInstance) {
        component.delete();
        this.updateComponentsBag();
    }

    updateComponentName(component: ComponentInstance, newComponentName: string) {
        component.setName(newComponentName);
        this.updateComponentsBag();
    }

    updateComponentType(component: ComponentInstance, componentType: string) {
        component.setComponentType(componentType);
    }

    private updateComponentsBag() {
        const componentsData = RootStore.uiStore.blankComponents.map((c) => ({
            componentId: c.id,
            componentName: c.name,
        }));
        this.selectorEditorConnection.sendMessage(MessageTypes.UpdateSelectorsList, componentsData);
    }

    // TODO: create model for selector
    //{ componentId: string; componentName: string; parameterName: string | null; parameterValueIndex: number; selector: string; }
    editSelector(selector) {
        this.selectorEditorConnection.sendMessage(MessageTypes.EditSelector, selector);
    }

    requestSelectorsList() {
        this.selectorEditorConnection.sendMessage(MessageTypes.RequestSelectorsList, null, (event) => {
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
