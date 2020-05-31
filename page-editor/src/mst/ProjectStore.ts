import { types, Instance } from 'mobx-state-tree';
import { WebSiteModel } from './WebSite';
import { PageTypeModel } from './PageType';
import { ComponentTypeModel } from './ComponentType';

export const ProjectStoreModel = types.model({
    webSites: types.array(WebSiteModel),
    pageTypes: types.array(PageTypeModel),
    componentTypes: types.array(ComponentTypeModel),
});

export default interface ProjectStore extends Instance<typeof ProjectStoreModel> {}
