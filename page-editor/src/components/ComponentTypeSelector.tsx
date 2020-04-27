import React, { Component } from 'react';
import ComponentType from 'models/ComponentType';

export default class ComponentTypeSelector extends Component<{ onSelected: Function }> {
    componentTypes: Array<ComponentType> = [];

    items = this.componentTypes.map((item) => {
        return (
            <li value={item.id} key={item.id}>
                {item.id}
            </li>
        );
    });

    render() {
        return (
            <div>
                Component Types list
                <ul>{this.items}</ul>
            </div>
        );
    }
}
