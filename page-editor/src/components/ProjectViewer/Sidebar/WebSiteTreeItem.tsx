import React, { useState } from 'react';
import { observer } from 'mobx-react';
import WebSite from 'mst/WebSite';
import PageList from 'components/ProjectViewer/Sidebar/PageList';
import 'styles/WebSitesTree.sass';

type Props = {
    webSite: WebSite;
};

const WebSiteTreeItem: React.FC<Props> = observer(({ webSite }) => {
    const [expanded, setExpanded] = useState(false);

    function expand() {
        setExpanded(!expanded);
    }

    return (
        <>
            <li key={webSite.id} className="web-site">
                <div className="expand-icon" onClick={expand} />
                <span className="name">{webSite.name}</span>
            </li>
            {expanded && <PageList pages={webSite.pageInstances} />}
        </>
    );
});

export default WebSiteTreeItem;
