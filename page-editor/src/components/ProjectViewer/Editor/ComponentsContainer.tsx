import IIdeProxy from 'interfaces/IIdeProxy';
import React from 'react';
import IComponentsContainer from 'mst/ComponentsContainer';
import { observer } from 'mobx-react';
import ComponentInstancesList from './ComponentInstancesList';
import ComponentInstance from './ComponentInstance';
import BlankComponentInstance from './BlankComponentInstance';
import RootStore from 'mst/RootStore';
import { useRootStore } from 'context';
import './ComponentsContainer.sass';

interface Props {
    ideProxy: IIdeProxy;
    pageObject: IComponentsContainer;
}

const ComponentsContainer: React.FC<Props> = observer(({ ideProxy, pageObject }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    return (
        <div className="components-container">
            <div className="container-name">{pageObject.name}</div>
            <ComponentInstancesList
                ideProxy={ideProxy}
                componentInstances={pageObject.componentsInstances}
                componentView={ComponentInstance}
            />
            <div className="blank-components">
                <div className="blank-components-header">
                    {/* <span className="title">New Components</span> */}
                    {/* &nbsp; */}
                    Specify type and name, then click Add button or press Ctrl+Enter
                </div>
                <ComponentInstancesList
                    ideProxy={ideProxy}
                    componentInstances={uiStore.blankComponents}
                    componentView={BlankComponentInstance}
                />
            </div>
        </div>
    );
});

export default ComponentsContainer;
