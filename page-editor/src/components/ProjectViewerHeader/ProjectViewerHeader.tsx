import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import './ProjectViewerHeader.sass';
import PageType from 'entities/mst/PageType';
import CloseButton from 'components-common/CloseButton/CloseButton';
import PageInstance from 'entities/mst/PageInstance';

interface Props {}

const Header: React.FC<Props> = observer(() => {
    const rootStore: RootStore = useRootStore();
    const { uiStore } = rootStore;

    function goBackToProjectSelector() {
        rootStore.clearProject();
    }

    function onMatchedPageClick(pi: PageInstance) {
        uiStore.addEditedPageObject(pi.pageType);
    }

    function editedPageObjects() {
        return uiStore.editedPageObjects.map((po: PageType) => (
            <div
                key={po.id}
                className={`header-tab ${po.selected ? 'selected' : ''}`}
                onClick={() => uiStore.selectPageObject(po)}
            >
                <span>{po.name}</span>
                <CloseButton onClick={() => uiStore.removeEditedPageObject(po)} />
            </div>
        ));
    }

    function matchedPages() {
        return uiStore.matchedPages.map((pi: PageInstance) => (
            <div key={pi.id} onClick={() => onMatchedPageClick(pi)} className="matched-page">
                <span> {pi.name} </span>
            </div>
        ));
    }

    return (
        <div id="header">
            <svg
                onClick={goBackToProjectSelector}
                className="go-back-icon"
                width="24"
                height="24"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <title>Go back to project selection</title>
                <path fill="#5a5a5a" d="M6,6V3L0,8l6,5v-3c4-1,7-0.5,10,2C14,7,10.5,6,6,6z" />
            </svg>
            <div
                className={`header-tab project-explorer ${uiStore.selectedPageObject ? '' : 'selected'}`}
                onClick={() => uiStore.showExplorer()}
            >
                Project Explorer ({uiStore.selectedProject})
            </div>
            {editedPageObjects()}
            <div className="matched-pages-container">
                <span>Matched pages: </span>
                {matchedPages()}
            </div>
        </div>
    );
});

export default Header;
