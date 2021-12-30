import { types, Instance, applySnapshot } from 'mobx-state-tree';
import IdeConnection, { IdeConnectionModel } from './IdeConnection';
import PageInstance, { PageInstanceModel } from 'entities/mst/PageInstance';
import PageType, { PageTypeModel } from 'entities/mst/PageType';
import ComponentInstance, { ComponentInstanceModel } from 'entities/mst/ComponentInstance';
import { NotificationModel } from './Notification';
import ISelectable, { SelectableModel } from './Selectable';
import WebSite, { WebSiteModel } from './WebSite';
import ComponentsContainer from './ComponentsContainer';
import { ComponentTypeModel } from './ComponentType';
import { Component } from 'react';
import { UrlMatchResult } from 'services/IMatchUrlService';
import { RootStore } from 'context';

export enum BreadcrumbType {
    ProjectExplorer = 'ProjectExplorer',
    MatchingPage = 'MatchingPage',
    EditedComponentInstance = 'EditedComponentInstance',
}

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
        blankComponents: types.array(ComponentInstanceModel),
        matchingWebsite: types.maybeNull(types.reference(WebSiteModel)),
        websiteIsMatchedManually: types.optional(types.boolean, false),
        matchingPages: types.array(
            types.reference(PageInstanceModel, {
                onInvalidated: (ev) => {
                    console.log('matchingPages invalidated', ev);
                    ev.removeRef();
                },
            }),
        ),
        selectedBreadcrumb: types.optional(
            types.enumeration<BreadcrumbType>(Object.values(BreadcrumbType)),
            BreadcrumbType.ProjectExplorer,
        ),
        editedPage: types.maybe(types.reference(PageInstanceModel)),
        editedComponentsChain: types.array(types.reference(ComponentInstanceModel)),
        editorSelectedLineIndex: types.optional(types.number, 0),
        editorCaretPosition: types.optional(types.number, 0),
        notification: types.maybeNull(NotificationModel),
        currentUrl: types.maybeNull(types.string),
    })
    .views((self) => ({
        // get selectedPageObject() {
        //     return self.editedPageObjects.find((po) => po.selected);
        // },
        get matchingPage(): PageInstance {
            if (self.matchingPages.length == 1) {
                return self.matchingPages[0];
            }
            throw new Error('Unable to define matching page.');
        },
        get selectedComponentsContainer(): ComponentsContainer | null {
            switch (self.selectedBreadcrumb) {
                case BreadcrumbType.MatchingPage:
                    return self.matchingPages[0].pageType;
                case BreadcrumbType.EditedComponentInstance:
                    return self.editedComponentsChain.find((ci) => ci.selected).componentType;
                default:
                    return null;
            }
        },
    }))
    .actions((self) => ({
        selectEditedComponentInstance(editedComponentInstance: ComponentInstance) {
            self.editedComponentsChain.forEach((c) => c.deselect());
            editedComponentInstance.select();
            this.selectBreadcrumb(BreadcrumbType.EditedComponentInstance);
        },
        selectBreadcrumb(breadcrumbType: BreadcrumbType) {
            console.log('selectBreadcrumb', breadcrumbType);
            self.selectedBreadcrumb = breadcrumbType;
        },
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
        // selectTab(tab: ProjectTab | undefined) {
        //     if (!tab) {
        //         return;
        //     }
        //     self.openedTabs.forEach((po) => po.deselect());
        //     tab.select();
        // },
        // showExplorer() {
        //     self.openedTabs.forEach((po) => po.deselect());
        // },
        // findTabFor(editedObject) {
        //     return self.openedTabs.find((t) => {
        //         return t.editedObject === editedObject;
        //     });
        // },
        // selectPageObject(pageType: PageType) {
        //     this.selectTab(this.findTabFor(pageType));
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
        addProject(ideType: string, projectName: string) {
            const ide = self.ideConnections.find((ide) => ide.type == ideType);
            if (!ide) {
                throw new Error('There is no connection to IDE: ' + ideType);
            }
            (ide as IdeConnection).addProject(projectName);
        },
        removeProject(ideType: string, projectName: string) {
            const ide = self.ideConnections.find((ide) => ide.type == ideType);
            if (!ide) {
                throw new Error('There is no connection to IDE: ' + ideType);
            }
            (ide as IdeConnection).removeProject(projectName);
            if (ideType === self.selectedIdeConnectionType && projectName === self.selectedProject) {
                this.clearProject();
            }
        },
        showTabForEditedPage(pageInstance: PageInstance) {
            console.log('showTabForEditedPage');
            this.selectBreadcrumb(BreadcrumbType.MatchingPage);
            // let tab = this.findTabFor(pageInstance);
            // if (!tab) {
            //     tab = ProjectTabModel.create({
            //         type: ProjectTabType.PageInstance,
            //         editedPageInstance: pageInstance.id,
            //     });
            //     self.openedTabs.push(tab);
            // }
            // if (!self.editedPageObjects.find((po) => po == pageObject)) {
            //     self.editedPageObjects.push(pageObject);
            // }
            // this.selectTab(tab);
            // this.selectPageObject(pageObject);
        },
        editComponent(componentInstance: ComponentInstance, parentComponentInstance: ComponentInstance | null) {
            // .define a chain of edited components
            const parentIndex = self.editedComponentsChain.indexOf(parentComponentInstance);
            const newEditedComponentsChain: ComponentInstance[] =
                parentIndex === -1
                    ? [] // .starting a new chain
                    : self.editedComponentsChain.slice(0, parentIndex + 1); // .use a part(or whole) of existing chain
            newEditedComponentsChain.push(componentInstance);
            self.editedComponentsChain.replace(newEditedComponentsChain);
            self.editedPage = self.matchingPage;
            this.selectEditedComponentInstance(componentInstance);
            // let tab = this.findTabFor(componentInstance);
            // if (!tab) {
            //     tab = ProjectTabModel.create({
            //         type: ProjectTabType.ComponentIntance,
            //         editedComponentInstance: componentInstance.id,
            //     });
            //     self.openedTabs.push(tab);
            // }
            // this.selectTab(tab);
        },
        // closeTab(tab: ProjectTab) {
        //     self.openedTabs.remove(tab);
        // },
        // removeEditedPageObject(pageObject: ComponentsContainer) {
        //     self.editedPageObjects.remove(pageObject);
        // },
        setUrlMatchResult(urlMatchResult: UrlMatchResult) {
            if (urlMatchResult.websiteId) {
                const website = RootStore.projectStore.webSites.find((ws) => ws.id === urlMatchResult.websiteId);
                if (!website) {
                    throw new Error('Unable to find matching website.');
                }
                this.setMatchingWebsite(website);
                const pages = website.pageInstances.filter((pi) => urlMatchResult.pageIds.includes(pi.id));
                this.setMathchingPages(pages);
            } else {
                this.setMatchingWebsite(null);
                this.setMathchingPages([]);
            }
        },
        setMatchingWebsite(website: WebSite | null, websiteIsMatchedManually?: boolean) {
            if (website) {
                self.matchingWebsite = website;
                self.websiteIsMatchedManually = !!websiteIsMatchedManually;
                if (self.matchingWebsite) {
                    self.matchingWebsite.expand();
                }
            } else {
                if (self.matchingWebsite && self.matchingWebsite.selected) {
                    self.websiteIsMatchedManually = true;
                } else {
                    self.matchingWebsite = null;
                }
            }
        },
        setMathchingPages(pageInstances: PageInstance[]) {
            const oldMatchingPage = self.matchingPages.length == 1 ? self.matchingPages[0] : null;
            self.matchingPages.replace(pageInstances);
            if (pageInstances.length !== 1) {
                this.selectBreadcrumb(BreadcrumbType.ProjectExplorer);
                return;
            }
            if (
                self.matchingPage !== oldMatchingPage &&
                self.selectedBreadcrumb == BreadcrumbType.EditedComponentInstance
            ) {
                this.selectBreadcrumb(BreadcrumbType.MatchingPage);
            }
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
        clearProject() {
            self.selectedProjectIsLoaded = false;
            self.selectedProject = null;
        },
    }));

export default interface UiStore extends Instance<typeof UiStoreModel> {}
