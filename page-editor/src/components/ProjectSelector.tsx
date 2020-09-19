import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'mst/RootStore';
import UiStore from 'mst/UiStore';
import { values } from 'mobx';
import IdeProxy from 'mst/IdeProxy';
import { cast, IMSTArray, ISimpleType } from 'mobx-state-tree';

export default observer(() => {
    const rootStore: RootStore = useRootStore();

    function ideProjects(projectsList) {
        return projectsList.map((p) => (
            <div key="{p}" className="ide-project">
                {p}
            </div>
        ));
    }

    function ideConnection(ide: IdeProxy) {
        return (
            <>
                <div className="ide-info">{ide.type}</div>
                <div className="ide-projects">{ideProjects(ide.projectsList)}</div>
            </>
        );
    }

    return <div id="projectSelector">{rootStore.uiStore.ideProxies.map(ideConnection)}</div>;
});
