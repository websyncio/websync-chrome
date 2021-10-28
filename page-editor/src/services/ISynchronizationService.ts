import ComponentInstance from 'entities/mst/ComponentInstance';
import ComponentsContainer from 'entities/mst/ComponentsContainer';
import ComponentType from 'entities/mst/ComponentType';
import PageInstance from 'entities/mst/PageInstance';
import WebSite from 'entities/mst/WebSite';

export default interface IProjectSynchronizationService {
    addComponentInstance(component: ComponentInstance): void;
    updateComponentInstance(component: ComponentInstance): void;
    deleteComponentInstance(component: ComponentInstance): void;
    updateWebSiteUrl(website: WebSite, newUrl: string): void;
    updatePageInstanceUrl(pageInstance: PageInstance, newUrl: string): void;
    // createSite();
    // createPageType();
    createComponentType(typeName: string, parentId: string, baseType: string | null): void;
    // updateSite();
    // updatePageType();
    // updateComponentType();
    // deleteSite();
    // deletePageType();
    // deleteComponentType();
}
