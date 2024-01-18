import { types, Instance } from 'mobx-state-tree';
import { ComponentsContainerModel } from './ComponentsContainer';

export const ComponentTypeModel = types
    .compose(
        ComponentsContainerModel,
        types.model({
            isCustom: types.boolean,
            baseType: types.maybeNull(types.reference(types.late(() => ComponentTypeModel))),
        }),
    )
    .views((self) => ({
        get name(): string {
            const arr = self.id.split('.');
            return arr[arr.length - 1];
        },
    }));

// types.model({
//     id: types.identifier,
//     baseComponentType: types.maybe(types.reference(types.late(() => ComponentTypeModel))),
//     componentInstances: types.array(ComponentInstanceModel),
// });

export default interface ComponentType extends Instance<typeof ComponentTypeModel> {}
