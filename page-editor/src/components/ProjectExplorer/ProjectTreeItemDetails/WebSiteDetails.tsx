import React, { useState } from 'react';
import { observer } from 'mobx-react';
import WebSite from 'entities/mst/WebSite';
import Input from 'components/Input/Input';
import './WebSiteDetails.sass';
import IIdeProxy from 'connections/IDE/IIdeConnection';

interface Props {
    website: WebSite;
    ideProxy: IIdeProxy;
}

const WebSiteDetails: React.FC<Props> = observer(({ website, ideProxy }) => {
    const [url, setUrl] = useState(website.url);

    const submitWebsiteRename = (val) => {
        setUrl(val);
        website.updateWebsite(val, ideProxy);
    };

    return (
        <div className="details-wrap">
            <div className="website-hosturl">
                <label>Url:</label>
                <Input value={url} onChange={submitWebsiteRename} />
                {url === '' && <span> Warning! Enter website url</span>}
            </div>
        </div>
    );
});

export default WebSiteDetails;
