import React from 'react';
import { observer } from 'mobx-react';
import WebSite from 'mst/WebSite';
import WebSitesTreeItem from './WebSiteTreeItem';
import 'styles/WebSitesTree.sass';

interface Props {
    websites: WebSite[];
    selectedWebsite?: WebSite;
}

const WebSitesTree: React.FC<Props> = observer(({ websites }) => {
    return (
        <ul id="webSitesTree">
            {websites.map((ws) => (
                <WebSitesTreeItem key={ws.id} webSite={ws} />
            ))}
        </ul>
    );
});

export default WebSitesTree;
