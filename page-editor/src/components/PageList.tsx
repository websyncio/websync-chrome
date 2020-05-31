import React, { Component } from 'react';
import PageType from '../models/PageType';
import { Dropdown } from 'semantic-ui-react';
import { StoreContext, useRootStore } from 'context';
import { observer } from 'mobx-react';
import RootStore from 'mst/RootStore';
import { values } from 'mobx';

// type PageListProps = {
//     pageTypes: Array<PageType>;
//     selected?: PageType;
//     onSelectedPageChanged: any;
// };

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
        const selectedPage = rootStore.projectStore.pageTypes.find((p) => p.id == data.value);
        rootStore.uiStore.setSelectedPage(selectedPage);
    }

    return (
        <Dropdown
            text={rootStore.uiStore.selectedPage?.name || ''}
            placeholder="Select Page"
            fluid
            search
            selection
            options={options}
            onChange={onPageChanged}
        />
    );
});
