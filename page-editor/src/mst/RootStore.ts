import { types, Instance } from 'mobx-state-tree';
import ProjectStore, { ProjectStoreModel } from './ProjectStore';
import { UiStoreModel } from './UiStore';

export const RootStoreModel = types
    .model({
        projectStore: types.optional(ProjectStoreModel, {}),
        uiStore: types.optional(UiStoreModel, {}),
    })
    .actions((self) => ({
        setProjectStore(projectStore: ProjectStore) {
            self.projectStore = projectStore;
        },
    }));

export default interface RootStore extends Instance<typeof RootStoreModel> {}
