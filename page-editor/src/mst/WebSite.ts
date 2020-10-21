import { types, Instance } from 'mobx-state-tree';
import { PageInstanceModel } from './PageInstance';
import { SelectableModel } from './Selectable';

export const WebSiteModel = types
    .compose(
        SelectableModel,
        types.model({
            id: types.identifier,
            baseWebSite: types.maybe(types.reference(types.late(() => WebSiteModel))),
            url: types.string,
            pageInstances: types.array(PageInstanceModel),
            expanded: types.optional(types.boolean, false),
        }),
    )
    .views((self) => ({
        get name() {
            const arr = self.id.split('.');
            return arr[arr.length - 1];
        },
    }))
    .actions((self) => ({
        toggleExpanded() {
            self.expanded = !self.expanded;
        },
    }));

export default interface WebSite extends Instance<typeof WebSiteModel> {}
