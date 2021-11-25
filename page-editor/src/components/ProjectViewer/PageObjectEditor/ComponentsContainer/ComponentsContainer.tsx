import React from 'react';
import IComponentsContainer from 'entities/mst/ComponentsContainer';
import { observer } from 'mobx-react';
import ComponentInstancesList from './ComponentInstancesList';
import ComponentInstance from 'components/ProjectViewer/PageObjectEditor/ComponentInstances/ComponentInstance';
import BlankComponentInstance from 'components/ProjectViewer/PageObjectEditor/ComponentInstances/BlankComponentInstance';
import RootStore from 'entities/mst/RootStore';
import { useRootStore } from 'context';
import './ComponentsContainer.sass';
import { DependencyContainer, TYPES } from 'inversify.config';
import { useState } from 'react';
import TreeOutline from 'components-common/TreeOutline/TreeOutline';
import SelectorHighlighter from 'services/SelectorHighlighterService';
import XcssSelector from 'entities/XcssSelector';
import ComponentsContainer from 'entities/mst/ComponentsContainer';
import IAttributeToXcssMapper from 'services/IAttributeToXcssMapper';
import XcssBuilder from 'services/XcssBuilder';

interface Props {
    pageObject: IComponentsContainer;
    basePageObject: IComponentsContainer;
    isExpanded: boolean;
    onExpand: (expandParent: boolean) => void;
}

enum ListType {
    Undefined,
    PageObjectComponents,
    BlankComponents,
}

export default observer(({ pageObject, basePageObject, isExpanded, onExpand }) => {
    const { uiStore, projectStore }: RootStore = useRootStore();
    const [activeList, setActiveList] = useState(ListType.PageObjectComponents);
    const selectorHighlighter: SelectorHighlighter = DependencyContainer.get<SelectorHighlighter>(
        TYPES.SelectorHighlighter,
    );
    const attributeToXcssMapper: IAttributeToXcssMapper = DependencyContainer.get<IAttributeToXcssMapper>(
        TYPES.AttributeToXcssMapper,
    );

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
        // selectComponent(pageObject.componentsInstances, -1);
        // selectComponent(uiStore.blankComponents, 0);
        return true;
    }

    function selectLastComponentInstance(): boolean {
        setActiveList(ListType.PageObjectComponents);
        uiStore.setEditorSelectedLineIndex(pageObject.componentsInstances.length - 1);
        console.log(
            'ComponentsContainer. LineIndex: ' + uiStore.editorSelectedLineIndex + ', activeList: ' + activeList,
        );
        // selectComponent(pageObject.componentsInstances, pageObject.componentsInstances.length - 1);
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

    function getComponentSelectors(container: IComponentsContainer, rootSelector: XcssSelector | null): XcssSelector[] {
        if (!container) {
            return [];
        }
        let selectors: XcssSelector[] = [];
        container.componentsInstances.forEach((c) => {
            const componentSelector: XcssSelector = attributeToXcssMapper.GetXcss(c.initializationAttribute);
            componentSelector.root = rootSelector;
            // componentSelector = XcssBuilder.concatSelectors(rootSelector, componentSelector);
            const innerComponentSelectors: XcssSelector[] = getComponentSelectors(c.componentType, componentSelector);
            if (innerComponentSelectors.length) {
                selectors = selectors.concat(innerComponentSelectors);
            } else {
                selectors.push(componentSelector);
            }
        });
        return selectors;
    }

    function stopPropagation(e) {
        e.stopPropagation();
    }

    function onHighlightCheckboxChange(container: ComponentsContainer, highlighted: boolean) {
        console.log('onHighlightCheckboxChange', highlighted);
        const componentSelectors: XcssSelector[] = getComponentSelectors(container, null);
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
                <span className="title">{pageObject.name}</span>
                {basePageObject && (
                    <>
                        &nbsp;extends&nbsp;
                        <a href="#" onClick={onParentClick}>
                            {basePageObject.name}
                        </a>
                    </>
                )}
                <span
                    className="highlight-elements-wrap flex-center"
                    title="Highlight all inner components"
                    onClick={stopPropagation}
                >
                    <input
                        id={`highlight-${pageObject.name}`}
                        onChange={(e) => onHighlightCheckboxChange(pageObject, e.target.checked)}
                        type="checkbox"
                    />
                    <label htmlFor={`highlight-${pageObject.name}`}>Highlight components</label>
                </span>
            </div>
            {isExpanded && (
                <>
                    <ComponentInstancesList
                        isActive={activeList === ListType.PageObjectComponents}
                        componentInstances={pageObject.componentsInstances}
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
                            componentInstances={uiStore.blankComponents}
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
});
