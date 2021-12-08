import { types, Instance, destroy } from 'mobx-state-tree';
import { ComponentsContainerModel } from './ComponentsContainer';

export const PageTypeModel = types
    .compose(
        ComponentsContainerModel,
        types.model({
            url: types.maybeNull(types.string),
            baseType: types.maybeNull(types.reference(types.late(() => PageTypeModel))),
        }),
    )
    .views((self) => ({
        get baseTypes() {
            const result: any[] = [];
            let current = self;
            while (current.baseType) {
                result.push(current.baseType);
                current = current.baseType;
            }
            return result;
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
