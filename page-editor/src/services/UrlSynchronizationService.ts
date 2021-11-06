import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import IUrlSynchronizationService from './IUrlSynchronizationService';
import { TYPES } from 'inversify.config';
import SelectorEditorConnection, { MessageTypes, MessageTargets } from '../connections/SelectorEditorConnection';
import { RootStore } from '../context';
import PageInstance from 'entities/mst/PageInstance';
import Reactor from '../utils/Reactor';
import WebSite from 'entities/mst/WebSite';

@injectable()
export class UrlSynchronizationService implements IUrlSynchronizationService {
    reactor: Reactor;

    constructor(@inject(TYPES.SelectorEditorConnection) private selectorEditorConnection: SelectorEditorConnection) {
        this.reactor = new Reactor();
        this.reactor.registerEvent(MessageTypes.UrlChanged);
        selectorEditorConnection.addListener(MessageTypes.UrlChanged, this.onUrlChanged.bind(this));
    }

    onUrlChanged(data) {
        console.log('on url changed', data);
        const { url } = data;
        this.reactor.dispatchEvent(MessageTypes.UrlChanged, data);

        // const matchingWebsite: WebSite = RootStore.projectStore.webSites.find((ws) => {
        //     return url.toLowerCase().indexOf(ws.url.toLowerCase()) === 0;
        // });

        // const matchingPages: PageInstance[] = [];
        // const pathname = new URL(url.toLowerCase()).pathname;
        // matchingWebsite.pageInstances.forEach((pi: PageInstance) => {
        //     if (pathname === pi.url) {
        //         matchingPages.push(pi);
        //     }
        // });

        RootStore.uiStore.setCurrentUrl(url);
        // RootStore.uiStore.setMatchingWebsite(matchingWebsite);
        // RootStore.uiStore.setMathchingPages(matchingPages);
    }

    requestCurrentUrl() {
        this.selectorEditorConnection.postMessage(MessageTypes.GetUrlRequest, null, MessageTargets.ContentPage);
    }

    redirectToUrl(url: string) {
        this.selectorEditorConnection.postMessage(MessageTypes.ChangeUrl, { url }, MessageTargets.ContentPage);
    }

    addUrlChangedListener(listener: Function) {
        this.reactor.addEventListener(MessageTypes.UrlChanged, listener);
    }
}
