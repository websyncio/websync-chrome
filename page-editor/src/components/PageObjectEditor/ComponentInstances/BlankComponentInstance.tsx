import React, { useLayoutEffect, useState } from 'react';
import { observer } from 'mobx-react';
import ComponentInstanceProps from 'components/PageObjectEditor/ComponentInstances/ComponentInstanceProps';
import TypeNameEditor from 'components/PageObjectEditor/TypeNameEditor/TypeNameEditor';
import './BlankComponentInstance.sass';
import { DependencyContainer, TYPES } from 'inversify.config';
import ISelectorsBagService from 'services/ISelectorsBagService';
import SelectorHighlighter from 'services/SelectorHighlighterService';
import XcssSelector from 'entities/XcssSelector';
import ISynchronizationService from 'services/ISynchronizationService';
import ComponentInstance from 'entities/mst/ComponentInstance';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';

const BlankComponentInstance: React.FC<ComponentInstanceProps> = observer(
    ({ component, caretPosition, onSelected: onSelect, onSelectNext, onSelectPrevious }) => {
        const [isDeleted, setIsDeleted] = useState(false);
        const [isAllSet, setIsAllSet] = useState(!!component.typeName.length && !!component.fieldName.length);
        const selectorBagService = DependencyContainer.get<ISelectorsBagService>(TYPES.SelectorsBagService);
        const synchronizationService = DependencyContainer.get<ISynchronizationService>(TYPES.SynchronizationService);
        const selectorHighlighter: SelectorHighlighter = DependencyContainer.get<SelectorHighlighter>(
            TYPES.SelectorHighlighter,
        );
        const { uiStore }: RootStore = useRootStore();

        useLayoutEffect(() => {
            if (isDeleted) {
                // .delete after animation completed
                setTimeout(() => selectorBagService.deleteComponent(component), 300);
            }
        }, [isDeleted]);

        function onChange(componentTypeName: string, componentFieldName: string) {
            if (component.typeName !== componentTypeName) {
                selectorBagService.updateComponentType(component, componentTypeName);
            }
            if (component.fieldName != componentFieldName) {
                selectorBagService.updateComponentFieldName(component, componentFieldName);
            }

            // Should we implement more complex validation here?
            if (!componentTypeName) {
                console.log('componentTypeName not set', componentTypeName);
            }
            if (!componentFieldName) {
                console.log('componentFieldName not set', componentFieldName);
            }
            setIsAllSet(!!componentTypeName.length && !!componentFieldName.length);
        }

        function takeComponent() {
            console.log('Take component', component);
            if (!uiStore.selectedPageObject) {
                throw new Error('No selected page object.');
            }
            component.setParent(uiStore.selectedPageObject);
            synchronizationService.addComponentInstance(component);
            selectorBagService.deleteComponent(component);
        }

        function onTakeComponentClick(e) {
            takeComponent();
            e.stopPropagation();
        }

        function highlightSelector() {
            const selector = new XcssSelector(component.rootXcss, null, null);
            selectorHighlighter.highlight(selector);
        }

        function removeHighlighting() {
            selectorHighlighter.removeHighlighting();
        }

        function onKeyDown(e) {
            const isEnter = e.key == 'Enter';
            if (isAllSet && e.ctrlKey && isEnter) {
                takeComponent();
                e.stopPropagation();
            }
        }

        return (
            <div
                className={`component-instance blank-component
                    ${component.selected ? 'selected' : ''} 
                    ${isDeleted ? 'deleted' : ''}`}
                onClick={onSelect}
                onKeyDown={onKeyDown}
            >
                <span className="body-wrap">
                    <TypeNameEditor
                        component={component}
                        showPlaceholders={true}
                        initialCaretPosition={caretPosition}
                        onDelete={() => setIsDeleted(true)}
                        onSelectNext={onSelectNext}
                        onSelectPrevious={onSelectPrevious}
                        onChange={onChange}
                    />
                    <span className="separator">&nbsp;&lt;&nbsp;</span>
                    <span
                        className="root-selector"
                        onMouseEnter={() => highlightSelector()}
                        onMouseLeave={() => removeHighlighting()}
                    >
                        &quot;{component.rootXcss}&quot;
                    </span>
                    {/* {initializationAttribute(component.initializationAttribute)} */}
                    <span
                        className={`add-component-button action-button ${isAllSet ? 'active' : ''}`}
                        title={`${isAllSet ? 'Add component to page object (Ctrl+Enter)' : 'Specify type and name'}`}
                        onClick={onTakeComponentClick}
                    >
                        Take
                    </span>
                </span>
            </div>
        );
    },
);

export default BlankComponentInstance;
