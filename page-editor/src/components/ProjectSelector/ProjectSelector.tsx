import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import IIdeProxy from 'connections/IDE/IIdeConnection';
import IdeConnection from 'entities/mst/IdeConnection';
import './ProjectSelector.sass';
import { DependencyContainer, TYPES } from 'inversify.config';
import ISelectorsBagService from 'services/ISelectorsBagService';

interface Props {
    ideProxies: IIdeProxy[];
}

const ProjectSelector: React.FC<Props> = observer(({ ideProxies }) => {
    const { projectStore, uiStore } = useRootStore();
    const selectorsBagService = DependencyContainer.get<ISelectorsBagService>(TYPES.SelectorsBagService);

    function onProjectSelected(ideConnection: IdeConnection, projectName: string) {
        // GET IDE PROXY AND REQUEST PROJECT DATA
        const ideProxy = ideProxies.find((p) => p.type == ideConnection.type);
        if (!ideProxy) {
            throw new Error('Invalid connection type: ' + ideConnection.type);
        }
        uiStore.setSelectedProject(ideConnection.type, projectName);
        ideProxy.requestProjectData(projectName);
        selectorsBagService.requestSelectorsList();
    }

    function ideProjects(ideConnection: IdeConnection) {
        return ideConnection.projectsList.map((p) => (
            <div key={p} className="ide-project" onClick={() => onProjectSelected(ideConnection, p)}>
                <i className="jdi-icon" />
                {p}
                {uiStore.selectedProject == p && <span className="loader" />}
            </div>
        ));
    }

    function getIDEIcon(ideType: string) {
        if (ideType.toLowerCase() == 'idea') {
            return <i className="idea-icon" />;
        }
    }

    function ideConnection(ideConnection: IdeConnection) {
        return (
            <>
                <div className="ide-info">
                    {getIDEIcon(ideConnection.type)} {ideConnection.type} projects:
                </div>
                <div className="ide-projects">{ideProjects(ideConnection)}</div>
            </>
        );
    }

    return (
        <div className="projects-selector flex-center full-height">
            {uiStore.ideConnections.length ? (
                <div className="projects-list-panel">{uiStore.ideConnections.map(ideConnection)}</div>
            ) : (
                <div className="no-connections-panel">
                    <h4>No IDE connections!</h4>
                    <div style={{ marginBottom: '2px' }}>To work with WebSync, please:</div>
                    <ul className="obligatory-actions">
                        <li>
                            Install WebSync extension to <i className="idea-icon" /> IDEA
                        </li>
                        <li>
                            Start <i className="idea-icon" /> IDEA and open the project with your tests
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
});

export default ProjectSelector;
