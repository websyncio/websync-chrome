import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
// import Message from '../models/Message';
import ConnectedState from './ConnectedState';
import DisconnectedState from './DisconnectedState';
import WebSession from '../models/WebSession';

import 'styles/Connection.sass';

type State = {
    isConnected: boolean;
    modules: Array<string>;
    selected: string;
};

type ConnectionProps = {
    onWebSessionUpdated: any;
    onSelectedPageChange: any;
    onSelectedProject: any;
    onPageUpdated: any;
    onComponentUpdated: any;
};

class Connection extends Component<ConnectionProps, State> {
    timeout = 250;
    sendHandler;

    constructor(props) {
        super(props);
        this.state = {
            isConnected: false,
            modules: [],
            selected: '',
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

            client.send(JSON.stringify({ type: 'get-modules' }));

            this.setState({ modules: [] });
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
                // const message = JSON.parse(e.data, Message.reviver);
                const message = JSON.parse(e.data);
                if (message.hasOwnProperty('status') && message.status !== 0) {
                    console.log('error occured:', message.error);
                    return;
                }
                switch (message.type) {
                    case 'get-modules-response':
                        console.log('Modules received: ', message.data);
                        return this.setState({ modules: message.data });
                    case 'get-module-response':
                        console.log('Module received: ', message.data);
                        const webSession = WebSession.fromJSON(message.data);
                        this.setState({ selected: webSession.module });
                        this.props.onSelectedProject(webSession);
                        return;
                    case 'show-page':
                        console.log('page is opened:', message.className);
                        return this.props.onSelectedPageChange(null, message.className);
                    case 'update-component':
                        this.props.onComponentUpdated(message.data);
                        return;
                    case 'update-page':
                        console.log('page is updated:', message.data);
                        this.props.onPageUpdated(message.data);
                        return;
                    default:
                        console.log('no message type, ignored: ', e.data);
                        return;
                }
            } catch (ex) {
                console.log('Message received "' + e.data + '"');
                console.log(ex);
            }
        };

        return (message) => {
            client.send(message);
        };
    };

    check = () => {
        const { isConnected } = this.state;
        if (!isConnected) this.componentDidMount();
    };

    getProjectWebSession = (module: string) => {
        this.setState({ selected: module });
        this.sendHandler(JSON.stringify({ type: 'get-module', moduleName: module }));
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
                            modules={this.state.modules}
                            getProjectWebSession={(module: string) => this.getProjectWebSession(module)}
                        />
                    ) : (
                        <p />
                    )
                ) : (
                    <DisconnectedState />
                )}
            </div>
        );
    }
}

export default Connection;
