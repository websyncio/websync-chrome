import { types, Instance } from 'mobx-state-tree';

export const SelectorModel = types.model({
    value: types.string,
});

export default interface Selector extends Instance<typeof SelectorModel> {}
