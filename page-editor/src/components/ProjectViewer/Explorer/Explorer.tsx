import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'mst/RootStore';
import WebsitesTree from './Sidebar/WebsitesTree';
import WebSite from 'mst/WebSite';
import PageInstance from 'mst/PageInstance';
import './Explorer.sass';
import WebSiteDetails from './Details/WebSiteDetails';
import PageInstanceDetails from './Details/PageInstanceDetails';
import Selectable from 'mst/Selectable';

interface Props {}

const Explorer: React.FC<Props> = observer(() => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    const [selectedWebSite, setSelectedWebSite] = useState<WebSite | undefined>(undefined);
    const [selectedPageInstance, setSelectedPageInstance] = useState<PageInstance | undefined>(undefined);

    function onSelected(ws: WebSite, pi: PageInstance | undefined) {
        if (selectedWebSite) {
            selectedWebSite.deselect();
        }
        if (selectedPageInstance) {
            selectedPageInstance.deselect();
        }
        if (pi) {
            pi.select();
        } else {
            ws.select();
        }
        setSelectedWebSite(ws);
        setSelectedPageInstance(pi);
    }

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
                {selectedPageInstance ? (
                    <PageInstanceDetails pageInstance={selectedPageInstance} />
                ) : selectedWebSite ? (
                    <WebSiteDetails website={selectedWebSite} />
                ) : (
                    <div>Nothing selected</div>
                )}
            </div>
        </div>
    );
});

export default Explorer;