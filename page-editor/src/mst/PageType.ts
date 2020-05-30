import { types, Instance } from 'mobx-state-tree';
import { ComponentInstanceModel } from './ComponentInstance';

export const PageTypeModel = types.model({
    id: types.identifier,
    // basePageType: types.maybe(types.reference(types.late(() => PageTypeModel))),
    url: types.string,
    componentsInstances: types.map(ComponentInstanceModel),
});

export default interface PageType extends Instance<typeof PageTypeModel> {}
