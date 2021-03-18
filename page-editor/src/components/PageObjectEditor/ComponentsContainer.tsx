import IIdeProxy from 'connections/IDE/IIdeConnection';
import React from 'react';
import IComponentsContainer from 'entities/mst/ComponentsContainer';
import IComponentInstance from 'entities/mst/ComponentInstance';
import { observer } from 'mobx-react';
import ComponentInstancesList from './ComponentInstancesList';
import ComponentInstance from './ComponentInstance';
import BlankComponentInstance from './BlankComponentInstance';
import RootStore from 'entities/mst/RootStore';
import { useRootStore } from 'context';
import './ComponentsContainer.sass';

interface Props {
    ideProxy: IIdeProxy;
    pageObject: IComponentsContainer;
}

const ComponentsContainer: React.FC<Props> = observer(({ pageObject }) => {
    const { uiStore }: RootStore = useRootStore();

    function selectComponent(components: IComponentInstance[], index: number) {
        components.forEach((c, i) => {
            if (i == index) {
                c.select();
            } else {
                c.deselect();
            }
        });
    }

    selectComponent(pageObject.componentsInstances, 0);
    selectComponent(uiStore.blankComponents, -1);

    function selectFirstBlankComponent(): boolean {
        selectComponent(pageObject.componentsInstances, -1);
        selectComponent(uiStore.blankComponents, 0);
        return true;
    }

    function selectLastComponentInstance(): boolean {
        selectComponent(pageObject.componentsInstances, pageObject.componentsInstances.length - 1);
        selectComponent(uiStore.blankComponents, -1);
        return true;
    }

    return (
        <div className="components-container">
            <div className="container-name">{pageObject.name}</div>
            <ComponentInstancesList
                componentInstances={pageObject.componentsInstances}
                componentView={ComponentInstance}
                onSelectNext={selectFirstBlankComponent}
            />
            <div className="blank-components">
                <div className="blank-components-header">
                    {/* <span className="title">New Components</span> */}
                    {/* &nbsp; */}
                    Specify type and name, then click Take button or press Ctrl+Enter
                </div>
                <ComponentInstancesList
                    componentInstances={uiStore.blankComponents}
                    componentView={BlankComponentInstance}
                    onSelectPrevious={selectLastComponentInstance}
                />
            </div>
        </div>
    );
});

export default ComponentsContainer;
