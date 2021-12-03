import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react';
import WebSite from 'entities/mst/WebSite';
import Input from 'components-common/Input/Input';
import './TreeItemDetails.sass';
import { DependencyContainer, TYPES } from 'inversify.config';
import ISynchronizationService from 'services/ISynchronizationService';
import { useRootStore } from 'context';
import IUrlMatcher from 'services/IUrlMatcher';
import IUrlSynchronizationService from 'services/IUrlSynchronizationService';

interface Props {
    website: WebSite;
}

const WebSiteDetails: React.FC<Props> = observer(({ website }) => {
    const { projectStore, uiStore } = useRootStore();
    const synchronizationService = DependencyContainer.get<ISynchronizationService>(TYPES.SynchronizationService);
    const urlMatchService = DependencyContainer.get<IUrlMatcher>(TYPES.UrlMatcher);
    const urlSynchroService = DependencyContainer.get<IUrlSynchronizationService>(TYPES.UrlSynchronizationService);
    const [matchStatusText, setMatchStatusText] = useState('');
    const websiteMatch: boolean = uiStore.matchingWebsite === website;
    const URL_DOES_NOT_MATCH = 'Base URL does not match current URL';
    const URL_IS_EMPTY = 'Please, specify Base URL';

    function urlWithoutParams() {
        const url = new URL(uiStore.currentUrl!);
        return url.origin + url.pathname;
    }

    function onChangeUrl(newUrl: string) {
        if (!newUrl) {
            setMatchStatusText(URL_IS_EMPTY);
        } else {
            const newMatchingWebsite = urlMatchService.matchWebsite(projectStore, newUrl);
            if (newMatchingWebsite === website) {
                synchronizationService.updateWebSiteUrl(website, newUrl);
                setMatchStatusText('');
            } else {
                setMatchStatusText(URL_DOES_NOT_MATCH);
            }
        }
    }

    function redirectToWebsiteUrl() {
        urlSynchroService.redirectToUrl(website.url);
    }

    return (
        <div className={`details-wrap ${uiStore.matchingWebsite === website ? 'match' : ''}`}>
            <div className="item-name-wrap">
                <i className="website-icon ws-icon-small" />
                <span className="item-name">{website.name}</span>
                <span className={`match-circle`} />
                {!websiteMatch && (
                    <span className="action-button" onClick={redirectToWebsiteUrl}>
                        Redirect to this website
                    </span>
                )}
            </div>
            <div className="field-wrap">
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
