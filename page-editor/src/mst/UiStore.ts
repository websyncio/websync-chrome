import { types, Instance } from 'mobx-state-tree';
import PageType, { PageTypeModel } from './PageType';

export const UiStoreModel = types
    .model({
        selectedPage: types.safeReference(PageTypeModel),
    })
    .actions((self) => ({
        setSelectedPage(page: PageType | undefined) {
            self.selectedPage = page;
        },
    }));

export default interface UiStore extends Instance<typeof UiStoreModel> {}
