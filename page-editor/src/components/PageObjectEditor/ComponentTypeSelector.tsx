import React from 'react';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import { observer } from 'mobx-react';
import './ComponentTypeSelector.sass';

interface Props {
    onSelected: Function;
}

const ComponentTypeSelector: React.FC<Props> = observer(() => {
    const { projectStore }: RootStore = useRootStore();

    function customComponentTypes() {
        return projectStore.customComponentTypes.map((item) => {
            return (
                <li value={item.id} key={item.id}>
                    {item.name}
                </li>
            );
        });
    }

    function frameworkComponentTypes() {
        return projectStore.frameworkComponentTypes.map((item) => {
            return (
                <li value={item.id} key={item.id}>
                    {item.name}
                </li>
            );
        });
    }

    return (
        <div>
            <ul className="framework-types">{frameworkComponentTypes()}</ul>
            <ul className="custom-types">{customComponentTypes()}</ul>
        </div>
    );
});

export default ComponentTypeSelector;
