import React, { useState } from 'react';
import { observer } from 'mobx-react';
import IComponentsContainer from 'entities/mst/ComponentsContainer';
import ComponentsContainer from '../ComponentsContainer/ComponentsContainer';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import ComponentInstance from 'entities/mst/ComponentInstance';

interface Props {
    componentInstance: ComponentInstance;
}

const ComponentEditor: React.FC<Props> = observer(({ componentInstance }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    const [expandedContainerIndex, setExpandedContainerIndex] = useState(0);

    function onExpand(containerIndex: number) {
        setExpandedContainerIndex(containerIndex);
    }

    // function getComponentType(componentTypeId) {
    //     return projectStore.componentTypes.find((t) => t.id === componentTypeId);
    // }

    function componentContainers(inheritanceLevel: number, container: any) {
        const baseType: IComponentsContainer = container.baseType;
        return (
            <>
                {/* <MatchUrlNotifications currentPageInstance={componentInstance}/> */}
                {baseType && componentContainers(inheritanceLevel + 1, baseType)}
                <ComponentsContainer
                    container={container}
                    baseContainer={baseType}
                    parentComponentInstance={componentInstance}
                    isExpanded={inheritanceLevel === expandedContainerIndex}
                    onExpand={(expandParent) => {
                        onExpand(expandParent ? inheritanceLevel + 1 : inheritanceLevel);
                    }}
                />
            </>
        );
    }

    return <div className="component-editor flex-auto">{componentContainers(0, componentInstance.componentType)}</div>;
});

export default ComponentEditor;
