import React, { useState } from 'react';
import { observer } from 'mobx-react';
import WebSite from 'entities/mst/WebSite';
import Input from 'components/Input/Input';
import './WebSiteDetails.sass';

interface Props {
    website: WebSite;
}

const WebSiteDetails: React.FC<Props> = observer(({ website }) => {
    const [url, setUrl] = useState(website.url);

    const onChange = (val) => {
        setUrl(val);
    };

    return (
        <div className="details-wrap">
            <div className="website-hosturl">
                <label>Url:</label>
                <Input value={url} onClick={onChange} />
            </div>
        </div>
    );
});

export default WebSiteDetails;
