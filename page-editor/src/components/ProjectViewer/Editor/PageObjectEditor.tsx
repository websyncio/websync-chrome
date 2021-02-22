import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import IComponentsContainer from 'entities/mst/ComponentsContainer';
import ComponentInstancesList from './ComponentInstancesList';
import IIdeProxy from 'connections/IDE/IIdeProxy';
import ComponentsContainer from './ComponentsContainer';

interface Props {
    ideProxy: IIdeProxy;
    pageObject: IComponentsContainer;
}

const PageObjectEditor: React.FC<Props> = observer(({ ideProxy, pageObject }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    return (
        <div id="pageObjectEditor" className="flex-auto">
            <ComponentsContainer ideProxy={ideProxy} pageObject={pageObject} />
        </div>
    );
});

export default PageObjectEditor;
