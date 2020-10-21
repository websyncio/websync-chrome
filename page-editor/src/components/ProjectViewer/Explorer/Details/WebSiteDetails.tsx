import React from 'react';
import { observer } from 'mobx-react';
import WebSite from 'mst/WebSite';

interface Props {
    website: WebSite;
}

const WebSiteDetails: React.FC<Props> = observer(({ website }) => {
    return (
        <div className="details-wrap">
            <div className="website-hosturl">
                <label>Url:</label>
                <span>{website.url}</span>
            </div>
        </div>
    );
});

export default WebSiteDetails;
