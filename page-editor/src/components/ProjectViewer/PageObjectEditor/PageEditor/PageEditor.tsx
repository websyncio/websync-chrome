import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import IComponentsContainer from 'entities/mst/ComponentsContainer';
import ComponentsContainer from '../ComponentsContainer/ComponentsContainer';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import './PageEditor.sass';
import MatchUrlNotifications from 'components/ProjectViewer/MatchUrlNotifications/MatchUrlNotifications';
import PageInstance from 'entities/mst/PageInstance';
import { DependencyContainer } from 'inversify.config';
import ISynchronizationService from 'services/ISynchronizationService';
import TYPES from 'inversify.types';
import PageType from 'entities/mst/PageType';

interface Props {
    pageType: PageType;
}

const PageEditor: React.FC<Props> = observer(({ pageType }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    const [expandedContainerIndex, setExpandedContainerIndex] = useState(0);
    const synchronizationService = DependencyContainer.get<ISynchronizationService>(TYPES.SynchronizationService);

    useEffect(() => {
        synchronizationService.openFileForClass(pageType.id);
        return () => {
            // do we need to do something here?
            //console.log("PageEditor is dismounted for:", pageInstance.name);
        };
    }, []);

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
            {/* <MatchUrlNotifications currentPageInstance={pageType} /> */}
            {componentContainers(0, pageType)}
        </div>
    );
});

export default PageEditor;
