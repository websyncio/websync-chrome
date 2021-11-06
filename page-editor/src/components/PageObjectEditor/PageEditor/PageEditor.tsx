import React, { useState } from 'react';
import { observer } from 'mobx-react';
// import { useRootStore } from 'context';
// import RootStore from 'entities/mst/RootStore';
import IComponentsContainer from 'entities/mst/ComponentsContainer';
// import ComponentInstancesList from './ComponentInstancesList';
import IIdeProxy from 'connections/IDE/IIdeConnection';
import ComponentsContainer from '../ComponentsContainer/ComponentsContainer';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import { DependencyContainer, TYPES } from 'inversify.config';
import IUrlSynchronizationService from 'services/IUrlSynchronizationService';
import './PageEditor.sass';

interface Props {
    pageObject: IComponentsContainer;
}

const PageEditor: React.FC<Props> = observer(({ pageObject }) => {
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

    function navigateToPage() {
        console.log('navigate to page');
        //urlSynchronizationService.redirectToUrl(`${getWebsiteUrl(pageInstance)}${pageInstance.url}`);
    }

    function createNewPage() {
        console.log('create new page');
    }

    function openWebSite() {
        console.log('open website');
    }

    function editPageObject() {
        console.log('edit page object');
    }

    function matchingPageStatus() {
        if (uiStore.matchingPages.length) {
            return (
                <li className="matching-page-status">
                    The matching page is{' '}
                    <span className="page-name" onClick={editPageObject}>
                        {pageObject.name}
                    </span>
                    in <span className="site-name">{uiStore.matchingWebsite.name}</span>
                </li>
            );
        } else {
            return (
                <li className="matching-page-status">
                    There is no matching page in{' '}
                    <span className="site-name" onClick={openWebSite}>
                        {uiStore.matchingWebsite.name}
                    </span>{' '}
                    for current browser URL, would you like to{' '}
                    <span className="action-button" onClick={createNewPage}>
                        Create New Page
                    </span>{' '}
                    for it?
                </li>
            );
        }
    }

    return (
        <div className="page-editor flex-auto">
            <ul className="page-editor-header">
                <li className="current-page-status">
                    {pageObject.name} does not match current browser URL, would you like to{' '}
                    <span className="action-button" onClick={navigateToPage}>
                        Navigate to {pageObject.name}
                    </span>{' '}
                    ?
                </li>
                {matchingPageStatus()}
                {/* {projectStore.selectedPageInstance &&
                uiStore.matchedPages.map((mp) => mp.id).includes(projectStore.selectedPageInstance.id) ? (
                    <span className="match-status"> Page matched </span>
                ) : (
                    <>
                        <span className="match-status">Page not matched</span>
                        <button onClick={() => redirectToUrl(projectStore.selectedPageInstance)}>
                            Redirect to page
                        </button>
                    </>
                )} */}
            </ul>
            {componentContainers(0, pageObject)}
        </div>
    );
});

export default PageEditor;
