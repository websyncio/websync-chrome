export default interface IEditorPopupAction {
    icon: string | null;
    name: string;
    execute: () => void;
}
