import ComponentType from 'entities/mst/ComponentType';
import IEditorPopupAction from '../EditorPopup/IEditorPopupAction';

export class ProposedComponentTypeAction implements IEditorPopupAction {
    icon: string | null = null;
    name: string;
    componentType: ComponentType;
    applyComponentType: (ct: ComponentType) => void;
    constructor(componentType: ComponentType, applyComponentType: (ct: ComponentType) => void) {
        this.componentType = componentType;
        this.name = componentType.name;
        this.applyComponentType = applyComponentType;
    }
    execute() {
        this.applyComponentType(this.componentType);
    }
}
