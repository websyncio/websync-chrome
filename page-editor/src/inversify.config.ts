import 'reflect-metadata';
import { Container } from 'inversify';
import ISynchronizationService from 'services/ISynchronizationService';
import JDISynchronizationService from 'supported-frameworks/JDI/services/JDISynchronizationService';
import JDIAttributeToXcssMapper from 'supported-frameworks/JDI/services/JDIAttributeToXcssMapper';
import { SelectorsBagService } from 'services/SelectorsBagService';
import { UrlSynchronizationService } from 'services/UrlSynchronizationService';
import SelectorEditorConnection from 'connections/SelectorEditorConnection';
import SelectorValidator from 'services/SelectorValidatorService';
import SelectorHighlighter from 'services/SelectorHighlighterService';
import IDEAConnection from 'connections/IDE/IDEAConnection';
import ISelectorsBagService from 'services/ISelectorsBagService';
import IAttributeToXcssMapper from 'services/IAttributeToXcssMapper';
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

DependencyContainer.bind<IDEAConnection>(TYPES.IDEAConnection).to(IDEAConnection).inSingletonScope();

DependencyContainer.bind<ISynchronizationService>(TYPES.SynchronizationService)
    .toDynamicValue(() => {
        const connection = DependencyContainer.get<IDEAConnection>(TYPES.IDEAConnection);
        const urlMatcher = DependencyContainer.get<IMatchUrlService>(TYPES.UrlMatcher);
        return new JDISynchronizationService(connection, urlMatcher);
    })
    .inSingletonScope();

DependencyContainer.bind<IAttributeToXcssMapper>(TYPES.AttributeToXcssMapper)
    .to(JDIAttributeToXcssMapper)
    .inSingletonScope();

DependencyContainer.bind<IMatchUrlService>(TYPES.UrlMatcher)
    .toDynamicValue(() => {
        const connection = DependencyContainer.get<IDEAConnection>(TYPES.IDEAConnection);
        return new JDIMatchUrlService(connection);
    })
    .inSingletonScope();
