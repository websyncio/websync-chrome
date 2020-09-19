import { types, Instance } from 'mobx-state-tree';
import PageType, { PageTypeModel } from './PageType';
import IIdeProxy from 'interfaces/IIdeProxy';
import { WebSiteModel } from './WebSite';
import IdeProxy, { IdeProxyModel } from './IdeProxy';

export const UiStoreModel = types
    .model({
        selectedPageType: types.safeReference(PageTypeModel),
        selectedWebSite: types.safeReference(WebSiteModel),
        ideProxies: types.array(IdeProxyModel),
    })
    .views((self) => ({}))
    .actions((self) => ({
        setSelectedPageType(pageType: PageType | undefined) {
            self.selectedPageType = pageType;
        },
        addIdeProxy(type: string) {
            this.removeIdeProxy(type);
            self.ideProxies.push(
                IdeProxyModel.create({
                    type,
                }),
            );
        },
        removeIdeProxy(type: string) {
            const ide = self.ideProxies.find((ide) => ide.type == type);
            if (ide) {
                self.ideProxies.remove(ide);
            }
        },
        setProjectsList(type, projectsList) {
            const ide = self.ideProxies.find((ide) => ide.type == type);
            if (!ide) {
                throw new Error('There is no connection to IDE: ' + type);
            }
            (ide as IdeProxy).setProjectList(projectsList);
        },
    }));

export default interface UiStore extends Instance<typeof UiStoreModel> {}
