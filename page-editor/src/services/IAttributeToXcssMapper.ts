import XcssSelector from 'entities/XcssSelector';
import Attribute from 'entities/mst/Attribute';

export default interface IAttributeToXcssMapper {
    GetXcss(attribute: Attribute): XcssSelector;
    GetAttribute(xcss: XcssSelector): Attribute;
}
