import { types, Instance, applySnapshot } from 'mobx-state-tree';
import IdeConnection, { IdeConnectionModel } from './IdeConnection';
import { PageTypeModel } from './PageType';
import PageInstance, { PageInstanceModel } from './PageInstance';
import PageType from 'entities/mst/PageType';
import ComponentInstance, { ComponentInstanceModel } from 'entities/mst/ComponentInstance';
import ComponentsContainer from './ComponentsContainer';

export const UiStoreModel = types
    .model({
        ideConnections: types.array(IdeConnectionModel),
        selectedIdeConnectionType: types.maybeNull(types.string),
        selectedProject: types.maybeNull(types.string),
        selectedProjectIsLoaded: types.optional(types.boolean, false),
        editedPageObjects: types.array(types.reference(PageTypeModel)),
        // selectedWebSite: types.safeReference(WebSiteModel),
        // selectedPageType: types.safeReference(PageTypeModel),s
        blankComponents: types.array(ComponentInstanceModel),
        matchedPages: types.array(types.reference(PageInstanceModel)),
    })
    .views((self) => ({
        get selectedPageObject(): ComponentsContainer | undefined {
            return self.editedPageObjects.find((po) => po.selected);
        },
    }))
    .actions((self) => ({
        // setSelectedPageType(pageType: PageType | undefined) {
        //     self.selectedPageType = pageType;
        // },
        selectPageObject(pageObject: PageType) {
            self.editedPageObjects.forEach((po) => po.deselect());
            pageObject.select();
        },
        showExplorer() {
            self.editedPageObjects.forEach((po) => po.deselect());
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
        addEditedPageObject(pageObject: PageType) {
            if (!self.editedPageObjects.find((po) => po == pageObject)) {
                self.editedPageObjects.push(pageObject);
            }
            this.selectPageObject(pageObject);
        },
        removeEditedPageObject(pageObject: PageType) {
            self.editedPageObjects.remove(pageObject);
        },
        updateMathchedPages(pageInstances: PageInstance[]) {
            self.matchedPages.replace(pageInstances);
        },
        generateBlankComponents(selectors) {
            applySnapshot(
                self.blankComponents,
                selectors.map((s) => ({
                    id: s.id,
                    componentType: s.type,
                    fieldName: s.name,
                    initializationAttribute: {
                        name: 'UI',
                        parameters: [{ values: [s.selector] }],
                    },
                })),
            );
        },
        deleteBlankComponent(component: ComponentInstance) {
            self.blankComponents.remove(component);
            component.delete();
        },
    }));

export default interface UiStore extends Instance<typeof UiStoreModel> {}
