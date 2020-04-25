import React, { Component } from 'react';
import ComponentInstanceModel from 'models/ComponentInstance';
import ParameterModel from 'models/Parameter';
import Attribute from './Attribute';
import SelectorEditorProxy from 'services/SelectorEditorProxy';
import { Popup } from 'semantic-ui-react';

export default class ComponentInstance extends Component<{ component: ComponentInstanceModel; onSend: any }> {
    onRename(event) {
        if (event.target.contentEditable === true) {
            event.target.contentEditable = false;
        } else {
            event.target.contentEditable = true;
        }
    }

    onNameKeyDown(event) {
        const newName = event.target.innerText.trim();
        if (!event.key.match(/[A-Za-z0-9_$]+/g)) {
            event.preventDefault();
            return;
        }
        if (event.key === 'Enter') {
            this.submitRename(event, this.props.component, newName);
            event.preventDefault();
        } else if (event.key === 'Escape') {
            this.submitRename(event, this.props.component, null);
        } else if (newName.length === 100) {
            event.preventDefault();
        }
    }

    onNameBlur(event) {
        const newName = event.target.innerText.trim();
        this.submitRename(event, this.props.component, newName);
    }

    submitRename(event, component, newName) {
        event.target.contentEditable = false;
        if (newName === null) {
            event.target.innerText = component.name;
            return;
        } else if (component.name === newName) {
            return;
        }

        component.name = newName;

        const data = {};
        data['command'] = 'update-component-instance';
        data['data'] = component;
        const json = JSON.stringify(data);
        console.log('sent ' + json);
        this.props.onSend(json);

        const lastDot = component.id.lastIndexOf('.');
        component.id = component.id.substring(0, lastDot + 1) + newName;
    }

    editSelector = (component: ComponentInstanceModel, parameter: ParameterModel, valueIndex: number) => {
        SelectorEditorProxy.instance().sendMessage('edit-component-selector', {
            componentId: component.id,
            componentName: component.name,
            parameterName: parameter.name,
            parameterValueIndex: valueIndex,
            selector: parameter.values[valueIndex].value,
        });
    };

    onSelectorEdited(parameterName, valueIndex, newValue) {
        //this.props.component.
    }

    render() {
        return (
            <span>
                <Popup
                    trigger={<span className="type-name">{this.props.component.getTypeName()}</span>}
                    flowing
                    pinned
                    hoverable
                    position="bottom left"
                    on="click"
                >
                    <div>List of Component types</div>
                </Popup>
                <span
                    className={`field-name`}
                    title="Double Click to Edit Name"
                    onDoubleClick={this.onRename}
                    onKeyDown={this.onNameKeyDown}
                    onBlur={this.onNameBlur}
                >
                    {this.props.component.getName()}
                </span>
                {this.props.component.initializationAttribute && (
                    <Attribute
                        attribute={this.props.component.initializationAttribute}
                        onEditSelector={(parameter, valueIndex) =>
                            this.editSelector(this.props.component, parameter, valueIndex)
                        }
                    />
                )}
            </span>
        );
    }
}