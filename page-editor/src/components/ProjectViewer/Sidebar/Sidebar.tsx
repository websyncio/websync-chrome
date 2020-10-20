import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'mst/RootStore';
import PageList from './PageList';
import WebsitesTree from './WebsitesTree';
import PageInstancesTree from '../../PageInstancesTree';
import ComponentInstancesTree from '../../ComponentInstancesTree';
import './Sidebar.sass';

interface Props {}

const Sidebar: React.FC<Props> = observer(() => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    return (
        <div id="sidebar" className="flex-auto">
            <div id="sidebar-search"></div>
            <WebsitesTree websites={projectStore.webSites} />
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
    );
});

export default Sidebar;