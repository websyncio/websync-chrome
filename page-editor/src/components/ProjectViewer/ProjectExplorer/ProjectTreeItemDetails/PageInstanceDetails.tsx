import React from 'react';
import { observer } from 'mobx-react';
import PageInstance from 'entities/mst/PageInstance';
import Input from 'components/Input/Input';
import './PageInstanceDetails.sass';
import { DependencyContainer, TYPES } from 'inversify.config';
import ISynchronizationService from 'services/ISynchronizationService';
import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import IUrlSynchronizationService from 'services/IUrlSynchronizationService';

interface Props {
    pageInstance: PageInstance;
}

const PageInstanceDetails: React.FC<Props> = observer(({ pageInstance }) => {
    const { uiStore, projectStore }: RootStore = useRootStore();
    const synchronizationService = DependencyContainer.get<ISynchronizationService>(TYPES.SynchronizationService);
    const urlSynchroService = DependencyContainer.get<IUrlSynchronizationService>(TYPES.UrlSynchronizationService);

    function onChangeUrl(newUrl: string) {
        synchronizationService.updatePageInstanceUrl(pageInstance, newUrl);
    }

    function getWebsiteUrl(pageInstance) {
        const website = projectStore.webSites.find((ws) => ws.pageInstances.some((pi) => pi.id === pageInstance.id));
        return website ? website.url : '';
    }

    function redirectToUrl() {
        urlSynchroService.redirectToUrl(`${getWebsiteUrl(pageInstance)}${pageInstance.url}`);
    }

    return (
        <div className="details-wrap">
            <div className="pageinstance-name">
                {uiStore.matchingPages.map((mp) => mp.id).includes(pageInstance.id) ? (
                    <div> Page matched </div>
                ) : (
                    <div>
                        {' '}
                        Page not matched <button onClick={redirectToUrl}> Redirect to page</button>{' '}
                    </div>
                )}
                <label>Page </label>
                <span>{pageInstance.name}</span>
            </div>
            <div className="pageinstance-name">
                <i className="ws-small-icon page-icon" />
                <span className="pageinstance-name">{pageInstance.name}</span>
            </div>
            <div className="pageinstance-url">
                <label>Url:</label>
                <Input value={pageInstance.url} onChange={onChangeUrl} />
            </div>
        </div>
    );
});

export default PageInstanceDetails;
