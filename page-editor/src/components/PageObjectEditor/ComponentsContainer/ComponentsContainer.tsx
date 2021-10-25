import IIdeProxy from 'connections/IDE/IIdeConnection';
import React from 'react';
import IComponentsContainer from 'entities/mst/ComponentsContainer';
import IComponentInstance from 'entities/mst/ComponentInstance';
import { observer } from 'mobx-react';
import ComponentInstancesList from './ComponentInstancesList';
import ComponentInstance from 'components/PageObjectEditor/ComponentInstances/ComponentInstance';
import BlankComponentInstance from 'components/PageObjectEditor/ComponentInstances/BlankComponentInstance';
import RootStore from 'entities/mst/RootStore';
import { useRootStore } from 'context';
import './ComponentsContainer.sass';
import { DependencyContainer, TYPES } from 'inversify.config';
import IUrlSynchronizationService from 'services/IUrlSynchronizationService';
import { useState } from 'react';
import { useEffect } from 'react';
import TreeOutline from 'components-common/TreeOutline/TreeOutline';

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

const ComponentsContainer: React.FC<Props> = observer(({ pageObject, basePageObject, isExpanded, onExpand }) => {
    const { uiStore, projectStore }: RootStore = useRootStore();
    const [activeList, setActiveList] = useState(ListType.PageObjectComponents);

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

    function onParentClick() {
        onExpand(true);
    }

    function onHeaderClick() {
        if (!isExpanded) {
            onExpand(false);
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

export default ComponentsContainer;
