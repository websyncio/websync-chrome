import IIdeProxy from 'connections/IDE/IIdeProxy';

export default class IDEConnectionsManager {
    ideProxies: IIdeProxy[] = [];
    registerIde(ideProxy: IIdeProxy) {
        this.ideProxies.push(ideProxy);
    }
}
