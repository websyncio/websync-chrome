import React, { Component } from 'react';
import ComponentType from 'mst/ComponentType';
import { useRootStore } from 'context';
import RootStore from 'mst/RootStore';
import { observer } from 'mobx-react';
import './ComponentTypeSelector.sass';

interface Props {
    onSelected: Function;
}

const ComponentTypeSelector: React.FC<Props> = observer(({ onSelected }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();

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
