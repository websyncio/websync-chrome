import { types, Instance } from 'mobx-state-tree';
import { ProjectStoreModel } from './ProjectStore';
import { BreadcrumbType, UiStoreModel } from './UiStore';

export const RootStoreModel = types
    .model({
        projectStore: types.optional(ProjectStoreModel, {}),
        uiStore: types.optional(UiStoreModel, {}),
    })
    .actions((self) => ({
        setProjectData(ideConnectionType: string, projectData) {
            if (
                self.uiStore.selectedIdeConnectionType == ideConnectionType &&
                self.uiStore.selectedProject == projectData.projectName
            ) {
                self.uiStore.selectedProjectIsLoaded = true;
                self.projectStore = ProjectStoreModel.create(projectData);
                self.uiStore.selectBreadcrumb(BreadcrumbType.ProjectExplorer);
                self.uiStore.setMathchingPages(self.projectStore.webSites[0].pageTypes);
            }
        },
    }));

export default interface RootStore extends Instance<typeof RootStoreModel> {}
