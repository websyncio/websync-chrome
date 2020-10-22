import { types, Instance } from 'mobx-state-tree';
import { ComponentsContainerModel } from './ComponentsContainer';

export const PageTypeModel = types.compose(
    ComponentsContainerModel,
    types.model({
        url: types.maybeNull(types.string),
    }),
);

export default interface PageType extends Instance<typeof PageTypeModel> {}
