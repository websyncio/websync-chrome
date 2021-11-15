import { useRootStore } from 'context';
import PageInstance from 'entities/mst/PageInstance';
import RootStore from 'entities/mst/RootStore';
import { DependencyContainer, TYPES } from 'inversify.config';
import { observer } from 'mobx-react';
import React from 'react';
import IUrlSynchronizationService from 'services/IUrlSynchronizationService';
import './MatchUrlNotifications.sass';

interface Props {
    currentPageInstance?: PageInstance;
}

const MatchUrlNotifications: React.FC<Props> = observer(({ currentPageInstance }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    const urlSynchronizationService = DependencyContainer.get<IUrlSynchronizationService>(
        TYPES.UrlSynchronizationService,
    );

    function navigateToPage(pageInstance: PageInstance) {
        urlSynchronizationService.redirectToUrl(`${pageInstance.website.url}${pageInstance.url}`);
    }

    function createNewPage() {
        console.log('create new page');
    }

    function editPageObject(pageInstance: PageInstance) {
        uiStore.showTabForEditedPage(pageInstance);
    }

    function matchingPagesList(pageInstances: PageInstance[]) {
        return pageInstances.map((pi, index) => {
            return (
                <span key={pi.name}>
                    <span className="page-name" onClick={() => editPageObject(pi)}>
                        {pi.name}
                    </span>
                    {index < pageInstances.length && <>,</>}
                </span>
            );
        });
    }

    function matchingPageStatus() {
        // if (uiStore.matchingPages.length === 1) {
        //     if (uiStore.matchingPages[0] !== currentPageInstance) {
        //         return (
        //             <li className="matching-page-status">
        //                 Browser URL match{' '}
        //                 <span className="page-name" onClick={() => editPageObject(uiStore.matchingPages[0])}>
        //                     {uiStore.matchingPages[0].name}
        //                 </span>
        //                 in <span className="site-name">{uiStore.matchingWebsite.name}</span>. Would you like to
        //                 <span className="action-button" onClick={() => editPageObject(uiStore.matchingPages[0])}>
        //                     Edit {uiStore.matchingPages[0].name}
        //                 </span>{' '}
        //                 ?
        //             </li>
        //         );
        //     }
        // } else
        if (uiStore.matchingPages.length > 1) {
            return (
                <li className="matching-page-status">
                    Several pages match current URL: {matchingPagesList(uiStore.matchingPages)}
                </li>
            );
        } else if (uiStore.matchingPages.length === 0) {
            return (
                <li className="matching-page-status">
                    Current URL matches <span className="site-name">{uiStore.matchingWebsite.name}</span>, but does not
                    match any page in it. Would you like to{' '}
                    <span className="action-button" onClick={createNewPage}>
                        Create Page
                    </span>{' '}
                    in <span className="site-name">{uiStore.matchingWebsite.name}</span> for this URL?
                </li>
            );
        }
    }

    function currentPageMatchStatus() {
        if (currentPageInstance && !uiStore.matchingPages.find((p) => p === currentPageInstance)) {
            return (
                <li className="current-page-status">
                    <span className="page-name">{currentPageInstance.pageType.name}</span> does NOT match current
                    current URL, would you like to{' '}
                    <span className="action-button" onClick={() => navigateToPage(currentPageInstance)}>
                        Navigate to {currentPageInstance.pageType.name}
                    </span>{' '}
                    ?
                </li>
            );
        }
    }

    return (
        <ul className="match-url-notifications">
            {currentPageMatchStatus()}
            {/* {matchingPageStatus()} */}
        </ul>
    );
});

export default MatchUrlNotifications;
