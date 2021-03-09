import IDEAConnection from 'connections/IDE/IDEAConnection';
import ComponentInstance from 'entities/mst/ComponentInstance';
import { injectable, inject } from 'inversify';
import { TYPES } from 'inversify.config';
import IProjectSynchronizerService from 'services/IProjectSynchronizationService';

@injectable()
export default class JDISynchronizationService implements IProjectSynchronizerService {
    constructor(@inject(TYPES.IDEAConnection) private ideaConnection: IDEAConnection) {}

    deleteComponentInstance(component: ComponentInstance): void {
        component.delete();
        //this.ideaConnection.deleteComponentInstance(component);
    }
}
