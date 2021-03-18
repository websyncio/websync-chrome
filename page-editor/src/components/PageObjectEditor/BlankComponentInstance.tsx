import React, { useLayoutEffect, useState } from 'react';
import { observer } from 'mobx-react';
import ComponentInstanceProps from './ComponentInstanceProps';
import TypeNameEditor from './TypeNameEditor';
import './BlankComponentInstance.sass';
import { DependencyContainer, TYPES } from 'inversify.config';
import ISelectorsBagService from 'services/ISelectorsBagService';
import SelectorHighlighter from 'services/SelectorHighlighterService';

const BlankComponentInstance: React.FC<ComponentInstanceProps> = observer(
    ({ component, caretPosition, onSelected, onSelectNext, onSelectPrevious }) => {
        const [isDeleted, setIsDeleted] = useState(false);
        const [isAllSet, setIsAllSet] = useState(!!component.typeName.length && !!component.componentFieldName.length);
        const selectorBagService = DependencyContainer.get<ISelectorsBagService>(TYPES.SelectorsBagService);
        const selectorHighlighter: SelectorHighlighter = DependencyContainer.get<SelectorHighlighter>(
            TYPES.SelectorHighlighter,
        );

        useLayoutEffect(() => {
            if (isDeleted) {
                // .delete after animation completed
                setTimeout(() => component.delete(), 300);
            }
        }, [isDeleted]);

        function onDeleted() {
            selectorBagService.deleteComponent(component);
            setIsDeleted(true);
        }

        function onChange(componentTypeName: string, componentFieldName: string) {
            if (component.typeName !== componentTypeName) {
                selectorBagService.updateComponentType(component, componentTypeName);
            }
            if (component.componentFieldName != componentFieldName) {
                selectorBagService.updateComponentName(component, componentFieldName);
            }

            // Should we implement more complex validation here?
            if (!componentTypeName) {
                console.log('componentTypeName', componentTypeName);
            }
            if (!componentFieldName) {
                console.log('componentFieldName', componentFieldName);
            }
            setIsAllSet(!!componentTypeName.length && !!componentFieldName.length);
        }

        function addComponent(e) {
            e.stopPropagation();
        }

        function highlightSelector() {
            selectorHighlighter.highlight(component.rootSelector);
        }

        function removeHighlighting() {
            selectorHighlighter.removeHighlighting();
        }

        return (
            <div
                className={`component-instance blank-component
                    ${component.selected ? 'selected' : ''} 
                    ${isDeleted ? 'deleted' : ''}`}
                onClick={onSelected}
            >
                <span className="body-wrap">
                    <TypeNameEditor
                        component={component}
                        showPlaceholders={true}
                        initialCaretPosition={caretPosition}
                        onDeleted={onDeleted}
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
                        &quot;{component.rootSelector}&quot;
                    </span>
                    {/* {initializationAttribute(component.initializationAttribute)} */}
                    <span
                        className={`add-component-button action-button ${isAllSet ? 'active' : ''}`}
                        title={`${isAllSet ? 'Add component to page object (Ctrl+Enter)' : 'Specify type and name'}`}
                        onClick={addComponent}
                    >
                        Take
                    </span>
                </span>
            </div>
        );
    },
);

export default BlankComponentInstance;
