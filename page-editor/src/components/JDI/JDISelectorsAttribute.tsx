import React, { Component } from 'react';
import AttributeModel from 'mst/Attribute';
import ParameterModel from 'mst/Parameter';
import { observer } from 'mobx-react';

interface JDISelectorsAttributeProps {
    attribute: AttributeModel;
    onEditSelector: any;
}

const JDISelectorsAttribute: React.SFC<JDISelectorsAttributeProps> = (props: JDISelectorsAttributeProps) => {
    function getStatus() {
        return Math.floor(Math.random() * 3);
    }

    const valuesList = (parameter: ParameterModel) => {
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

    return (
        <span className="init-attribute">
            {'('}
            {props.attribute.parameters.map((p, index) => (
                <span className="parameter" key={index}>
                    {p.name && [
                        <span className="parameter-name" key={index}>
                            {p.name}
                        </span>,
                        ' = ',
                    ]}
                    {valuesList(p)}
                    {index !== props.attribute.parameters.length - 1 && ', '}
                </span>
            ))}
            {')'}
        </span>
    );
};

export default observer(JDISelectorsAttribute);
