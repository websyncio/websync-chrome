import React, { Component, RefObject, useEffect, useLayoutEffect, useState } from 'react';
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
    const typeRef: RefObject<any> = React.createRef();
    const nameRef: any = React.createRef();
    let popper: any;

    const [isOpen, setIsOpen] = useState(false);
    const [isTypeSelected, setIsTypeSelected] = useState(false);
    const [isNameSelected, setIsNameSelected] = useState(false);
    const [hasError, setHasError] = useState(false);

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
            setIsNameSelected(false);
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

    function getCursorPosition(editableElement) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
            const range = sel.getRangeAt(0);
            if (range.commonAncestorContainer.parentNode == editableElement) {
                return range.endOffset;
            }
        }
        return 0;
    }

    function onNameKeyDown(e) {
        if (!e.altKey && !e.ctrlKey && !e.shiftKey) {
            if (e.key == 'ArrowLeft' && getCursorPosition(e.target) == 0) {
                setIsNameSelected(false);
                setIsTypeSelected(true);
                typeRef.current.focus();
            }
        }

        const newName = e.target.innerText.trim();
        if (!e.key.match(/[A-Za-z0-9_$]+/g)) {
            e.preventDefault();
            return;
        }
        if (e.key === 'Enter') {
            e.target.classList.remove('editing');
            submitRename(e, component, newName);
            e.preventDefault();
        } else if (e.key === 'Escape') {
            e.target.classList.remove('editing');
            submitRename(e, component, null);
        } else if (newName.length === 100) {
            e.preventDefault();
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
                        onValidationError={() => {
                            setHasError(true);
                        }}
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

    function onTypeKeyDown(e) {
        if (!e.altKey && !e.ctrlKey && !e.shiftKey) {
            if (e.key == 'ArrowRight' && getCursorPosition(typeRef.current) == typeRef.current.textContent.length) {
                setIsTypeSelected(false);
                setIsNameSelected(true);
                nameRef.current.focus();
                e.preventDefault();
            }
        }
        if (e.ctrlKey && e.key === ' ') {
            setIsOpen(true);
            // event.preventDefault();
        }
    }

    return (
        <div className={`component-instance ${component.selected ? 'selected' : ''}`} onClick={selectComponent}>
            {hasError && (
                <svg className="warning-icon" width="14" height="14" viewBox="0 0 20 20" fill="red">
                    <path d="M19.64 16.36L11.53 2.3A1.85 1.85 0 0 0 10 1.21 1.85 1.85 0 0 0 8.48 2.3L.36 16.36C-.48 17.81.21 19 1.88 19h16.24c1.67 0 2.36-1.19 1.52-2.64zM11 16H9v-2h2zm0-4H9V6h2z" />
                </svg>
            )}

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
