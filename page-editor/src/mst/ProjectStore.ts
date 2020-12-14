import { types, Instance, getParent, hasParent, destroy, cast } from 'mobx-state-tree';
import WebSite, { WebSiteModel } from './WebSite';
import PageType, { PageTypeModel } from './PageType';
import PageInstance from './PageInstance';
import ComponentType, { ComponentTypeModel } from './ComponentType';
import ComponentInstance from './ComponentInstance';

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
        updateComponentInitializationParameter(
            pageType: PageType,
            componentId,
            parameterName,
            parameterValueIndex,
            parameterValue,
        ) {
            const componentInstance: ComponentInstance = pageType.componentsInstances.find(
                (ci) => ci.id == componentId,
            );
            if (!componentInstance) {
                throw new Error('No component to update. componentId: ' + componentId);
            }
            componentInstance.updateInitializationParameter(parameterName, parameterValueIndex, parameterValue);
        },
    }));

export default interface ProjectStore extends Instance<typeof ProjectStoreModel> {}
