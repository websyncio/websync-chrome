import React from 'react';
import RootStoreType, { RootStoreModel } from 'mst/RootStore';

const createStore = (): RootStoreType => {
    return RootStoreModel.create();
};

// Store object. Can be used for services
export const RootStore: RootStoreType = createStore();

// Context. Can be used for class component
export const StoreContext = React.createContext<RootStoreType>(RootStore);

// Hook. Can be used for function components
export const useRootStore = () => React.useContext(StoreContext);
