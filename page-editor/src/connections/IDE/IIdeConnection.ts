import ComponentInstanceModel from 'entities/mst/ComponentInstance';

export default interface IIdeConnection {
    type: string;
    requestProjectData: (projectName: string) => void;
    updateComponentInstance: (component: ComponentInstanceModel) => void;
}
