import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import WebsitesTree from './ProjectTree/ProjectTree';
import WebSite from 'entities/mst/WebSite';
import PageInstance from 'entities/mst/PageInstance';
import './ProjectExplorer.sass';
import WebSiteDetails from './ProjectTreeItemDetails/WebSiteDetails';
import PageInstanceDetails from './ProjectTreeItemDetails/PageInstanceDetails';
// import Selectable from 'entities/mst/Selectable';
import IIdeProxy from 'connections/IDE/IIdeConnection';
import { DependencyContainer, TYPES } from 'inversify.config';
import IUrlSynchronizationService from 'services/IUrlSynchronizationService';

interface Props {
    ideProxy: IIdeProxy;
}

const Explorer: React.FC<Props> = observer(() => {
    const { projectStore }: RootStore = useRootStore();

    const urlSynchronizationService = DependencyContainer.get<IUrlSynchronizationService>(
        TYPES.UrlSynchronizationService,
    );

    // const [selectedWebSite, setSelectedWebSite] = useState<WebSite | undefined>(undefined);
    // const [selectedPageInstance, setSelectedPageInstance] = useState<PageInstance | undefined>(undefined);

    function onSelected(ws: WebSite, pi: PageInstance | null) {
        if (projectStore.selectedWebSite) {
            projectStore.selectedWebSite.deselect();
        }
        if (projectStore.selectedPageInstance) {
            projectStore.selectedPageInstance.deselect();
        }
        if (pi) {
            pi.select();
        } else {
            ws.select();
        }
    }

    useEffect(() => {
        urlSynchronizationService.initUrlSynchro();
    }, []);

    return (
        <div id="projectExplorer" className="hbox full-height">
            <div id="sidebar" className="full-height">
                <div id="sidebar-search"></div>
                <WebsitesTree websites={projectStore.webSites} onSelected={onSelected} />
                {/* {uiStore.selectedWebSite && <PageInstancesTree />} */}
                <div id="sidebar-actions"></div>
                {/* <div> */}
                {/* <PageList/> */}
                {/* <PageList
                        pageTypes={this.state.pageTypes}
                        selected={this.state.selectedPageType}
                        onSelectedPageChanged={this.onSelectedPageChange}
                    /> */}
                {/* {uiStore.selectedPageType && <ComponentInstancesTree/>} */}
                {/* </div> */}
            </div>
            <div id="details" className="flex-auto">
                {projectStore.selectedPageInstance ? (
                    <PageInstanceDetails pageInstance={projectStore.selectedPageInstance} />
                ) : projectStore.selectedWebSite ? (
                    <WebSiteDetails website={projectStore.selectedWebSite} />
                ) : (
                    <div>Nothing selected</div>
                )}
            </div>
        </div>
    );
});

export default Explorer;
