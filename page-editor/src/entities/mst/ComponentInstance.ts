import { types, Instance, getParentOfType, destroy } from 'mobx-state-tree';
import { AttributeModel } from './Attribute';
import ProjectStore, { ProjectStoreModel } from 'entities/mst/ProjectStore';
import { SelectableModel } from './Selectable';
import { ComponentsContainerModel } from './ComponentsContainer';

export const ComponentInstanceModel = types
    .compose(
        SelectableModel,
        types.model({
            id: types.identifier,
            parentId: types.optional(types.string, ''),
            fieldIndex: types.optional(types.number, 0),
            // try to fix - https://mobx-state-tree.js.org/tips/circular-deps
            componentTypeId: types.maybeNull(types.string), // types.maybe(types.safeReference(types.late(() => ComponentTypeModel))),
            fieldName: types.string,
            name: types.maybeNull(types.string),
            initializationAttribute: types.maybeNull(AttributeModel),
        }),
    )
    // .volatile(()=>({
    //     isBlank: false
    // }))
    .views((self) => ({
        get typeName() {
            if (self.componentTypeId) {
                const arr = self.componentTypeId.split('.');
                return arr[arr.length - 1].trim();
            }
            return '';
        },
        get componentType() {
            const projectStore = getParentOfType(self, ProjectStoreModel);
            return projectStore.componentTypes.find((t) => t.id === self.componentTypeId);
        },
        get container() {
            return getParentOfType(self, ComponentsContainerModel);
        },
        // get componentFieldName() {
        //     // if (self.isBlank) {
        //     //     // this is a model from SelectorEditor
        //     //     return self.name;
        //     // }
        //     // this is a model from IDE
        //     const arr = self.id.split('.');
        //     return arr[arr.length - 1].trim();
        // },
        get rootXcss() {
            if (self.initializationAttribute == null || !self.initializationAttribute.constructorArguments.length) {
                return '';
            }
            return self.initializationAttribute.constructorArguments[0].toString();
        },
    }))
    .actions((self) => ({
        setComponentTypeId(newComponentTypeId) {
            // const matchingTypes = getParentOfType(self, ProjectStoreModel)
            //     .componentTypes.filter((t) => t.name === newComponentTypeName);

            // let typeNamespace = '';
            // if (self.componentTypeId) {
            //     typeNamespace = getNamespace(self.componentTypeId);
            // }
            // console.log('typeNamespace', typeNamespace);

            self.componentTypeId = newComponentTypeId;
        },
        setFieldName(newFieldName) {
            self.fieldName = newFieldName;
            // if (ideProxy) {
            //     ideProxy.updateComponentInstance(self);

            // have to update id by creating new object and replacing the old one with it
            // const lastDot = self.id.lastIndexOf('.');
            // const newId = self.id.substring(0, lastDot + 1) + newName;
            // const pageType = getParentOfType(self, PageTypeModel);
            // const updated = { ...getSnapshot(self), id: newId };
            // pageType.updateComponentInstance(self, updated);
            // }
        },
        updateInitializationParameter(parameterName, parameterValueIndex, parameterValue) {
            if (!self.initializationAttribute) {
                throw new Error('No initialization attribute to update for component. componentId: ' + self.id);
            }
            self.initializationAttribute.updateParameterValue(parameterName, parameterValueIndex, parameterValue);
        },
        delete() {
            destroy(self);
            // const pageType = getParentOfType(self, PageTypeModel);
            // pageType.deleteComponentInstance(self);
        },
        setParent(componentsContainer) {
            self.parentId = componentsContainer.id;
        },
    }));

export default interface ComponentInstance extends Instance<typeof ComponentInstanceModel> {}
