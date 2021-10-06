// import IIdeProxy from 'connections/IDE/IIdeConnection';
import IComponentInstance from 'entities/mst/ComponentInstance';

export default interface ComponentInstanceProps {
    component: IComponentInstance;
    isSelected: boolean;
    index: number;
    initialCaretPosition: number | null;
    onSelectedStateChange: (isSelected: boolean) => void;
    onSelectNext: (caretPosition: number) => boolean;
    onSelectPrevious: (caretPosition: number) => boolean;
}
