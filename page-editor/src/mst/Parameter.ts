import { types, Instance } from 'mobx-state-tree';
import { SelectorModel } from './Selector';

export const ParameterModel = types.model({
    name: types.optional(types.string, ''),
    values: types.map(SelectorModel),
});

export default interface Parameter extends Instance<typeof ParameterModel> {}
