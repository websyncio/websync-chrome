import IDEAConnection, { MessageTypes } from 'connections/IDE/IDEAConnection';
import { RootStore } from 'context';
import ComponentInstance from 'entities/mst/ComponentInstance';
import PageInstance from 'entities/mst/PageInstance';
import WebSite from 'entities/mst/WebSite';
import { injectable, inject } from 'inversify';
import { TYPES } from 'inversify.config';
import IProjectSynchronizerService from 'services/ISynchronizationService';
import type IMatchUrlService from 'services/IMatchUrlService';

@injectable()
export default class JDISynchronizationService implements IProjectSynchronizerService {
    constructor(
        @inject(TYPES.IDEAConnection) private ideaConnection: IDEAConnection,
        @inject(TYPES.UrlMatcher) private urlMatcher: IMatchUrlService,
    ) {
        ideaConnection.addListener(MessageTypes.ProjectDataReceived, this.onProjectDataReceived.bind(this));
        ideaConnection.addListener(MessageTypes.ProjectUpdated, this.onProjectUpdated.bind(this));
        ideaConnection.addListener(MessageTypes.WebsiteUpdated, this.onWebsiteUpdated.bind(this));
    }

    openFileForClass(classFullName: string) {
        if (!RootStore.uiStore.selectedProject) {
            throw new Error('Project not set');
        }

        this.ideaConnection.openFileForClass(RootStore.uiStore.selectedProject, classFullName);
    }

    onWebsiteUpdated(website) {
        RootStore.projectStore.updateWebsite(website);
        this.matchPage();
    }

    onProjectUpdated(projectData) {
        // RootStore.uiStore.setMatchingWebsite(null);
        // RootStore.uiStore.setMathchingPages([]);
        RootStore.projectStore.updateProject(projectData);
        this.matchPage();
    }

    onProjectDataReceived(connectionType, projectData) {
        // RootStore.uiStore.setMatchingWebsite(null);
        // RootStore.uiStore.setMathchingPages([]);
        RootStore.setProjectData(connectionType, projectData);
        this.matchPage();
    }

    matchPage() {
        if (RootStore.uiStore.currentUrl) {
            this.urlMatcher.matchUrl(RootStore.uiStore.currentUrl).then((matchResult) => {
                RootStore.uiStore.setUrlMatchResult(matchResult);
            });
        }
    }

    async createPageType(name: string, url: string): Promise<object> {
        if (!RootStore.uiStore.selectedProject) {
            throw new Error('Project not set');
        }
        if (!RootStore.uiStore.matchingWebsite) {
            throw new Error('No matching website');
        }

        return this.ideaConnection.createPageType(
            RootStore.uiStore.selectedProject,
            name,
            RootStore.uiStore.matchingWebsite.id,
            null,
            url,
        );
    }

    createWebsite(name: string, host: string) {
        if (!RootStore.uiStore.selectedProject) {
            throw new Error('Project not set');
        }

        return this.ideaConnection.createWebsite(RootStore.uiStore.selectedProject, name, host);
    }

    createComponentType(typeName: string, parentId: string, baseType: string | null): void {
        if (!RootStore.uiStore.selectedProject) {
            throw new Error('Project not set');
        }
        this.ideaConnection.createComponentType(RootStore.uiStore.selectedProject!, typeName, parentId, baseType);
    }

    updateComponentInstance(component: ComponentInstance): void {
        if (!RootStore.uiStore.selectedProject) {
            throw new Error('Project not set');
        }
        this.ideaConnection.updateComponentInstance(RootStore.uiStore.selectedProject, component);
    }

    updateWebSiteUrl(website: WebSite, newUrl: any) {
        if (!RootStore.uiStore.selectedProject) {
            throw new Error('Project not set');
        }
        website.setUrl(newUrl);
        this.ideaConnection.updateWebSite(RootStore.uiStore.selectedProject, website);
    }

    updatePageInstanceUrl(pageInstance: PageInstance, newUrl: string) {
        if (!RootStore.uiStore.selectedProject) {
            throw new Error('Project not set');
        }
        pageInstance.setUrl(newUrl);
        this.ideaConnection.updatePageInstance(RootStore.uiStore.selectedProject, pageInstance);
    }

    addComponentInstance(component: ComponentInstance): void {
        if (!RootStore.uiStore.selectedProject) {
            throw new Error('Project not set');
        }
        // let selectedPageObject = RootStore.uiStore.selectedPageObject;
        // if(!selectedPageObject){
        //     throw new Error("Page object is not selected. No place to add the component instance.");
        // }
        // selectedPageObject.addComponentInstance(component);
        this.ideaConnection.addComponentInstance(RootStore.uiStore.selectedProject, component);
    }

    deleteComponentInstance(component: ComponentInstance): void {
        if (!RootStore.uiStore.selectedProject) {
            throw new Error('Project not set');
        }

        // component.delete();
        this.ideaConnection.deleteComponentInstance(RootStore.uiStore.selectedProject, component);
    }
}
