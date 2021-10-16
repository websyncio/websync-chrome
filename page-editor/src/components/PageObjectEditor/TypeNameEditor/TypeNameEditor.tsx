import { createPopper } from '@popperjs/core';
import Portal from 'components-common/Portal';
import FocusTrap from 'focus-trap-react';
import { observer } from 'mobx-react';
import ComponentInstanceModel from 'entities/mst/ComponentInstance';
import React, { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import EditorPopup from '../EditorPopup/EditorPopup';
import './TypeNameEditor.sass';
import RootStore from 'entities/mst/RootStore';
import { useRootStore } from 'context';
import { PopupContent } from 'semantic-ui-react';
import { getNextIndex } from 'utils/IndexUtils';
import IEditorPopupAction from '../EditorPopup/IEditorPopupAction';
import { ProposedComponentTypeAction } from './ProposedComponentTypeAction';
import ComponentType from 'entities/mst/ComponentType';

interface Props {
    component: ComponentInstanceModel;
    showPlaceholders: boolean;
    isSelected: boolean;
    initialCaretPosition: number | null;
    onDelete: () => void;
    onSelectedStateChange: (isSelected: boolean) => void;
    onSelectNext: (caretPosition: number) => boolean;
    onSelectPrevious: (caretPosition: number) => boolean;
    onChange: (componentType: string, componentName: string) => void;
}

const TypeNameEditor: React.FC<Props> = observer(
    ({
        component,
        showPlaceholders,
        isSelected,
        initialCaretPosition,
        onDelete,
        onSelectedStateChange: onSelectedStateChange,
        onSelectNext,
        onSelectPrevious,
        onChange,
    }) => {
        const { uiStore, projectStore }: RootStore = useRootStore();
        const typePlaceholder = '<set type>';
        const namePlaceholder = '<set name>';
        const popupRef: any = React.createRef();
        const typeRef: RefObject<any> = useRef(null);
        const nameRef: any = useRef(null);
        const [showSpace, setShowSpace] = useState(true);
        const [isEditorPopupOpen, setIsEditorPopupOpen] = useState(false);
        const [showTypePlaceholder, setShowTypePlaceholder] = useState(showPlaceholders && !component.typeName.length);
        const [showNamePlaceholder, setShowNamePlaceholder] = useState(showPlaceholders && !component.fieldName.length);
        const [actualCaretPosition, setActualCaretPosition] = useState(0);
        const [editorPopupSelectedActionIndex, setEditorPopupSelectedActionIndex] = useState(0);
        const [editorPopupActions, setEditorPopupActions] = useState<IEditorPopupAction[]>([]);
        let popper: any;

        const matchingTypes = projectStore.componentTypes.filter((t) => t.name === component.typeName);

        useLayoutEffect(() => {
            console.log('TypeNameEditor first render', component.fieldName);
            popper = createPopper(typeRef.current, popupRef.current, {
                placement: 'bottom-start',
                strategy: 'fixed',
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [-3, 1],
                        },
                    },
                ],
            });
            return function cleanup() {
                popper.destroy();
            };
        }, []);

        useLayoutEffect(() => {
            if (popper) {
                console.log('popper.forceUpdate();');
                popper.forceUpdate();
            }
        }, [isEditorPopupOpen]);

        useEffect(() => {
            console.log('TypeNameEditor rerendered. useEffect', component.fieldName);
        });

        function makeEditable(element) {
            typeRef.current.contentEditable = element == typeRef.current;
            //spaceRef.current.contentEditable = element==spaceRef.current;
            nameRef.current.contentEditable = element == nameRef.current;
            element.focus();
        }

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
                console.log('TypeNameEditor. Set actual caret position: ' + actualCaretPosition);
                setCaretPosition(actualCaretPosition, showSpace);
                onSelectedStateChange(true);
            }
        });

        useLayoutEffect(() => {
            if (isSelected) {
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
                    onDelete(); //setIsDeleted(true);
                }
            }
        }, [isSelected]);

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

        function handleInvalidSymbols(e) {
            if (!e.key.match(/[A-Za-z0-9_$]+/g)) {
                e.preventDefault();
                return true;
            }
        }

        function handleExtraSymbols(e, maxLength: number) {
            const name = e.target.innerText.trim();
            if (name.length === maxLength) {
                e.preventDefault();
                return true;
            }
        }

        function getValueBeforeCaret(caretPosition: number) {
            const typeLength = typeRef.current.textContent.length;
            const nameLength = nameRef.current.textContent.length;
            if (caretPosition <= typeLength) {
                return typeRef.current.textContent.substring(0, caretPosition);
            }
            if (caretPosition == typeLength + 1) {
                return null;
            }
            if (caretPosition > typeLength + 1 + nameLength) {
                throw new Error('Invalid caret position.');
            }
            return nameRef.current.textContent.substring(0, caretPosition - typeLength - 1);
        }

        function applySelectedComponent(componentType: ComponentType) {
            // TODO: we have to store id of selected component type
            onChange(componentType.name, nameRef.current.textContent);
            setShowTypePlaceholder(false);
            setActualCaretPosition(0);
            setIsEditorPopupOpen(false);
        }

        function generatePopupActionsForProposedComponents(
            typeName: string,
            frameworkComponentTypes: ComponentType[],
            customComponentTypes: ComponentType[],
            applySelectedComponent: (componenType: ComponentType) => void,
        ): IEditorPopupAction[] {
            function filterComponentTypes(allComponentTypes) {
                if (!typeName) {
                    return allComponentTypes;
                }
                const typeNameStartWith = allComponentTypes.filter((c) => c.name.startsWith(typeName));
                allComponentTypes = allComponentTypes.filter((c) => !typeNameStartWith.includes(c));
                const typeNameContainsExact = allComponentTypes.filter((c) => c.name.includes(typeName));
                return typeNameStartWith.concat(typeNameContainsExact);
            }
            const filteredFrameworkCompopentTypes = filterComponentTypes(projectStore.frameworkComponentTypes);
            const filteredCustomCompopentTypes = filterComponentTypes(projectStore.customComponentTypes);
            const filteredComponentTypes = filteredFrameworkCompopentTypes.concat(filteredCustomCompopentTypes);

            return filteredComponentTypes.map((c) => new ProposedComponentTypeAction(c, applySelectedComponent));
        }

        function showPopupWithProposedComponents(searchString: string) {
            if (searchString === null) {
                // .find a better way
                setIsEditorPopupOpen(false);
                return;
            }
            const editorPopupActions = generatePopupActionsForProposedComponents(
                searchString,
                projectStore.frameworkComponentTypes,
                projectStore.customComponentTypes,
                applySelectedComponent,
            );
            setEditorPopupSelectedActionIndex(0);
            setEditorPopupActions(editorPopupActions);
            setIsEditorPopupOpen(true);
        }

        function onTypeKeyDown(e) {
            const isLeftArrow = e.key == 'ArrowLeft';
            const isRightArrow = e.key == 'ArrowRight';
            const isDelete = e.key == 'Delete';
            const isBackspace = e.key == 'Backspace';
            const isEnter = e.key == 'Enter';
            const typeLength = typeRef.current.textContent.length;
            const elementCaretPosition = getElementCaretPosition(e.target);
            const isStart = elementCaretPosition == 0;
            const isEnd = elementCaretPosition == typeLength;
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
                } else if (e.altKey) {
                    return;
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
                        showPopupWithProposedComponents(getValueBeforeCaret(actualCaretPosition));
                        e.preventDefault();
                    }
                }
            }
            if (e.altKey) {
                // HOT KEYS WITH ALT
                if (isEnter) {
                    setIsEditorPopupOpen(true);
                    e.preventDefault();
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

            if (handleInvalidSymbols(e)) {
                return;
            }

            if (handleExtraSymbols(e, 50)) {
                return;
            }

            // if(showPlaceholders){
            //     const isWordCharacter = e.key.length === 1;
            //     if(typeLength==0){
            //         if(isWordCharacter){
            //             setShowTypePlaceholder(false);
            //         }
            //     }else if(typeLength==1){
            //         if(isStart){
            //             setShowTypePlaceholder(isDelete);
            //         }else if(isEnd){
            //             setShowTypePlaceholder(isBackspace);
            //         }
            //     }
            // }
        }

        function onNameKeyDown(e) {
            const isHomeKey = e.key == 'Home';
            const isEndKey = e.key == 'End';
            const isLeftArrow = e.key == 'ArrowLeft';
            const isRightArrow = e.key == 'ArrowRight';
            const isBackspace = e.key == 'Backspace';
            const isDelete = e.key == 'Delete';
            const elementCaretPosition = getElementCaretPosition(e.target);
            const nameLength = nameRef.current.textContent.length;
            const isStart = elementCaretPosition == 0;
            const isEnd = elementCaretPosition == nameLength;
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
                    const caretPosition = getTypeLength() + 1 + nameLength;
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
                    const caretPosition = getTypeLength() + 1 + nameLength;
                    setCaretPosition(caretPosition, showSpace);
                    setActualCaretPosition(caretPosition);
                    e.preventDefault();
                    return;
                }
            }

            if (handleInvalidSymbols(e)) {
                return;
            }

            if (handleExtraSymbols(e, 50)) {
                return;
            }

            // if(showPlaceholders){
            //     const isWordCharacter = e.key.length === 1;
            //     if(nameLength==0){
            //         if(isWordCharacter){
            //             setShowNamePlaceholder(false);
            //         }
            //     }else if(nameLength==1){
            //         if(isStart){
            //             setShowNamePlaceholder(isDelete);
            //         }else if(isEnd){
            //             setShowNamePlaceholder(isBackspace);
            //         }
            //     }
            // }
        }

        function onKeyDown(e) {
            const isArrowLeft = e.key == 'ArrowLeft';
            const isArrowRight = e.key == 'ArrowRight';
            const isArrowDown = e.key == 'ArrowDown';
            const isArrowUp = e.key == 'ArrowUp';
            const isEnter = e.key == 'Enter';

            if (e.shiftKey && !e.ctrlKey && !e.altKey && e.key == 'Delete') {
                onDelete();
                return;
            }

            if (!e.altKey && !e.ctrlKey && !e.shiftKey) {
                if (isEditorPopupOpen) {
                    if (isArrowDown || isArrowUp) {
                        setEditorPopupSelectedActionIndex(
                            getNextIndex(editorPopupSelectedActionIndex, editorPopupActions.length, isArrowUp),
                        );
                        e.preventDefault();
                    } else if (isEnter) {
                        editorPopupActions[editorPopupSelectedActionIndex].execute();
                    }
                } else {
                    if (isArrowDown) {
                        if (onSelectNext(getCaretPosition())) {
                            typeRef.current.contentEditable = false;
                            nameRef.current.contentEditable = false;
                        }
                        e.preventDefault();
                    } else if (isArrowUp) {
                        if (onSelectPrevious(getCaretPosition())) {
                            typeRef.current.contentEditable = false;
                            nameRef.current.contentEditable = false;
                        }
                        e.preventDefault();
                    } else if (isEnter) {
                        if (onSelectNext(0)) {
                            typeRef.current.contentEditable = false;
                            nameRef.current.contentEditable = false;
                        }
                        e.preventDefault();
                    }
                }
                if (isArrowLeft) {
                    if (actualCaretPosition > 0) {
                        setActualCaretPosition(actualCaretPosition - 1);
                        if (isEditorPopupOpen) {
                            showPopupWithProposedComponents(getValueBeforeCaret(actualCaretPosition - 1));
                        }
                        e.preventDefault();
                    }
                } else if (isArrowRight) {
                    if (actualCaretPosition < getFullLength() - 1) {
                        setActualCaretPosition(actualCaretPosition + 1);
                        if (isEditorPopupOpen) {
                            showPopupWithProposedComponents(getValueBeforeCaret(actualCaretPosition + 1));
                        }
                        e.preventDefault();
                    }
                }
            }
        }

        function makeNonEditable(element) {
            element.contentEditable = false;
        }

        function onBlur(event) {
            console.log('on blur', event);
            if (isEditorPopupOpen) {
                return;
            } else {
                event.target.contentEditable = false;
                if (!isActive(typeRef.current) && !isActive(nameRef.current)) {
                    console.log('Deselect blurred component', window.document.activeElement);
                    onSelectedStateChange(false);
                    // component.deselect();
                }
            }
        }

        function togglePopup() {
            setIsEditorPopupOpen(!isEditorPopupOpen);
        }

        function setPlaceholder(element, setShowPlaceholder: (boolean) => void) {
            if (!showPlaceholders) {
                return;
            }
            setShowPlaceholder(!element.textContent.length);
        }

        function onAttributeChange(e, setShowPlaceholder) {
            if (e.altKey || e.ctrlKey) {
                return;
            }
            const isWordCharacter = e.key.length === 1;
            const isBackspaceOrDelete = e.key === 'Backspace' || e.key === 'Delete';
            if (isWordCharacter || isBackspaceOrDelete) {
                const attributeElement = e.target;
                setPlaceholder(attributeElement, setShowPlaceholder);
                const caretPosition = getCaretPosition();
                // console.log('attribute changed', attributeElement);
                // console.log('attribute changed', caretPosition);
                setActualCaretPosition(caretPosition);
                console.log('attribute changed, type: ', typeRef.current.textContent);
                console.log('attribute changed, name: ', nameRef.current.textContent);
                onChange(typeRef.current.textContent, nameRef.current.textContent);

                if (isEditorPopupOpen && e.target === typeRef.current) {
                    const searchString = getValueBeforeCaret(caretPosition);
                    console.log('update popup actions', searchString);
                    showPopupWithProposedComponents(searchString);
                }
            }
        }

        function onEditableClick(element) {
            makeEditable(element);
            setActualCaretPosition(getCaretPosition());
        }

        // function popupContent(){
        //     if(matchingTypes.length===1){
        //         return selectComponentTypePopup(matchingTypes);
        //     }else if(matchingTypes.length===0){
        //         return createComponentTypePopup(component.typeName);
        //     }
        //     return editorPopup();
        // }

        // function onEditorPopupFocused(e){
        //     // Popup should not be focued. Send focus back to editor
        //     console.log("onEditorPopupFocused");
        //     e.preventDefault();
        //     typeRef.current.focus();
        // }

        return (
            <span onKeyDown={onKeyDown}>
                <span
                    tabIndex={-1}
                    className={`trigger type-name ${matchingTypes.length !== 1 ? 'error' : ''}`}
                    ref={typeRef}
                    spellCheck="false"
                    onKeyDown={onTypeKeyDown}
                    onKeyUp={(e) => onAttributeChange(e, setShowTypePlaceholder)}
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
                        {isEditorPopupOpen && (
                            <FocusTrap
                                focusTrapOptions={{
                                    fallbackFocus: () => typeRef.current,
                                    onDeactivate: togglePopup,
                                    clickOutsideDeactivates: true,
                                }}
                            >
                                <div className="editor-popup">
                                    <EditorPopup
                                        actions={editorPopupActions}
                                        selectedActionIndex={editorPopupSelectedActionIndex}
                                    />
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
                        onKeyUp={(e) => onAttributeChange(e, setShowNamePlaceholder)}
                        onBlur={onBlur}
                        onMouseDown={(e) => makeNonEditable(e.target)}
                        onClick={(e) => onEditableClick(e.target)}
                    >
                        {component.fieldName}
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
