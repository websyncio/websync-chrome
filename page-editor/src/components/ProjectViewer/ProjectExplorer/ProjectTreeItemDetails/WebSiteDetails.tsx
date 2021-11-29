import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import WebSite from 'entities/mst/WebSite';
import Input from 'components/Input/Input';
import './WebSiteDetails.sass';
import { DependencyContainer, TYPES } from 'inversify.config';
import ISynchronizationService from 'services/ISynchronizationService';
import { useRootStore } from 'context';

interface Props {
    website: WebSite;
}

const WebSiteDetails: React.FC<Props> = observer(({ website }) => {
    const { projectStore, uiStore } = useRootStore();
    const synchronizationService = DependencyContainer.get<ISynchronizationService>(TYPES.SynchronizationService);

    function onChangeUrl(newUrl: string) {
        synchronizationService.updateWebSiteUrl(website, newUrl);
    }

    function urlWithoutParams() {
        const url = new URL(uiStore.currentUrl!);
        return url.origin + url.pathname;
    }

    function isWebSiteMatchCurrentUrl(): boolean {
        if (!website.url) {
            return false;
        }
        const currentUrl = urlWithoutParams();
        return currentUrl.startsWith(website.url);
    }

    return (
        <div className="details-wrap">
            <div className="website-name-wrap">
                <i className="website-icon ws-icon-small" />
                <span className="website-name">{website.name}</span>
                <span className={`match-circle ${isWebSiteMatchCurrentUrl() ? '' : 'no-match'}`} />
            </div>
            <div className="website-hosturl">
                <label>
                    Base URL
                    <i className="info-icon" title="Pattern that matches base URL of the tested website" />
                </label>
                <span className="current-url">({urlWithoutParams()})</span>
                <input type="text" value={website.url} />
                {/* <Input value={website.url} onChange={onChangeUrl} /> */}
                {website.url === '' && <span> Warning! Enter website url</span>}
            </div>
        </div>
    );
});

export default WebSiteDetails;
