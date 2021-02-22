import { Scss } from 'components/ScssBuilder';
import { types, Instance } from 'mobx-state-tree';

export const SelectorModel = types
    .model({
        type: types.string,
        value: types.string,
    })
    .views((self) => ({
        get scss(): Scss {
            return Scss.create(self.type, self.value);
        },
    }));

export default interface Selector extends Instance<typeof SelectorModel> {}
