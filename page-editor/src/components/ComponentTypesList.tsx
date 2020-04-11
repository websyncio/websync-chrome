import React, { Component } from 'react';
import ComponentType from '../models/ComponentType';

type PageListProps = {
    componentTypesList: Array<ComponentType>;
};

class ComponentTypesList extends Component<PageListProps> {
    render() {
        const { componentTypesList } = this.props;

        const items = componentTypesList.map((item) => {
            return (
                <li value={item.id} key={item.id}>
                    {item.id}
                </li>
            );
        });
        return (
            <div>
                <p>All components types are: </p>
                <ul>{items}</ul>
            </div>
        );
    }
}

export default ComponentTypesList;
