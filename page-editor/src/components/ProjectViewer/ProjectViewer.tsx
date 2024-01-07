import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import ProjectExplorer from './ProjectExplorer/ProjectExplorer';
import ProjectViewerHeader from './ProjectViewerHeader/ProjectViewerHeader';
import PageEditor from './PageObjectEditor/PageEditor/PageEditor';
import { BreadcrumbType, ProjectTab, ProjectTabType } from 'entities/mst/UiStore';
import ComponentEditor from 'components/ProjectViewer/PageObjectEditor/ComponentEditor/ComponentEditor';
import WebsiteSelector from 'components/ProjectViewer/WebsiteSelector/WebsiteSelector';
// import Explorer from './Explorer/Explorer';

interface Props {}

const ProjectViewer: React.FC<Props> = observer(() => {
    const { uiStore, projectStore }: RootStore = useRootStore();

    // function tabContent(tab: ProjectTab) {
    //     switch (tab.type) {
    //         case ProjectTabType.PageInstance:
    //             return <>{tab.editedPageInstance && <PageEditor pageInstance={tab.editedPageInstance} />}</>;
    //         case ProjectTabType.ComponentIntance:
    //             return (
    //                 <>
    //                     {tab.editedComponentInstance && (
    //                         <ComponentEditor componentInstance={tab.editedComponentInstance} />
    //                     )}
    //                 </>
    //             );
    //         default:
    //             throw new Error('Invalid tab type.');
    //     }
    // }

    function componentEditor() {
        const selectedComponentInstance = uiStore.editedComponentsChain.find((c) => c && c.selected);
        if (selectedComponentInstance) {
            return <ComponentEditor componentInstance={selectedComponentInstance} />;
        }
        throw new Error('Unable to define edited component instance');
    }

    function selectedBreadcrumbContent() {
        switch (uiStore.selectedBreadcrumb) {
            case BreadcrumbType.ProjectExplorer:
                return <ProjectExplorer />;
            case BreadcrumbType.MatchingPage:
                return <PageEditor pageType={uiStore.matchingPage} />;
            case BreadcrumbType.EditedComponentInstance:
                return componentEditor();
        }
    }

    return (
        <>
            {uiStore.matchingWebsite ? (
                <div id="projectViewer" className="full-height">
                    <ProjectViewerHeader />
                    {selectedBreadcrumbContent()}
                    {/* {uiStore.selectedTab ? tabContent(uiStore.selectedTab) : <ProjectExplorer />} */}
                    {/* <MatchingPage /> */}
                </div>
            ) : (
                <WebsiteSelector />
            )}
        </>
    );
});

export default ProjectViewer;
