import { types, Instance, getSnapshot, getParent, hasParent, getParentOfType, cast, clone } from 'mobx-state-tree';
import { AttributeModel } from './Attribute';
import { ComponentTypeModel } from './ComponentType';
import { PageTypeModel } from './PageType';
import IDEAConnection from 'services/IDE/IDEAConnection';
import { SelectableModel } from './Selectable';

export const ComponentInstanceModel = types.compose(
    SelectableModel,
    types
        .model({
            id: types.identifier,
            // try to fix - https://mobx-state-tree.js.org/tips/circular-deps
            componentType: types.string, //.maybe(types.reference(types.late(() => ComponentTypeModel))),
            name: types.string,
            initializationAttribute: types.optional(AttributeModel, {
                name: '',
            }),
        })
        .views((self) => ({
            get typeName() {
                const arr = self.componentType.split('.');
                return arr[arr.length - 1].trim();
            },
            get componentFieldName() {
                const arr = self.id.split('.');
                return arr[arr.length - 1].trim();
            },
            get rootSelector() {
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
            rename(newName, ideProxy) {
                self.name = newName;
                ideProxy.updateComponentInstance(self);

                // have to update id by creating new object and replacing the old one with it
                const lastDot = self.id.lastIndexOf('.');
                const newId = self.id.substring(0, lastDot + 1) + newName;
                const pageType = getParentOfType(self, PageTypeModel);
                const updated = { ...getSnapshot(self), id: newId };
                pageType.updateComponentInstance(self, updated);
            },
            updateInitializationParameter(parameterName, parameterValueIndex, parameterValue) {
                if (!self.initializationAttribute) {
                    throw new Error('No initialization attribute to update for component. componentId: ' + self.id);
                }
                self.initializationAttribute.updateParameterValue(parameterName, parameterValueIndex, parameterValue);
                IDEAConnection.instance().updateComponentInstance(self as ComponentInstance);
            },
            delete(ideProxy) {
                const pageType = getParentOfType(self, PageTypeModel);
                pageType.deleteComponentInstance(self);
            },
        })),
);

export default interface ComponentInstance extends Instance<typeof ComponentInstanceModel> {}
