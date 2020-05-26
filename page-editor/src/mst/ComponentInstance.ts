import { types, Instance } from 'mobx-state-tree';
import { AttributeModel } from './Attribute';
import { ComponentTypeModel } from './ComponentType';

export const ComponentInstanceModel = types.model({
    id: types.identifier,
    componentType: types.reference(ComponentTypeModel),
    name: types.string,
    initializationAttribute: types.optional(AttributeModel, {
        name: '',
    }),
});

export default interface ComponentInstance extends Instance<typeof ComponentInstanceModel> {}
