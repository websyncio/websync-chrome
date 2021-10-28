import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import IIdeProxy from 'connections/IDE/IIdeConnection';
import ProjectExplorer from '../ProjectExplorer/ProjectExplorer';
import ProjectViewerHeader from '../ProjectViewerHeader/ProjectViewerHeader';
import PageEditor from '../PageObjectEditor/PageEditor';
import PageType from 'entities/mst/PageType';
import { ProjectTab, ProjectTabType } from 'entities/mst/UiStore';
import ComponentEditor from 'components/PageObjectEditor/ComponentEditor';
import ComponentInstance from 'entities/mst/ComponentInstance';
// import Explorer from './Explorer/Explorer';

interface Props {}

const ProjectViewer: React.FC<Props> = observer(() => {
    const { uiStore }: RootStore = useRootStore();

    function tabContent(tab: ProjectTab) {
        switch (tab.type) {
            case ProjectTabType.PageType:
                return <PageEditor pageObject={tab.editedObject} />;
            case ProjectTabType.ComponentIntance:
                return <ComponentEditor componentInstance={tab.editedObject} />;
            default:
                throw new Error('Invalid tab type.');
        }
    }

    return (
        <div id="projectViewer" className="full-height">
            <ProjectViewerHeader />
            {uiStore.selectedTab ? tabContent(uiStore.selectedTab) : <ProjectExplorer />}
        </div>
    );
});

export default ProjectViewer;
