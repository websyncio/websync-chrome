import React, { Component, DOMElement, RefObject, useEffect, useLayoutEffect, useState } from 'react';
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
import { SSL_OP_CIPHER_SERVER_PREFERENCE } from 'constants';
import { boolean } from 'mobx-state-tree/dist/internal';

interface Props {
    ideProxy: IIdeProxy;
    component: ComponentInstanceModel;
    caretPosition: number;
    onSelected: () => void;
    onSelectNext: (caretPosition: number) => void;
    onSelectPrevious: (caretPosition: number) => void;
}

const ComponentInstance: React.FC<Props> = observer(
    ({ ideProxy, component, caretPosition, onSelected, onSelectNext, onSelectPrevious }) => {
        const { projectStore, uiStore }: RootStore = useRootStore();
        const popupRef: any = React.createRef();
        const typeRef: RefObject<any> = React.createRef();
        const nameRef: any = React.createRef();
        let popper: any;

        const [isOpen, setIsOpen] = useState(false);
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

        function isActive(element): boolean {
            return window.document.activeElement === element;
        }

        function setElementCaretPosition(element, position: number) {
            const range = document.createRange();
            range.selectNode(element);
            range.setStart(element.childNodes[0], position);
            range.collapse(true);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
        }

        function setCaretPosition(position: number) {
            const typeLength = typeRef.current.textContent.length;
            const nameLength = nameRef.current.textContent.length;
            if (position <= typeLength) {
                typeRef.current.contentEditable = true;
                typeRef.current.focus();
                setElementCaretPosition(typeRef.current, position);
            } else {
                position = position - typeLength - 1;
                if (position > nameLength) {
                    position = nameLength;
                }
                nameRef.current.contentEditable = true;
                nameRef.current.focus();
                setElementCaretPosition(nameRef.current, position);
            }
        }

        useEffect(() => {
            if (component.selected && !isActive(typeRef.current) && !isActive(nameRef.current)) {
                setCaretPosition(caretPosition);
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

        function getElementCaretPosition(editableElement) {
            const sel = window.getSelection();
            if (sel && sel.rangeCount) {
                const range = sel.getRangeAt(0);
                if (range.commonAncestorContainer.parentNode == editableElement) {
                    return range.endOffset;
                }
            }
            return 0;
        }

        function getCaretPosition(): number {
            if (isActive(typeRef.current)) {
                return getElementCaretPosition(typeRef.current);
            }
            if (isActive(nameRef.current)) {
                return typeRef.current.textContent.length + 1 + getElementCaretPosition(nameRef.current);
            }
            throw new Error('Unable to calculate caret position.');
        }

        function onNameKeyDown(e) {
            if (!e.altKey && !e.ctrlKey && !e.shiftKey) {
                if (e.key == 'ArrowLeft' && getElementCaretPosition(e.target) == 0) {
                    nameRef.current.contentEditable = false;
                    setCaretPosition(typeRef.current.textContent.length);
                    e.preventDefault();
                    return;
                }
            }

            const newName = e.target.innerText.trim();
            if (!e.key.match(/[A-Za-z0-9_$]+/g)) {
                e.preventDefault();
                return;
            }
            if (e.key === 'Enter') {
                submitRename(e, component, newName);
                e.preventDefault();
            } else if (e.key === 'Escape') {
                submitRename(e, component, null);
            } else if (newName.length === 100) {
                e.preventDefault();
            }
        }

        function onNameBlur(event) {
            const newName = event.target.innerText.trim();
            submitRename(event, component, newName);
            event.target.contentEditable = false;
        }

        function onTypeBlur(event) {
            event.target.contentEditable = false;
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

        function selectComponent() {
            component.select();
            onSelected();
        }

        function onTypeKeyDown(e) {
            if (!e.altKey && !e.ctrlKey && !e.shiftKey) {
                if (
                    e.key == 'ArrowRight' &&
                    getElementCaretPosition(typeRef.current) == typeRef.current.textContent.length
                ) {
                    typeRef.current.contentEditable = false;
                    nameRef.current.contentEditable = true;
                    nameRef.current.focus();
                    e.preventDefault();
                }
            }
            if (e.ctrlKey && e.key === ' ') {
                setIsOpen(true);
                // event.preventDefault();
            }
        }

        function onKeyDown(e) {
            if (!e.altKey && !e.ctrlKey && !e.shiftKey) {
                if (e.key == 'ArrowDown') {
                    onSelectNext(getCaretPosition());
                    typeRef.current.contentEditable = false;
                    nameRef.current.contentEditable = false;
                    e.preventDefault();
                } else if (e.key == 'ArrowUp') {
                    onSelectPrevious(getCaretPosition());
                    typeRef.current.contentEditable = false;
                    nameRef.current.contentEditable = false;
                    e.preventDefault();
                }
            }
            if (e.ctrlKey && e.key === ' ') {
                setIsOpen(true);
                // event.preventDefault();
            }
        }

        function makeEditable(e) {
            e.target.contentEditable = true;
            e.target.focus();
        }

        function makeNonEditable(e) {
            e.target.contentEditable = false;
        }

        return (
            <div
                className={`component-instance ${component.selected ? 'selected' : ''} ${hasError ? 'has-error' : ''}`}
                onClick={selectComponent}
                onKeyDown={onKeyDown}
            >
                <svg className="error-icon" width="14" height="14" viewBox="0 0 20 20" fill="red">
                    <path d="M19.64 16.36L11.53 2.3A1.85 1.85 0 0 0 10 1.21 1.85 1.85 0 0 0 8.48 2.3L.36 16.36C-.48 17.81.21 19 1.88 19h16.24c1.67 0 2.36-1.19 1.52-2.64zM11 16H9v-2h2zm0-4H9V6h2z" />
                </svg>
                <span
                    className={`trigger type-name`}
                    ref={typeRef}
                    spellCheck="false"
                    onKeyDown={onTypeKeyDown}
                    onMouseDown={makeNonEditable}
                    onClick={makeEditable}
                    onBlur={onTypeBlur}
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
                &nbsp;
                <div className="field-name-wrap">
                    <span
                        ref={nameRef}
                        spellCheck="false"
                        className={`field-name`}
                        title="Double Click to Edit Name"
                        // onDoubleClick={onRename}
                        onKeyDown={onNameKeyDown}
                        onBlur={onNameBlur}
                        onClick={makeEditable}
                        onMouseDown={makeNonEditable}
                    >
                        {getName(component.id)}
                    </span>
                </div>
                &nbsp;
                {initializationAttribute(component.initializationAttribute)}
            </div>
        );
    },
);

export default ComponentInstance;
