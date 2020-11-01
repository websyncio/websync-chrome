import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'mst/RootStore';
import ComponentsContainer from 'mst/ComponentsContainer';
import ComponentInstancesTree from './ComponentInstancesTree';
import IIdeProxy from 'interfaces/IIdeProxy';

interface Props {
    ideProxy: IIdeProxy;
    pageObject: ComponentsContainer;
}

const PageObjectEditor: React.FC<Props> = observer(({ ideProxy, pageObject }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    return (
        <div id="pageObjectEditor" className="flex-auto">
            <ComponentInstancesTree ideProxy={ideProxy} pageObject={pageObject} />
        </div>
    );
});

export default PageObjectEditor;
