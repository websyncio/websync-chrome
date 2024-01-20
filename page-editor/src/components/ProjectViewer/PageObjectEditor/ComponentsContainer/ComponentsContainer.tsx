import React, { useEffect, useMemo } from 'react';
import IComponentsContainer from 'entities/mst/ComponentsContainer';
import IComponentInstance from 'entities/mst/ComponentInstance';
import { observer } from 'mobx-react';
import ComponentInstancesList from './ComponentInstancesList';
import ComponentInstance from 'components/ProjectViewer/PageObjectEditor/ComponentInstances/ComponentInstance';
import BlankComponentInstance from 'components/ProjectViewer/PageObjectEditor/ComponentInstances/BlankComponentInstance';
import RootStore from 'entities/mst/RootStore';
import { useRootStore } from 'context';
import './ComponentsContainer.sass';
import { DependencyContainer } from 'inversify.config';
import { useState } from 'react';
import TreeOutline from 'components-common/TreeOutline/TreeOutline';
import SelectorHighlighter from 'services/SelectorHighlighterService';
import XcssSelector from 'entities/XcssSelector';
import TYPES from 'inversify.types';

interface Props {
    container: IComponentsContainer;
    baseContainer: IComponentsContainer;
    parentComponentInstance: IComponentInstance | null;
    rootSelector: XcssSelector | null;
    isExpanded: boolean;
    onExpand: (expandParent: boolean) => void;
}

enum ListType {
    Undefined,
    PageObjectComponents,
    BlankComponents,
}

const ComponentsContainer: React.FC<Props> = observer(
    ({ container, baseContainer, parentComponentInstance, rootSelector, isExpanded, onExpand }) => {
        const { uiStore, projectStore }: RootStore = useRootStore();
        const [activeList, setActiveList] = useState(ListType.PageObjectComponents);
        const selectorHighlighter: SelectorHighlighter = DependencyContainer.get<SelectorHighlighter>(
            TYPES.SelectorHighlighter,
        );

        function getComponentSelectors(
            container1: IComponentsContainer,
            rootSelector: XcssSelector | null,
        ): XcssSelector[] {
            if (!container1) {
                return [];
            }
            let selectors: XcssSelector[] = [];
            container1.componentInstances.forEach((c) => {
                const componentSelector: XcssSelector | null = c.initializationAttribute.rootSelectorXcss;
                if (componentSelector) {
                    componentSelector.root = rootSelector;
                    // componentSelector = XcssBuilder.concatSelectors(rootSelector, componentSelector);
                    const innerComponentSelectors: XcssSelector[] = getComponentSelectors(
                        c.componentType,
                        componentSelector,
                    );
                    if (innerComponentSelectors.length) {
                        selectors = selectors.concat(innerComponentSelectors);
                    } else {
                        selectors.push(componentSelector);
                    }
                }
            });
            return selectors;
        }

        const componentSelectors: XcssSelector[] = getComponentSelectors(container, rootSelector);

        useEffect(() => {
            return () => selectorHighlighter.removeComponentHighlighting(componentSelectors);
        });

        // function selectComponent(components: IComponentInstance[], index: number) {
        //     components.forEach((c, i) => {
        //         if (i == index) {
        //             c.select();
        //         } else {
        //             c.deselect();
        //         }
        //     });
        // }

        function selectFirstBlankComponent(): boolean {
            setActiveList(ListType.BlankComponents);
            uiStore.setEditorSelectedLineIndex(0);
            console.log(
                'ComponentsContainer. LineIndex: ' + uiStore.editorSelectedLineIndex + ', activeList: ' + activeList,
            );
            // selectComponent(pageObject.componentInstances, -1);
            // selectComponent(uiStore.blankComponents, 0);
            return true;
        }

        function selectLastComponentInstance(): boolean {
            setActiveList(ListType.PageObjectComponents);
            uiStore.setEditorSelectedLineIndex(container.componentInstances.length - 1);
            console.log(
                'ComponentsContainer. LineIndex: ' + uiStore.editorSelectedLineIndex + ', activeList: ' + activeList,
            );
            // selectComponent(pageObject.componentInstances, pageObject.componentInstances.length - 1);
            // selectComponent(uiStore.blankComponents, -1);
            return true;
        }

        function onFocus() {
            console.log('onFocus', document.activeElement);
        }

        function onParentClick(e) {
            onExpand(true);
            e.stopPropagation();
        }

        function onHeaderClick() {
            if (!isExpanded) {
                onExpand(false);
            }
        }

        function stopPropagation(e) {
            e.stopPropagation();
        }

        function onHighlightCheckboxChange(highlighted: boolean) {
            console.log('onHighlightCheckboxChange', highlighted);
            // const componentSelectors: XcssSelector[] = getComponentSelectors(container, null);
            if (highlighted) {
                selectorHighlighter.highlightComponents(componentSelectors);
            } else {
                selectorHighlighter.removeComponentHighlighting(componentSelectors);
            }
        }

        return (
            <div className="components-container" onFocus={onFocus}>
                <div className={`header ${isExpanded ? 'expanded' : ''}`} onClick={onHeaderClick}>
                    {!isExpanded && <TreeOutline expanded={isExpanded} />}
                    <span className="title">{container.name}</span>
                    {baseContainer && (
                        <>
                            &nbsp;extends&nbsp;
                            <a href="#" onClick={onParentClick}>
                                {baseContainer.name}
                            </a>
                        </>
                    )}
                    <span
                        className="highlight-elements-wrap flex-center"
                        title="Highlight all inner components"
                        onClick={stopPropagation}
                    >
                        <input
                            id={`highlight-${container.name}`}
                            onChange={(e) => onHighlightCheckboxChange(e.target.checked)}
                            type="checkbox"
                        />
                        <label htmlFor={`highlight-${container.name}`}>Hide existing</label>
                    </span>
                </div>
                {isExpanded && (
                    <>
                        <ComponentInstancesList
                            isActive={activeList === ListType.PageObjectComponents}
                            container={container}
                            componentInstances={container.componentInstances}
                            rootSelector={rootSelector}
                            parentComponentInstance={parentComponentInstance}
                            componentView={ComponentInstance}
                            onActiveStateChange={(isActive) =>
                                setActiveList(isActive ? ListType.PageObjectComponents : ListType.Undefined)
                            }
                            onSelectNext={selectFirstBlankComponent}
                        />
                        <div className="blank-components">
                            <div className="blank-components-header">
                                {/* <span className="title">New Components</span> */}
                                {/* &nbsp; */}
                                Specify type and name, then click Take button or press Ctrl+Enter
                            </div>
                            <ComponentInstancesList
                                isActive={activeList === ListType.BlankComponents}
                                container={container}
                                componentInstances={uiStore.blankComponents}
                                parentComponentInstance={parentComponentInstance}
                                rootSelector={rootSelector}
                                componentView={BlankComponentInstance}
                                onActiveStateChange={(isActive) =>
                                    setActiveList(isActive ? ListType.BlankComponents : ListType.Undefined)
                                }
                                onSelectPrevious={selectLastComponentInstance}
                            />
                        </div>
                    </>
                )}
            </div>
        );
    },
);

export default ComponentsContainer;
