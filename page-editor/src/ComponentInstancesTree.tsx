import React, { Component } from 'react';
import ComponentInstance from './models/ComponentInstance';
import './styles/ComponentInstancesTree.sass';
import Attribute from './components/Attribute';

class ComponentInstancesList extends Component<{ componentInstancesList: ComponentInstance[] }> {
    constructor(props) {
        super(props);
        this.state = {
            componentInstancesList: [],
        };
    }

    render() {
        const { componentInstancesList } = this.props;

        return (
            <div className="components-tree">
                <ul>
                    {componentInstancesList.map((component, key) => [
                        <li key={key}>
                            <span className="type-name">{component.getTypeName()}</span>
                            <span className="field-name">{component.getName()}</span>
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
