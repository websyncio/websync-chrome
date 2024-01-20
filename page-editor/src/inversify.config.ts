import 'reflect-metadata';
import { Container } from 'inversify';
import ISynchronizationService from 'services/ISynchronizationService';
import UnionSynchronizationService from 'supported-frameworks/JDI/services/UnionSynchronizationService';
import { SelectorsBagService } from 'services/SelectorsBagService';
import { UrlSynchronizationService } from 'services/UrlSynchronizationService';
import SelectorEditorConnection from 'connections/SelectorEditorConnection';
import SelectorValidator from 'services/SelectorValidatorService';
import SelectorHighlighter from 'services/SelectorHighlighterService';
import VSConnection from 'connections/IDE/VSConnection';
import ISelectorsBagService from 'services/ISelectorsBagService';
import IMatchUrlService from 'services/IMatchUrlService';
import JDIMatchUrlService from 'supported-frameworks/JDI/services/JDIMatchUrlService';
import TYPES from 'inversify.types';

export const DependencyContainer = new Container();

DependencyContainer.bind<UrlSynchronizationService>(TYPES.UrlSynchronizationService)
    .toDynamicValue(() => {
        const connection = DependencyContainer.get<SelectorEditorConnection>(TYPES.SelectorEditorConnection);
        const urlMatcher = DependencyContainer.get<IMatchUrlService>(TYPES.UrlMatcher);
        return new UrlSynchronizationService(connection, urlMatcher);
    })
    .inSingletonScope();

DependencyContainer.bind<SelectorEditorConnection>(TYPES.SelectorEditorConnection)
    .to(SelectorEditorConnection)
    .inSingletonScope();

DependencyContainer.bind<ISelectorsBagService>(TYPES.SelectorsBagService)
    .toDynamicValue(() => {
        const connection = DependencyContainer.get<SelectorEditorConnection>(TYPES.SelectorEditorConnection);
        const synchronizationService = DependencyContainer.get<ISynchronizationService>(TYPES.SynchronizationService);
        return new SelectorsBagService(connection, synchronizationService);
    })
    .inSingletonScope();

DependencyContainer.bind<SelectorValidator>(TYPES.SelectorValidator)
    .toDynamicValue(() => {
        const connection = DependencyContainer.get<SelectorEditorConnection>(TYPES.SelectorEditorConnection);
        return new SelectorValidator(connection);
    })
    .inSingletonScope();

DependencyContainer.bind<SelectorHighlighter>(TYPES.SelectorHighlighter)
    .toDynamicValue(() => {
        const connection = DependencyContainer.get<SelectorEditorConnection>(TYPES.SelectorEditorConnection);
        return new SelectorHighlighter(connection);
    })
    .inSingletonScope();

DependencyContainer.bind<VSConnection>(TYPES.IDEAConnection).to(VSConnection).inSingletonScope();

DependencyContainer.bind<ISynchronizationService>(TYPES.SynchronizationService)
    .toDynamicValue(() => {
        const connection = DependencyContainer.get<VSConnection>(TYPES.IDEAConnection);
        const urlMatcher = DependencyContainer.get<IMatchUrlService>(TYPES.UrlMatcher);
        return new UnionSynchronizationService(connection, urlMatcher);
    })
    .inSingletonScope();

DependencyContainer.bind<IMatchUrlService>(TYPES.UrlMatcher)
    .toDynamicValue(() => {
        const connection = DependencyContainer.get<VSConnection>(TYPES.IDEAConnection);
        return new JDIMatchUrlService(connection);
    })
    .inSingletonScope();
