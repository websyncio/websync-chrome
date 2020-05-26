import { types, Instance } from 'mobx-state-tree';
import { ComponentInstanceModel } from './ComponentInstance';

export const ComponentTypeModel = types.model({
    id: types.identifier,
    baseComponentType: types.maybe(types.reference(types.late(() => ComponentTypeModel))),
    componentsInstances: types.map(ComponentInstanceModel),
});

export default interface ComponentType extends Instance<typeof ComponentTypeModel> {}
