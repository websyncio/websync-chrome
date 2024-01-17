import VSConnection from 'connections/IDE/VSConnection';
import { RootStore } from 'context';
import PageInstance from 'entities/mst/PageInstance';
import ProjectStore from 'entities/mst/ProjectStore';
import WebSite from 'entities/mst/WebSite';
import { inject, injectable } from 'inversify';
import TYPES from 'inversify.types';
import IMatchUrlService, { UrlMatchResult } from 'services/IMatchUrlService';
import { trimStart } from 'utils/StringUtils';

@injectable()
export default class JDIMatchUrlService implements IMatchUrlService {
    constructor(@inject(TYPES.IDEAConnection) private ideaConnection: VSConnection) {}

    async matchUrl(url: string): Promise<UrlMatchResult> {
        if (!RootStore.uiStore.selectedProject) {
            throw new Error('Project not set');
        }
        return this.ideaConnection.matchUrl(RootStore.uiStore.selectedProject, url) as Promise<UrlMatchResult>;
        // let pathname: string;
        // try {
        //     // url parameter has full url
        //     pathname = new URL(url.toLowerCase()).pathname;
        //     const websitePathname = new URL(website.url.toLowerCase()).pathname;
        //     if (pathname.startsWith(websitePathname)) {
        //         pathname = pathname.substring(websitePathname.length);
        //     }
        // } catch (TypeError) {
        //     // url parameter has absolute path
        //     pathname = url;
        // }
        // pathname = trimStart(pathname, '/').toLowerCase();
        // const matchingPages: PageInstance[] = [];
        // website.pageInstances.forEach((pi: PageInstance) => {
        //     if (this.urlMatchesPattern(pathname, trimStart(pi.url, '/').toLowerCase())) {
        //         matchingPages.push(pi);
        //     }
        // });
        // return matchingPages;
    }

    urlMatchesPattern(url: string, urlPattern: string): boolean {
        const isDynamicUrl = urlPattern.includes('{0}');
        if (isDynamicUrl) {
            const urlRegexPattern = '^' + urlPattern.replace(/{\d+}/g, '[^/]+') + '$';
            return new RegExp(urlRegexPattern).test(url);
        } else {
            return url === urlPattern;
        }
    }
}
