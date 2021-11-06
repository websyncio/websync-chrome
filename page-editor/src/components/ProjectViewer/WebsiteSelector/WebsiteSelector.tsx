import { observer } from 'mobx-react';
import React from 'react';
import { useRootStore } from 'context';
import { DependencyContainer, TYPES } from 'inversify.config';
import IProjectSynchronizationService from 'services/ISynchronizationService';
import './WebsiteSelector.sass';
import IUrlSynchronizationService from 'services/IUrlSynchronizationService';

interface Props {}

const WebsiteSelector: React.FC<Props> = observer(({}) => {
    const { projectStore, uiStore } = useRootStore();

    const urlSynchronizationService = DependencyContainer.get<IUrlSynchronizationService>(
        TYPES.UrlSynchronizationService,
    );

    const projectSynchronizationService = DependencyContainer.get<IProjectSynchronizationService>(
        TYPES.SynchronizationService,
    );

    function getCurrentHost() {
        if (uiStore.currentUrl) {
            return new URL(uiStore.currentUrl).host;
        }
        return '';
    }

    function navigateTo(url: string) {
        urlSynchronizationService.redirectToUrl(url);
    }

    function websitesList() {
        return projectStore.webSites.map((ws) => (
            <div key={ws.id}>
                <i className="page-icon" />
                <span>{ws.name}</span>:&nbsp;
                <a href="#" onClick={() => navigateTo(ws.url)}>
                    {ws.url}
                </a>
            </div>
        ));
    }

    function onCreateWebSite() {
        //projectSynchronizationService.createWebsite();
    }

    return (
        <div className="website-selector">
            <div className="flex-center">
                <span>{uiStore.currentUrl}</span>
            </div>
            <div className="flex-center">
                <div className="current-host">{getCurrentHost()}</div>
                <div className="websites-list">{websitesList()}</div>
            </div>
            <div className="flex-center">
                <span
                    className={`action-button`}
                    title={`${'Add component to page object (Ctrl+Enter)'}`}
                    onClick={onCreateWebSite}
                >
                    Create WebSite
                </span>
            </div>
        </div>
    );
});

export default WebsiteSelector;
