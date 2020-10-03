import React from 'react';
// import { useRootStore } from 'context';
import { observer } from 'mobx-react';
// import RootStore from 'mst/RootStore';
import PageInstance from 'mst/PageInstance';

interface Props {
    pages: PageInstance[];
}

const PageList: React.FC<Props> = observer(({ pages }) => {
    // const rootStore: RootStore = useRootStore();

    // const options = rootStore.projectStore?.pageTypes.map((item) => {
    //     return {
    //         key: item.id,
    //         value: item.id,
    //         text: item.name,
    //     };
    // });

    // function onPageChanged(e, data) {
    //     console.log('page changed', data);
    //     const selectedPageType = rootStore.projectStore?.pageTypes.find((p) => p.id == data.value);
    //     rootStore.uiStore.setSelectedPageType(selectedPageType);
    // }

    return (
        <ul className="pages-list">
            {pages.map((p) => (
                <li key={p.pageType.name}>{p.pageType.name}</li>
            ))}
        </ul>
    );
});

export default PageList;
