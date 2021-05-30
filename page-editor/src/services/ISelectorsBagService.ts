import ComponentInstance from 'entities/mst/ComponentInstance';

export default interface ISelectorsBagService {
    deleteComponent(component: ComponentInstance);
    updateComponentFieldName(component: ComponentInstance, componentName: string);
    updateComponentType(component: ComponentInstance, componentType: string);
    requestSelectorsList();
    editSelector(selector);
}
