import React from 'react';
import { observer } from 'mobx-react';
import WebSite from 'entities/mst/WebSite';
import './WebSitesTree.sass';
import TreeOutline from 'components-common/TreeOutline/TreeOutline';

type Props = {
    website: WebSite;
    onSelected: (item: any) => void;
};

const WebSiteTreeItem: React.FC<Props> = observer(({ website, onSelected }) => {
    function expand() {
        website.toggleExpanded();
    }

    function pageList(pages) {
        return (
            <ul className="pages-list">
                {pages.map((p) => (
                    <li className="website-page" key={p.pageType.name} onClick={() => onSelected(p)}>
                        {p.pageType.name}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <>
            <li
                key={website.id}
                className={`website ${website.expanded ? 'expanded' : ''} ${website.selected ? 'selected' : ''}`}
            >
                <div className="expand-icon" onClick={expand} />
                <TreeOutline expanded={website.expanded} />
                <span className="name" onClick={() => onSelected(website)}>
                    {website.name}
                </span>
            </li>
            {website.expanded && pageList(website.pageInstances)}
        </>
    );
});

export default WebSiteTreeItem;
