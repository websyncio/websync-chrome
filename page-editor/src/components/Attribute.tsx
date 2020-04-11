import React, { Component } from 'react';
import AttributeModel from '../models/Attribute';
import Selector from './Selector';
import SelectorModel from 'models/Selector';

class Attribute extends Component<{ attribute: AttributeModel }> {
    getStatus() {
        return Math.floor(Math.random() * 3);
    }

    valuesList = (values: SelectorModel[]) => {
        return (
            <span className="parameter-values">
                {values.length > 1 && '{'}
                {values.map((s, index) => {
                    return (
                        <span key={index}>
                            <Selector selector={s} />
                            {index !== values.length - 1 && ', '}
                        </span>
                    );
                })}
                {values.length > 1 && '}'}
            </span>
        );
    };

    render() {
        return (
            <span className="init-attribute">
                {'('}
                {this.props.attribute.parameters.map((p, index) => (
                    <span className="parameter" key={index}>
                        {p.name && [
                            <span className="parameter-name" key={index}>
                                {p.name}
                            </span>,
                            ' = ',
                        ]}
                        {this.valuesList(p.values)}
                        {index !== this.props.attribute.parameters.length - 1 && ', '}
                    </span>
                ))}
                {')'}
            </span>
        );
    }
}

export default Attribute;
