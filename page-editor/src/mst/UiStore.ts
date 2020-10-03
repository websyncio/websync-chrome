import { types, Instance } from 'mobx-state-tree';
import PageType, { PageTypeModel } from './PageType';
import IIdeProxy from 'interfaces/IIdeProxy';
import { WebSiteModel } from './WebSite';
import IdeConnection, { IdeConnectionModel } from './IdeConnection';

export const UiStoreModel = types
    .model({
        ideConnections: types.array(IdeConnectionModel),
        selectedIdeConnectionType: types.maybeNull(types.string),
        selectedProject: types.maybeNull(types.string),
        selectedProjectIsLoaded: types.optional(types.boolean, false),
        selectedWebSite: types.safeReference(WebSiteModel),
        selectedPageType: types.safeReference(PageTypeModel),
    })
    .views((self) => ({}))
    .actions((self) => ({
        setSelectedPageType(pageType: PageType | undefined) {
            self.selectedPageType = pageType;
        },
        addIdeConnection(type: string) {
            this.removeIdeConnection(type);
            self.ideConnections.push(
                IdeConnectionModel.create({
                    type,
                }),
            );
        },
        removeIdeConnection(type: string) {
            const ide = self.ideConnections.find((ide) => ide.type == type);
            if (ide) {
                self.ideConnections.remove(ide);
            }
        },
        setProjectsList(type, projectsList) {
            const ide = self.ideConnections.find((ide) => ide.type == type);
            if (!ide) {
                throw new Error('There is no connection to IDE: ' + type);
            }
            (ide as IdeConnection).setProjectList(projectsList);
        },
        setSelectedProject(ideConnectionType: string, projectName: string) {
            self.selectedIdeConnectionType = ideConnectionType;
            self.selectedProject = projectName;
        },
    }));

export default interface UiStore extends Instance<typeof UiStoreModel> {}
