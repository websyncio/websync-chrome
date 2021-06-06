import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import IUrlSynchronizationService from './IUrlSynchronizationService';
import { TYPES } from 'inversify.config';
import SelectorEditorConnection, { MessageTypes, MessageTargets } from '../connections/SelectorEditorConnection';
import { RootStore } from '../context';
import PageInstance from 'entities/mst/PageInstance';
import Reactor from '../utils/Reactor';

@injectable()
export class UrlSynchronizationService implements IUrlSynchronizationService {
    reactor: Reactor;

    constructor(@inject(TYPES.SelectorEditorConnection) private selectorEditorConnection: SelectorEditorConnection) {
        this.reactor = new Reactor();
        this.reactor.registerEvent(MessageTypes.UrlChanged);
        selectorEditorConnection.addListener(MessageTypes.UrlChanged, this.onUrlChanged.bind(this));
    }

    onUrlChanged(data) {
        const { url } = data;
        this.reactor.dispatchEvent(MessageTypes.UrlChanged);
        const matchedPages: PageInstance[] = [];
        RootStore.projectStore.webSites.map((site) => {
            console.log('onurlchanged');
            if (url.toLowerCase().indexOf(site.url.toLowerCase()) === 0) {
                const urlC = new URL(url.toLowerCase());
                const pathname = urlC.pathname;

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
        this.selectorEditorConnection.postMessage(MessageTypes.GetUrlRequest, null, MessageTargets.ContentPage);
    }

    redirectToUrl(url: string) {
        this.selectorEditorConnection.postMessage(MessageTypes.ChangeUrl, { url }, MessageTargets.ContentPage);
    }

    addUrlChangedListener(listener: Function) {
        this.reactor.addEventListener(MessageTypes.UrlChanged, listener);
    }
}
