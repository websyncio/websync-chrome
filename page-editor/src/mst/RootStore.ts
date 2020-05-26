import { types, Instance } from 'mobx-state-tree';
import { DomainStoreModel } from './DomainStore';
import { UiStoreModel } from './UiStore';

export const RootStoreModel = types.model({
    DomainStore: types.optional(DomainStoreModel, {}),
    UiStore: types.optional(UiStoreModel, {}),
});

export default interface RootStore extends Instance<typeof RootStoreModel> {}
