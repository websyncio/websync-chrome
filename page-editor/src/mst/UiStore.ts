import { types, Instance } from 'mobx-state-tree';
import PageType, { PageTypeModel } from './PageType';

export const UiStoreModel = types
    .model({
        selectedPageType: types.safeReference(PageTypeModel),
    })
    .actions((self) => ({
        setSelectedPageType(pageType: PageType | undefined) {
            self.selectedPageType = pageType;
        },
    }));

export default interface UiStore extends Instance<typeof UiStoreModel> {}
