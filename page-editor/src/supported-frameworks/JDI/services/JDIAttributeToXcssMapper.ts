import XcssSelector from 'entities/XcssSelector';
import Attribute, { AttributeModel } from 'entities/mst/Attribute';
import { GenericAttributes } from '../JDIInitializationAttributes';
import IAttributeToXcssMapper from 'services/IAttributeToXcssMapper';
import { injectable } from 'inversify';

@injectable()
export default class JDIAttributeToXcssMapper implements IAttributeToXcssMapper {
    GetXcss(attribute: Attribute): XcssSelector {
        const xcss: string = this.ConvertToXcss(attribute.shortName, attribute.parameters[0].values[0]);
        return new XcssSelector(xcss, null, null);
    }

    GetAttribute(xcssSelector: XcssSelector): Attribute {
        return AttributeModel.create({
            name: 'UI',
            parameters: [
                {
                    values: [xcssSelector.xcss],
                },
            ],
        });
    }

    ConvertToXcss(attributeName: string, attributeValue: string) {
        switch (attributeName) {
            case GenericAttributes.UI:
            case GenericAttributes.XPath:
            case GenericAttributes.Css:
            case GenericAttributes.FindBy:
                return attributeValue;
            case GenericAttributes.ByText:
                return `['${attributeValue}']`;
            case GenericAttributes.WithText:
                return `[~'${attributeValue}']`;
            default:
                throw new Error(
                    `Unable to convert attribute from JDI to Xcss. attribute name: ${attributeName}, attribute value ${attributeValue}`,
                );
        }
    }
}
