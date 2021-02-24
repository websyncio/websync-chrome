import IIdeProxy from 'connections/IDE/IIdeConnection';
import IComponentInstance from 'entities/mst/ComponentInstance';

export default interface ComponentInstanceProps {
    component: IComponentInstance;
    index: number;
    caretPosition: number | null;
    onSelected: () => void;
    onSelectNext: (caretPosition: number) => boolean;
    onSelectPrevious: (caretPosition: number) => boolean;
}
