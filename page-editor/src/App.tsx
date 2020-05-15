import React, { Component } from 'react';
import 'styles/App.sass';
import Connection from './components/Connection';
import PageType from './models/PageType';
import PageList from './components/PageList';
import ComponentInstancesList from './components/ComponentInstancesTree';
import SelectorEditorProxy, { MessageTypes } from './services/SelectorEditorProxy';
import AjaxLoader from './resources/ajaxloader-64x64.gif';
import 'semantic-ui-css/semantic.min.css';
import WebSession from './models/WebSession';

type AppState = {
    module: string;
    pageTypes: Array<PageType>;
    selectedPageType?: PageType;
};

class App extends Component<any, AppState> {
    connection: any;

    constructor(props) {
        super(props);
        this.onSelectedPageChange = this.onSelectedPageChange.bind(this);
        this.onWebSessionUpdated = this.onWebSessionUpdated.bind(this);
        this.connection = React.createRef();

        SelectorEditorProxy.instance().addListener(
            MessageTypes.UpdateComponentSelector,
            this.onUdpateComponenetSelector.bind(this),
        );

        //let webSession = JSON.parse(testdata, WebSession.reviver);
        this.state = {
            module: '',
            pageTypes: [], // webSession.pages,
            selectedPageType: undefined,
        };
    }

    onUdpateComponenetSelector(data) {
        const arr = data.componentId.split('.');
        arr.splice(arr.length - 1);
        const pageTypeId = arr.join('.');
        const pageType = this.state.pageTypes.find((p) => p.id === pageTypeId);
        if (!pageType) {
            return;
        }

        const component = pageType.componentsInstances.find((c) => c.id === data.componentId);
        if (!component) {
            return;
        }

        const parameter = component.initializationAttribute?.parameters.find((p) => p.name === data.parameterName);
        if (!parameter) {
            return;
        }

        parameter.values[data.parameterValueIndex].value = data.selector;
        this.setState(this.state);

        const message = {};
        message['command'] = 'update-component-instance';
        message['moduleName'] = this.state.module;
        message['data'] = component;
        this.onSend(JSON.stringify(message));
    }

    onSelectedPageChange = (e, data) => {
        if (data.value === undefined) {
            this.setState({ selectedPageType: this.state.pageTypes.find((p) => p.id === data) });
        } else this.setState({ selectedPageType: this.state.pageTypes.find((p) => p.id === data.value) });
    };

    onWebSessionUpdated = (webSession: WebSession) => {
        this.setState({ module: webSession.module });
        this.setState({ pageTypes: webSession.pages });
        const page = webSession.pages.find(
            (p) => this.state.selectedPageType !== undefined && p.id === this.state.selectedPageType.id,
        );
        this.setState({ selectedPageType: page });
    };

    onSelectedProject = (message) => {
        this.setState({ module: message.module });
        this.setState({ pageTypes: message.pages });
    };

    onSend = (json: string) => {
        this.connection.current.sendHandler(json);
    };
    onComponentUpdated = (json: any) => {
        //TODO implement
        return;
    };

    onPageUpdated = (json: any) => {
        //TODO implement
        return;
    };

    render() {
        return (
            <div className="App">
                <Connection
                    ref={this.connection}
                    onWebSessionUpdated={this.onWebSessionUpdated}
                    onSelectedPageChange={this.onSelectedPageChange}
                    onSelectedProject={this.onSelectedProject}
                    onComponentUpdated={this.onComponentUpdated}
                    onPageUpdated={this.onPageUpdated}
                />
                {this.state.pageTypes.length === 0 ? (
                    <img src={AjaxLoader} />
                ) : (
                    <div>
                        <p>Current IDEA project: {this.state.module}</p>
                    </div>
                )}
                <PageList
                    pageTypes={this.state.pageTypes}
                    selected={this.state.selectedPageType}
                    onSelectedPageChanged={this.onSelectedPageChange}
                />
                {this.state.selectedPageType && (
                    <ComponentInstancesList
                        componentInstancesList={this.state.selectedPageType.componentsInstances}
                        onSend={this.onSend}
                    />
                )}
            </div>
        );
    }
}

export default App;
