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

    getName() {
        const arr = this.id.split('.');
        return arr[arr.length - 1].trim();
    }

    getTypeName() {
        const arr = this.componentTypeId.split('.');
        return arr[arr.length - 1].trim();
    }

    static fromJSON(json: any): ComponentInstance {
        const componentInstence = Object.create(ComponentInstance.prototype);
        return Object.assign(componentInstence, json, {
            initializationAttribute: Attribute.fromJSON(json.initializationAttribute),
        });
    }
}
