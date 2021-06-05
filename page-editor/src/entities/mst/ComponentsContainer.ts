import { types, Instance } from 'mobx-state-tree';
import { ComponentInstanceModel } from './ComponentInstance';
import { SelectableModel } from './Selectable';

export const ComponentsContainerModel = types
    .compose(
        SelectableModel,
        types.model({
            id: types.identifier,
            baseType: types.string, // types.maybe(types.reference(types.late(() => ComponentsContainerModel))),
            componentsInstances: types.array(ComponentInstanceModel),
        }),
    )
    .views((self) => ({
        get name() {
            const arr = self.id.split('.');
            return arr[arr.length - 1];
        },
    }));

export default interface ComponentsContainer extends Instance<typeof ComponentsContainerModel> {}
