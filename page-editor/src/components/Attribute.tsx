import React, { Component } from 'react';
import AttributeModel from '../models/Attribute';
import Selector from './Selector';
import SelectorModel from 'models/Selector';
import ComponentInstance from '../models/ComponentInstance';
import ParmeterModel from 'models/Parameter';

class Attribute extends Component<{ attribute: AttributeModel; onEditSelector: any }> {
    getStatus() {
        return Math.floor(Math.random() * 3);
    }

    valuesList = (parameter: ParmeterModel) => {
        return (
            <span className="parameter-values">
                {parameter.values.length > 1 && '{'}
                {parameter.values.map((s, index) => {
                    return (
                        <span key={s.value}>
                            <Selector selector={s} onEdit={() => this.props.onEditSelector(parameter, index)} />
                            {index !== parameter.values.length - 1 && ', '}
                        </span>
                    );
                })}
                {parameter.values.length > 1 && '}'}
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
                        {this.valuesList(p)}
                        {index !== this.props.attribute.parameters.length - 1 && ', '}
                    </span>
                ))}
                {')'}
            </span>
        );
    }
}

export default Attribute;
