import IIdeProxy from 'connections/IDE/IIdeProxy';
import IComponentInstance from 'entities/mst/ComponentInstance';

export default interface ComponentInstanceProps {
    ideProxy: IIdeProxy;
    component: IComponentInstance;
    index: number;
    caretPosition: number | null;
    onSelected: () => void;
    onSelectNext: (caretPosition: number) => boolean;
    onSelectPrevious: (caretPosition: number) => boolean;
}
