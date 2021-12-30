import React, { useContext, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import WebSite from 'entities/mst/WebSite';
import Input from 'components-common/Input/Input';
import './TreeItemDetails.sass';
import { DependencyContainer, TYPES } from 'inversify.config';
import ISynchronizationService from 'services/ISynchronizationService';
import { useRootStore } from 'context';
import IUrlSynchronizationService from 'services/IUrlSynchronizationService';

interface Props {
    website: WebSite;
}

const WebSiteDetails: React.FC<Props> = observer(({ website }) => {
    const { projectStore, uiStore } = useRootStore();
    const synchronizationService = DependencyContainer.get<ISynchronizationService>(TYPES.SynchronizationService);
    const urlSynchroService = DependencyContainer.get<IUrlSynchronizationService>(TYPES.UrlSynchronizationService);
    const websiteMatch: boolean = uiStore.matchingWebsite === website;
    const URL_DOES_NOT_MATCH = 'Base URL does not match current URL';
    const URL_IS_EMPTY = 'Please, specify Base URL';
    const originalUrl = useMemo(() => website.url, [website]);

    let matchStatusText = '';
    if (!website.url) {
        matchStatusText = URL_IS_EMPTY;
    } else if (website.url !== originalUrl && (!websiteMatch || uiStore.websiteIsMatchedManually)) {
        matchStatusText = URL_DOES_NOT_MATCH;
    }

    function urlWithoutParams() {
        const url = new URL(uiStore.currentUrl!);
        return url.origin + url.pathname;
    }

    function onChangeUrl(newUrl: string) {
        synchronizationService.updateWebSiteUrl(website, newUrl);
    }

    function redirectToWebsiteUrl() {
        urlSynchroService.redirectToUrl(website.url);
    }

    return (
        <div
            className={`details-wrap ${websiteMatch ? 'match' : ''} ${
                websiteMatch && uiStore.websiteIsMatchedManually ? 'manual' : ''
            }`}
        >
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
                <Input value={website.url} onChange={onChangeUrl} />
                <div className="match-status-text">{matchStatusText}</div>
            </div>
        </div>
    );
});

export default WebSiteDetails;
