import { InitializationAttributesProps } from 'components/FrameworkComponentsProps';
import Attribute from 'entities/mst/Attribute';

export interface IFrameworkComponentsProvider {
    getInitializationAttributeView(attribute: Attribute): React.ComponentType<InitializationAttributesProps>;
}
