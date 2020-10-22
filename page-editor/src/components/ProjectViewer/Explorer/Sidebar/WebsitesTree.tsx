import React from 'react';
import { observer } from 'mobx-react';
import WebSite from 'mst/WebSite';
import PageInstance from 'mst/PageInstance';
import './WebSitesTree.sass';
import RootStore from 'mst/RootStore';
import { useRootStore } from 'context';

interface Props {
    websites: WebSite[];
    selectedWebsite?: WebSite;
    onSelected: (webSite: WebSite, pageInstance: PageInstance | undefined) => void;
}

const WebSitesTree: React.FC<Props> = observer(({ websites, onSelected }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();

    function expand(website: WebSite) {
        website.toggleExpanded();
    }

    function editPageObject(po) {
        uiStore.addEditedPageObject(po);
    }

    function pageList(website: WebSite) {
        return (
            <ul className="pages-list">
                {website.pageInstances.map((p) => (
                    <li
                        className={`website-page selectable ${p.selected ? 'selected' : ''}`}
                        key={p.pageType.name}
                        onClick={() => onSelected(website, p)}
                        onDoubleClick={() => editPageObject(p.pageType)}
                    >
                        {p.pageType.name}
                    </li>
                ))}
            </ul>
        );
    }

    function websiteItem(website: WebSite) {
        return (
            <>
                <li
                    key={website.id}
                    className={`website selectable ${website.expanded ? 'expanded' : ''} ${
                        website.selected ? 'selected' : ''
                    }`}
                    onClick={() => onSelected(website, undefined)}
                >
                    <div className="expand-icon" onClick={() => expand(website)} />
                    <span className="name">{website.name}</span>
                </li>
                {website.expanded && pageList(website)}
            </>
        );
    }

    return <ul id="webSitesTree">{websites.map((ws) => websiteItem(ws))}</ul>;
});

export default WebSitesTree;
