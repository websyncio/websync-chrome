import React, { Component } from 'react';
import ComponentInstanceModel from 'models/ComponentInstance';
import ComponentInstance from 'components/ComponentInstance';

import 'styles/ComponentInstancesTree.sass';

export default class ComponentInstancesTree extends Component<{
    componentInstancesList: ComponentInstanceModel[];
    onSend: any;
}> {
    render() {
        const { componentInstancesList } = this.props;

        return (
            <div className="components-tree">
                <ul>
                    {componentInstancesList.map((component, key) => [
                        <li key={key}>
                            <ComponentInstance component={component} onSend={this.props.onSend} />
                        </li>,
                        // <ComponentInstancesList componentInstancesList={component.selectedPageType.componentsInstances}/>
                    ])}
                </ul>
            </div>
        );
    }
}
