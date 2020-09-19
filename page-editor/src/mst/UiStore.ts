import { types, Instance } from 'mobx-state-tree';
import PageType, { PageTypeModel } from './PageType';
import IIdeProxy from 'interfaces/IIdeProxy';
import { WebSiteModel } from './WebSite';
import IdeProxy, { IdeProxyModel } from './IdeProxy';

export const UiStoreModel = types
    .model({
        selectedPageType: types.safeReference(PageTypeModel),
        selectedWebSite: types.safeReference(WebSiteModel),
        ideProxies: types.map(IdeProxyModel),
    })
    .actions((self) => ({
        setSelectedPageType(pageType: PageType | undefined) {
            self.selectedPageType = pageType;
        },
        addIdeProxy(type: string) {
            self.ideProxies.set(
                type,
                IdeProxyModel.create({
                    type,
                }),
            );
        },
        removeIdeProxy(type: string) {
            delete self.ideProxies[type];
        },
        setProjectsList(type, projectsList) {
            if (!self.ideProxies[type]) {
                throw new Error("No ide proxy of type '" + { type } + "' in the list");
            }
            (self.ideProxies[type] as IdeProxy).setProjectList(projectsList);
        },
    }));

export default interface UiStore extends Instance<typeof UiStoreModel> {}
