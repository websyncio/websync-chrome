import { types, Instance } from 'mobx-state-tree';
import { ComponentsContainerModel } from './ComponentsContainer';

export const ComponentTypeModel = ComponentsContainerModel.named('ComponentType');

// types.model({
//     id: types.identifier,
//     baseComponentType: types.maybe(types.reference(types.late(() => ComponentTypeModel))),
//     componentsInstances: types.array(ComponentInstanceModel),
// });

export default interface ComponentType extends Instance<typeof ComponentTypeModel> {}
