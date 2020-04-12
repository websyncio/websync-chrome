import React, { Component } from 'react';
import SelectorModel from 'models/Selector';
import SelectorValidator from 'services/SelectorValidator';

export default class Selector extends Component<{ selector: SelectorModel }, { status: number | undefined }> {
    selectorValidator: SelectorValidator;
    constructor(props) {
        super(props);
        this.state = {
            status: undefined,
        };
        this.selectorValidator = new SelectorValidator(this.onValidated.bind(this));
    }

    componentDidMount() {
        this.selectorValidator.validate(this.props.selector.value);
    }

    onValidated(validationResult: any) {
        this.setState({ status: validationResult.count });
    }

    render() {
        return (
            <span className="parameter-value">
                &apos;
                <span className={` ${this.state.status !== undefined && this.state.status < 1 && 'invalid'}`}>
                    {this.props.selector.value}
                </span>
                &apos;
            </span>
        );
    }
}
