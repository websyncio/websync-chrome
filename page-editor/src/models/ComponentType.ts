import ComponentInstance from './ComponentInstance';

export default class ComponentType {
    id: string;
    baseComponentType: string;
    componentsInstances: ComponentInstance[];
    constructor(id: string, baseComponentType: string, componentsInstances: ComponentInstance[]) {
        this.id = id;
        this.baseComponentType = baseComponentType;
        this.componentsInstances = componentsInstances;
    }

    static fromJSON(json: any): ComponentType {
        const compoenntType = Object.create(ComponentType.prototype);
        return Object.assign(compoenntType, json, {
            componentsInstances: json.componentsInstances.map((c) => ComponentInstance.fromJSON(c)),
        });
    }
}
