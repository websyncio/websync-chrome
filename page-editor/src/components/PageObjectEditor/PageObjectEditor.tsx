import React, { useState } from 'react';
import { observer } from 'mobx-react';
// import { useRootStore } from 'context';
// import RootStore from 'entities/mst/RootStore';
import IComponentsContainer from 'entities/mst/ComponentsContainer';
// import ComponentInstancesList from './ComponentInstancesList';
import IIdeProxy from 'connections/IDE/IIdeConnection';
import ComponentsContainer from './ComponentsContainer/ComponentsContainer';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import { DependencyContainer, TYPES } from 'inversify.config';
import IUrlSynchronizationService from 'services/IUrlSynchronizationService';

interface Props {
    pageObject: IComponentsContainer;
}

const PageObjectEditor: React.FC<Props> = observer(({ pageObject }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    const [expandedContainerIndex, setExpandedContainerIndex] = useState(0);
    const urlSynchronizationService = DependencyContainer.get<IUrlSynchronizationService>(
        TYPES.UrlSynchronizationService,
    );

    function getWebsiteUrl(pageInstance) {
        const website = projectStore.webSites.find((ws) => ws.pageInstances.some((pi) => pi.id === pageInstance.id));
        return website ? website.url : '';
    }

    function redirectToUrl(pageInstance) {
        urlSynchronizationService.redirectToUrl(`${getWebsiteUrl(pageInstance)}${pageInstance.url}`);
    }

    function onExpand(containerIndex: number) {
        setExpandedContainerIndex(containerIndex);
    }

    function componentContainers(inheritanceLevel: number, pageObject: any) {
        const baseType: IComponentsContainer = pageObject.baseType;
        return (
            <>
                {baseType && componentContainers(inheritanceLevel + 1, pageObject.baseType)}
                <ComponentsContainer
                    pageObject={pageObject}
                    basePageObject={baseType}
                    isExpanded={inheritanceLevel === expandedContainerIndex}
                    onExpand={(expandParent) => {
                        onExpand(expandParent ? inheritanceLevel + 1 : inheritanceLevel);
                    }}
                />
            </>
        );
    }

    return (
        <div id="pageObjectEditor" className="flex-auto">
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
            {componentContainers(0, pageObject)}
        </div>
    );
});

export default PageObjectEditor;
