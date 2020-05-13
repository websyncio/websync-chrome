import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import Message from '../models/Message';
import ConnectedState from './ConnectedState';
import DisconnectedState from './DisconnectedState';

import 'styles/Connection.sass';

type State = {
    isConnected: boolean;
    modules: Array<string>;
    selected: string;
};

type ConnectionProps = {
    onWebSessionUpdated: any;
    onSelectedPageChange: any;
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

            const data = {};
            data['command'] = 'get-modules';
            client.send(JSON.stringify(data));

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
                const message = JSON.parse(e.data, Message.reviver);
                if (message.status !== 0) {
                    console.log('error message ===', message.data);
                    return;
                }
                if (message.command === 'update-component') {
                    this.props.onComponentUpdated(message.data);
                    return;
                }
                if (message.command === 'update-page') {
                    this.props.onPageUpdated(message.data);
                    return;
                }
                if (message.data.modules) {
                    this.setState({ modules: message.data.modules });
                    return;
                }
                if (message.type === 'PageType') {
                    this.props.onSelectedPageChange(message.data);
                    console.log('New page is opened:', message.data);
                } else {
                    const webSession = message.data;
                    console.log('WebSession received:', webSession);

                    const modules = [webSession.module];
                    console.log(modules);
                    this.setState({ modules: modules });
                    this.props.onWebSessionUpdated(webSession);
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
        // this.sendHandler('get-project-web-session:' + module);
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
