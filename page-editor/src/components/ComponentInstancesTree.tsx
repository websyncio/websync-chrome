import React, { Component } from 'react';
import ComponentInstance from '../models/ComponentInstance';
import 'styles/ComponentInstancesTree.sass';
import Attribute from './Attribute';

class ComponentInstancesList extends Component<{ componentInstancesList: ComponentInstance[]; onSend: any }> {
    onRename(event, component) {
        if (event.target.contentEditable === true) {
            event.target.contentEditable = false;
        } else {
            event.target.contentEditable = true;
        }
    }

    onNameKeyDown(event, component) {
        const newName = event.target.innerText.trim();
        if (!event.key.match(/[a-z_$][A-Za-z0-9_$]+/g)) {
            event.preventDefault();
            return;
        }
        if (event.key === 'Enter') {
            this.submitRename(event, component, newName);
            event.preventDefault();
        } else if (event.key === 'Escape') {
            this.submitRename(event, component, null);
        } else if (newName.length === 100) {
            event.preventDefault();
        }
    }

    onNameBlur(event, component) {
        const newName = event.target.innerText.trim();
        this.submitRename(event, component, newName);
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

    render() {
        const { componentInstancesList } = this.props;

        return (
            <div className="components-tree">
                <ul>
                    {componentInstancesList.map((component, key) => [
                        <li key={key}>
                            <span className="type-name">{component.getTypeName()}</span>
                            <span
                                className={`field-name`}
                                title="Double Click to Edit Name"
                                onDoubleClick={(event) => this.onRename(event, component)}
                                onKeyDown={(event) => this.onNameKeyDown(event, component)}
                                onBlur={(event) => this.onNameBlur(event, component)}
                            >
                                {component.getName()}
                            </span>
                            {component.initializationAttribute && (
                                <Attribute
                                    component={component}
                                    attribute={component.initializationAttribute}
                                    onSend={this.props.onSend}
                                />
                            )}
                        </li>,
                        // <ComponentInstancesList componentInstancesList={component.selectedPageType.componentsInstances}/>
                    ])}
                </ul>
            </div>
        );
    }
}

export default ComponentInstancesList;
