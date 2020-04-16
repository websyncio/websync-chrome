import React, { Component } from 'react';
import SelectorModel from 'models/Selector';
import SelectorValidator from 'services/SelectorValidator';

export default class Selector extends Component<
    { selector: SelectorModel; onEdit: any },
    { status: number | undefined }
> {
    selectorValidator: SelectorValidator = new SelectorValidator();

    constructor(props) {
        super(props);
        this.state = {
            status: undefined,
        };
    }

    componentDidMount() {
        this.selectorValidator.validate(this.props.selector.value, this.onValidated.bind(this));
    }

    onValidated(validationResult: any) {
        console.log(this.props.selector.value + ': ' + validationResult.count);
        this.setState({ status: validationResult.count });
    }

    render() {
        return (
            <span className="parameter-value">
                &apos;
                <span
                    className={` ${this.state.status !== undefined && this.state.status < 1 && 'invalid'}`}
                    onClick={this.props.onEdit}
                >
                    {this.props.selector.value}
                </span>
                &apos;
            </span>
        );
    }
}
