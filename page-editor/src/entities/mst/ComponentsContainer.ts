import { types, Instance } from 'mobx-state-tree';
import ComponentInstance, { ComponentInstanceModel } from './ComponentInstance';
import { SelectableModel } from './Selectable';

export const ComponentsContainerModel = types
    .compose(
        SelectableModel,
        types.model({
            id: types.identifier,
            componentInstances: types.array(ComponentInstanceModel),
        }),
    )
    .views((self) => ({
        get name() {
            const arr = self.id.split('.');
            return arr[arr.length - 1];
        },
        getComponentInstance(componentId) {
            return self.componentInstances.find((ci) => ci.id == componentId);
        },
    }))
    .actions((self) => ({
        addComponentInstance(component: ComponentInstance) {
            self.componentInstances.push(component);
        },
    }));

export default interface ComponentsContainer extends Instance<typeof ComponentsContainerModel> {}
