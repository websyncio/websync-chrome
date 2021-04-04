import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { RootStore } from '../context';
import SelectorEditorConnection, { MessageTargets, MessageTypes } from '../connections/SelectorEditorConnection';
import { TYPES } from 'inversify.config';
import ISelectorsBagService from './ISelectorsBagService';
import ComponentInstance from 'entities/mst/ComponentInstance';

@injectable()
export class SelectorsBagService implements ISelectorsBagService {
    constructor(@inject(TYPES.SelectorEditorConnection) private selectorEditorConnection: SelectorEditorConnection) {
        selectorEditorConnection.addListener(MessageTypes.SelectorUpdated, this.onSelectorUpdated);
        selectorEditorConnection.addListener(MessageTypes.SelectorsListUpdated, this.generateBlankComponents);
        this.generateBlankComponents([
            {
                id: '1',
                name: 'SearchInput',
                selector: '#search',
            },
            {
                id: '2',
                name: 'SendButton',
                selector: "[type='submit']",
            },
            {
                id: '3',
                name: 'CancelButton',
                selector: "button['Cancel']",
            },
            {
                id: '4.',
                name: '',
                selector: "button['Cancel']",
            },
        ]);
    }

    deleteComponent(component: ComponentInstance) {
        component.delete();
        this.updateSelectorsList();
    }

    updateComponentName(component: ComponentInstance, newComponentName: string) {
        component.setName(newComponentName);
        this.updateSelectorsList();
    }

    updateComponentType(component: ComponentInstance, componentType: string) {
        component.setComponentType(componentType);
        this.updateSelectorsList();
    }

    private updateSelectorsList() {
        const componentsData = RootStore.uiStore.blankComponents.map((c) => ({
            id: c.id,
            name: c.componentFieldName,
            type: c.componentType,
        }));
        this.selectorEditorConnection.postMessage(
            MessageTypes.SelectorsListUpdated,
            componentsData,
            MessageTargets.SelectorEditorMain,
        );
    }

    // TODO: create model for selector
    //{ componentId: string; componentName: string; parameterName: string | null; parameterValueIndex: number; selector: string; }
    editSelector(selector) {
        this.selectorEditorConnection.postMessage(MessageTypes.EditSelector, selector);
    }

    requestSelectorsList() {
        this.selectorEditorConnection.postMessage(
            MessageTypes.GetSelectorsList,
            null,
            MessageTargets.SelectorEditorMain,
            (event) => {
                if (event.data) {
                    this.generateBlankComponents(event.data);
                }
            },
        );
    }

    generateBlankComponents(data) {
        RootStore.uiStore.generateBlankComponents(data);
    }

    onSelectorUpdated(data) {
        console.log('update component selector in projectStore here', data);
        if (!RootStore.uiStore.selectedPageObject) {
            throw new Error('No selected page object to update.');
        }
        const componentInstance: ComponentInstance = RootStore.uiStore.selectedPageObject.getComponentInstance(
            data.componentId,
        );
        if (!componentInstance) {
            throw new Error('No component to update. componentId: ' + data.componentId);
        }
        componentInstance.updateInitializationParameter(
            data.parameterName,
            data.parameterValueIndex,
            data.parameterValue,
        );
    }
}
