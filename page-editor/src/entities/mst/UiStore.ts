import { types, Instance, applySnapshot } from 'mobx-state-tree';
import IdeConnection, { IdeConnectionModel } from './IdeConnection';
import PageInstance, { PageInstanceModel } from 'entities/mst/PageInstance';
import PageType from 'entities/mst/PageType';
import ComponentInstance, { ComponentInstanceModel } from 'entities/mst/ComponentInstance';
import { NotificationModel } from './Notification';
import { SelectableModel } from './Selectable';
import WebSite, { WebSiteModel } from './WebSite';
import { DependencyContainer, TYPES } from 'inversify.config';
import IUrlMatcher from 'services/IUrlMatcher';

export enum ProjectTabType {
    PageInstance = 'PageInstance',
    ComponentIntance = 'ComponentIntance',
}

export const ProjectTabModel = types
    .compose(
        SelectableModel,
        types.model({
            type: types.enumeration<ProjectTabType>(Object.values(ProjectTabType)),
            editedComponentInstance: types.maybe(types.reference(ComponentInstanceModel)),
            editedPageInstance: types.maybe(
                types.reference(PageInstanceModel, {
                    onInvalidated: (ev) => {
                        console.log('editedPageInstance invalidated', ev);
                        if (ev.cause == 'destroy') {
                            ev.removeRef();
                        }
                    },
                }),
            ),
        }),
    )
    .views((self) => ({
        get editedObject() {
            switch (self.type) {
                case ProjectTabType.ComponentIntance:
                    return self.editedComponentInstance;
                case ProjectTabType.PageInstance:
                    return self.editedPageInstance;
                default:
                    throw new Error('Unknown tab type.');
            }
        },
        get componentsContainer() {
            switch (self.type) {
                case ProjectTabType.ComponentIntance:
                    return self.editedComponentInstance?.componentType;
                case ProjectTabType.PageInstance:
                    return self.editedPageInstance?.pageType;
                default:
                    throw new Error('Unknown tab type.');
            }
        },
    }));

export interface ProjectTab extends Instance<typeof ProjectTabModel> {}

export const UiStoreModel = types
    .model({
        ideConnections: types.array(IdeConnectionModel),
        selectedIdeConnectionType: types.maybeNull(types.string),
        selectedProject: types.maybeNull(types.string),
        selectedProjectIsLoaded: types.optional(types.boolean, false),
        openedTabs: types.array(ProjectTabModel),
        blankComponents: types.array(ComponentInstanceModel),
        matchingPages: types.array(
            types.reference(PageInstanceModel, {
                onInvalidated: (ev) => {
                    console.log('matchingPages invalidated', ev);
                    ev.removeRef();
                },
            }),
        ),
        editorSelectedLineIndex: types.optional(types.number, 0),
        editorCaretPosition: types.optional(types.number, 0),
        notification: types.maybeNull(NotificationModel),
        matchingWebsite: types.maybeNull(types.reference(WebSiteModel)),
        currentUrl: types.maybeNull(types.string),
    })
    .views((self) => ({
        // get selectedPageObject() {
        //     return self.editedPageObjects.find((po) => po.selected);
        // },
        get selectedTab(): ProjectTab | undefined {
            return self.openedTabs.find((t) => t.selected);
        },
    }))
    .actions((self) => ({
        showNotification(title: string | null, message: string, isError: boolean) {
            self.notification = NotificationModel.create({
                message,
                title,
                isError,
            });
        },
        hideNotification() {
            self.notification = null;
        },
        setEditorSelectedLineIndex(lineIndex: number) {
            self.editorSelectedLineIndex = lineIndex;
        },
        setEditorCaretPosition(caretPosition: number) {
            self.editorCaretPosition = caretPosition;
        },
        // setSelectedPageType(pageType: PageType | undefined) {
        //     self.selectedPageType = pageType;
        // },
        selectTab(tab: ProjectTab | undefined) {
            if (!tab) {
                return;
            }
            self.openedTabs.forEach((po) => po.deselect());
            tab.select();
        },
        showExplorer() {
            self.openedTabs.forEach((po) => po.deselect());
        },
        findTabFor(editedObject) {
            return self.openedTabs.find((t) => {
                return t.editedObject === editedObject;
            });
        },
        selectPageObject(pageType: PageType) {
            this.selectTab(this.findTabFor(pageType));
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
        showTabForEditedPage(pageInstance: PageInstance) {
            let tab = this.findTabFor(pageInstance);
            if (!tab) {
                tab = ProjectTabModel.create({
                    type: ProjectTabType.PageInstance,
                    editedPageInstance: pageInstance.id,
                });
                self.openedTabs.push(tab);
            }
            // if (!self.editedPageObjects.find((po) => po == pageObject)) {
            //     self.editedPageObjects.push(pageObject);
            // }
            this.selectTab(tab);
            // this.selectPageObject(pageObject);
        },
        addTabForEditedComponent(componentInstance: ComponentInstance) {
            let tab = this.findTabFor(componentInstance);
            if (!tab) {
                tab = ProjectTabModel.create({
                    type: ProjectTabType.ComponentIntance,
                    editedComponentInstance: componentInstance.id,
                });
                self.openedTabs.push(tab);
            }
            this.selectTab(tab);
        },
        closeTab(tab: ProjectTab) {
            self.openedTabs.remove(tab);
        },
        // removeEditedPageObject(pageObject: ComponentsContainer) {
        //     self.editedPageObjects.remove(pageObject);
        // },
        setMatchingWebsite(website: WebSite | null) {
            self.matchingWebsite = website;
        },
        setMathchingPages(pageInstances: PageInstance[]) {
            self.matchingPages.replace(pageInstances);
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
        setCurrentUrl(url) {
            self.currentUrl = url;
        },
    }));

export default interface UiStore extends Instance<typeof UiStoreModel> {}
