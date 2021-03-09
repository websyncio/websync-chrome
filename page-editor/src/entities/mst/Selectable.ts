import { types, Instance } from 'mobx-state-tree';

export const SelectableModel = types
    .model()
    .volatile((self) => ({
        selected: false,
    }))
    .actions((self) => ({
        select() {
            self.selected = true;
        },
        deselect() {
            self.selected = false;
        },
    }));

export default interface Selectable extends Instance<typeof SelectableModel> {}
