import React, { Component } from 'react';
import AttributeModel from 'mst/Attribute';
import ParameterModel from 'mst/Parameter';
import { observer } from 'mobx-react';
import { Scss } from 'components/ScssBuilder';
import Selector from 'components/ProjectViewer/Editor/Selector';
import SelectorModel from 'models/Selector';
import './JDIAttribute.sass';

interface JDISelectorsAttributeProps {
    attribute: AttributeModel;
    onEditSelector: any;
    onValidationError: () => void;
}

const JDISelectorsAttribute: React.FC<JDISelectorsAttributeProps> = ({
    attribute,
    onEditSelector,
    onValidationError,
}: JDISelectorsAttributeProps) => {
    function getStatus() {
        return Math.floor(Math.random() * 3);
    }

    function getSelector(value: string) {
        return new SelectorModel(attribute.name, value);
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
                                onValidationError={onValidationError}
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
