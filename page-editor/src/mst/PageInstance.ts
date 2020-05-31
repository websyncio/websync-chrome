import { types, Instance } from 'mobx-state-tree';
import { PageTypeModel } from './PageType';

export const PageInstanceModel = types.model({
    id: types.identifier,
    pageType: types.reference(PageTypeModel),
    name: types.string,
    url: types.optional(types.string, ''),
});

export default interface PageInstance extends Instance<typeof PageInstanceModel> {}
