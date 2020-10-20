import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'mst/RootStore';
import './Header.sass';

interface Props {}

const Header: React.FC<Props> = observer(() => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    return (
        <div id="header">
            <svg
                className="go-back-icon"
                width="24"
                height="24"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path fill="#5a5a5a" d="M6,6V3L0,8l6,5v-3c4-1,7-0.5,10,2C14,7,10.5,6,6,6z" />
            </svg>
            <div className="header-tab">Project Explorer (jdi-x.x.x)</div>
        </div>
    );
});

export default Header;
