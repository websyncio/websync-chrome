import { types, Instance, getSnapshot, getParent, hasParent, getParentOfType, cast, clone } from 'mobx-state-tree';
import { AttributeModel } from './Attribute';
import { ComponentTypeModel } from './ComponentType';
import { PageTypeModel } from './PageType';

export const ComponentInstanceModel = types
    .model({
        id: types.identifier,
        // try to fix - https://mobx-state-tree.js.org/tips/circular-deps
        componentType: types.string, //.maybe(types.reference(types.late(() => ComponentTypeModel))),
        name: types.string,
        initializationAttribute: types.optional(AttributeModel, {
            name: '',
        }),
    })
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
    }));

export default interface ComponentInstance extends Instance<typeof ComponentInstanceModel> {}
