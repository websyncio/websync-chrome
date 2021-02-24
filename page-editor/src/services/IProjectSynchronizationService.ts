import ComponentInstance from 'entities/mst/ComponentInstance';

export default interface IProjectSynchronizationService {
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
