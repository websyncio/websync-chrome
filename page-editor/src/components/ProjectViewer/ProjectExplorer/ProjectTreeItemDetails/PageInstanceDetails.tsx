import React, { useState } from 'react';
import { observer } from 'mobx-react';
import PageInstance from 'entities/mst/PageInstance';
import Input from 'components-common/Input/Input';
import './TreeItemDetails.sass';
import { DependencyContainer, TYPES } from 'inversify.config';
import ISynchronizationService from 'services/ISynchronizationService';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import IUrlSynchronizationService from 'services/IUrlSynchronizationService';
import IUrlMatcher from 'services/IUrlMatcher';

interface Props {
    pageInstance: PageInstance;
}

const PageInstanceDetails: React.FC<Props> = observer(({ pageInstance }) => {
    const { uiStore, projectStore }: RootStore = useRootStore();
    const synchronizationService = DependencyContainer.get<ISynchronizationService>(TYPES.SynchronizationService);
    const urlSynchroService = DependencyContainer.get<IUrlSynchronizationService>(TYPES.UrlSynchronizationService);
    const urlMatchService = DependencyContainer.get<IUrlMatcher>(TYPES.UrlMatcher);
    const pageMatch: boolean = uiStore.matchingPages.includes(pageInstance);
    const [matchStatusText, setMatchStatusText] = useState('');
    const URL_DOES_NOT_MATCH = 'Absolute URL does not match current URL';
    const URL_IS_EMPTY = 'Please, specify Absolute URL';

    function onChangeUrl(newUrl: string) {
        if (!newUrl) {
            setMatchStatusText(URL_IS_EMPTY);
        } else {
            const newMatchingPages = urlMatchService.matchPage(uiStore.matchingWebsite, newUrl);
            if (newMatchingPages.includes(pageInstance)) {
                synchronizationService.updatePageInstanceUrl(pageInstance, newUrl);
                setMatchStatusText('');
            } else {
                setMatchStatusText(URL_DOES_NOT_MATCH);
            }
        }
    }

    function getWebsiteUrl(pageInstance) {
        const website = projectStore.webSites.find((ws) => ws.pageInstances.some((pi) => pi.id === pageInstance.id));
        return website ? website.url : '';
    }

    function redirectToUrl() {
        urlSynchroService.redirectToUrl(`${pageInstance.fullUrl}`);
    }

    function urlWithoutParams() {
        const url = new URL(uiStore.currentUrl!);
        return url.origin + url.pathname;
    }

    function editPageObject() {
        uiStore.showTabForEditedPage(pageInstance);
    }

    return (
        <div className={`details-wrap ${pageMatch ? 'match' : ''}`}>
            <div className="item-name-wrap">
                <i className="page-icon ws-icon-small" />
                <span className="item-name" style={{ cursor: 'pointer' }} onClick={editPageObject}>
                    {pageInstance.pageType.name}
                </span>
                <span className={`match-circle`} />
                {pageMatch ? (
                    <span className="action-button" onClick={editPageObject}>
                        Edit this page
                    </span>
                ) : (
                    <span className="action-button" onClick={redirectToUrl}>
                        Redirect to this page
                    </span>
                )}
            </div>
            <div className="field-wrap">
                <label>
                    Absolute URL
                    <i className="info-icon" title="Pattern that matches absolute URL of the tested page" />
                </label>
                <span className="current-url">({urlWithoutParams()})</span>
                <Input value={pageInstance.url} onChange={onChangeUrl} disabled={!pageMatch} />
                <div className="match-status-text">{matchStatusText}</div>
            </div>
        </div>
    );
});

export default PageInstanceDetails;
