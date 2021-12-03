import PageInstance from 'entities/mst/PageInstance';
import ProjectStore from 'entities/mst/ProjectStore';
import WebSite from 'entities/mst/WebSite';
import { injectable } from 'inversify';
import IUrlMatcher from 'services/IUrlMatcher';
import { trimStart } from 'utils/StringUtils';

@injectable()
export default class JDIUrlMatcher implements IUrlMatcher {
    matchWebsite(projectStore: ProjectStore, url: string): WebSite {
        return projectStore.webSites.find((ws) => {
            return url.toLowerCase().startsWith(ws.url.toLowerCase());
        });
    }

    matchPage(website: WebSite, url: string): PageInstance[] {
        if (!website) {
            return [];
        }
        let pathname: string;
        try {
            // url parameter has full url
            pathname = new URL(url.toLowerCase()).pathname;
            const websitePathname = new URL(website.url.toLowerCase()).pathname;
            if (pathname.startsWith(websitePathname)) {
                pathname = pathname.substring(websitePathname.length);
            }
        } catch (TypeError) {
            // url parameter has absolute path
            pathname = url;
        }
        pathname = trimStart(pathname, '/').toLowerCase();
        const matchingPages: PageInstance[] = [];
        website.pageInstances.forEach((pi: PageInstance) => {
            if (pathname === trimStart(pi.url, '/').toLowerCase()) {
                matchingPages.push(pi);
            }
        });
        return matchingPages;
    }
}
