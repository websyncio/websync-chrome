import Attribute from './Attribute';

export default class PageInstance {
    id: string;
    pageTypeId: string;
    name: string;
    initializationAttribute: Attribute | null;

    constructor(id: string, pageTypeId: string, name: string, initializationAttribute: Attribute | null) {
        this.id = id;
        this.pageTypeId = pageTypeId;
        this.name = name;
        this.initializationAttribute = initializationAttribute;
    }

    static fromJSON(json: any): PageInstance {
        const pageInstance = Object.create(PageInstance.prototype);
        return Object.assign(pageInstance, json, {
            initializationAttribute: Attribute.fromJSON(json.initializationAttribute),
        });
    }
}
