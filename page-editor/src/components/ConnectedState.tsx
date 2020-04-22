import React, { Component } from 'react';
import Loader from '../../public/loader-64x64.gif';

type ConnState = {
    modules: string[];
};

class ConnectedState extends Component<any, ConnState> {
    render() {
        return (
            <form>
                {this.props.modules.length === 0 ? (
                    <img src={Loader} />
                ) : (
                    <div>
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
                    </div>
                )}
            </form>
        );
    }
}

export default ConnectedState;
