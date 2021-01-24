import IIdeProxy from 'interfaces/IIdeProxy';
import IComponentInstance from 'mst/ComponentInstance';

export default interface ComponentInstanceProps {
    ideProxy: IIdeProxy;
    component: IComponentInstance;
    index: number;
    caretPosition: number | null;
    onSelected: () => void;
    onSelectNext: (caretPosition: number) => void;
    onSelectPrevious: (caretPosition: number) => void;
}
