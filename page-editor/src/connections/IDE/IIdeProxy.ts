import ComponentInstanceModel from 'entities/mst/ComponentInstance';

export default interface IdeProxy {
    type: string;
    requestProjectData: (projectName: string) => void;
    updateComponentInstance: (component: ComponentInstanceModel) => void;
}
