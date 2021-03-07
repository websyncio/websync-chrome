import { types, Instance, destroy, getSnapshot } from 'mobx-state-tree';
import { ComponentsContainerModel } from './ComponentsContainer';

export const PageTypeModel = types
    .compose(
        ComponentsContainerModel,
        types.model({
            url: types.maybeNull(types.string),
        }),
    )
    .views((self) => ({
        getComponentInstance(componentId) {
            return self.componentsInstances.find((ci) => ci.id == componentId);
        },
    }))
    .actions((self) => ({
        updateComponentInstance(old, updated) {
            const index = self.componentsInstances.indexOf(old);
            destroy(old);
            self.componentsInstances.splice(index, 0, updated);
        },
        deleteComponentInstance(ci) {
            destroy(ci);
        },
    }));

export default interface PageType extends Instance<typeof PageTypeModel> {}
