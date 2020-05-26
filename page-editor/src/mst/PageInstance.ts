import { types, Instance } from 'mobx-state-tree';
import { PageTypeModel } from './PageType';
import { AttributeModel } from './Attribute';

export const PageInstanceModel = types.model({
    id: types.identifier,
    pageType: types.reference(PageTypeModel),
    name: types.string,
    initializationAttribute: types.optional(AttributeModel, {
        name: '',
    }),
});

export default interface PageInstance extends Instance<typeof PageInstanceModel> {}
