import ComponentInstanceModel from 'entities/mst/ComponentInstance';

export default interface IIdeConnection {
    type: string;
    requestProjectData: (projectName: string) => void;
    updateComponentInstance: (component: ComponentInstanceModel) => void;
    // updateWebsiteUrl: (url: string) => void;
    // updatePageInstanceUrl: (url: string) => void;
}
