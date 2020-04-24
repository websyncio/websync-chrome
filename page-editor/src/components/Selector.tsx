import React, { Component } from 'react';
import SelectorModel from 'models/Selector';
import SelectorValidator from 'services/SelectorValidator';
import ComponentInstance from '../models/ComponentInstance';

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

    onRename(event) {
        console.log('onRename');
        if (event.target.contentEditable === true) {
            event.target.contentEditable = false;
        } else {
            event.target.contentEditable = true;
        }
    }

    onNameKeyDown(event) {
        const newName = event.target.innerText.trim();
        // if (!event.key.match(/[A-Za-z0-9_$]+/g)) {
        //     event.preventDefault();
        //     return;
        // }
        console.log('onNameKeyDown');
        console.log(event.key);
        if (event.key === 'Enter') {
            this.submitRename(event, newName);
            event.preventDefault();
        } else if (event.key === 'Escape') {
            this.submitRename(event, null);
        } else if (newName.length === 100) {
            event.preventDefault();
        }
    }

    onNameBlur(event) {
        const newName = event.target.innerText.trim();
        console.log('onNameBlur');
        this.submitRename(event, newName);
    }

    submitRename(event, newName) {
        // event.target.contentEditable = false;
        // if (newName === null) {
        //     event.target.innerText = this.props.component.name;
        //     return;
        // } else if (this.props.component.name === newName) {
        //     return;
        // }
        // const param =
        //     this.props.component.initializationAttribute &&
        //     this.props.component.initializationAttribute.parameters.find((p) => p.name === this.props.parameterName);
        // console.log('param.name: ' + param?.name);
        // if (param !== null && param !== undefined) {
        //     param.values[this.props.index].value = newName;
        // }
        // console.log('param.index: ' + this.props.index);
        // const data = {};
        // data['command'] = 'update-component-instance';
        // data['data'] = this.props.component;
        // const json = JSON.stringify(data);
        // console.log('sent ' + json);
        // this.props.onSend(json);
    }

    render() {
        return (
            <span className="parameter-value">
                &apos;
                <span
                    onDoubleClick={(event) => this.onRename(event)}
                    onKeyDown={(event) => this.onNameKeyDown(event)}
                    onBlur={(event) => this.onNameBlur(event)}
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
