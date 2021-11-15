import { types, Instance } from 'mobx-state-tree';
import ComponentInstance from './ComponentInstance';
import PageInstance from './PageInstance';
import { ProjectStoreModel } from './ProjectStore';
import { UiStoreModel } from './UiStore';
import WebSite from './WebSite';

export const RootStoreModel = types
    .model({
        projectStore: types.optional(ProjectStoreModel, {}),
        uiStore: types.optional(UiStoreModel, {}),
    })
    .actions((self) => ({
        setProjectData(ideConnectionType: string, projectData) {
            if (
                self.uiStore.selectedIdeConnectionType == ideConnectionType &&
                self.uiStore.selectedProject == projectData.project
            ) {
                self.uiStore.selectedProjectIsLoaded = true;
                self.projectStore = ProjectStoreModel.create(projectData);

                const matchingWebsite: WebSite = self.projectStore.webSites.find((ws) => {
                    return self.uiStore.currentUrl!.toLowerCase().indexOf(ws.url.toLowerCase()) === 0;
                });

                const matchingPages: PageInstance[] = [];
                const pathname = new URL(self.uiStore.currentUrl!.toLowerCase()).pathname;
                if (matchingWebsite) {
                    matchingWebsite.pageInstances.forEach((pi: PageInstance) => {
                        if (pathname === pi.url) {
                            matchingPages.push(pi);
                        }
                    });
                }
                self.uiStore.setMatchingWebsite(matchingWebsite);
                self.uiStore.setMathchingPages(matchingPages);
            }
        },
        clearProject() {
            self.uiStore.selectedProjectIsLoaded = false;
            self.uiStore.selectedProject = null;
        },
    }));

export default interface RootStore extends Instance<typeof RootStoreModel> {}
