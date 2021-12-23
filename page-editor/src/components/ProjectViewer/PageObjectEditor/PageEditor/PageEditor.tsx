import React, { useState } from 'react';
import { observer } from 'mobx-react';
import IComponentsContainer from 'entities/mst/ComponentsContainer';
import ComponentsContainer from '../ComponentsContainer/ComponentsContainer';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import './PageEditor.sass';
import MatchUrlNotifications from 'components/ProjectViewer/MatchUrlNotifications/MatchUrlNotifications';
import PageInstance from 'entities/mst/PageInstance';

interface Props {
    pageInstance: PageInstance;
}

const PageEditor: React.FC<Props> = observer(({ pageInstance }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    const [expandedContainerIndex, setExpandedContainerIndex] = useState(0);

    function onExpand(containerIndex: number) {
        setExpandedContainerIndex(containerIndex);
    }

    function componentContainers(inheritanceLevel: number, container: any) {
        const baseType: IComponentsContainer = container.baseType;
        return (
            <>
                {baseType && componentContainers(inheritanceLevel + 1, baseType)}
                <ComponentsContainer
                    container={container}
                    baseContainer={baseType}
                    parentComponentInstance={null}
                    rootSelector={null}
                    isExpanded={inheritanceLevel === expandedContainerIndex}
                    onExpand={(expandParent) => {
                        onExpand(expandParent ? inheritanceLevel + 1 : inheritanceLevel);
                    }}
                />
            </>
        );
    }

    return (
        <div className="page-editor flex-auto">
            <MatchUrlNotifications currentPageInstance={pageInstance} />
            {componentContainers(0, pageInstance?.pageType)}
        </div>
    );
});

export default PageEditor;
