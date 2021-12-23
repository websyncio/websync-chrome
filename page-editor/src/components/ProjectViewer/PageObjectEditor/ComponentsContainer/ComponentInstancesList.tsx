import React, { useLayoutEffect } from 'react';
import ComponentInstanceProps from 'components/ProjectViewer/PageObjectEditor/ComponentInstances/ComponentInstanceProps';
import { observer } from 'mobx-react';
import './ComponentInstancesList.sass';
import IComponentInstance from 'entities/mst/ComponentInstance';
import IComponentsContainer from 'entities/mst/ComponentsContainer';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import XcssSelector from 'entities/XcssSelector';

interface Props {
    isActive: boolean;
    container: IComponentsContainer;
    parentComponentInstance: IComponentInstance | null;
    componentInstances: IComponentInstance[];
    rootSelector: XcssSelector | null;
    componentView: React.ComponentType<ComponentInstanceProps>;
    onActiveStateChange?: (isActive: boolean) => void;
    onSelectNext?: () => boolean;
    onSelectPrevious?: () => boolean;
}

const ComponentInstancesList: React.FC<Props> = observer(
    ({
        isActive,
        container,
        parentComponentInstance,
        componentInstances,
        rootSelector,
        componentView: ComponentView,
        onActiveStateChange,
        onSelectPrevious,
        onSelectNext,
    }) => {
        // const [selectedLineIndex, setSelectedComponentIndex] = useState(0);
        // const [caretPosition, setCaretPosition] = useState<number | null>(0);
        const { uiStore }: RootStore = useRootStore();

        useLayoutEffect(() => {
            console.log(
                'ComponentInstancesList is rerendered. caretPosition: ' +
                    uiStore.editorCaretPosition +
                    ', isActive: ' +
                    isActive,
            );
        });

        // function onRename(event, component) {
        //     if (event.target.contentEditable === true) {
        //         event.target.contentEditable = false;
        //     } else {
        //         event.target.contentEditable = true;
        //     }
        // }

        // function onNameKeyDown(event, component) {
        //     const newName = event.target.innerText.trim();
        //     if (!event.key.match(/[a-z_$][A-Za-z0-9_$]+/g)) {
        //         event.preventDefault();
        //         return;
        //     }
        //     if (event.key === 'Enter') {
        //         submitRename(event, component, newName);
        //         event.preventDefault();
        //     } else if (event.key === 'Escape') {
        //         submitRename(event, component, null);
        //     } else if (newName.length === 100) {
        //         event.preventDefault();
        //     }
        // }

        // function onNameBlur(event, component) {
        //     const newName = event.target.innerText.trim();
        //     submitRename(event, component, newName);
        // }

        // function submitRename(event, component, newName) {
        //     event.target.contentEditable = false;
        //     if (newName === null) {
        //         event.target.innerText = component.name;
        //         return;
        //     } else if (component.name === newName) {
        //         return;
        //     }

        //     component.name = newName;

        //     const message = {};
        //     message['type'] = 'update-component-instance';
        //     // message['moduleName'] = app.state.module; // TODO moduleName is required in the command
        //     message['data'] = component;
        //     const json = JSON.stringify(message);
        //     console.log('sent ' + json);
        //     //this.props.onSend(json);

        //     const lastDot = component.id.lastIndexOf('.');
        //     component.id = component.id.substring(0, lastDot + 1) + newName;
        // }

        function onSelectComponent(isSelected: boolean, component: IComponentInstance) {
            const componentLineIndex = componentInstances.indexOf(component);
            if (isSelected) {
                onActiveStateChange && onActiveStateChange(true);
                uiStore.setEditorSelectedLineIndex(componentLineIndex);
            } else if (uiStore.editorSelectedLineIndex == componentLineIndex) {
                onActiveStateChange && onActiveStateChange(false);
                uiStore.setEditorSelectedLineIndex(-1);
            }
        }

        function selectComponent(component: IComponentInstance, shift: number, caretPosition: number): boolean {
            uiStore.setEditorCaretPosition(caretPosition);
            const index = componentInstances.indexOf(component);
            const newIndex = index + shift;
            // .first or last line
            if (newIndex < 0) {
                if (onSelectPrevious) {
                    return onSelectPrevious();
                }
                return false;
            }
            if (newIndex > componentInstances.length - 1) {
                if (onSelectNext) {
                    return onSelectNext();
                }
                return false;
            }
            // .select next component
            console.log('ComponentInstancesList. Select component, lineIndex: ' + newIndex);
            uiStore.setEditorSelectedLineIndex(newIndex);
            //setSelectedComponentIndex(index);
            // componentInstances.forEach((c, i) => {
            //     if (i == newIndex) {
            //         c.select();
            //     } else {
            //         c.deselect();
            //     }
            // });
            return true;
        }

        return (
            <div className="components-list">
                <ul>
                    {componentInstances.map((componentInstance, lineIndex) => [
                        <li key={componentInstance.id}>
                            <ComponentView
                                container={container}
                                componentInstance={componentInstance}
                                parentComponentInstance={parentComponentInstance}
                                rootSelector={rootSelector}
                                isSelected={isActive && uiStore.editorSelectedLineIndex === lineIndex}
                                index={lineIndex + 1}
                                initialCaretPosition={uiStore.editorCaretPosition}
                                onSelectedStateChange={(isSelected) => onSelectComponent(isSelected, componentInstance)}
                                onSelectNext={(caretPosition) => {
                                    return selectComponent(componentInstance, 1, caretPosition);
                                }}
                                onSelectPrevious={(caretPosition) => {
                                    return selectComponent(componentInstance, -1, caretPosition);
                                }}
                            />
                        </li>,
                        // <ComponentInstancesList componentInstancesList={component.selectedPageType.componentsInstances}/>
                    ])}
                </ul>
            </div>
        );
    },
);

export default ComponentInstancesList;
