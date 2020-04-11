import React, { Component } from 'react';
import SelectorModel from 'models/Selector';
import SelectorValidator from 'services/SelectorValidator';

export default class Selector extends Component<{ selector: SelectorModel }> {
    render() {
        return (
            <span className="parameter-value">
                `
                <span
                    className={` ${
                        this.props.selector.status !== undefined && this.props.selector.status < 1 && 'invalid'
                    }`}
                >
                    {this.props.selector.value}
                </span>
                `
            </span>
        );
    }
}
