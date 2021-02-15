import React from 'react';
import ComponentInstance from './ComponentInstance';
import ComponentInstanceProps from './ComponentInstanceProps';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'mst/RootStore';
import ComponentsContainer from 'mst/ComponentsContainer';
import './ComponentInstancesList.sass';
import IIdeProxy from 'interfaces/IIdeProxy';
import IComponentInstance from 'mst/ComponentInstance';
import { useState } from 'react';

interface Props {
    ideProxy: IIdeProxy;
    componentInstances: IComponentInstance[];
    componentView: React.ComponentType<ComponentInstanceProps>;
    onSelectNext?: () => boolean;
    onSelectPrevious?: () => boolean;
}

const ComponentInstancesList: React.FC<Props> = observer(
    ({ ideProxy, componentInstances, componentView: ComponentView, onSelectPrevious, onSelectNext }) => {
        const { projectStore, uiStore }: RootStore = useRootStore();

        const [caretPosition, setCaretPosition] = useState<number | null>(0);
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

        function onComponentSelected(component: IComponentInstance) {
            setCaretPosition(null);
            component.select();
            componentInstances.forEach((c) => {
                if (c !== component) {
                    c.deselect();
                }
            });
        }

        function selectComponent(component: IComponentInstance, shift: number, caretPosition: number): boolean {
            setCaretPosition(caretPosition);
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
            componentInstances.forEach((c, i) => {
                if (i == newIndex) {
                    c.select();
                } else {
                    c.deselect();
                }
            });
            return true;
        }

        function onComponentKeyDown(e, component: IComponentInstance) {
            if (!e.altKey && !e.ctrlKey && !e.shiftKey) {
            }
        }

        return (
            <div className="components-tree">
                <ul>
                    {componentInstances.map((component, index) => [
                        <li key={component.id} onKeyDown={(e) => onComponentKeyDown(e, component)}>
                            <ComponentView
                                ideProxy={ideProxy}
                                component={component}
                                index={index + 1}
                                caretPosition={caretPosition}
                                onSelected={() => onComponentSelected(component)}
                                onSelectNext={(caretPosition) => {
                                    return selectComponent(component, 1, caretPosition);
                                }}
                                onSelectPrevious={(caretPosition) => {
                                    return selectComponent(component, -1, caretPosition);
                                }}
                            />
                            {/* <ComponentInstance
                            ideProxy={ideProxy}
                            component={component}
                            index={index + 1}
                            caretPosition={caretPosition}
                            onSelected={() => onComponentSelected(component)}
                            onSelectNext={(caretPosition) => {
                                selectComponent(component, 1, caretPosition);
                            }}
                            onSelectPrevious={(caretPosition) => {
                                selectComponent(component, -1, caretPosition);
                            }}
                        /> */}
                        </li>,
                        // <ComponentInstancesList componentInstancesList={component.selectedPageType.componentsInstances}/>
                    ])}
                </ul>
            </div>
        );
    },
);

export default ComponentInstancesList;
