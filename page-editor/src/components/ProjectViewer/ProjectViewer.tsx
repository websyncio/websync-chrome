import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import ProjectExplorer from './ProjectExplorer/ProjectExplorer';
import ProjectViewerHeader from './ProjectViewerHeader/ProjectViewerHeader';
import PageEditor from '../PageObjectEditor/PageEditor/PageEditor';
import { ProjectTab, ProjectTabType } from 'entities/mst/UiStore';
import ComponentEditor from 'components/PageObjectEditor/ComponentEditor/ComponentEditor';
import WebsiteSelector from 'components/WebsiteSelector/WebsiteSelector';
import WebSite from 'entities/mst/WebSite';
import PageInstance from 'entities/mst/PageInstance';
// import Explorer from './Explorer/Explorer';

interface Props {}

const ProjectViewer: React.FC<Props> = observer(() => {
    const { uiStore, projectStore }: RootStore = useRootStore();

    const matchingWebsite: WebSite = projectStore.webSites.find((ws) => {
        return uiStore.currentUrl!.toLowerCase().indexOf(ws.url.toLowerCase()) === 0;
    });

    const matchingPages: PageInstance[] = [];
    const pathname = new URL(uiStore.currentUrl!.toLowerCase()).pathname;
    if (matchingWebsite) {
        matchingWebsite.pageInstances.forEach((pi: PageInstance) => {
            if (pathname === pi.url) {
                matchingPages.push(pi);
            }
        });
    }

    uiStore.setMatchingWebsite(matchingWebsite);
    uiStore.setMathchingPages(matchingPages);

    function tabContent(tab: ProjectTab) {
        switch (tab.type) {
            case ProjectTabType.PageType:
                return <PageEditor pageObject={tab.editedObject} />;
            case ProjectTabType.ComponentIntance:
                return <ComponentEditor componentInstance={tab.editedObject} />;
            default:
                throw new Error('Invalid tab type.');
        }
    }

    return (
        <>
            {uiStore.matchingWebsite ? (
                <div id="projectViewer" className="full-height">
                    <ProjectViewerHeader />
                    {uiStore.selectedTab ? tabContent(uiStore.selectedTab) : <ProjectExplorer />}
                </div>
            ) : (
                <WebsiteSelector />
            )}
        </>
    );
});

export default ProjectViewer;
