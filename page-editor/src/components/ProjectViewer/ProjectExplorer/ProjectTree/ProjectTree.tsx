import React from 'react';
import { observer } from 'mobx-react';
import WebSite from 'entities/mst/WebSite';
import PageInstance from 'entities/mst/PageInstance';
import './ProjectTree.sass';
import RootStore from 'entities/mst/RootStore';
import { useRootStore } from 'context';
import TreeOutline from 'components-common/TreeOutline/TreeOutline';

interface Props {
    websites: WebSite[];
    selectedWebsite?: WebSite;
    onSelected: (webSite: WebSite, pageInstance: PageInstance | null) => void;
}

const WebSitesTree: React.FC<Props> = observer(({ websites, onSelected }) => {
    const { uiStore }: RootStore = useRootStore();

    function expand(website: WebSite) {
        website.toggleExpanded();
    }

    function editPageObject(pi: PageInstance) {
        uiStore.showTabForEditedPage(pi);
    }

    function pageList(website: WebSite) {
        return (
            <ul className="pages-list">
                {website.pageInstances.map((pi) => (
                    <li
                        className={`tree-item website-page selectable ${pi.selected ? 'selected' : ''}`}
                        key={pi.pageType.name}
                        onClick={() => onSelected(website, pi)}
                        onDoubleClick={() => editPageObject(pi)}
                        title="Double click to edit page"
                    >
                        <i className="tree-icon page-icon" />
                        <span className="tree-name">{pi.pageType.name}</span>
                        {uiStore.matchingPages.includes(pi) && <span className={`match-circle`} />}
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
                    className={`tree-item website selectable 
                        ${website.expanded ? 'expanded' : ''} 
                        ${website.selected ? 'selected' : ''} 
                        `}
                    onClick={() => onSelected(website, null)}
                >
                    <TreeOutline onClick={() => expand(website)} expanded={website.expanded} />
                    <i className="tree-icon website-icon" />
                    <span className="tree-name">{website.name}</span>
                    {uiStore.matchingWebsite === website && (
                        <span className={`match-circle ${uiStore.websiteIsMatchedManually ? 'manual' : ''}`} />
                    )}
                </li>
                {website.expanded && pageList(website)}
            </>
        );
    }

    return <ul id="webSitesTree">{websites.map((ws) => websiteItem(ws))}</ul>;
});

export default WebSitesTree;
