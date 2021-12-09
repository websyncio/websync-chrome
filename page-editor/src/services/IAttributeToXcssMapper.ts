import XcssSelector from 'entities/XcssSelector';
import Attribute from 'entities/mst/Attribute';

export default interface IAttributeToXcssMapper {
    GetXcss(attribute: Attribute | null): XcssSelector | null;
    GetAttribute(xcss: XcssSelector): Attribute;
}
