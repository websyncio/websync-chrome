import React, { Component } from 'react';

type ConnState = {
    projects: string[];
};

class ConnectedState extends Component<any, ConnState> {
    render() {
        return (
            <form>
                <p>Select IDEA project:</p>
                {this.props.projects.map((p, index) => (
                    <div className="radio" key={index}>
                        <label key={index}>
                            <input
                                type="radio"
                                key={index}
                                onClick={() => this.props.getProjectWebSession(this.props.projects[index])}
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
