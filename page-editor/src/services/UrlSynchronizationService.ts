import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import IUrlSynchronizationService from './IUrlSynchronizationService';
import { TYPES } from 'inversify.config';
import SelectorEditorConnection, { MessageTypes, MessageTargets } from '../connections/SelectorEditorConnection';
import { RootStore } from '../context';
import PageInstance from 'entities/mst/PageInstance';
import Reactor from '../utils/Reactor';
import WebSite from 'entities/mst/WebSite';
import type IMatchUrlService from './IMatchUrlService';

@injectable()
export class UrlSynchronizationService implements IUrlSynchronizationService {
    reactor: Reactor;

    constructor(
        @inject(TYPES.SelectorEditorConnection) private selectorEditorConnection: SelectorEditorConnection,
        @inject(TYPES.UrlMatcher) private urlMatcher: IMatchUrlService,
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

        this.urlMatcher.matchUrl(url).then((matchResult) => {
            RootStore.uiStore.setUrlMatchResult(matchResult);
        });
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
