import { types, Instance, applySnapshot } from 'mobx-state-tree';
import WebSite, { WebSiteModel } from './WebSite';
import { PageTypeModel } from './PageType';
import PageInstance from './PageInstance';
import ComponentType, { ComponentTypeModel } from './ComponentType';

function compareComponentTypes(a: ComponentType, b: ComponentType) {
    if (a.name > b.name) {
        return 1;
    } else if (a.name < b.name) {
        return -1;
    }
    return 0;
}

export const ProjectStoreModel = types
    .model({
        webSites: types.array(WebSiteModel),
        pageTypes: types.array(PageTypeModel),
        componentTypes: types.array(ComponentTypeModel),
    })
    .views((self) => ({
        get selectedWebSite(): WebSite | null {
            return self.webSites.find((ws) => ws.selected);
        },
        get selectedPageInstance(): PageInstance | null {
            return self.webSites.reduce((result, ws) => result.concat(ws.pageInstances), []).find((pi) => pi.selected);
        },
        get frameworkComponentTypes(): ComponentType[] {
            return self.componentTypes.filter((ct) => !ct.isCustom).sort(compareComponentTypes);
        },
        get customComponentTypes(): ComponentType[] {
            return self.componentTypes.filter((ct) => ct.isCustom).sort(compareComponentTypes);
        },
    }))
    .actions((self) => ({
        updatePageType(pageTypeJson) {
            const index = self.pageTypes.findIndex((pt) => pt.id == pageTypeJson.id);
            if (!index) {
                console.log('Probably name of the page changed. Have to decide what to do in this case.');
                throw new Error('Unable to update page type: ' + pageTypeJson.id);
            }
            console.log('Apply snapshot, Old', JSON.stringify(self.pageTypes[index]));
            console.log('Apply snapshot, New', JSON.stringify(pageTypeJson));
            applySnapshot(self.pageTypes[index], pageTypeJson);
        },
        updateComponentType(componentTypeJson) {
            const oldComponentType = self.componentTypes.find((pt) => pt.id == componentTypeJson.id);
            if (!oldComponentType) {
                throw new Error('Unable to update component type: ' + componentTypeJson.id);
            }
            applySnapshot(oldComponentType, componentTypeJson);
        },
        updateWebsite(websiteJson) {
            const oldWebsite = self.webSites.find((pt) => pt.id == websiteJson.id);
            if (!oldWebsite) {
                throw new Error('Unable to update website: ' + websiteJson.id);
            }
            applySnapshot(oldWebsite, websiteJson);
        },
        updateProject(projectJson) {
            applySnapshot(self, projectJson);
        },
    }));

export default interface ProjectStore extends Instance<typeof ProjectStoreModel> {}
