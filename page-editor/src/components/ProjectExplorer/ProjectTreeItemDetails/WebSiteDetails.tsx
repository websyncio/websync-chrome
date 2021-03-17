import React, { useState } from 'react';
import { observer } from 'mobx-react';
import WebSite from 'entities/mst/WebSite';
import Input from 'components/Input/Input';
import './WebSiteDetails.sass';
import IIdeProxy from 'connections/IDE/IIdeConnection';
import { DependencyContainer, TYPES } from 'inversify.config';
import ISynchronizationService from 'services/ISynchronizationService';

interface Props {
    website: WebSite;
}

const WebSiteDetails: React.FC<Props> = observer(({ website }) => {
    const synchronizationService = DependencyContainer.get<ISynchronizationService>(TYPES.SynchronizationService);

    function onChangeUrl(newUrl: string) {
        synchronizationService.updateWebSiteUrl(website, newUrl);
    }

    return (
        <div className="details-wrap">
            <div className="website-hosturl">
                <label>Url:</label>
                <Input value={website.url} onChange={onChangeUrl} />
                {website.url === '' && <span> Warning! Enter website url</span>}
            </div>
        </div>
    );
});

export default WebSiteDetails;
