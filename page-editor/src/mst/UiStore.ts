import { types, Instance } from 'mobx-state-tree';
// import PageType, { PageTypeModel } from './PageType';
// import ComponentType, { ComponentTypeModel } from './ComponentType';
// import IIdeProxy from 'interfaces/IIdeProxy';
// import { WebSiteModel } from './WebSite';
import IdeConnection, { IdeConnectionModel } from './IdeConnection';
import ComponentsContainer, { ComponentsContainerModel } from './ComponentsContainer';
import { PageTypeModel } from './PageType';
import PageType from 'models/PageType';

export const UiStoreModel = types
    .model({
        ideConnections: types.array(IdeConnectionModel),
        selectedIdeConnectionType: types.maybeNull(types.string),
        selectedProject: types.maybeNull(types.string),
        selectedProjectIsLoaded: types.optional(types.boolean, false),
        editedPageObjects: types.array(types.reference(PageTypeModel)),
        // selectedWebSite: types.safeReference(WebSiteModel),
        // selectedPageType: types.safeReference(PageTypeModel),s
        // editedComponentType: types.maybeNull(ComponentTypeModel),
    })
    .views((self) => ({
        get editedPageObject() {
            return self.editedPageObjects.find((po) => po.selected);
        },
    }))
    .actions((self) => ({
        // setSelectedPageType(pageType: PageType | undefined) {
        //     self.selectedPageType = pageType;
        // },
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
        addEditedPageObject(po: PageType) {
            self.editedPageObjects.push(po);
        },
    }));

export default interface UiStore extends Instance<typeof UiStoreModel> {}
