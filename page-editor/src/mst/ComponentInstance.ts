import { types, Instance } from 'mobx-state-tree';
import { AttributeModel } from './Attribute';
import { ComponentTypeModel } from './ComponentType';

export const ComponentInstanceModel = types.model({
    id: types.identifier,
    // try to fix - https://mobx-state-tree.js.org/tips/circular-deps
    componentType: types.string, //.maybe(types.reference(types.late(() => ComponentTypeModel))),
    name: types.string,
    initializationAttribute: types.optional(AttributeModel, {
        name: '',
    }),
});

export default interface ComponentInstance extends Instance<typeof ComponentInstanceModel> {}
