import React, { Component } from 'react';
import Selector from './Selector';
import ComponentInstance from 'mst/ComponentInstance';
import AttributeModel from 'mst/Attribute';
import ParameterModel from 'mst/Parameter';

class Attribute extends Component<{ attribute: AttributeModel; onEditSelector: any }> {
    getStatus() {
        return Math.floor(Math.random() * 3);
    }

    valuesList = (parameter: ParameterModel) => {
        return (
            <span className="parameter-values">
                {parameter.values.length > 1 && '{'}
                {parameter.values.map((s, index) => {
                    return (
                        <span key={parameter.name || ''}>
                            {/* <Selector selector={s} onEdit={() => this.props.onEditSelector(s, index)} /> */}
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
