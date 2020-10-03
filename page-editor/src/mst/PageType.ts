import { types, Instance } from 'mobx-state-tree';
import { ComponentInstanceModel } from './ComponentInstance';

export const PageTypeModel = types
    .model({
        id: types.identifier,
        // basePageType: types.maybe(types.reference(types.late(() => PageTypeModel))),
        url: types.maybeNull(types.string),
        componentsInstances: types.array(ComponentInstanceModel),
    })
    .views((self) => ({
        get name() {
            const arr = self.id.split('.');
            return arr[arr.length - 1];
        },
    }));

export default interface PageType extends Instance<typeof PageTypeModel> {}
