import { types, Instance, destroy, getSnapshot } from 'mobx-state-tree';
import { ComponentsContainerModel } from './ComponentsContainer';
import ComponentInstance, { ComponentInstanceModel } from './ComponentInstance';
import IdeProxy from 'connections/IDE/IIdeProxy';

export const PageTypeModel = types
    .compose(
        ComponentsContainerModel,
        types.model({
            url: types.maybeNull(types.string),
        }),
    )
    .actions((self) => ({
        updateComponentInstance(old, updated) {
            const index = self.componentsInstances.indexOf(old);
            destroy(old);
            self.componentsInstances.splice(index, 0, updated);
        },
        deleteComponentInstance(ci) {
            self.componentsInstances.remove(ci);
            destroy(ci);
        },
    }));

export default interface PageType extends Instance<typeof PageTypeModel> {}
