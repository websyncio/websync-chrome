import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'mst/RootStore';
import PageList from './PageList';
import WebsiteList from './WebsiteList';
import PageInstancesTree from './PageInstancesTree';
import ComponentInstancesTree from './ComponentInstancesTree';

export default observer(() => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    return (
        <div id="projectViewer">
            <div>
                <PageList />
                {/* <PageList 
                    pageTypes={this.state.pageTypes}
                    selected={this.state.selectedPageType}
                    onSelectedPageChanged={this.onSelectedPageChange}
                /> */}
                {uiStore.selectedPageType && <ComponentInstancesTree />}
            </div>
            <div>
                <WebsiteList websites={projectStore.webSites} selectedWebsite={uiStore.selectedWebSite} />
                {uiStore.selectedWebSite && <PageInstancesTree />}
            </div>
        </div>
    );
});
