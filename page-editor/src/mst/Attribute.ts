import { types, Instance } from 'mobx-state-tree';
import { ParameterModel } from './Parameter';

export const AttributeModel = types.model({
    name: types.string,
    parameters: types.map(ParameterModel),
});

export default interface Attribute extends Instance<typeof AttributeModel> {}
