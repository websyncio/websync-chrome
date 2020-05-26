import { types, Instance } from 'mobx-state-tree';

export const UiStoreModel = types.model({});

export default interface UiStore extends Instance<typeof UiStoreModel> {}
