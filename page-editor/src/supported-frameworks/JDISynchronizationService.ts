import { injectable } from 'inversify';
import IProjectSynchronizerService from 'services/IProjectSynchronizationService';

@injectable()
export default class JDISynchronizationService implements IProjectSynchronizerService {}
