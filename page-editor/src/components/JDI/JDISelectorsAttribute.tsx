import React, { Component } from 'react';
import AttributeModel from 'entities/mst/Attribute';
import ParameterModel from 'entities/mst/Parameter';
import { observer } from 'mobx-react';
import Selector from 'components/PageObjectEditor/Selector';
import './JDIAttribute.sass';
import { SelectorModel } from 'entities/mst/Selector';

interface JDISelectorsAttributeProps {
    attribute: AttributeModel;
    onEditSelector: any;
    onValidated: (hasError: boolean) => void;
}

const JDISelectorsAttribute: React.FC<JDISelectorsAttributeProps> = ({
    attribute,
    onEditSelector,
    onValidated,
}: JDISelectorsAttributeProps) => {
    function getStatus() {
        return Math.floor(Math.random() * 3);
    }

    function getSelector(value: string) {
        return SelectorModel.create({
            type: attribute.name,
            value: value,
        });
    }

    const valuesList = (parameter: ParameterModel) => {
        return (
            <span className="parameter-values">
                {parameter.values.length > 1 && '{'}
                {parameter.values.map((v, index) => {
                    return (
                        <>
                            <Selector
                                parameterName={parameter.name}
                                selector={getSelector(v)}
                                onEdit={() => onEditSelector(parameter, index)}
                                onValidated={onValidated}
                            />
                            {index !== parameter.values.length - 1 && ', '}
                        </>
                    );
                })}
                {parameter.values.length > 1 && '}'}
            </span>
        );
    };

    return (
        <span className="init-attribute">
            {'('}
            {attribute.parameters.map((p, index) => (
                <span className="parameter" key={index}>
                    {p.name && [
                        <span className="parameter-name" key={index}>
                            {p.name}
                        </span>,
                        ' = ',
                    ]}
                    {valuesList(p)}
                    {index !== attribute.parameters.length - 1 && ', '}
                </span>
            ))}
            {')'}
        </span>
    );
};

export default observer(JDISelectorsAttribute);
