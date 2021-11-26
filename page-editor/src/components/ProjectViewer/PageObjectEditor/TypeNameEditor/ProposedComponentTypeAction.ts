import ComponentType from 'entities/mst/ComponentType';
import IEditorPopupAction from '../EditorPopup/IEditorPopupAction';

const FRAMEWORK_LETTER = 'F';
const CUSTOM_LETTER = 'C';
const FRAMEWORK_COLOR = 'rgb(158, 208, 139)';
const CUSTOM_COLOR = 'rgb(117, 198, 235)';
const FRAMEWORK_TITLE = 'This component is part of the framework';
const CUSTOM_TITLE = 'This is a custom component';

export class ProposedComponentTypeAction implements IEditorPopupAction {
    iconLetter: string | undefined = undefined;
    iconColor: string | undefined = undefined;
    iconTitle: string | undefined = undefined;
    iconBase64: string | undefined;
    name: string;
    actionClass = 'use-proposed-component';
    componentType: ComponentType;
    applyComponentType: (ct: ComponentType) => void;
    constructor(componentType: ComponentType, applyComponentType: (ct: ComponentType) => void) {
        this.componentType = componentType;
        if (this.componentType.isCustom) {
            this.iconColor = CUSTOM_COLOR;
            this.iconLetter = CUSTOM_LETTER;
            this.iconTitle = CUSTOM_TITLE;
        } else {
            this.iconColor = FRAMEWORK_COLOR;
            this.iconLetter = FRAMEWORK_LETTER;
            this.iconTitle = FRAMEWORK_TITLE;
        }
        this.name = componentType.name;
        this.applyComponentType = applyComponentType;
    }
    execute() {
        this.applyComponentType(this.componentType);
    }
}
