import React, { useLayoutEffect, useState } from 'react';
import { observer } from 'mobx-react';
import ComponentInstanceProps from './ComponentInstanceProps';
import TypeNameEditor from './TypeNameEditor';
import './BlankComponentInstance.sass';

const BlankComponentInstance: React.FC<ComponentInstanceProps> = observer(
    ({ ideProxy, component, index, caretPosition, onSelected, onSelectNext, onSelectPrevious }) => {
        const [isDeleted, setIsDeleted] = useState(false);

        useLayoutEffect(() => {
            if (isDeleted) {
                // .delete after animation completed
                setTimeout(() => component.delete(ideProxy), 300);
            }
        }, [isDeleted]);

        function onDeleted() {
            setIsDeleted(true);
        }

        return (
            <div
                className={`component-instance blank-component
                    ${component.selected ? 'selected' : ''} 
                    ${isDeleted ? 'deleted' : ''}`}
                onClick={onSelected}
            >
                <span className="line-prefix"></span>
                <span className="body-wrap">
                    <TypeNameEditor
                        component={component}
                        caretPosition={caretPosition}
                        onDeleted={onDeleted}
                        onSelectNext={onSelectNext}
                        onSelectPrevious={onSelectPrevious}
                    />
                    &nbsp;&lt;&nbsp;
                    <span className="root-selector">&quot;{component.rootSelector}&quot;</span>
                    {/* {initializationAttribute(component.initializationAttribute)} */}
                </span>
            </div>
        );
    },
);

export default BlankComponentInstance;
