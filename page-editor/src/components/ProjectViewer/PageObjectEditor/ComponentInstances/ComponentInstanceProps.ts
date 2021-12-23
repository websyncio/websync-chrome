// import IIdeProxy from 'connections/IDE/IIdeConnection';
import ComponentInstance from 'entities/mst/ComponentInstance';
import IComponentsContainer from 'entities/mst/ComponentsContainer';
import XcssSelector from 'entities/XcssSelector';

export default interface ComponentInstanceProps {
    container: IComponentsContainer;
    componentInstance: ComponentInstance;
    parentComponentInstance: ComponentInstance | null;
    rootSelector: XcssSelector | null;
    isSelected: boolean;
    index: number;
    initialCaretPosition: number | null;
    onSelectedStateChange: (isSelected: boolean) => void;
    onSelectNext: (caretPosition: number) => boolean;
    onSelectPrevious: (caretPosition: number) => boolean;
}
