import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'mst/RootStore';

export default observer(() => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    return <div></div>;
});
