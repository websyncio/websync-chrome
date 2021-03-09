import { types, Instance } from 'mobx-state-tree';
import { PageTypeModel } from './PageType';
import { SelectableModel } from './Selectable';

export const PageInstanceModel = types
    .compose(
        SelectableModel,
        types.model({
            id: types.identifier,
            pageType: types.reference(PageTypeModel),
            name: types.string,
            url: types.optional(types.string, ''),
        }),
    )
    .actions(() => ({
        updatePageInstanceUrl(newUrl, ideProxy) {
            ideProxy.updatePageInstanceUrl(newUrl);
        },
    }));

export default interface PageInstance extends Instance<typeof PageInstanceModel> {}
