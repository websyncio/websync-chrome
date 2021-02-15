import React, { useLayoutEffect, useState } from 'react';
import { observer } from 'mobx-react';
import ComponentInstanceProps from './ComponentInstanceProps';
import TypeNameEditor from './TypeNameEditor';
import './BlankComponentInstance.sass';

const BlankComponentInstance: React.FC<ComponentInstanceProps> = observer(
    ({ ideProxy, component, index, caretPosition, onSelected, onSelectNext, onSelectPrevious }) => {
        const [isDeleted, setIsDeleted] = useState(false);
        const [isAllSet, setIsAllSet] = useState(!!component.typeName.length && !!component.componentFieldName.length);

        useLayoutEffect(() => {
            if (isDeleted) {
                // .delete after animation completed
                setTimeout(() => component.delete(ideProxy), 300);
            }
        }, [isDeleted]);

        function onDeleted() {
            setIsDeleted(true);
        }

        function onChange(componentType: string, componentName: string) {
            setIsAllSet(!!componentType.length && !!componentName.length);
        }

        function addComponent(e) {
            e.stopPropagation();
        }

        return (
            <div
                className={`component-instance blank-component
                    ${component.selected ? 'selected' : ''} 
                    ${isDeleted ? 'deleted' : ''}`}
                onClick={onSelected}
            >
                {/* <span className="line-prefix">
                    <span className="line-index">{index}</span>
                </span> */}
                <span className="body-wrap">
                    <TypeNameEditor
                        component={component}
                        showPlaceholders={true}
                        caretPosition={caretPosition}
                        onDeleted={onDeleted}
                        onSelectNext={onSelectNext}
                        onSelectPrevious={onSelectPrevious}
                        onChange={onChange}
                    />
                    <span className="separator">&nbsp;&lt;&nbsp;</span>
                    <span className="root-selector">&quot;{component.rootSelector}&quot;</span>
                    {/* {initializationAttribute(component.initializationAttribute)} */}
                    <span
                        className={`add-component-button action-button ${isAllSet ? 'active' : ''}`}
                        title={`${isAllSet ? 'Add component to page object (Ctrl+Enter)' : 'Specify type and name'}`}
                        onClick={addComponent}
                    >
                        Add
                    </span>
                </span>
            </div>
        );
    },
);

export default BlankComponentInstance;
