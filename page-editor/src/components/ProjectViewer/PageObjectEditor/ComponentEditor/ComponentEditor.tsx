import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import IComponentsContainer from 'entities/mst/ComponentsContainer';
import ComponentsContainer from '../ComponentsContainer/ComponentsContainer';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import ComponentInstance from 'entities/mst/ComponentInstance';
import XcssSelector from 'entities/XcssSelector';
import IAttributeToXcssMapper from 'services/IAttributeToXcssMapper';
import { DependencyContainer } from 'inversify.config';
import { SelectorsBagService } from 'services/SelectorsBagService';
import ISynchronizationService from 'services/ISynchronizationService';
import TYPES from 'inversify.types';

interface Props {
    componentInstance: ComponentInstance;
}

const ComponentEditor: React.FC<Props> = observer(({ componentInstance }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    const [expandedContainerIndex, setExpandedContainerIndex] = useState(0);
    const attributeToXcssMapper: IAttributeToXcssMapper = DependencyContainer.get<IAttributeToXcssMapper>(
        TYPES.AttributeToXcssMapper,
    );
    const selectorsBagService = DependencyContainer.get<SelectorsBagService>(TYPES.SelectorsBagService);
    const synchronizationService = DependencyContainer.get<ISynchronizationService>(TYPES.SynchronizationService);

    function calculateRootSelector() {
        const index = uiStore.editedComponentsChain.indexOf(componentInstance);
        const rootComponents: ComponentInstance[] = uiStore.editedComponentsChain.slice(0, index + 1);
        let rootSelector: XcssSelector | null = null;
        rootComponents.forEach((c: ComponentInstance) => {
            const xcss: XcssSelector | null = attributeToXcssMapper.GetXcss(c.initializationAttribute);
            if (xcss) {
                xcss.root = rootSelector;
                rootSelector = xcss;
            }
        });
        return rootSelector;
    }

    const rootSelector: XcssSelector | null = useMemo(() => calculateRootSelector(), [componentInstance]);

    useEffect(() => {
        synchronizationService.openFileForClass(componentInstance.componentType.id);
        if (rootSelector) {
            selectorsBagService.setRootComponent({
                rootSelector: rootSelector,
            });
            return () => {
                selectorsBagService.removeRootComponent();
            };
        }
    }, []);

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
                    rootSelector={rootSelector}
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
