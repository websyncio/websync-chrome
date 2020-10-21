import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'mst/RootStore';
import IIdeProxy from 'interfaces/IIdeProxy';
import IdeConnection from 'mst/IdeConnection';
import IdeProject from './IdeProject';
import './ProjectSelector.sass';

interface Props {
    ideProxies: IIdeProxy[];
}

const ProjectSelector: React.FC<Props> = observer(({ ideProxies }) => {
    const rootStore: RootStore = useRootStore();

    function onProjectSelected(ideConnection: IdeConnection, projectName: string) {
        // GET IDE PROXY AND REQUEST PROJECT DATA
        const ideProxy = ideProxies.find((p) => p.type == ideConnection.type);
        if (!ideProxy) {
            throw new Error('Invalid connection type: ' + ideConnection.type);
        }
        rootStore.uiStore.setSelectedProject(ideConnection.type, projectName);
        ideProxy.requestProjectData(projectName);
    }

    function ideProjects(ideConnection: IdeConnection) {
        return ideConnection.projectsList.map((p) => (
            <IdeProject
                key={p}
                projectName={p}
                isSelected={rootStore.uiStore.selectedProject == p}
                onProjectSelected={() => onProjectSelected(ideConnection, p)}
            />
        ));
    }

    function ideConnection(ideConnection: IdeConnection) {
        return (
            <>
                <div className="ide-info">{ideConnection.type}</div>
                <div className="ide-projects">{ideProjects(ideConnection)}</div>
            </>
        );
    }

    return <div id="projectSelector">{rootStore.uiStore.ideConnections.map(ideConnection)}</div>;
});

export default ProjectSelector;
