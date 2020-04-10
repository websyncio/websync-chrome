import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import WebSession from './models/WebSession';
import ConnectedState from './components/ConnectedState';
import DisconnectedState from './components/DisconnectedState';

import './styles/Connection.sass';

type State = {
    isConnected: boolean;
    projects: [];
    selected: string;
    dataToSend: string;
};

type ConnectionProps = {
    onWebSessionUpdated: any;
};

class Connection extends Component<ConnectionProps, State> {
    timeout = 250;
    sendHandler;

    constructor(props) {
        super(props);
        this.state = {
            isConnected: false,
            projects: [],
            selected: '',
            dataToSend: '',
        };
    }

    componentDidMount() {
        this.sendHandler = this.connect();
    }

    connect = () => {
        const client = new W3CWebSocket('ws://localhost:1804/');
        let isConnection = false;

        client.onerror = () => {
            console.log('Connection Error');
        };

        client.onopen = () => {
            console.log('WebSocket Client Connected');
            isConnection = true;

            function sendCommand(command: string) {
                client.send(command);
            }

            sendCommand('get-projects');
            // sendCommand('get-web-session');

            this.setState({ isConnected: isConnection });
        };

        client.onclose = () => {
            console.log('echo-protocol Client Closed');
            isConnection = false;
            this.setState({ isConnected: isConnection });

            setTimeout(this.check, Math.min(10000, this.timeout));
        };

        client.onmessage = (e) => {
            try {
                const message = JSON.parse(e.data);
                if (message.projects) {
                    this.setState({ projects: message.projects });
                    return;
                }
                const webSession = JSON.parse(e.data, WebSession.reviver);
                console.log('WebSession received', webSession);
                this.props.onWebSessionUpdated(webSession);
            } catch (ex) {
                console.log('Message received', e.data);
            }

            // console.log("Received: '" + e.data + "'");
            // if (e.data.charAt(0) === "{") {
            //     let data: string = e.data;
            //     let pageObject = JSON.parse(data);
            //     let pages: PageType[] = pageObject.pages as PageType[];
            //     this.setState({pageTypes: pages});
            // }
            // }
        };

        return (message) => {
            console.log('dfsafs');
            client.send(message);
        };
    };

    check = () => {
        const { isConnected } = this.state;
        if (!isConnected) this.componentDidMount();
    };

    getProjectWebSession = (project: string) => {
        this.setState({ selected: project });
        this.sendHandler('get-project-web-session:' + project);
    };

    render() {
        return (
            <div
                className={`connection ${
                    this.state.isConnected ? (this.state.selected === '' ? 'selecting' : 'connected') : 'disconnected'
                }`}
            >
                {this.state.isConnected ? (
                    this.state.selected === '' ? (
                        <ConnectedState
                            projects={this.state.projects}
                            getProjectWebSession={(project: string) => this.getProjectWebSession(project)}
                        />
                    ) : (
                        <p />
                    )
                ) : (
                    <DisconnectedState />
                )}

                {this.state.dataToSend ? this.sendHandler(this.state.dataToSend) : ''}
            </div>
        );
    }
}

export default Connection;
