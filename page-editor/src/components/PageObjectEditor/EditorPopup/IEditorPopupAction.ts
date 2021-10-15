export default interface IEditorPopupAction {
    iconLetter: string | undefined;
    iconColor: string | undefined;
    iconTitle: string | undefined;
    name: string;
    execute: () => void;
}
