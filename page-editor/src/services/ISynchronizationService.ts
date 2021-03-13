import ComponentInstance from 'entities/mst/ComponentInstance';
import PageInstance from 'entities/mst/PageInstance';
import WebSite from 'entities/mst/WebSite';

export default interface IProjectSynchronizationService {
    updateWebSiteUrl(website: WebSite, newUrl: string);
    updatePageInstanceUrl(pageInstance: PageInstance, newUrl: string);
    deleteComponentInstance(component: ComponentInstance): void;
    // createSite();
    // createPageType();
    // createComponentType();
    // updateSite();
    // updatePageType();
    // updateComponentType();
    // deleteSite();
    // deletePageType();
    // deleteComponentType();
}
