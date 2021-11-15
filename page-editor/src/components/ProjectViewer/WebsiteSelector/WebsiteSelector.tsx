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
            return new URL(uiStore.currentUrl).origin;
        }
        return '';
    }

    const currentHost: string = getCurrentHost();

    function navigateTo(url: string) {
        urlSynchronizationService.redirectToUrl(url);
    }

    function websitesList() {
        return projectStore.webSites.map((ws) => (
            <div className="flex-left website" key={ws.id}>
                <i className="website-icon" />
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
        <div className="website-selector full-height flex-center">
            <div className="flex-center">
                <span className="current-url">{uiStore.currentUrl}</span>
            </div>
            <div className="flex-center mx-auto select-website-panel">
                <div className="flex-center current-host-container">
                    <div>
                        <i className="warning-icon" />
                    </div>
                    <div className="warning">
                        <div>
                            Current host <span className="current-host">{currentHost}</span> does not match any website
                            in project <strong>{uiStore.selectedProject}</strong>.
                        </div>
                        <div>You may match it manually.</div>
                    </div>
                </div>
                <div className="websites-list-container">{websitesList()}</div>
            </div>
            <div className="text-divider mx-auto">or</div>
            <div className="flex-center create-website-panel">
                <div className="message">
                    You may{' '}
                    <span
                        className={`create-website-button ws-btn ws-btn__primary`}
                        title={`Create Website for ${currentHost}`}
                        onClick={onCreateWebSite}
                    >
                        Create Website
                    </span>{' '}
                    for <span className="current-host">{currentHost}</span> in project{' '}
                    <strong>{uiStore.selectedProject}</strong>.
                </div>
            </div>
        </div>
    );
});

export default WebsiteSelector;
