import IIdeProxy from 'interfaces/IIdeProxy';

export default class VSConnection implements IIdeProxy {
    type = 'VisualStudio';
    requestProjectData(projectName: string) {
        throw new Error('Not implented');
    }
}
