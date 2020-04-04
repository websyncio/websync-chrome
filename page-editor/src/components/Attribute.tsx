import React, { Component } from 'react';
import AttributeModel from '../models/Attribute';

class Attribute extends Component<{ attribute: AttributeModel }> {
    getStatus() {
        return Math.floor(Math.random() * 3);
    }

    valuesList = (values: string[]) => {
        return (
            <span className="parameter-values">
                {values.length > 1 && '{'}
                {values.map((v, index) => {
                    return (
                        <span className="parameter-value" key={index}>
                            `<span className={` ${this.getStatus() < 1 && 'invalid'}`}>{v}</span>`
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
