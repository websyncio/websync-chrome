import { types, Instance, getParent, hasParent, destroy, cast } from 'mobx-state-tree';
import { WebSiteModel } from './WebSite';
import { PageTypeModel } from './PageType';
import { ComponentTypeModel } from './ComponentType';
import ComponentInstance from 'models/ComponentInstance';
import PageType from 'models/PageType';

export const ProjectStoreModel = types
    .model({
        webSites: types.array(WebSiteModel),
        pageTypes: types.array(PageTypeModel),
        componentTypes: types.array(ComponentTypeModel),
    })
    .actions((self) => ({
        updatePageType(pageTypeJson) {
            const updated = PageTypeModel.create(pageTypeJson);
            const oldIndex = self.pageTypes.findIndex((pt) => pt.id == updated.id);
            if (!oldIndex) {
                console.log('Probably name of the page changed. Have to decide what to do in this case.');
                throw new Error('Unable to update page type: ' + updated.id);
            }
            const old = self.pageTypes[oldIndex];
            if (old.selected) {
                updated.select();
            }
            destroy(self.pageTypes[oldIndex]);
            self.pageTypes.splice(oldIndex, 0, updated);
        },
        updateComponentType(componentTypeJson) {
            console.log('component is updated:', componentTypeJson);
        },
    }));

export default interface ProjectStore extends Instance<typeof ProjectStoreModel> {}
