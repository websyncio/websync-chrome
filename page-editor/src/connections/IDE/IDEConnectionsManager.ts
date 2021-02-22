import IIdeProxy from 'connections/IDE/IIdeConnection';

export default class IDEConnectionsManager {
    ideProxies: IIdeProxy[] = [];
    registerIde(ideProxy: IIdeProxy) {
        this.ideProxies.push(ideProxy);
    }
}
