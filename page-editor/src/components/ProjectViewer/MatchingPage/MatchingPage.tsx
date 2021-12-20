import CreatePageModal from 'components/Modals/CreatePageModal';
import { useRootStore } from 'context';
import PageInstance from 'entities/mst/PageInstance';
import RootStore from 'entities/mst/RootStore';
import { observer } from 'mobx-react';
import React from 'react';
import './MatchingPage.sass';

interface Props {}

const MatchingPage: React.FC<Props> = observer(() => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    const [createPageModalIsOpen, setCreatePageModalIsOpen] = React.useState(false);

    function editPageObject(pageInstance: PageInstance) {
        uiStore.showTabForEditedPage(pageInstance);
    }

    function createPage() {
        setCreatePageModalIsOpen(true);
    }

    function matchResult() {
        switch (uiStore.matchingPages.length) {
            case 0:
                return (
                    <span className="match-result flex-left">
                        <i className="nomatch-icon" />
                        No matching page in
                        <i className="ws-icon-small website-icon" style={{ marginLeft: '4px' }}></i>{' '}
                        {uiStore.matchingWebsite.name}
                        <span className="create-page-btn ws-btn ws-btn__primary" onClick={createPage}>
                            Create Page
                        </span>
                    </span>
                );
            case 1:
                return (
                    <span className="match-result flex-left">
                        <i className="ws-icon-small website-icon"></i>
                        {uiStore.matchingWebsite.name}&nbsp;/&nbsp;
                        <i className="ws-icon-small page-icon"></i>
                        <a
                            className="page-name"
                            onClick={() => editPageObject(uiStore.matchingPages[0])}
                            title={`Matching page for ${uiStore.currentUrl}`}
                        >
                            {uiStore.matchingPages[0].pageType.name}
                        </a>
                    </span>
                );
            default:
                return <>Several pages match current URL</>;
        }
    }

    function closeCreatePageModal() {
        setCreatePageModalIsOpen(false);
    }

    return (
        <>
            <div className={`matching-page ${uiStore.matchingPages.length ? '' : 'no-match'}`}>
                <span className="current-url ws-hide-text" title={uiStore.currentUrl!}>
                    {uiStore.currentUrl}
                </span>
                {matchResult()}
            </div>
            {createPageModalIsOpen && <CreatePageModal onRequestClose={closeCreatePageModal} />}
        </>
    );
});

export default MatchingPage;
