import IDEAConnection from 'connections/IDE/IDEAConnection';
import { RootStore } from 'context';
import ComponentInstance from 'entities/mst/ComponentInstance';
import PageInstance from 'entities/mst/PageInstance';
import WebSite from 'entities/mst/WebSite';
import { injectable, inject } from 'inversify';
import { TYPES } from 'inversify.config';
import IProjectSynchronizerService from 'services/ISynchronizationService';

@injectable()
export default class JDISynchronizationService implements IProjectSynchronizerService {
    constructor(@inject(TYPES.IDEAConnection) private ideaConnection: IDEAConnection) {}

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

    deleteComponentInstance(component: ComponentInstance): void {
        component.delete();
        //this.ideaConnection.deleteComponentInstance(component);
    }
}
