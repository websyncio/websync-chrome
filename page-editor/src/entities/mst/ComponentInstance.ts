import { types, Instance, getParentOfType, destroy } from 'mobx-state-tree';
import { getNamespace } from 'utils/TypeNameUtils';
import { AttributeModel } from './Attribute';
import ComponentsContainer from './ComponentsContainer';
import ProjectStore, { ProjectStoreModel } from 'entities/mst/ProjectStore';
import { ComponentType } from 'react';
import { WebSiteModel } from './WebSite';

export const ComponentInstanceModel = types
    .model({
        id: types.identifier,
        parentId: types.string,
        fieldIndex: types.number,
        // try to fix - https://mobx-state-tree.js.org/tips/circular-deps
        componentTypeId: types.maybeNull(types.string), // types.maybe(types.safeReference(types.late(() => ComponentTypeModel))),
        fieldName: types.string,
        name: types.maybeNull(types.string),
        initializationAttribute: types.maybeNull(AttributeModel),
    })
    // .volatile(()=>({
    //     isBlank: false
    // }))
    .views((self) => ({
        get componentType() {
            const projectStore = getParentOfType(self, ProjectStoreModel);
            return projectStore.componentTypes.find((t) => t.id === self.componentTypeId);
        },
        get typeName() {
            if (self.componentTypeId) {
                const arr = self.componentTypeId.split('.');
                return arr[arr.length - 1].trim();
            }
            return '';
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
            if (self.initializationAttribute == null || !self.initializationAttribute.parameters.length) {
                return '';
            }
            if (!self.initializationAttribute.parameters[0].values.length) {
                throw new Error(
                    `Initialization attribute '${self.initializationAttribute.name}' has no values for parameter '${self.initializationAttribute.parameters[0].name}'`,
                );
            }

            return self.initializationAttribute.parameters[0].values[0];
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
