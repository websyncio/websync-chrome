import { types, Instance } from 'mobx-state-tree';
import { ExpandableModel } from './Expandable';
import { PageInstanceModel } from './PageInstance';
import { SelectableModel } from './Selectable';

export const WebSiteModel = types
    .compose(
        ExpandableModel,
        SelectableModel,
        types.model({
            id: types.identifier,
            baseWebSite: types.maybe(types.reference(types.late(() => WebSiteModel))),
            url: types.string,
            pageInstances: types.array(PageInstanceModel),
        }),
    )
    .views((self) => ({
        get name() {
            const arr = self.id.split('.');
            return arr[arr.length - 1];
        },
    }))
    .actions((self) => ({
        setUrl(newUrl) {
            self.url = newUrl;
        },
    }));

export default interface WebSite extends Instance<typeof WebSiteModel> {}
