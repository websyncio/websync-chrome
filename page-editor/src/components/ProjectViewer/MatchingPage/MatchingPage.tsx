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

    function matchingPage() {
        switch (uiStore.matchingPages.length) {
            case 0:
                return (
                    <>
                        No matching page in {uiStore.matchingWebsite.name}
                        <span className="create-page-btn ws-btn ws-btn__primary" onClick={createPage}>
                            Create Page
                        </span>
                    </>
                );
            case 1:
                return (
                    <>
                        {uiStore.matchingWebsite.name}&nbsp;/&nbsp;
                        <a
                            className="page-name"
                            onClick={() => editPageObject(uiStore.matchingPages[0])}
                            title={`Matching page for ${uiStore.currentUrl}`}
                        >
                            {uiStore.matchingPages[0].pageType.name}
                        </a>
                    </>
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
            <div className="flex-center matching-page">{matchingPage()}</div>
            <CreatePageModal isOpen={createPageModalIsOpen} onRequestClose={closeCreatePageModal} />
        </>
    );
});

export default MatchingPage;
