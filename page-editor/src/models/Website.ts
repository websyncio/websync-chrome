import PageInstance from './PageInstance';

export default class Website {
    id: string;
    baseWebsiteId: string;
    url: string;
    pageInstances: PageInstance[];
    constructor(id: string, basePageTypeId: string, url: string, pageInstances: PageInstance[]) {
        this.id = id;
        this.baseWebsiteId = basePageTypeId;
        this.url = url;
        this.pageInstances = pageInstances;
    }

    static fromJSON(json: any): Website {
        const website = Object.create(Website.prototype);
        return Object.assign(website, json, {
            pageInstances: json.pageInstances.map((c) => PageInstance.fromJSON(c)),
        });
    }
}
