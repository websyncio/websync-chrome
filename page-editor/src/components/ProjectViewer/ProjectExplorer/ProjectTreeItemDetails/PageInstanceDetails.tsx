import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import PageInstance from 'entities/mst/PageInstance';
import Input from 'components-common/Input/Input';
import './TreeItemDetails.sass';
import { DependencyContainer } from 'inversify.config';
import ISynchronizationService from 'services/ISynchronizationService';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import IUrlSynchronizationService from 'services/IUrlSynchronizationService';
import { debounce } from 'utils/TimerUtils';
import TYPES from 'inversify.types';

interface Props {
    pageInstance: PageInstance;
}

const PageInstanceDetails: React.FC<Props> = observer(({ pageInstance }) => {
    const { uiStore, projectStore }: RootStore = useRootStore();
    const synchronizationService = DependencyContainer.get<ISynchronizationService>(TYPES.SynchronizationService);
    const urlSynchroService = DependencyContainer.get<IUrlSynchronizationService>(TYPES.UrlSynchronizationService);
    const pageMatch: boolean = uiStore.matchingPages.includes(pageInstance);
    const URL_DOES_NOT_MATCH = 'Does not match current URL Path';
    const URL_IS_EMPTY = 'Please, specify URL Path';
    const originalUrl = useMemo(() => pageInstance.url, [pageInstance]);
    const urlIsStatic = !pageInstance.url.includes('{0}');

    let matchStatusText = '';
    if (!pageInstance.url) {
        matchStatusText = URL_IS_EMPTY;
    } else if (pageInstance.url !== originalUrl && !pageMatch) {
        matchStatusText = URL_DOES_NOT_MATCH;
    }

    const updateUrlDebounced = debounce((pi, newUrl) => synchronizationService.updatePageInstanceUrl(pi, newUrl), 300);
    function onChangeUrl(newUrl: string) {
        updateUrlDebounced(pageInstance, newUrl);
    }

    function redirectToUrl() {
        urlSynchroService.redirectToUrl(`${pageInstance.fullUrl}`);
    }

    function urlWithoutParams() {
        const url = new URL(uiStore.currentUrl!);
        return url.pathname;
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
                    urlIsStatic && (
                        <span className="action-button" onClick={redirectToUrl}>
                            Redirect to this page
                        </span>
                    )
                )}
            </div>
            <div className="field-wrap">
                <label>
                    URL Path
                    <i
                        className="info-icon"
                        title="Pattern that matches absolute URL of the page. Use '{1..N}' to match dynamic elements."
                    />
                </label>
                <span className="current-url">({urlWithoutParams()})</span>
                <Input value={pageInstance.url} onChange={onChangeUrl} />
                <div className="match-status-text">{matchStatusText}</div>
            </div>
        </div>
    );
});

export default PageInstanceDetails;
