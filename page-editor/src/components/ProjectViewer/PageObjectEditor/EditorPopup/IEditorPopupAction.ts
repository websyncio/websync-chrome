export default interface IEditorPopupAction {
    iconLetter: string | undefined;
    iconBase64: string | undefined;
    iconColor: string | undefined;
    iconTitle: string | undefined;
    actionClass: string;
    name: string;
    execute: () => void;
}
