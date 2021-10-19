import ComponentsContainer from 'entities/mst/ComponentsContainer';
import ComponentType, { ComponentTypeModel } from 'entities/mst/ComponentType';
import { DependencyContainer, TYPES } from 'inversify.config';
import ISynchronizationService from 'services/ISynchronizationService';
import IEditorPopupAction from '../EditorPopup/IEditorPopupAction';

export default class CreateComponentTypeAction implements IEditorPopupAction {
    iconLetter: string | undefined;
    iconColor: string | undefined;
    iconTitle: string | undefined;
    iconBase64: string | undefined =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAB4ElEQVQ4jY2Qv2sTYRjHP+/d5UeTtCVVqIiUaBTsj+DPQexUcHBzqnTopuJkqX9A585WOkhnQao4uDiITiW4BIUi1jYaC2na9Jo7kzSXXnOX1yEV4/UOfOAZ3g+f58vzvAKfWl6eDA+p4fuxePwagNVo5LS9taXrD3Mtryu8IPtq6kpyYHDp3PDY1XAkKgDsg6YsfPuSM/TSg/G7Lz8HBrx7dqs/NXJp5fzo5TG/zdZXP62u5fPjd+69qf9hSrdw4vTQ3NmLGd9hgPRIJnPm5MBcN9O6H7FE76iqqiA0iAwD7tGSCthfUVWI9/ZlAgOEEOHOXnFwDXDKR9YgKDFwawhFCXfP/HOCbVk7ALhVUBIgQp1WEuDWOk6zWQoM2G/UFivlbRMARwfR02lHB6BSLplWdX8xMODm5Its8cfGBykl3pJSslXIv78x9fxjYACAaRZntwr5gpeXfm5sGkblsZcfC5iYfls09d2slxu7+srE9Ouil2teAPB9M5007Ghb0WICoO1Y0txJJ/3cYxsA6Eaq2mj2KZH4KVHebgldDym6kar+d0Bbhvba7b8fKaVEoOp+ru8JAne+Wvl126rXLwA4LXf98NCZ93cDauHRQsTu6Z+VUsroQe3JzNMZ28/7DXfktz6AoGZHAAAAAElFTkSuQmCC';
    name: string;
    typeName: string;
    parentPageObject: ComponentsContainer;
    synchronizationService: ISynchronizationService;
    onExecuted: () => void;

    constructor(typeName: string, parentPageObject: ComponentsContainer, onExecuted) {
        this.name = `Create component type '${typeName}'`;
        this.typeName = typeName;
        this.parentPageObject = parentPageObject;
        this.onExecuted = onExecuted;
        this.synchronizationService = DependencyContainer.get<ISynchronizationService>(TYPES.SynchronizationService);
    }

    execute() {
        this.synchronizationService.createComponentType(this.typeName, this.parentPageObject, null);
        this.onExecuted();
    }
}
