import Attribute from './Attribute';

export default class ComponentInstance {
    id: string;
    componentTypeId: string;
    name: string;
    initializationAttribute: Attribute | null;

    constructor(id: string, componentTypeId: string, name: string, initializationAttribute: Attribute | null) {
        this.id = id;
        this.componentTypeId = componentTypeId;
        this.name = name;
        this.initializationAttribute = initializationAttribute;
    }

    static fromJSON(json: any): ComponentInstance {
        const componentInstence = Object.create(ComponentInstance.prototype);
        return Object.assign(componentInstence, json, {
            initializationAttribute: Attribute.fromJSON(json.initializationAttribute),
        });
    }
}
