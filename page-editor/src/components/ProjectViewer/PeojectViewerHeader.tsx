import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'mst/RootStore';

interface Props {}

const Header: React.FC<Props> = observer(() => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    return <div id="header"></div>;
});

export default Header;
