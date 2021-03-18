import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import IUrlSynchronizationService from './IUrlSynchronizationService';
import { TYPES } from 'inversify.config';
import SelectorEditorConnection, { MessageTypes } from '../connections/SelectorEditorConnection';
import { RootStore } from '../context';
import PageInstance from 'entities/mst/PageInstance';

@injectable()
export class UrlSynchronizationService implements IUrlSynchronizationService {
    constructor(@inject(TYPES.SelectorEditorConnection) private selectorEditorConnection: SelectorEditorConnection) {
        selectorEditorConnection.addListener(MessageTypes.UrlChanged, this.updateUrlStatus);
    }

    updateUrlStatus(data) {
        const { url } = data;
        const matchedPages: PageInstance[] = [];
        console.log('update url matched pages');
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
}
