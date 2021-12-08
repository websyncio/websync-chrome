import React, { useLayoutEffect, useState } from 'react';
import { observer } from 'mobx-react';
import ComponentInstanceProps from 'components/ProjectViewer/PageObjectEditor/ComponentInstances/ComponentInstanceProps';
import TypeNameEditor from 'components/ProjectViewer/PageObjectEditor/TypeNameEditor/TypeNameEditor';
import './BlankComponentInstance.sass';
import { DependencyContainer, TYPES } from 'inversify.config';
import ISelectorsBagService from 'services/ISelectorsBagService';
import SelectorHighlighter from 'services/SelectorHighlighterService';
import XcssSelector from 'entities/XcssSelector';
import ISynchronizationService from 'services/ISynchronizationService';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';

const BlankComponentInstance: React.FC<ComponentInstanceProps> = observer(
    ({
        container,
        componentInstance,
        parentComponentInstance,
        isSelected,
        initialCaretPosition,
        onSelectedStateChange,
        onSelectNext,
        onSelectPrevious,
    }) => {
        const [isDeleted, setIsDeleted] = useState(false);
        const [isAllSet, setIsAllSet] = useState(
            !!componentInstance.typeName.length && !!componentInstance.fieldName.length,
        );
        const selectorBagService = DependencyContainer.get<ISelectorsBagService>(TYPES.SelectorsBagService);
        const synchronizationService = DependencyContainer.get<ISynchronizationService>(TYPES.SynchronizationService);
        const selectorHighlighter: SelectorHighlighter = DependencyContainer.get<SelectorHighlighter>(
            TYPES.SelectorHighlighter,
        );
        const { uiStore }: RootStore = useRootStore();

        useLayoutEffect(() => {
            if (isDeleted) {
                // .delete after animation completed
                setTimeout(() => selectorBagService.deleteComponent(componentInstance), 300);
            }
        }, [isDeleted]);

        function onChange(componentTypeId: string, componentFieldName: string) {
            if (componentInstance.componentTypeId !== componentTypeId) {
                selectorBagService.updateComponentType(componentInstance, componentTypeId);
            }
            if (componentInstance.fieldName != componentFieldName) {
                selectorBagService.updateComponentFieldName(componentInstance, componentFieldName);
            }

            // Should we implement more complex validation here?
            // if (!componentTypeId) {
            //     console.log('componentTypeName not set', componentTypeName);
            // }
            if (!componentFieldName) {
                console.log('componentFieldName not set', componentFieldName);
            }
            setIsAllSet(!!componentTypeId.length && !!componentFieldName.length);
        }

        function takeComponent() {
            console.log('Take component', componentInstance);
            componentInstance.setParent(container);
            synchronizationService.addComponentInstance(componentInstance);
            selectorBagService.deleteComponent(componentInstance);
        }

        function onTakeComponentClick(e) {
            takeComponent();
            e.stopPropagation();
        }

        function highlightSelector() {
            const selector = new XcssSelector(componentInstance.rootXcss, null, null);
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
                    ${isSelected ? 'selected' : ''} 
                    ${isDeleted ? 'deleted' : ''}`}
                onClick={() => onSelectedStateChange(true)}
                onKeyDown={onKeyDown}
            >
                <span className="body-wrap">
                    <TypeNameEditor
                        container={container}
                        componentInstance={componentInstance}
                        parentComponentInstance={parentComponentInstance}
                        isSelected={isSelected}
                        onSelectedStateChange={onSelectedStateChange}
                        showPlaceholders={true}
                        initialCaretPosition={initialCaretPosition}
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
                        &quot;{componentInstance.rootXcss}&quot;
                    </span>
                    {/* {initializationAttribute(component.initializationAttribute)} */}
                    <span
                        className={`add-component-button action-button ${isAllSet ? 'active' : ''}`}
                        title={`${isAllSet ? 'Add component to page object (Ctrl+Enter)' : 'Specify type and name'}`}
                        onClick={onTakeComponentClick}
                    >
                        Add
                    </span>
                </span>
            </div>
        );
    },
);

export default BlankComponentInstance;
