import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { RootStore } from '../context';
import SelectorEditorConnection, { MessageTargets, MessageTypes } from '../connections/SelectorEditorConnection';
import { TYPES } from 'inversify.config';
import ISelectorsBagService from './ISelectorsBagService';
import ComponentInstance from 'entities/mst/ComponentInstance';
import IProjectSynchronizationService from './ISynchronizationService';

@injectable()
export class SelectorsBagService implements ISelectorsBagService {
    constructor(
        @inject(TYPES.SelectorEditorConnection) private selectorEditorConnection: SelectorEditorConnection,
        @inject(TYPES.SynchronizationService) private synchronizationService: IProjectSynchronizationService,
    ) {
        selectorEditorConnection.addListener(MessageTypes.SelectorUpdated, this.onSelectorUpdated.bind(this));
        selectorEditorConnection.addListener(
            MessageTypes.SelectorsListUpdated,
            this.generateBlankComponents.bind(this),
        );
        // this.generateBlankComponents([
        //     {
        //         id: '1',
        //         type: 'WebInput',
        //         name: 'SearchInput',
        //         selector: '#search',
        //     },
        //     {
        //         id: '2',
        //         type: 'WebInput',
        //         name: 'SendButton',
        //         selector: "[type='submit']",
        //     },
        //     {
        //         id: '3',
        //         type: '',
        //         name: 'CancelButton',
        //         selector: "button['Cancel']",
        //     },
        //     {
        //         id: '4',
        //         type: '',
        //         name: '',
        //         selector: "button['Cancel']",
        //     },
        // ]);
    }

    deleteComponent(component: ComponentInstance) {
        console.log('delete component from selectors bag');
        RootStore.uiStore.deleteBlankComponent(component);
        this.updateSelectorsList();
    }

    updateComponentFieldName(component: ComponentInstance, newComponentFieldName: string) {
        component.setFieldName(newComponentFieldName);
        this.updateSelectorsList();
    }

    updateComponentType(component: ComponentInstance, componentTypeId: string) {
        component.setComponentTypeId(componentTypeId);
        this.updateSelectorsList();
    }

    private updateSelectorsList() {
        const componentsData = RootStore.uiStore.blankComponents.map((c) => ({
            id: c.id,
            name: c.fieldName,
            type: c.componentTypeId,
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
        console.log('selectors list updated');
        RootStore.uiStore.generateBlankComponents(data);
    }

    onSelectorUpdated(data) {
        console.log('update component selector in projectStore here', data);
        const componentsContainer = RootStore.uiStore.selectedTab?.componentsContainer;
        if (!componentsContainer) {
            throw new Error('No selected page object to update.');
        }
        const componentInstance: ComponentInstance | undefined = componentsContainer.getComponentInstance(
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

        this.synchronizationService.updateComponentInstance(componentInstance);
    }
}
