import React, { useState } from 'react';
import { observer } from 'mobx-react';
import IComponentsContainer from 'entities/mst/ComponentsContainer';
import ComponentsContainer from '../ComponentsContainer/ComponentsContainer';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import ComponentInstance from 'entities/mst/ComponentInstance';
import ComponentType from 'entities/mst/ComponentType';

interface Props {
    componentType?: ComponentType;
    componentInstance: ComponentInstance;
}

const ComponentEditor: React.FC<Props> = observer(({ componentType, componentInstance }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    const [expandedContainerIndex, setExpandedContainerIndex] = useState(0);

    function onExpand(containerIndex: number) {
        setExpandedContainerIndex(containerIndex);
    }

    function getComponentType(componentTypeId) {
        return projectStore.componentTypes.find((t) => t.id === componentTypeId);
    }

    function componentContainers(inheritanceLevel: number, pageObject: any) {
        const baseType: IComponentsContainer = pageObject.baseType;
        return (
            <>
                {/* <MatchUrlNotifications currentPageInstance={componentInstance}/> */}
                {baseType && componentContainers(inheritanceLevel + 1, pageObject.baseType)}
                <ComponentsContainer
                    pageObject={pageObject}
                    basePageObject={baseType}
                    isExpanded={inheritanceLevel === expandedContainerIndex}
                    onExpand={(expandParent) => {
                        onExpand(expandParent ? inheritanceLevel + 1 : inheritanceLevel);
                    }}
                />
            </>
        );
    }

    return (
        <div className="component-editor flex-auto">
            {componentContainers(0, getComponentType(componentInstance.componentTypeId))}
        </div>
    );
});

export default ComponentEditor;
