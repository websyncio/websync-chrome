import { types, Instance } from 'mobx-state-tree';

export const ParameterModel = types.model({
    name: types.maybeNull(types.string),
    values: types.array(types.string),
});

export default interface Parameter extends Instance<typeof ParameterModel> {}
