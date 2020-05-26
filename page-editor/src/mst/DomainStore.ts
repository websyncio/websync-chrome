import { types, Instance } from 'mobx-state-tree';
import { WebSiteModel } from './WebSite';
import { PageTypeModel } from './PageType';
import { PageInstanceModel } from './PageInstance';
import { ComponentTypeModel } from './ComponentType';
import { ComponentInstanceModel } from './ComponentInstance';

export const DomainStoreModel = types.model({
    webSites: types.map(WebSiteModel),
    pageTypes: types.map(PageTypeModel),
    pageInstances: types.map(PageInstanceModel),
    componentTypes: types.map(ComponentTypeModel),
    componentInstances: types.map(ComponentInstanceModel),
});

export default interface DomainStore extends Instance<typeof DomainStoreModel> {}
