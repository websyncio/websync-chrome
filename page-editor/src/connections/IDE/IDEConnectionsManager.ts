import IIdeConnection from 'connections/IDE/IIDEConnection';

export default class IDEConnectionsManager {
    ideProxies: IIdeConnection[] = [];
    registerIde(ideProxy: IIdeConnection) {
        this.ideProxies.push(ideProxy);
    }
}
