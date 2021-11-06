import { useRootStore } from 'context';
import PageInstance from 'entities/mst/PageInstance';
import RootStore from 'entities/mst/RootStore';
import { DependencyContainer, TYPES } from 'inversify.config';
import { observer } from 'mobx-react';
import React from 'react';
import IUrlSynchronizationService from 'services/IUrlSynchronizationService';
import './MatchingPage.sass';

interface Props {}

const MatchingPage: React.FC<Props> = observer(() => {
    const { projectStore, uiStore }: RootStore = useRootStore();

    function editPageObject(pageInstance: PageInstance) {
        uiStore.showTabForEditedPage(pageInstance);
    }

    function matchingPage() {
        switch (uiStore.matchingPages.length) {
            case 0:
                return <>No matching page</>;
            case 1:
                return (
                    <>
                        Matching page:{' '}
                        <a className="page-name" onClick={() => editPageObject(uiStore.matchingPages[0])}>
                            {uiStore.matchingPages[0].pageType.name}
                        </a>
                    </>
                );
            default:
                return <>Several pages match current URL</>;
        }
    }

    return <span className="matching-page">{matchingPage()}</span>;
});

export default MatchingPage;
