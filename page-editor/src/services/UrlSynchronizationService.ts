import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import IUrlSynchronizationService from './IUrlSynchronizationService';
import { TYPES } from 'inversify.config';
import SelectorEditorConnection, { MessageTypes } from '../connections/SelectorEditorConnection';

@injectable()
export class UrlSyncrhonizationService implements IUrlSynchronizationService {
    constructor(@inject(TYPES.SelectorEditorConnection) private selectorEditorConnection: SelectorEditorConnection) {
        selectorEditorConnection.addListener(MessageTypes.UrlChanged, this.updateUrlStatus);
    }

    updateUrlStatus(data: any) {
        console.log('service Update URL Status', data);
    }
}
