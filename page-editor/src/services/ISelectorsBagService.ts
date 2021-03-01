import ComponentInstance from 'entities/mst/ComponentInstance';

export default interface ISelectorsBagService {
    deleteComponent(component: ComponentInstance);
    updateComponentName(component: ComponentInstance, componentName: string);
    updateComponentType(component: ComponentInstance, componentType: string);
    requestSelectorsList();
}
