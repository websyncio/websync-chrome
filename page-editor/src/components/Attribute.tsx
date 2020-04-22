import React, { Component } from 'react';
import AttributeModel from '../models/Attribute';
import Selector from './Selector';
import SelectorModel from 'models/Selector';
import ComponentInstance from '../models/ComponentInstance';

class Attribute extends Component<{ component: ComponentInstance; attribute: AttributeModel; onSend: any }> {
    getStatus() {
        return Math.floor(Math.random() * 3);
    }

    valuesList = (parameterName: string | undefined, i: number, values: SelectorModel[]) => {
        return (
            <span className="parameter-values">
                {values.length > 1 && '{'}
                {values.map((s, index) => {
                    return (
                        <span key={index}>
                            <Selector
                                selector={s}
                                parameterName={parameterName}
                                index={i}
                                component={this.props.component}
                                onSend={this.props.onSend}
                            />
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
                {this.props.attribute &&
                    this.props.attribute.parameters.map((p, index) => (
                        <span className="parameter" key={index}>
                            {p.name && [
                                <span className="parameter-name" key={index}>
                                    {p.name}
                                </span>,
                                ' = ',
                            ]}
                            {this.valuesList(p.name, index, p.values)}
                            {index !== this.props.attribute.parameters.length - 1 && ', '}
                        </span>
                    ))}
                {')'}
            </span>
        );
    }
}

export default Attribute;
