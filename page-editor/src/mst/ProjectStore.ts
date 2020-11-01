import { types, Instance, getParent, hasParent } from 'mobx-state-tree';
import { WebSiteModel } from './WebSite';
import { PageTypeModel } from './PageType';
import { ComponentTypeModel } from './ComponentType';
import ComponentInstance from 'models/ComponentInstance';

export const ProjectStoreModel = types
    .model({
        webSites: types.array(WebSiteModel),
        pageTypes: types.array(PageTypeModel),
        componentTypes: types.array(ComponentTypeModel),
    })
    .actions((self) => ({}));

export default interface ProjectStore extends Instance<typeof ProjectStoreModel> {}
