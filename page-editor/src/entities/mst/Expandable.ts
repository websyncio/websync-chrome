import { types, Instance } from 'mobx-state-tree';

export const ExpandableModel = types
    .model()
    .volatile(() => ({
        expanded: false,
    }))
    .actions((self) => ({
        toggleExpanded() {
            self.expanded = !self.expanded;
        },
    }));

export default interface Selectable extends Instance<typeof ExpandableModel> {}
