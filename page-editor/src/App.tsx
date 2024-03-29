import React, { useEffect } from 'react';
import 'App.sass';

import { observer } from 'mobx-react';

import IIdeProxy from 'connections/IDE/IIDEConnection';
import VSConnection from 'connections/IDE/VSConnection';
import ProjectSelector from 'components/ProjectSelector/ProjectSelector';
import ProjectViewer from 'components/ProjectViewer/ProjectViewer';
import RootStore from 'entities/mst/RootStore';
import { useRootStore } from 'context';
// import SelectorsBagService from 'services/SelectorsBagService';
import { DependencyContainer } from 'inversify.config';
import IUrlSynchronizationService from 'services/IUrlSynchronizationService';
import { NotificationToast } from 'components/NotificationToast/NotificationToast';
import TYPES from 'inversify.types';

const App: React.FC = observer(() => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    const urlSynchronizationService = DependencyContainer.get<IUrlSynchronizationService>(
        TYPES.UrlSynchronizationService,
    );
    const ideaConnection: VSConnection = DependencyContainer.get<VSConnection>(TYPES.IDEAConnection);
    const ideProxies: IIdeProxy[] = [ideaConnection];

    useEffect(() => {
        urlSynchronizationService.requestCurrentUrl();
    }, []);

    // useLayoutEffect(() => {
    //     SelectorsBagService.init();
    // }, []);

    // SelectorEditorProxy.instance().addListener(
    //     MessageTypes.UpdateComponentSelector,
    //     onUdpateComponenetSelector
    // );

    //let webSession = JSON.parse(testdata, WebSession.reviver);
    // this.state = {
    //     module: '',
    //     pageTypes: [], // webSession.pages,
    //     selectedPageType: undefined,
    //     websites: [], // webSession.pages,
    //     selectedWebsite: undefined,
    // };

    // function onUdpateComponenetSelector(data) {
    //     const arr = data.componentId.split('.');
    //     arr.splice(arr.length - 1);
    //     const pageTypeId = arr.join('.');
    //     const pageType = this.state.pageTypes.find((p) => p.id === pageTypeId);
    //     if (!pageType) {
    //         return;
    //     }

    //     const component = pageType.componentInstances.find((c) => c.id === data.componentId);
    //     if (!component) {
    //         return;
    //     }

    //     const parameter = component.initializationAttribute?.parameters.find((p) => p.name === data.parameterName);
    //     if (!parameter) {
    //         return;
    //     }

    //     parameter.values[data.parameterValueIndex].value = data.selector;
    //     this.setState(this.state);

    //     const message = {};
    //     message['type'] = 'update-component-instance';
    //     message['moduleName'] = this.state.module;
    //     message['data'] = component;
    //     this.onSend(JSON.stringify(message));
    // }

    // onSelectedPageChange = (e, data) => {
    //     if (data.value === undefined) {
    //         this.setState({ selectedPageType: this.state.pageTypes.find((p) => p.id === data) });
    //     } else this.setState({ selectedPageType: this.state.pageTypes.find((p) => p.id === data.value) });
    // };

    // onSelectedWebsiteChange = (e, data) => {
    //     if (data.value === undefined) {
    //         this.setState({ selectedWebsite: this.state.websites.find((p) => p.id === data) });
    //     } else this.setState({ selectedWebsite: this.state.websites.find((p) => p.id === data.value) });
    // };

    // onWebSessionUpdated = (webSession: WebSession) => {
    //     this.setState({ module: webSession.module });
    //     this.setState({ pageTypes: webSession.pages });
    //     const page = webSession.pages.find(
    //         (p) => this.state.selectedPageType !== undefined && p.id === this.state.selectedPageType.id,
    //     );
    //     this.setState({ selectedPageType: page });
    // };

    // onSelectedProject = (message) => {
    //     this.setState({ module: message.module });
    //     this.setState({ pageTypes: message.pages });
    //     this.setState({ websites: message.websites });
    // };

    // onSend = (json: string) => {
    //     this.connection.current.sendHandler(json);
    // };
    // onComponentUpdated = (json: any) => {
    //     //TODO implement
    //     return;
    // };

    // onPageUpdated = (json: any) => {
    //     const newPage = PageType.fromJSON(json);
    //     const indexForNewOne = this.state.pageTypes.findIndex((p) => p.id === newPage.id);
    //     const pages = this.state.pageTypes;
    //     pages[indexForNewOne] = newPage;
    //     this.setState({ pageTypes: pages });
    //     this.setState({ selectedPageType: pages[indexForNewOne] });
    //     return;
    // };

    // onProjectMetadataReceived = (projectStore) => {
    //     console.log('project metadata received', projectStore);
    //     this.context.setProjectStore(projectStore);
    // };

    // function getIdeProxyForSelectedProject(): IIdeProxy {
    //     const ideProxy = ideProxies.find((p) => p.type == uiStore.selectedIdeConnectionType);
    //     if (!ideProxy) {
    //         throw new Error('Invalid connection type: ' + uiStore.selectedIdeConnectionType);
    //     }
    //     return ideProxy;
    // }

    return (
        <div className="App full-height">
            {uiStore.selectedProjectIsLoaded ? <ProjectViewer /> : <ProjectSelector ideProxies={ideProxies} />}
            {uiStore.notification && (
                <NotificationToast
                    title={uiStore.notification.title}
                    message={uiStore.notification.message}
                    isError={uiStore.notification.isError}
                />
            )}
            {/* <Connection
                    ref={this.connection}
                    onWebSessionUpdated={this.onWebSessionUpdated}
                    onSelectedPageChange={this.onSelectedPageChange}
                    onSelectedProject={this.onSelectedProject}
                    onComponentUpdated={this.onComponentUpdated}
                    onPageUpdated={this.onPageUpdated}
                    onProjectMetadataReceived={this.onProjectMetadataReceived}
                /> */}
            {/* {this.state.pageTypes.length === 0 ? (
                    <img src={AjaxLoader} />
                ) : (
                    <div>
                        <p>Current IDEA project: {this.state.module}</p>
                    </div>
                )} */}
        </div>
    );
});

export default App;
