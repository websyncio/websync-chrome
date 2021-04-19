import { createPopper } from '@popperjs/core';
import Portal from 'components-common/Portal';
import FocusTrap from 'focus-trap-react';
import { observer } from 'mobx-react';
import ComponentInstanceModel from 'entities/mst/ComponentInstance';
import React, { RefObject, useEffect, useLayoutEffect, useState } from 'react';
import ComponentTypeSelector from './ComponentTypeSelector';
import './TypeNameEditor.sass';

interface Props {
    component: ComponentInstanceModel;
    showPlaceholders: boolean;
    initialCaretPosition: number | null;
    onDeleted: () => void;
    onSelectNext: (caretPosition: number) => boolean;
    onSelectPrevious: (caretPosition: number) => boolean;
    onChange: (componentType: string, componentName: string) => void;
}

const TypeNameEditor: React.FC<Props> = observer(
    ({ component, showPlaceholders, initialCaretPosition, onDeleted, onSelectNext, onSelectPrevious, onChange }) => {
        const typePlaceholder = '<set type>';
        const namePlaceholder = '<set name>';
        const popupRef: any = React.createRef();
        const typeRef: RefObject<any> = React.createRef();
        const nameRef: any = React.createRef();
        const [showSpace, setShowSpace] = useState(true);
        const [isOpen, setIsOpen] = useState(false);
        const [showTypePlaceholder, setShowTypePlaceholder] = useState(showPlaceholders && !component.typeName.length);
        const [showNamePlaceholder, setShowNamePlaceholder] = useState(showPlaceholders && !component.name.length);
        const [actualCaretPosition, setActualCaretPosition] = useState(0);
        let popper: any;

        useLayoutEffect(() => {
            console.log('TypeNameEditor first render');
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
            console.log('TypeNameEditor rerendered');
        });

        function getTypeLength(): number {
            return showTypePlaceholder ? typePlaceholder.length : typeRef.current.textContent.length;
        }

        function getFullLength(): number {
            let totalLength = getTypeLength();
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
            if (showTypePlaceholder) {
                position = position < typePlaceholder.length ? 0 : position - typePlaceholder.length;
            }
            if (position <= typeLength || !nameDisplayed) {
                const maxPosition = typeLength;
                if (position > maxPosition) {
                    position = maxPosition;
                }
                const elementPosition = position;
                makeEditable(typeRef.current);
                setElementCaretPosition(typeRef.current, elementPosition);
            } else {
                const maxPosition = typeLength + 1 + nameLength;
                if (position > maxPosition) {
                    position = maxPosition;
                }
                const elementPosition = position - typeLength - 1;
                makeEditable(nameRef.current);
                setElementCaretPosition(nameRef.current, elementPosition);
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
                console.log('get caret position from type');
                return getElementCaretPosition(typeRef.current);
            }
            if (isActive(nameRef.current)) {
                console.log('get caret position from name');
                return getTypeLength() + 1 + getElementCaretPosition(nameRef.current);
            }
            return 0;
            throw new Error('Unable to calculate caret position.');
        }

        useLayoutEffect(() => {
            if (isActive(typeRef.current) || isActive(nameRef.current)) {
                console.log('set actual caret position: ' + actualCaretPosition);
                setCaretPosition(actualCaretPosition, showSpace);
                component.select();
            }
        });

        useLayoutEffect(() => {
            if (component.selected) {
                if (!isActive(typeRef.current) && !isActive(nameRef.current)) {
                    const caretPosition = initialCaretPosition == null ? getFullLength() : initialCaretPosition;
                    console.log(
                        'set caret position when type and name are not active: ' +
                            caretPosition +
                            ', initial caret position: ' +
                            initialCaretPosition,
                    );
                    setCaretPosition(caretPosition, showSpace);
                    console.log('caret position:' + caretPosition + ', actual caret position: ' + getCaretPosition());
                    setActualCaretPosition(caretPosition);
                }
            } else {
                if (!showPlaceholders && !typeRef.current.textContent && !nameRef.current.textContent) {
                    onDeleted(); //setIsDeleted(true);
                }
            }
        }, [component.selected]);

        function deleteSpace(caretShift = 0) {
            setShowSpace(false);
            const caretPosition = getCaretPosition();
            typeRef.current.textContent += nameRef.current.textContent;
            nameRef.current.textContent = '';
            const newCaretPosition = caretPosition + caretShift;
            setCaretPosition(newCaretPosition, false);
            setActualCaretPosition(newCaretPosition);
        }

        function addSpace() {
            if (typeRef.current.textContent && !nameRef.current.textContent) {
                setShowSpace(true);
                const caretPosition = getCaretPosition();
                const text = typeRef.current.textContent;
                typeRef.current.textContent = text.substring(0, caretPosition);
                nameRef.current.textContent = text.substring(caretPosition);
                const newCaretPosition = caretPosition + 1;
                setCaretPosition(caretPosition + 1, true);
                setActualCaretPosition(newCaretPosition);
            }
        }

        function onTypeKeyDown(e) {
            const isLeftArrow = e.key == 'ArrowLeft';
            const isRightArrow = e.key == 'ArrowRight';
            const isDelete = e.key == 'Delete';
            const isEnd = getElementCaretPosition(e.target) == getTypeLength(); //typeRef.current.textContent.length;
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
                            const caretPosition = getTypeLength() + 1 + nameRef.current.textContent.length;
                            setCaretPosition(caretPosition, showSpace);
                            setActualCaretPosition(caretPosition);
                            e.preventDefault();
                        } else {
                            //setElementCaretPosition(typeRef.current, typeRef.current.textContent.length);
                            const caretPosition = getTypeLength();
                            setCaretPosition(caretPosition, showSpace);
                            setActualCaretPosition(caretPosition);
                            e.preventDefault();
                        }
                        return;
                    }
                    if (isLeftArrow) {
                        //setElementCaretPosition(typeRef.current, 0);
                        setCaretPosition(0, showSpace);
                        setActualCaretPosition(0);
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
                        const caretPosition = getTypeLength() + 1;
                        setCaretPosition(caretPosition, showSpace);
                        setActualCaretPosition(caretPosition);
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
                        setActualCaretPosition(0);
                        e.preventDefault();
                        return;
                    case 'End':
                        const caretPosition = getTypeLength() + 1 + nameRef.current.textContent.length;
                        setCaretPosition(caretPosition, showSpace);
                        setActualCaretPosition(caretPosition);
                        e.preventDefault();
                        return;
                    case ' ':
                        addSpace();
                        e.preventDefault();
                        return;
                    case 'Enter':
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
                    // setElementCaretPosition(nameRef.current, nameRef.current.textContent.length);
                    const caretPosition = getTypeLength() + 1 + nameRef.current.textContent.length;
                    setCaretPosition(caretPosition, showSpace);
                    setActualCaretPosition(caretPosition);
                    e.preventDefault();
                    return;
                } else if (isLeftArrow) {
                    if (isStart) {
                        setCaretPosition(0, showSpace);
                        setActualCaretPosition(0);
                    } else {
                        // setElementCaretPosition(nameRef.current, 0);
                        const caretPosition = getTypeLength() + 1;
                        setCaretPosition(caretPosition, showSpace);
                        setActualCaretPosition(caretPosition);
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
                        const caretPosition = getTypeLength();
                        setCaretPosition(caretPosition, showSpace);
                        setActualCaretPosition(caretPosition);
                        e.preventDefault();
                        return;
                    }
                } else if (isHomeKey) {
                    setCaretPosition(0, showSpace);
                    setActualCaretPosition(0);
                    e.preventDefault();
                    return;
                } else if (isEndKey) {
                    const caretPosition = getTypeLength() + 1 + nameRef.current.textContent.length;
                    setCaretPosition(caretPosition, showSpace);
                    setActualCaretPosition(caretPosition);
                    e.preventDefault();
                    return;
                }
            }

            if (!e.key.match(/[A-Za-z0-9_$]+/g)) {
                e.preventDefault();
                return;
            }
            const name = e.target.innerText.trim();
            if (name.length === 100) {
                e.preventDefault();
                return;
            }
        }

        function onKeyDown(e) {
            if (!e.altKey && !e.ctrlKey && !e.shiftKey) {
                if (e.key == 'ArrowDown') {
                    if (onSelectNext(getCaretPosition())) {
                        typeRef.current.contentEditable = false;
                        nameRef.current.contentEditable = false;
                    }
                    e.preventDefault();
                } else if (e.key == 'Enter') {
                    if (onSelectNext(0)) {
                        typeRef.current.contentEditable = false;
                        nameRef.current.contentEditable = false;
                    }
                    e.preventDefault();
                } else if (e.key == 'ArrowUp') {
                    if (onSelectPrevious(getCaretPosition())) {
                        typeRef.current.contentEditable = false;
                        nameRef.current.contentEditable = false;
                    }
                    e.preventDefault();
                }
            }
        }

        function makeNonEditable(element) {
            element.contentEditable = false;
        }

        function onBlur(event) {
            event.target.contentEditable = false;
            if (!isActive(typeRef.current) && !isActive(nameRef.current)) {
                component.deselect();
            }
        }

        function togglePopup() {
            setIsOpen(!isOpen);
        }

        function onComponentTypeSelected() {
            console.log('onComponentTypeSelected not implemlemented');
        }

        function setPlaceholder(element, setShowPlaceholder: (boolean) => void) {
            if (!showPlaceholders) {
                return;
            }
            setShowPlaceholder(!element.textContent.length);
        }

        function onAttributeChange(attributeElement, setShowPlaceholder) {
            setPlaceholder(attributeElement, setShowPlaceholder);
            // component.setComponentType(typeRef.current.textContent);
            // component.rename(nameRef.current.textContent, null);
            const caretPosition = getCaretPosition();
            console.log('attribute changed', attributeElement);
            console.log('attribute changed', caretPosition);
            setActualCaretPosition(caretPosition);
            onChange(typeRef.current.textContent, nameRef.current.textContent);
        }

        function onEditableClick(element) {
            makeEditable(element);
            setActualCaretPosition(getCaretPosition());
        }

        return (
            <span onKeyDown={onKeyDown}>
                <span
                    className={`trigger type-name`}
                    ref={typeRef}
                    spellCheck="false"
                    onKeyDown={onTypeKeyDown}
                    onKeyUp={(e) => onAttributeChange(e.target, setShowTypePlaceholder)}
                    onMouseDown={(e) => makeNonEditable(e.target)}
                    onClick={(e) => onEditableClick(e.target)}
                    onBlur={onBlur}
                >
                    {component.typeName}
                </span>
                {showTypePlaceholder && (
                    <span className="component-attr-placeholder" onClick={() => onEditableClick(typeRef.current)}>
                        {typePlaceholder}
                    </span>
                )}
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
                {showSpace && <span className="space">&nbsp;</span>}
                <div className="field-name-wrap">
                    <span
                        ref={nameRef}
                        spellCheck="false"
                        className={`field-name`}
                        title="Double Click to Edit Name"
                        // onDoubleClick={onRename}
                        onKeyDown={onNameKeyDown}
                        onKeyUp={(e) => onAttributeChange(e.target, setShowNamePlaceholder)}
                        onBlur={onBlur}
                        onMouseDown={(e) => makeNonEditable(e.target)}
                        onClick={(e) => onEditableClick(e.target)}
                    >
                        {component.componentFieldName}
                    </span>
                    {showNamePlaceholder && (
                        <span className="component-attr-placeholder" onClick={() => onEditableClick(nameRef.current)}>
                            {namePlaceholder}
                        </span>
                    )}
                </div>
            </span>
        );
    },
);

export default TypeNameEditor;
