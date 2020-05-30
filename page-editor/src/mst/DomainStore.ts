import { types, Instance } from 'mobx-state-tree';
import { WebSiteModel } from './WebSite';
import { PageTypeModel } from './PageType';
import { ComponentTypeModel } from './ComponentType';

export const DomainStoreModel = types.model({
    webSites: types.map(WebSiteModel),
    pageTypes: types.map(PageTypeModel),
    componentTypes: types.map(ComponentTypeModel),
});

export default interface DomainStore extends Instance<typeof DomainStoreModel> {}
