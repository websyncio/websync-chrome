import React, { Component } from 'react';
import PageType from '../models/PageType';
import { Dropdown } from 'semantic-ui-react';
import { StoreContext, useRootStore } from 'context';
import { observer } from 'mobx-react';
import RootStore from 'mst/RootStore';

export default observer(() => {
    const rootStore: RootStore = useRootStore();

    const options = rootStore.projectStore.pageTypes.map((item) => {
        return {
            key: item.id,
            value: item.id,
            text: item.name,
        };
    });

    function onPageChanged(e, data) {
        console.log('page changed', data);
        const selectedPageType = rootStore.projectStore.pageTypes.find((p) => p.id == data.value);
        rootStore.uiStore.setSelectedPageType(selectedPageType);
    }

    return (
        <Dropdown
            text={rootStore.uiStore.selectedPageType?.name || ''}
            placeholder="Select Page"
            fluid
            search
            selection
            options={options}
            onChange={onPageChanged}
        />
    );
});
