import { types, Instance } from 'mobx-state-tree';

export const ParameterModel = types
    .model({
        name: types.maybeNull(types.string),
        values: types.array(types.string),
    })
    .actions((self) => ({
        updateValue(index, value) {
            if (index >= self.values.length) {
                throw new Error(`Invalid value index to update for parameter: ${index}.`);
            }
            self.values.splice(index, 1, value);
        },
    }));

export default interface Parameter extends Instance<typeof ParameterModel> {}
