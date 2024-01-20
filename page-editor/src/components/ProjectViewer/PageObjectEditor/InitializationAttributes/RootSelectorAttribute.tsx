import React from 'react';
import AttributeModel from 'entities/mst/Attribute';
import ParameterModel from 'entities/mst/Parameter';
import { observer } from 'mobx-react';
import Selector from 'components/ProjectViewer/PageObjectEditor/InitializationAttributes/Selector';
import './RootSelectorAttribute.sass';
import { DependencyContainer } from 'inversify.config';
import XcssSelector from 'entities/XcssSelector';
import TYPES from 'inversify.types';

interface Props {
    attribute: AttributeModel;
    rootSelector: XcssSelector | null;
    onEditSelector: any;
    onValidated: (hasError: boolean) => void;
}

const RootSelectorAttribute: React.FC<Props> = ({ attribute, rootSelector, onEditSelector, onValidated }: Props) => {
    const constructorArgument = (constructorArgument: string) => {
        const selector: XcssSelector | null = attribute.rootSelectorXcss;
        if (selector) {
            selector.root = rootSelector;
        }
        return (
            <span className="parameter-values">
                {/* {parameter.values.length > 1 && '{'} */}
                {/* {constructorArgument.map((v, index) => { */}
                <Selector
                    // parameterName={constructorArgument.name}
                    selector={selector}
                    onEdit={() => onEditSelector(constructorArgument, 0)}
                    onValidated={onValidated}
                />
                {/* {index !== constructorArgument.values.length - 1 && ', '} */}
                {/* })} */}
                {/* {parameter.values.length > 1 && '}'} */}
            </span>
        );
    };

    return (
        <span className="init-attribute">
            {'('}
            {attribute.constructorArguments.map((p, index) => (
                <span className="parameter" key={index}>
                    {constructorArgument(p)}
                    {index !== attribute.constructorArguments.length - 1 && ', '}
                </span>
            ))}
            {/* {attribute.namedArguments.map((p, index) => (
                <span className="parameter" key={index}>
                    {p.name && [
                        <span className="parameter-name" key={index}>
                            {p.name}
                        </span>,
                        ' = ',
                    ]}
                    {constructorArgument(p)}
                    {index !== attribute.parameters.length - 1 && ', '}
                </span>
            ))} */}
            {')'}
        </span>
    );
};

export default observer(RootSelectorAttribute);
