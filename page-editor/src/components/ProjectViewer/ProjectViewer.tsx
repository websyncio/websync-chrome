import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import ProjectExplorer from './ProjectExplorer/ProjectExplorer';
import ProjectViewerHeader from './ProjectViewerHeader/ProjectViewerHeader';
import PageEditor from './PageObjectEditor/PageEditor/PageEditor';
import { ProjectTab, ProjectTabType } from 'entities/mst/UiStore';
import ComponentEditor from 'components/ProjectViewer/PageObjectEditor/ComponentEditor/ComponentEditor';
import WebsiteSelector from 'components/ProjectViewer/WebsiteSelector/WebsiteSelector';
import WebSite from 'entities/mst/WebSite';
import PageInstance from 'entities/mst/PageInstance';
import ComponentInstance from 'entities/mst/ComponentInstance';
import MatchingPage from './MatchingPage/MatchingPage';
// import Explorer from './Explorer/Explorer';

interface Props {}

const ProjectViewer: React.FC<Props> = observer(() => {
    const { uiStore, projectStore }: RootStore = useRootStore();

    function tabContent(tab: ProjectTab) {
        switch (tab.type) {
            case ProjectTabType.PageInstance:
                return <PageEditor pageInstance={tab.editedObject as PageInstance} />;
            case ProjectTabType.ComponentIntance:
                return <ComponentEditor componentInstance={tab.editedObject as ComponentInstance} />;
            default:
                throw new Error('Invalid tab type.');
        }
    }

    return (
        <>
            {uiStore.matchingWebsite ? (
                <div id="projectViewer" className="full-height">
                    <ProjectViewerHeader />
                    {uiStore.selectedTab ? tabContent(uiStore.selectedTab) : <ProjectExplorer />}
                    <MatchingPage />
                </div>
            ) : (
                <WebsiteSelector />
            )}
        </>
    );
});

export default ProjectViewer;
