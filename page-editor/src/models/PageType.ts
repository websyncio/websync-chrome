import ComponentInstance from './ComponentInstance';

export default class PageType {
    id: string;
    basePageTypeId: string;
    url: string;
    componentsInstances: ComponentInstance[];
    constructor(id: string, basePageTypeId: string, url: string, componentsInstances: ComponentInstance[]) {
        this.id = id;
        this.basePageTypeId = basePageTypeId;
        this.url = url;
        this.componentsInstances = componentsInstances;
    }

    getName() {
        const arr = this.id.split('.');
        return arr[arr.length - 1];
    }

    static fromJSON(json: any): PageType {
        const pageType = Object.create(PageType.prototype);
        return Object.assign(pageType, json, {
            componentsInstances: json.componentsInstances.map((c) => ComponentInstance.fromJSON(c)),
        });
    }
}
