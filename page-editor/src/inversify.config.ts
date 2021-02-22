import 'reflect-metadata';
import { Container } from 'inversify';
import IProjectSynchronizationService from 'services/IProjectSynchronizationService';
import JDISynchronizationService from 'supported-frameworks/JDISynchronizationService';

const TYPES = {
    ProjectSynchronizationService: Symbol.for('ProjectSynchronizationService'),
};

export const DependencyContainer = new Container();
DependencyContainer.bind<IProjectSynchronizationService>(TYPES.ProjectSynchronizationService).to(
    JDISynchronizationService,
);
