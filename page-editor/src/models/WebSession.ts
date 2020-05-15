import PageType from './PageType';
import ComponentType from './ComponentType';

export default class WebSession {
    module: string;
    pages: PageType[];
    components: ComponentType[];

    updatePage(json: any): void {
        const newPage = PageType.fromJSON(json);
        const indexForNewOne = this.pages.findIndex((p) => p.id === newPage.id);
        this.pages[indexForNewOne] = newPage;
    }

    updateComponent(json: any): void {
        const newComponent = ComponentType.fromJSON(json);
        const indexForNewOne = this.components.findIndex((c) => c.id === newComponent.id);
        this.components[indexForNewOne] = newComponent;
    }

    constructor(module: string, pages: PageType[], components: ComponentType[]) {
        this.module = module;
        this.pages = pages;
        this.components = components;
    }

    static fromJSON(json: any): WebSession {
        const webSession = Object.create(WebSession.prototype);
        return Object.assign(webSession, json, {
            module: json.module,
            pages: json.pages.map((p) => PageType.fromJSON(p)),
            components: json.pages.map((c) => ComponentType.fromJSON(c)),
        });
    }

    // static reviver(key: string, value: any): any {
    //     return key === '' ? WebSession.fromJSON(value) : value;
    // }
}
