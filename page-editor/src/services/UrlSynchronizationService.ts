import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import IUrlSynchronizationService from './IUrlSynchronizationService';
import { TYPES } from 'inversify.config';
import SelectorEditorConnection, { MessageTypes, MessageTargets } from '../connections/SelectorEditorConnection';
import { RootStore } from '../context';
import PageInstance from 'entities/mst/PageInstance';
import Reactor from '../utils/Reactor';

export const UrlSynchronizationEvents = {
    UrlChanged: 'url-changed',
};
@injectable()
export class UrlSynchronizationService implements IUrlSynchronizationService {
    reactor: Reactor;

    constructor(@inject(TYPES.SelectorEditorConnection) private selectorEditorConnection: SelectorEditorConnection) {
        this.reactor = new Reactor();
        this.reactor.registerEvent(UrlSynchronizationEvents.UrlChanged);
        selectorEditorConnection.addListener(MessageTypes.UrlChanged, this.onUrlChanged.bind(this));
    }

    onUrlChanged(data) {
        const { url } = data;
        this.reactor.dispatchEvent(UrlSynchronizationEvents.UrlChanged);
        const matchedPages: PageInstance[] = [];
        RootStore.projectStore.webSites.map((site) => {
            if (url.toLowerCase().indexOf(site.url.toLowerCase()) === 0) {
                const urlC = new URL(url.toLowerCase());
                const pathname = urlC.pathname.substring(1);

                site.pageInstances.map((pi: PageInstance) => {
                    if (pathname === pi.url) {
                        matchedPages.push(pi);
                    }
                });
            }
            return site;
        });
        RootStore.uiStore.updateMathchedPages(matchedPages);
    }

    initUrlSynchro() {
        this.selectorEditorConnection.postMessage(MessageTypes.InitSynchroService, null, MessageTargets.ContentPage);
    }

    redirectToUrl(url: string) {
        this.selectorEditorConnection.postMessage(MessageTypes.ChangePageUrl, { url }, MessageTargets.ContentPage);
    }

    addUrlChangedListener(listener: Function) {
        this.reactor.addEventListener(UrlSynchronizationEvents.UrlChanged, listener);
    }
}
