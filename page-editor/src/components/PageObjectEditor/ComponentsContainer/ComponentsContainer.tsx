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

interface Props {
    ideProxy: IIdeProxy;
    pageObject: IComponentsContainer;
}

enum ListType {
    Undefined,
    PageObjectComponents,
    BlankComponents,
}

const ComponentsContainer: React.FC<Props> = observer(({ pageObject }) => {
    const { uiStore, projectStore }: RootStore = useRootStore();
    const urlSynchronizationService = DependencyContainer.get<IUrlSynchronizationService>(
        TYPES.UrlSynchronizationService,
    );
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

    useEffect(function () {
        console.log('ComponentsContainer. Rerendered');
    });

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

    function getWebsiteUrl(pageInstance) {
        const website = projectStore.webSites.find((ws) => ws.pageInstances.some((pi) => pi.id === pageInstance.id));
        return website ? website.url : '';
    }

    function redirectToUrl(pageInstance) {
        urlSynchronizationService.redirectToUrl(`${getWebsiteUrl(pageInstance)}${pageInstance.url}`);
    }

    function baseComponents(pageObject: any) {
        const baseType: IComponentsContainer = pageObject.baseType;
        if (baseType) {
            return (
                <>
                    {baseComponents(baseType)}
                    <ComponentInstancesList
                        isActive={false}
                        componentInstances={baseType.componentsInstances}
                        componentView={ComponentInstance}
                    />
                </>
            );
        }
    }

    return (
        <div className="components-container">
            <div className="container-name">
                <strong>{pageObject.name}</strong>
                {projectStore.selectedPageInstance &&
                uiStore.matchedPages.map((mp) => mp.id).includes(projectStore.selectedPageInstance.id) ? (
                    <div> Page matched </div>
                ) : (
                    <div>
                        {' '}
                        Page not matched{' '}
                        <button onClick={() => redirectToUrl(projectStore.selectedPageInstance)}>
                            {' '}
                            Redirect to page
                        </button>{' '}
                    </div>
                )}
            </div>
            {baseComponents(pageObject)}
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
        </div>
    );
});

export default ComponentsContainer;
