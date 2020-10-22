import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'mst/RootStore';
import ComponentsContainer from 'mst/ComponentsContainer';
import './Header.sass';

interface Props {}

const Header: React.FC<Props> = observer(() => {
    const rootStore: RootStore = useRootStore();

    function goBackToProjectSelector() {
        rootStore.clearProject();
    }

    function editedPageObjects() {
        return rootStore.uiStore.editedPageObjects.map((po: ComponentsContainer) => (
            <div key={po.id} className="header-tab">
                {po.name}
            </div>
        ));
    }

    return (
        <div id="header">
            <svg
                onClick={goBackToProjectSelector}
                className="go-back-icon"
                width="24"
                height="24"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <title>Go back to project selection</title>
                <path fill="#5a5a5a" d="M6,6V3L0,8l6,5v-3c4-1,7-0.5,10,2C14,7,10.5,6,6,6z" />
            </svg>
            <div className="header-tab">Project Explorer (jdi-x.x.x)</div>
            {editedPageObjects()}
        </div>
    );
});

export default Header;
