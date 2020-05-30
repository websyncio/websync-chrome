import React from 'react';
import RootStore, { RootStoreModel } from 'mst/RootStore';

export function createRootStore() {
    return RootStoreModel.create();
}

export const StoreContext = React.createContext<RootStore>(createRootStore());

export const useRootStore = () => React.useContext(StoreContext);
