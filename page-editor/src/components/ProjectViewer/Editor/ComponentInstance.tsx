import React, { Component, useEffect, useLayoutEffect, useState } from 'react';
import ComponentInstanceModel from 'mst/ComponentInstance';
import AttributeModel from 'mst/Attribute';
import ParameterModel from 'mst/Parameter';
import JDISelectorsAttribute from '../../JDI/JDISelectorsAttribute';
import SelectorEditorProxy from 'services/SelectorEditor/SelectorEditorProxy';
import { createPopper } from '@popperjs/core';
import FocusTrap from 'focus-trap-react';
import Portal from '../../Portal';
import 'styles/Popup.sass';
import './ComponentInstance.sass';
import ComponentTypeSelector from './ComponentTypeSelector';
import { InitializationAttributes } from 'services/JDI';
import IIdeProxy from 'interfaces/IIdeProxy';
import { observer } from 'mobx-react';
import RootStore from 'mst/RootStore';
import { useRootStore } from 'context';
import { isType } from 'mobx-state-tree';

interface Props {
    ideProxy: IIdeProxy;
    component: ComponentInstanceModel;
    onSelected: () => void;
}

const ComponentInstance: React.FC<Props> = observer(({ ideProxy, component, onSelected }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    const popupRef: any = React.createRef();
    const typeRef: any = React.createRef();
    const nameRef: any = React.createRef();
    let popper: any;

    const [isOpen, setIsOpen] = useState(false);
    const [isTypeSelected, setIsTypeSelected] = useState(false);
    const [isNameSelected, setIsNameSelected] = useState(false);

    useLayoutEffect(() => {
        popper = createPopper(typeRef.current, popupRef.current, {
            placement: 'bottom-start',
            strategy: 'fixed',
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [0, 2],
                    },
                },
            ],
        });
        return function cleanup() {
            popper.destroy();
        };
    }, []);

    useEffect(() => {
        if (popper) {
            popper.forceUpdate();
        }
    }, [isOpen]);

    useEffect(() => {
        if (component.selected) {
            typeRef.current.focus();
            setIsTypeSelected(true);
        }
    }, [component.selected]);

    function togglePopup() {
        setIsOpen(!isOpen);
    }

    function onRename(event) {
        // if (event.target.contentEditable === true) {
        //     event.target.contentEditable = false;
        // } else {
        event.target.contentEditable = true;
        event.target.focus();
        event.target.classList.add('editing');
        const target = event.target;

        target.focus();
        const range = document.createRange();
        range.selectNodeContents(target);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    function submitRename(event, component: ComponentInstanceModel, newName) {
        if (event.target.contentEditable === 'true') {
            //event.target.contentEditable = false;
            if (newName === null) {
                event.target.innerText = component.name;
                return;
            } else if (component.name === newName) {
                return;
            }

            component.rename(newName, ideProxy);
        }
    }

    function onNameKeyDown(event) {
        const newName = event.target.innerText.trim();
        if (!event.key.match(/[A-Za-z0-9_$]+/g)) {
            event.preventDefault();
            return;
        }
        if (event.key === 'Enter') {
            event.target.classList.remove('editing');
            submitRename(event, component, newName);
            event.preventDefault();
        } else if (event.key === 'Escape') {
            event.target.classList.remove('editing');
            submitRename(event, component, null);
        } else if (newName.length === 100) {
            event.preventDefault();
        }
    }

    function onNameBlur(event) {
        event.target.classList.remove('editing');
        const newName = event.target.innerText.trim();
        submitRename(event, component, newName);
    }

    const editSelector = (component: ComponentInstanceModel, parameter: ParameterModel, valueIndex: number) => {
        SelectorEditorProxy.instance().sendMessage('edit-component-selector', {
            componentId: component.id,
            componentName: component.name,
            parameterName: parameter.name,
            parameterValueIndex: valueIndex,
            selector: parameter.values[valueIndex],
        });
    };

    function editComponentType() {
        console.log('edit component type');
    }

    function getName(id: string) {
        const arr = id.split('.');
        return arr[arr.length - 1].trim();
    }

    function getTypeName(componentTypeId: string) {
        const arr = componentTypeId.split('.');
        return arr[arr.length - 1].trim();
    }

    function initializationAttribute(attribute: AttributeModel) {
        if (attribute) {
            if (InitializationAttributes.Generic.indexOf(attribute.name) != -1) {
                return (
                    <JDISelectorsAttribute
                        attribute={component.initializationAttribute}
                        onEditSelector={(parameter, valueIndex) => editSelector(component, parameter, valueIndex)}
                    />
                );
            }
            console.error('Unsupported type of initialization attribute', attribute);
        }
    }

    function editType() {
        setIsTypeSelected(true);
        setIsNameSelected(false);
    }

    function editName() {
        setIsTypeSelected(false);
        setIsNameSelected(true);
    }

    function selectComponent() {
        component.select();
        onSelected();
    }

    function onTypeKeyDown(event) {
        if (event.ctrlKey && event.key === ' ') {
            setIsOpen(true);
            // event.preventDefault();
        }
    }

    return (
        <div className={`component-instance ${component.selected ? 'selected' : ''}`} onClick={selectComponent}>
            <span
                className={`trigger type-name editing ${component.selected && isTypeSelected ? 'selected' : ''}`}
                ref={typeRef}
                contentEditable="true"
                spellCheck="false"
                onClick={editType}
                onKeyDown={onTypeKeyDown}
            >
                {getTypeName(component.componentType)}
            </span>

            <Portal>
                <span className="popup__container" ref={popupRef}>
                    {isOpen && (
                        <FocusTrap
                            focusTrapOptions={{
                                onDeactivate: togglePopup,
                                clickOutsideDeactivates: true,
                            }}
                        >
                            <div className="popup">
                                <div tabIndex={0}>
                                    <ComponentTypeSelector onSelected={editSelector} />
                                </div>
                            </div>
                        </FocusTrap>
                    )}
                </span>
            </Portal>

            <div className="field-name-wrap">
                <span
                    ref={nameRef}
                    contentEditable="true"
                    spellCheck="false"
                    className={`field-name editing ${component.selected && isNameSelected ? 'selected' : ''}`}
                    title="Double Click to Edit Name"
                    // onDoubleClick={onRename}
                    onClick={editName}
                    onKeyDown={onNameKeyDown}
                    onBlur={onNameBlur}
                >
                    {getName(component.id)}
                </span>
            </div>
            {initializationAttribute(component.initializationAttribute)}
        </div>
    );
});

export default ComponentInstance;
