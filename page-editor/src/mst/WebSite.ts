import { types, Instance } from 'mobx-state-tree';
import { PageInstanceModel } from './PageInstance';

export const WebSiteModel = types.model({
    id: types.identifier,
    baseWebsite: types.maybe(types.reference(types.late(() => WebSiteModel))),
    url: types.string,
    pageInstances: types.map(PageInstanceModel),
});

export default interface WebSite extends Instance<typeof WebSiteModel> {}
