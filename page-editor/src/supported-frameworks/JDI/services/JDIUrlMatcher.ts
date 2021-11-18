import PageInstance from 'entities/mst/PageInstance';
import ProjectStore from 'entities/mst/ProjectStore';
import WebSite from 'entities/mst/WebSite';
import { injectable } from 'inversify';
import IUrlMatcher from 'services/IUrlMatcher';

@injectable()
export default class JDIUrlMatcher implements IUrlMatcher {
    matchWebsite(projectStore: ProjectStore, url: string): WebSite {
        return projectStore.webSites.find((ws) => {
            return url.toLowerCase().indexOf(ws.url.toLowerCase()) === 0;
        });
    }

    matchPage(website: WebSite, url: string): PageInstance[] {
        if (!website) {
            return [];
        }
        const pathname = new URL(url.toLowerCase()).pathname;
        const matchingPages: PageInstance[] = [];
        website.pageInstances.forEach((pi: PageInstance) => {
            if (pathname === pi.url) {
                matchingPages.push(pi);
            }
        });
        return matchingPages;
    }
}
