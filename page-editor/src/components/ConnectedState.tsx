import React, { Component } from 'react';

type ConnState = {
    modules: string[];
};

class ConnectedState extends Component<any, ConnState> {
    render() {
        return (
            <form>
                <p>Select IDEA project:</p>
                {this.props.modules.map((p, index) => (
                    <div className="radio" key={index}>
                        <label key={index}>
                            <input
                                type="radio"
                                key={index}
                                onClick={() => this.props.getProjectWebSession(this.props.modules[index])}
                            />
                            {p}
                        </label>
                    </div>
                ))}
            </form>
        );
    }
}

export default ConnectedState;
