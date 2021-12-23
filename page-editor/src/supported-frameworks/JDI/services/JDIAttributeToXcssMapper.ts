import XcssSelector from 'entities/XcssSelector';
import Attribute, { AttributeModel } from 'entities/mst/Attribute';
import { GenericAttributes } from '../JDIInitializationAttributes';
import IAttributeToXcssMapper from 'services/IAttributeToXcssMapper';
import { injectable } from 'inversify';

@injectable()
export default class JDIAttributeToXcssMapper implements IAttributeToXcssMapper {
    GetXcss(attribute: Attribute | null): XcssSelector | null {
        // TODO: have to deside what to do if we have several parameters
        if (attribute == null || !attribute.parameters.length || !attribute.parameters[0].values.length) {
            return new XcssSelector('', null, null);
        }
        console.log('GetXcss', attribute.shortName);
        const xcss: string | null = this.ConvertToXcss(attribute.shortName, attribute.parameters[0].values[0]);
        if (!xcss) {
            return new XcssSelector('', null, null);
        }
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
                console.error(
                    `Unable to convert attribute from JDI to Xcss. attribute name: ${attributeName}, attribute value ${attributeValue}`,
                );
                return null;
        }
    }
}
