import { createPopper } from '@popperjs/core';
import Portal from 'components/Portal';
import FocusTrap from 'focus-trap-react';
import { observer } from 'mobx-react';
import ComponentInstanceModel from 'mst/ComponentInstance';
import React, { RefObject, useEffect, useLayoutEffect, useState } from 'react';
import ComponentTypeSelector from './ComponentTypeSelector';

interface Props {
    component: ComponentInstanceModel;
    caretPosition: number | null;
    onDeleted: () => void;
    onSelectNext: (caretPosition: number) => void;
    onSelectPrevious: (caretPosition: number) => void;
}

const TypeNameEditor: React.FC<Props> = observer(
    ({ component, caretPosition, onDeleted, onSelectNext, onSelectPrevious }) => {
        const popupRef: any = React.createRef();
        const typeRef: RefObject<any> = React.createRef();
        const spaceRef: any = React.createRef();
        const nameRef: any = React.createRef();
        const [showSpace, setShowSpace] = useState(true);
        const [isOpen, setIsOpen] = useState(false);
        let popper: any;

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

        function getFullLength(): number {
            let totalLength = typeRef.current.textContent.length;
            if (showSpace) {
                totalLength += 1 + nameRef.current.textContent.length;
            }
            return totalLength;
        }

        function isActive(element): boolean {
            return window.document.activeElement === element;
        }

        function makeEditable(element) {
            typeRef.current.contentEditable = element == typeRef.current;
            //spaceRef.current.contentEditable = element==spaceRef.current;
            nameRef.current.contentEditable = element == nameRef.current;
            element.focus();
        }

        function setElementCaretPosition(element, position: number) {
            const range = document.createRange();
            range.selectNode(element);
            if (element.childNodes[0]) {
                range.setStart(element.childNodes[0], position);
                range.collapse(true);
                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(range);
            }
        }

        function setCaretPosition(position: number, nameDisplayed: boolean) {
            const typeLength = typeRef.current.textContent.length;
            const nameLength = nameRef.current.textContent.length;
            if (position <= typeLength || !nameDisplayed) {
                if (position > typeLength) {
                    position = typeLength;
                }
                makeEditable(typeRef.current);
                setElementCaretPosition(typeRef.current, position);
            } else {
                position = position - typeLength - 1;
                if (position > nameLength) {
                    position = nameLength;
                }
                makeEditable(nameRef.current);
                setElementCaretPosition(nameRef.current, position);
            }
        }

        useLayoutEffect(() => {
            if (component.selected) {
                if (!isActive(typeRef.current) && !isActive(nameRef.current)) {
                    setCaretPosition(caretPosition == null ? getFullLength() : caretPosition, showSpace);
                }
            } else {
                if (!typeRef.current.textContent && !nameRef.current.textContent) {
                    onDeleted(); //setIsDeleted(true);
                }
            }
        }, [component.selected]);

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

        function deleteSpace(caretShift = 0) {
            setShowSpace(false);
            const caretPosition = getCaretPosition();
            typeRef.current.textContent += nameRef.current.textContent;
            nameRef.current.textContent = '';
            setCaretPosition(caretPosition + caretShift, false);
        }

        function addSpace() {
            if (typeRef.current.textContent && !nameRef.current.textContent) {
                setShowSpace(true);
                const caretPosition = getCaretPosition();
                const text = typeRef.current.textContent;
                typeRef.current.textContent = text.substring(0, caretPosition);
                nameRef.current.textContent = text.substring(caretPosition);
                setCaretPosition(caretPosition + 1, true);
            }
        }

        function submitRename(event, component: ComponentInstanceModel, newName) {
            // if (event.target.contentEditable === 'true') {
            //     //event.target.contentEditable = false;
            //     if (newName === null) {
            //         event.target.innerText = component.name;
            //         return;
            //     } else if (component.name === newName) {
            //         return;
            //     }
            //     component.rename(newName, ideProxy);
            // }
        }

        function onTypeKeyDown(e) {
            const isLeftArrow = e.key == 'ArrowLeft';
            const isRightArrow = e.key == 'ArrowRight';
            const isDelete = e.key == 'Delete';
            const isEnd = getElementCaretPosition(e.target) == typeRef.current.textContent.length;
            if (e.ctrlKey) {
                if (e.shiftKey) {
                    // SELECTION
                    if (isRightArrow) {
                        //setElementSelectionRange();
                        //setElementCaretPosition(nameRef.current, nameRef.current.textContent.length);
                        return;
                    } else if (isLeftArrow) {
                        //setElementSelectionRange();
                        //setElementCaretPosition(nameRef.current, 0);
                        return;
                    }
                } else {
                    // NAVIGATION WITH CTRL
                    if (isRightArrow) {
                        if (isEnd) {
                            setCaretPosition(
                                typeRef.current.textContent.length + 1 + nameRef.current.textContent.length,
                                showSpace,
                            );
                            e.preventDefault();
                        } else {
                            setElementCaretPosition(typeRef.current, typeRef.current.textContent.length);
                            e.preventDefault();
                        }
                        return;
                    }
                    if (isLeftArrow) {
                        setElementCaretPosition(typeRef.current, 0);
                        e.preventDefault();
                        return;
                    }

                    // HOT KEYS WITH CTRL
                    if (e.key === ' ') {
                        setIsOpen(true);
                        e.preventDefault();
                    }
                }
            } else {
                // NAVIGATION
                if (isEnd) {
                    if (isRightArrow) {
                        setCaretPosition(typeRef.current.textContent.length + 1, showSpace);
                        e.preventDefault();
                        return;
                    } else if (isDelete) {
                        deleteSpace();
                        e.preventDefault();
                        return;
                    }
                }
                switch (e.key) {
                    case 'Home':
                        setCaretPosition(0, showSpace);
                        e.preventDefault();
                        return;
                    case 'End':
                        setCaretPosition(
                            typeRef.current.textContent.length + 1 + nameRef.current.textContent.length,
                            showSpace,
                        );
                        e.preventDefault();
                        return;
                    case ' ':
                        addSpace();
                        e.preventDefault();
                        return;
                }
            }
        }

        function onNameKeyDown(e) {
            const isHomeKey = e.key == 'Home';
            const isEndKey = e.key == 'End';
            const isLeftArrow = e.key == 'ArrowLeft';
            const isRightArrow = e.key == 'ArrowRight';
            const isBackspace = e.key == 'Backspace';
            const isStart = getElementCaretPosition(e.target) == 0;
            if (e.shiftKey) {
                // if(isStart && isLeftArrow){
                //     component.setForDeletion(true);
                //     setCaretPosition(typeRef.current.textContent.length);
                //     e.preventDefault();
                //     return;
                // }
                if (e.ctrlKey) {
                    if (isRightArrow) {
                        //setElementSelectionRange();
                        //setElementCaretPosition(nameRef.current, nameRef.current.textContent.length);
                        e.preventDefault();
                        return;
                    } else if (isLeftArrow) {
                        //setElementSelectionRange();
                        //setElementCaretPosition(nameRef.current, 0);
                        e.preventDefault();
                        return;
                    }
                }
            } else if (e.ctrlKey) {
                if (isRightArrow) {
                    setElementCaretPosition(nameRef.current, nameRef.current.textContent.length);
                    e.preventDefault();
                    return;
                } else if (isLeftArrow) {
                    if (isStart) {
                        setCaretPosition(0, showSpace);
                    } else {
                        setElementCaretPosition(nameRef.current, 0);
                    }
                    e.preventDefault();
                    return;
                }
            } else {
                if (isStart) {
                    if (isBackspace) {
                        deleteSpace(-1);
                        e.preventDefault();
                        return;
                    }
                    if (isLeftArrow) {
                        setCaretPosition(typeRef.current.textContent.length, showSpace);
                        e.preventDefault();
                        return;
                    }
                } else if (isHomeKey) {
                    setCaretPosition(0, showSpace);
                    e.preventDefault();
                    return;
                } else if (isEndKey) {
                    setCaretPosition(
                        typeRef.current.textContent.length + 1 + nameRef.current.textContent.length,
                        showSpace,
                    );
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
                return;
            }
            if (e.key === 'Escape') {
                submitRename(e, component, null);
                return;
            }
            if (newName.length === 100) {
                e.preventDefault();
                return;
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
        }

        function makeNonEditable(element) {
            element.contentEditable = false;
        }

        function onNameBlur(event) {
            const newName = event.target.innerText.trim();
            submitRename(event, component, newName);
            event.target.contentEditable = false;
        }

        function onTypeBlur(event) {
            event.target.contentEditable = false;
        }

        function togglePopup() {
            setIsOpen(!isOpen);
        }

        function onComponentTypeSelected() {
            console.log('onComponentTypeSelected not implemlemented');
        }

        return (
            <span onKeyDown={onKeyDown}>
                <span
                    className={`trigger type-name`}
                    ref={typeRef}
                    spellCheck="false"
                    onKeyDown={onTypeKeyDown}
                    onMouseDown={(e) => makeNonEditable(e.target)}
                    onClick={(e) => makeEditable(e.target)}
                    onBlur={onTypeBlur}
                >
                    {component.typeName}
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
                                        <ComponentTypeSelector onSelected={onComponentTypeSelected} />
                                    </div>
                                </div>
                            </FocusTrap>
                        )}
                    </span>
                </Portal>
                {showSpace && (
                    <span ref={spaceRef} className="space">
                        &nbsp;
                    </span>
                )}
                <div className="field-name-wrap">
                    <span
                        ref={nameRef}
                        spellCheck="false"
                        className={`field-name`}
                        title="Double Click to Edit Name"
                        // onDoubleClick={onRename}
                        onKeyDown={onNameKeyDown}
                        onBlur={onNameBlur}
                        onMouseDown={(e) => makeNonEditable(e.target)}
                        onClick={(e) => makeEditable(e.target)}
                    >
                        {component.componentFieldName}
                    </span>
                </div>
            </span>
        );
    },
);

export default TypeNameEditor;
