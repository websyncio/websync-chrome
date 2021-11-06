import React from 'react';
// import { useRootStore } from 'context';
import { observer } from 'mobx-react';
// import RootStore from 'mst/RootStore';
import PageInstance from 'entities/mst/PageInstance';

interface Props {
    pages: PageInstance[];
    onPageInstanceSelected: (pageInstance: PageInstance) => void;
}

const PageList: React.FC<Props> = observer(({ pages, onPageInstanceSelected }) => {
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
                <li className="website-page" key={p.pageType.name} onClick={() => onPageInstanceSelected(p)}>
                    {p.pageType.name}
                </li>
            ))}
        </ul>
    );
});

export default PageList;
