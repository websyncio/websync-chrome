import React, { useContext, useState } from 'react';
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
    const [matchStatusText, setMatchStatusText] = useState('');
    const URL_DOES_NOT_MATCH = 'Base URL does not match current URL';

    function urlWithoutParams() {
        const url = new URL(uiStore.currentUrl!);
        return url.origin + url.pathname;
    }

    function isWebSiteMatchCurrentUrl(url: string): boolean {
        if (!url) {
            return false;
        }
        const currentUrl = urlWithoutParams();
        return currentUrl.startsWith(url);
    }

    function onChangeUrl(newUrl: string) {
        if (isWebSiteMatchCurrentUrl(newUrl)) {
            synchronizationService.updateWebSiteUrl(website, newUrl);
            setMatchStatusText('');
        } else {
            setMatchStatusText(URL_DOES_NOT_MATCH);
        }
    }

    return (
        <div className={`details-wrap ${uiStore.matchingWebsite === website ? 'match' : ''}`}>
            <div className="website-name-wrap">
                <i className="website-icon ws-icon-small" />
                <span className="website-name">{website.name}</span>
                <span className={`match-circle`} />
            </div>
            <div className="website-baseurl">
                <label>
                    Base URL
                    <i className="info-icon" title="Pattern that matches base URL of the tested website" />
                </label>
                <span className="current-url">({urlWithoutParams()})</span>
                <Input value={website.url} onChange={onChangeUrl} disabled={uiStore.matchingWebsite !== website} />
                <div className="match-status-text">{matchStatusText}</div>
            </div>
        </div>
    );
});

export default WebSiteDetails;
