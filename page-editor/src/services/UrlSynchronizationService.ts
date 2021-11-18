import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import IUrlSynchronizationService from './IUrlSynchronizationService';
import { TYPES } from 'inversify.config';
import SelectorEditorConnection, { MessageTypes, MessageTargets } from '../connections/SelectorEditorConnection';
import { RootStore } from '../context';
import PageInstance from 'entities/mst/PageInstance';
import Reactor from '../utils/Reactor';
import WebSite from 'entities/mst/WebSite';
import IUrlMatcher from './IUrlMatcher';

@injectable()
export class UrlSynchronizationService implements IUrlSynchronizationService {
    reactor: Reactor;

    constructor(
        @inject(TYPES.SelectorEditorConnection) private selectorEditorConnection: SelectorEditorConnection,
        @inject(TYPES.UrlMatcher) private urlMatcher: IUrlMatcher,
    ) {
        this.reactor = new Reactor();
        this.reactor.registerEvent(MessageTypes.UrlChanged);
        selectorEditorConnection.addListener(MessageTypes.UrlChanged, this.onUrlChanged.bind(this));
    }

    onUrlChanged(data) {
        console.log('on url changed', data);
        const { url } = data;
        if (!url) {
            throw new Error('Url can not be null');
        }
        this.reactor.dispatchEvent(MessageTypes.UrlChanged, data);
        RootStore.uiStore.setCurrentUrl(url);

        const matchingWebsite: WebSite = this.urlMatcher.matchWebsite(RootStore.projectStore, url);
        const matchingPages: PageInstance[] = this.urlMatcher.matchPage(matchingWebsite, url);
        RootStore.uiStore.setMatchingWebsite(matchingWebsite);
        RootStore.uiStore.setMathchingPages(matchingPages);
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
