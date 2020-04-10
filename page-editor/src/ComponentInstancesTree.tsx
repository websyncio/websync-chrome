import React, { Component } from 'react';
import ComponentInstance from './models/ComponentInstance';
import './styles/ComponentInstancesTree.sass';
import Attribute from './components/Attribute';

class ComponentInstancesList extends Component<{ componentInstancesList: ComponentInstance[]; onSend: any }> {
    constructor(props) {
        super(props);
        this.state = {
            componentInstancesList: [],
        };
    }

    onRename(event, component) {
        console.log('rename');
        if (event.target.contentEditable == true) {
            event.target.contentEditable = false;
        } else {
            event.target.contentEditable = true;
        }
        console.log('editable=' + event.target.contentEditable);
    }

    onNameKeyDown(event, component) {
        console.log('nameKeyDown');
        const newName = event.target.innerText.trim();
        console.log(event.key + ':' + event.keyCode);
        if (!event.key.match(/[A-Za-z0-9_$]+/g)) {
            event.preventDefault();
            return;
        }
        if (event.key === 'Enter') {
            this.submitRename(event, component, newName);
            event.preventDefault();
        } else if (event.key === 'Escape') {
            this.submitRename(event, component, null);
        } else if (newName.length == 100) {
            event.preventDefault();
        }
    }

    onNameBlur(event, component) {
        console.log('blur');
        const newName = event.target.innerText.trim();
        this.submitRename(event, component, newName);
    }

    submitRename(event, component, newName) {
        console.log('submitRename');
        event.target.contentEditable = false;
        if (newName === null) {
            event.target.innerText = component.name;
            return;
        } else if (component.name === newName) {
            return;
        }
        component.name = newName;
        const json = JSON.stringify(component);
        console.log('sent ' + json);
        this.props.onSend(json);
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
                                <Attribute attribute={component.initializationAttribute} />
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
