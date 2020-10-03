export default interface IdeProxy {
    type: string;
    requestProjectData: (projectName: string) => void;
}
