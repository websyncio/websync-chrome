import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import IIdeProxy from 'connections/IDE/IIdeConnection';
import ProjectExplorer from '../ProjectExplorer/ProjectExplorer';
import ProjectViewerHeader from '../ProjectViewerHeader/ProjectViewerHeader';
import PageObjectEditor from '../PageObjectEditor/PageObjectEditor';
// import Explorer from './Explorer/Explorer';

interface Props {
    ideProxy: IIdeProxy;
}

const ProjectViewer: React.FC<Props> = observer(({ ideProxy }) => {
    const { uiStore }: RootStore = useRootStore();
    return (
        <div id="projectViewer" className="full-height">
            <ProjectViewerHeader />
            {uiStore.selectedPageObject ? (
                <PageObjectEditor ideProxy={ideProxy} pageObject={uiStore.selectedPageObject} />
            ) : (
                <ProjectExplorer ideProxy={ideProxy} />
            )}
        </div>
    );
});

export default ProjectViewer;
