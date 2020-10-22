import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import RootStore from 'mst/RootStore';
import ComponentsContainer from 'mst/ComponentsContainer';

interface Props {
    pageObject: ComponentsContainer;
}

const PageObjectEditor: React.FC<Props> = observer(({ pageObject }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    return (
        <div id="pageObjectEditor" className="flex-auto">
            {pageObject.id}
        </div>
    );
});

export default PageObjectEditor;
