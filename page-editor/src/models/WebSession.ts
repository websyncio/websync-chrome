import PageType from './PageType';
import ComponentType from './ComponentType';

export default class WebSession {
    project: string;
    pages: PageType[];
    components: ComponentType[];

    constructor(project: string, pages: PageType[], components: ComponentType[]) {
        this.project = project;
        this.pages = pages;
        this.components = components;
    }

    static fromJSON(json: any): WebSession {
        const webSession = Object.create(WebSession.prototype);
        return Object.assign(webSession, json, {
            project: json.project,
            pages: json.pages.map((p) => PageType.fromJSON(p)),
            components: json.pages.map((c) => ComponentType.fromJSON(c)),
        });
    }

    static reviver(key: string, value: any): any {
        return key === '' ? WebSession.fromJSON(value) : value;
    }
}
