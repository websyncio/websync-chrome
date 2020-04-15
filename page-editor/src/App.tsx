import React, { Component } from 'react';
import './styles/App.sass';
import Connection from './components/Connection';
import PageType from './models/PageType';
import PageList from './components/PageList';
import ComponentInstancesList from './components/ComponentInstancesTree';

import 'semantic-ui-css/semantic.min.css';
import WebSession from './models/WebSession';

type AppState = {
    module: string;
    pageTypes: Array<PageType>;
    selectedPageType?: PageType;
};

class App extends Component<any, AppState> {
    constructor(props) {
        super(props);
        this.onSelectedPageChange = this.onSelectedPageChange.bind(this);
        this.onWebSessionUpdated = this.onWebSessionUpdated.bind(this);
        this.connection = React.createRef();

        //let webSession = JSON.parse(testdata, WebSession.reviver);
        this.state = {
            module: '',
            pageTypes: [], // webSession.pages,
            selectedPageType: undefined,
        };
    }

    connection;

    onSelectedPageChange = (e, data) => {
        this.setState({ selectedPageType: this.state.pageTypes.find((p) => p.id === data.value) });
    };

    onWebSessionUpdated = (webSession: WebSession) => {
        this.setState({ module: webSession.module });
        this.setState({ pageTypes: webSession.pages });
    };

    onSend = (json: string) => {
        this.connection.current.sendHandler(json);
    };

    render() {
        return (
            <div className="App">
                <Connection ref={this.connection} onWebSessionUpdated={this.onWebSessionUpdated} />
                <div>
                    <p>Current IDEA project: {this.state.module}</p>
                </div>
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
