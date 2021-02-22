import 'reflect-metadata';
import { Container } from 'inversify';
import IProjectSynchronizationService from 'services/IProjectSynchronizationService';
import JDISynchronizationService from 'supported-frameworks/JDISynchronizationService';
import { SelectorsBagService } from 'services/SelectorsBagService';
import SelectorEditorConnection from 'connections/SelectorEditorConnection';
import SelectorValidator from 'services/SelectorValidatorService';
import SelectorHighlighter from 'services/SelectorHighlighterService';

export const TYPES = {
    ProjectSynchronizationService: Symbol.for('ProjectSynchronizationService'),
    SelectorsBagService: Symbol.for('SelectorsBagService'),
    SelectorEditorConnection: Symbol.for('SelectorEditorConnection'),
    SelectorValidator: Symbol.for('SelectorValidator'),
    SelectorHighlighter: Symbol.for('SelectorHighlighter'),
};

export const DependencyContainer = new Container();
DependencyContainer.bind<IProjectSynchronizationService>(TYPES.ProjectSynchronizationService)
    .to(JDISynchronizationService)
    .inSingletonScope();
DependencyContainer.bind<SelectorEditorConnection>(TYPES.SelectorEditorConnection)
    .to(SelectorEditorConnection)
    .inSingletonScope();

DependencyContainer.bind<SelectorsBagService>(TYPES.SelectorsBagService)
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
