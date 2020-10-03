import { types, Instance } from 'mobx-state-tree';
import { PageInstanceModel } from './PageInstance';

export const WebSiteModel = types
    .model({
        id: types.identifier,
        baseWebSite: types.maybe(types.reference(types.late(() => WebSiteModel))),
        url: types.string,
        pageInstances: types.array(PageInstanceModel),
    })
    .views((self) => ({
        get name() {
            const arr = self.id.split('.');
            return arr[arr.length - 1];
        },
    }));

export default interface WebSite extends Instance<typeof WebSiteModel> {}
