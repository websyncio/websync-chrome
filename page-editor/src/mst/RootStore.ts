import { types, Instance } from 'mobx-state-tree';
import ProjectStore, { ProjectStoreModel } from './ProjectStore';
import { UiStoreModel } from './UiStore';

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
            }
        },
    }));

export default interface RootStore extends Instance<typeof RootStoreModel> {}
