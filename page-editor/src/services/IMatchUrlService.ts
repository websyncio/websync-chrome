import PageInstance from 'entities/mst/PageInstance';
import ProjectStore from 'entities/mst/ProjectStore';
import WebSite from 'entities/mst/WebSite';

export class UrlMatchResult {
    public websiteId: string | null;
    public pageIds: string[];
    constructor(website: string | null, pageIds: string[]) {
        this.websiteId = website;
        this.pageIds = pageIds;
    }
}

export default interface IMatchUrlService {
    matchUrl(url: string): Promise<UrlMatchResult>;
}
