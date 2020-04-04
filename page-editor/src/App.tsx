import React, { Component } from 'react';
import './styles/App.sass';
import Connection from './Connection';
import PageType from './models/PageType';
import PageList from './PageList';
import ComponentInstancesList from './ComponentInstancesTree';
// import { testdata } from './data/testdata/testdata1';

import 'semantic-ui-css/semantic.min.css';
import WebSession from './models/WebSession';

type AppState = {
    project: string;
    pageTypes: Array<PageType>;
    selectedPageType?: PageType;
};

class App extends Component<any, AppState> {
    constructor(props) {
        super(props);
        this.onSelectedPageChange = this.onSelectedPageChange.bind(this);
        this.onWebSessionUpdated = this.onWebSessionUpdated.bind(this);

        //let webSession = JSON.parse(testdata, WebSession.reviver);
        this.state = {
            project: '',
            pageTypes: [], // webSession.pages,
            selectedPageType: undefined,
        };
    }

    onSelectedPageChange = (e, data) => {
        this.setState({ selectedPageType: this.state.pageTypes.find((p) => p.id === data.value) });
    };

    onWebSessionUpdated = (webSession: WebSession) => {
        this.setState({ project: webSession.project });
        this.setState({ pageTypes: webSession.pages });
    };

    render() {
        return (
            <div className="App">
                <Connection onWebSessionUpdated={this.onWebSessionUpdated} />
                <div>
                    <p>Current IDEA project: {this.state.project}</p>
                </div>
                <PageList
                    pageTypes={this.state.pageTypes}
                    selected={this.state.selectedPageType}
                    onSelectedPageChanged={this.onSelectedPageChange}
                />

                {this.state.selectedPageType && (
                    <ComponentInstancesList componentInstancesList={this.state.selectedPageType.componentsInstances} />
                )}
            </div>
        );
    }
}

export default App;
