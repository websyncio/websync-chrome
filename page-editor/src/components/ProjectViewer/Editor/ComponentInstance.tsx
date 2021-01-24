import React, { useLayoutEffect, useState } from 'react';
import IComponentInstance from 'mst/ComponentInstance';
import AttributeModel from 'mst/Attribute';
import ParameterModel from 'mst/Parameter';
import JDISelectorsAttribute from '../../JDI/JDISelectorsAttribute';
import SelectorEditorProxy from 'services/SelectorEditor/SelectorEditorProxy';
import 'styles/Popup.sass';
import './ComponentInstance.sass';
import { InitializationAttributes } from 'services/JDI';
import { observer } from 'mobx-react';
import TypeNameEditor from './TypeNameEditor';
import ComponentInstanceProps from './ComponentInstanceProps';

const ComponentInstance: React.FC<ComponentInstanceProps> = observer(
    ({ ideProxy, component, index, caretPosition, onSelected, onSelectNext, onSelectPrevious }) => {
        const [hasError, setHasError] = useState(false);

        const [isDeleted, setIsDeleted] = useState(false);

        useLayoutEffect(() => {
            if (isDeleted) {
                // .delete after animation completed
                setTimeout(() => component.delete(ideProxy), 300);
            }
        }, [isDeleted]);

        // function onRename(event) {
        //     // if (event.target.contentEditable === true) {
        //     //     event.target.contentEditable = false;
        //     // } else {
        //     event.target.contentEditable = true;
        //     event.target.focus();
        //     const target = event.target;

        //     target.focus();
        //     const range = document.createRange();
        //     range.selectNodeContents(target);
        //     const selection = window.getSelection();
        //     selection?.removeAllRanges();
        //     selection?.addRange(range);
        // }

        const editSelector = (component: IComponentInstance, parameter: ParameterModel, valueIndex: number) => {
            SelectorEditorProxy.instance().sendMessage('edit-component-selector', {
                componentId: component.id,
                componentName: component.name,
                parameterName: parameter.name,
                parameterValueIndex: valueIndex,
                selector: parameter.values[valueIndex],
            });
        };

        function initializationAttribute(attribute: AttributeModel) {
            if (attribute) {
                if (InitializationAttributes.Generic.indexOf(attribute.name) != -1) {
                    return (
                        <JDISelectorsAttribute
                            attribute={component.initializationAttribute}
                            onEditSelector={(parameter, valueIndex) => editSelector(component, parameter, valueIndex)}
                            onValidationError={() => {
                                setHasError(true);
                            }}
                        />
                    );
                }
                console.error('Unsupported type of initialization attribute', attribute);
            }
        }

        function onDeleted() {
            setIsDeleted(true);
        }

        return (
            <div
                className={`component-instance 
                    ${component.selected ? 'selected' : ''} 
                    ${hasError ? 'has-error' : ''} 
                    ${isDeleted ? 'deleted' : ''}`}
                onClick={onSelected}
            >
                <span className="line-prefix">
                    <svg className="error-icon" width="14" height="14" viewBox="0 0 20 20" fill="red">
                        <path d="M19.64 16.36L11.53 2.3A1.85 1.85 0 0 0 10 1.21 1.85 1.85 0 0 0 8.48 2.3L.36 16.36C-.48 17.81.21 19 1.88 19h16.24c1.67 0 2.36-1.19 1.52-2.64zM11 16H9v-2h2zm0-4H9V6h2z" />
                    </svg>
                    <span className="line-index">{index}</span>
                </span>
                <span className="body-wrap">
                    <TypeNameEditor
                        component={component}
                        caretPosition={caretPosition}
                        onDeleted={onDeleted}
                        onSelectNext={onSelectNext}
                        onSelectPrevious={onSelectPrevious}
                    />
                    &nbsp;
                    {initializationAttribute(component.initializationAttribute)}
                </span>
            </div>
        );
    },
);

export default ComponentInstance;
