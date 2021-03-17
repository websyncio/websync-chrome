import 'reflect-metadata';
import { Container } from 'inversify';
import ISynchronizationService from 'services/ISynchronizationService';
import JDISynchronizationService from 'supported-frameworks/JDISynchronizationService';
import { SelectorsBagService } from 'services/SelectorsBagService';
import { UrlSynchronizationService } from 'services/UrlSynchronizationService';
import SelectorEditorConnection from 'connections/SelectorEditorConnection';
import SelectorValidator from 'services/SelectorValidatorService';
import SelectorHighlighter from 'services/SelectorHighlighterService';
import IDEAConnection from 'connections/IDE/IDEAConnection';
import ISelectorsBagService from 'services/ISelectorsBagService';

export const TYPES = {
    SynchronizationService: Symbol.for('ProjectSynchronizationService'),
    SelectorsBagService: Symbol.for('SelectorsBagService'),
    SelectorEditorConnection: Symbol.for('SelectorEditorConnection'),
    SelectorValidator: Symbol.for('SelectorValidator'),
    SelectorHighlighter: Symbol.for('SelectorHighlighter'),
    IDEAConnection: Symbol.for('IDEAConnection'),
    UrlSynchronizationService: Symbol.for('UrlSynchronizationService'),
};

export const DependencyContainer = new Container();

DependencyContainer.bind<UrlSynchronizationService>(TYPES.UrlSynchronizationService)
    .toDynamicValue(() => {
        const connection = DependencyContainer.get<SelectorEditorConnection>(TYPES.SelectorEditorConnection);
        return new UrlSynchronizationService(connection);
    })
    .inSingletonScope();

DependencyContainer.bind<SelectorEditorConnection>(TYPES.SelectorEditorConnection)
    .to(SelectorEditorConnection)
    .inSingletonScope();

DependencyContainer.bind<ISelectorsBagService>(TYPES.SelectorsBagService)
    .toDynamicValue(() => {
        const connection = DependencyContainer.get<SelectorEditorConnection>(TYPES.SelectorEditorConnection);
        return new SelectorsBagService(connection);
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
        return new JDISynchronizationService(connection);
    })
    .inSingletonScope();
