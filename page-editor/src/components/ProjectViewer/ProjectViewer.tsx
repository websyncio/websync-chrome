import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'mst/RootStore';
import IIdeProxy from 'interfaces/IIdeProxy';
import ProjectViewerSidebar from './Sidebar/Sidebar';
import ProjectViewerHeader from './PeojectViewerHeader';
import PageObjectEditor from './PageObjectEditor';

interface Props {
    ideProxy: IIdeProxy;
}

const ProjectViewer: React.FC<Props> = observer((ideProxy) => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    return (
        <div id="projectViewer">
            <ProjectViewerHeader />
            <ProjectViewerSidebar />
            <PageObjectEditor />
        </div>
    );
});

export default ProjectViewer;
