import React from 'react';
import AttributeModel from 'entities/mst/Attribute';
import ParameterModel from 'entities/mst/Parameter';
import { observer } from 'mobx-react';
import Selector from 'components/PageObjectEditor/InitializationAttributes/Selector';
import './RootSelectorAttribute.sass';
import IAttributeToXcssMapper from 'services/IAttributeToXcssMapper';
import { DependencyContainer, TYPES } from 'inversify.config';

interface Props {
    attribute: AttributeModel;
    onEditSelector: any;
    onValidated: (hasError: boolean) => void;
}

const RootSelectorAttribute: React.FC<Props> = ({ attribute, onEditSelector, onValidated }: Props) => {
    const attributeToXcssMapper: IAttributeToXcssMapper = DependencyContainer.get<IAttributeToXcssMapper>(
        TYPES.AttributeToXcssMapper,
    );

    const valuesList = (parameter: ParameterModel) => {
        return (
            <span className="parameter-values">
                {parameter.values.length > 1 && '{'}
                {parameter.values.map((v, index) => {
                    return (
                        <>
                            <Selector
                                parameterName={parameter.name}
                                selector={attributeToXcssMapper.GetXcss(attribute)}
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

export default observer(RootSelectorAttribute);
