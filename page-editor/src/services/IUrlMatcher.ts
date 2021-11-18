import PageInstance from 'entities/mst/PageInstance';
import ProjectStore from 'entities/mst/ProjectStore';
import WebSite from 'entities/mst/WebSite';

export default interface IUrlMatcher {
    matchWebsite(projectStore: ProjectStore, url: string): WebSite;
    matchPage(website: WebSite, url: string): PageInstance[];
}
