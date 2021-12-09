import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import './ProjectViewerHeader.sass';
import { BreadcrumbType, ProjectTab, ProjectTabType } from 'entities/mst/UiStore';
import CreatePageModal from 'components/Modals/CreatePageModal';
import IAttributeToXcssMapper from 'services/IAttributeToXcssMapper';
import { DependencyContainer, TYPES } from 'inversify.config';
import Selector from 'components/ProjectViewer/PageObjectEditor/InitializationAttributes/Selector';
import ComponentInstance from 'entities/mst/ComponentInstance';

interface Props {}

const Header: React.FC<Props> = observer(() => {
    const rootStore: RootStore = useRootStore();
    const { uiStore } = rootStore;
    const [createPageModalIsOpen, setCreatePageModalIsOpen] = React.useState(false);
    const attributeToXcssMapper: IAttributeToXcssMapper = DependencyContainer.get<IAttributeToXcssMapper>(
        TYPES.AttributeToXcssMapper,
    );

    function goBackToProjectSelector() {
        rootStore.clearProject();
    }

    // function onMatchedPageClick(pi: PageInstance) {
    //     uiStore.showTabForEditedPage(pi);
    // }

    // function tabContent(t: ProjectTab) {
    //     if (t.type === ProjectTabType.ComponentIntance) {
    //         return (
    //             <>
    //                 <i className="tab-icon component-icon" />
    //                 <span className="tab-name">{t.editedComponentInstance.componentType.name}</span>
    //             </>
    //         );
    //     } else if (t.type === ProjectTabType.PageInstance) {
    //         return (
    //             <>
    //                 <i className="tab-icon page-icon" />
    //                 <span className="tab-name">{t.editedPageInstance!.pageType.name}</span>
    //                 {uiStore.matchingPages.includes(t.editedPageInstance!) && <span className="match-circle" />}
    //             </>
    //         );
    //     }
    //     throw new Error('Unknown tab type');
    // }

    // function openedTabs() {
    //     return uiStore.openedTabs.map((t: ProjectTab) => {
    //         const tabKey = t.editedObject?.id;
    //         if (tabKey) {
    //             return (
    //                 <>
    //                     <div
    //                         key={tabKey}
    //                         className={`header-tab ${t.selected ? 'selected' : ''}`}
    //                         onClick={() => uiStore.selectTab(t)}
    //                     >
    //                         {tabContent(t)}
    //                         <CloseButton onClick={() => uiStore.closeTab(t)} />
    //                     </div>
    //                 </>
    //             );
    //         }
    //     });
    // }

    // function matchedPages() {
    //     return uiStore.matchingPages.map((pi: PageInstance) => (
    //         <div key={pi.id} onClick={() => onMatchedPageClick(pi)} className="matched-page">
    //             <span> {pi.name} </span>
    //         </div>
    //     ));
    // }

    function breadcrumbsSeparator() {
        return (
            <svg
                className="breadcrumbs-separator"
                focusable="false"
                viewBox="0 0 24 24"
                aria-hidden="true"
                data-testid="NavigateNextIcon"
            >
                <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
            </svg>
        );
    }

    function isBreadcrumbSelected(breadcrumbType: BreadcrumbType) {
        return uiStore.selectedBreadcrumb === breadcrumbType;
    }

    function createPage() {
        setCreatePageModalIsOpen(true);
    }

    function closeCreatePageModal() {
        setCreatePageModalIsOpen(false);
    }

    function matchingPage() {
        switch (uiStore.matchingPages.length) {
            case 0:
                return (
                    <span className="match-result flex-left">
                        <i className="nomatch-icon" />
                        No matching page
                        <span className="create-page-btn ws-btn ws-btn__primary" onClick={createPage}>
                            Create Page
                        </span>
                    </span>
                );
            case 1:
                return (
                    <>
                        {breadcrumbsSeparator()}
                        <div
                            className={`header-tab ${
                                isBreadcrumbSelected(BreadcrumbType.MatchingPage) ? 'selected' : ''
                            }`}
                            onClick={() => uiStore.selectBreadcrumb(BreadcrumbType.MatchingPage)}
                        >
                            <i className="tab-icon page-icon" />
                            <span className="tab-name">{uiStore.matchingPages[0].pageType.name}</span>
                            <span className="match-circle" />
                        </div>
                    </>
                );
            default:
                return <>Several pages match current URL</>;
        }
    }

    function editedComponents() {
        if (
            uiStore.editedComponentsChain &&
            uiStore.matchingPages.length === 1 &&
            uiStore.matchingPage === uiStore.editedPage
        ) {
            const breadcrumbTypeSelected = isBreadcrumbSelected(BreadcrumbType.EditedComponentInstance);
            const validComponents: ComponentInstance[] = [];
            for (let i = 0; i < uiStore.editedComponentsChain.length; i++) {
                if (!uiStore.editedComponentsChain[i] || !uiStore.editedComponentsChain[i].componentType) {
                    break;
                }
                validComponents.push(uiStore.editedComponentsChain[i]);
            }
            return validComponents.map((c) => (
                <div key={c.id} className="flex-left">
                    {breadcrumbsSeparator()}
                    <div
                        className={`header-tab ${breadcrumbTypeSelected && c.selected ? 'selected' : ''}`}
                        onClick={() => uiStore.selectEditedComponentInstance(c)}
                    >
                        <i className="tab-icon component-icon" />
                        <span className="tab-name">{c.componentType.name}</span>
                        {c.initializationAttribute && (
                            <span className="root-selector-wrap">
                                (<Selector selector={attributeToXcssMapper.GetXcss(c.initializationAttribute)} />)
                            </span>
                        )}
                    </div>
                </div>
            ));
        }
    }

    return (
        <>
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
                    className={`header-tab project-explorer ${
                        isBreadcrumbSelected(BreadcrumbType.ProjectExplorer) ? 'selected' : ''
                    }`}
                    onClick={() => uiStore.selectBreadcrumb(BreadcrumbType.ProjectExplorer)}
                >
                    {uiStore.selectedProject}
                </div>
                {matchingPage()}
                {editedComponents()}
                {/* {openedTabs()} */}
                <span className="header-actions"></span>
            </div>
            <CreatePageModal isOpen={createPageModalIsOpen} onRequestClose={closeCreatePageModal} />
        </>
    );
});

export default Header;
