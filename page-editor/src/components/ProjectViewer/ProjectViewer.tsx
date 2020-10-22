import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'mst/RootStore';
import IIdeProxy from 'interfaces/IIdeProxy';
import ProjectExplorer from './Explorer/Explorer';
import ProjectViewerHeader from './Header/Header';
import PageObjectEditor from './Editor/PageObjectEditor';
import Explorer from './Explorer/Explorer';

interface Props {
    ideProxy: IIdeProxy;
}

const ProjectViewer: React.FC<Props> = observer((ideProxy) => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    return (
        <div id="projectViewer" className="full-height">
            <ProjectViewerHeader />
            {uiStore.selectedPageObject ? (
                <PageObjectEditor pageObject={uiStore.selectedPageObject} />
            ) : (
                <ProjectExplorer />
            )}
        </div>
    );
});

export default ProjectViewer;
