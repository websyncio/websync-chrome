import IIdeProxy from 'interfaces/IIdeProxy';

export default class IDEConnectionsManager {
    ideProxies: IIdeProxy[] = [];
    registerIde(ideProxy: IIdeProxy) {
        this.ideProxies.push(ideProxy);
    }
}
