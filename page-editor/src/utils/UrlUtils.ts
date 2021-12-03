import { trimEnd, trimStart } from './StringUtils';

export function concatUrls(rootUrl: string, relativeUrl: string) {
    rootUrl = rootUrl.trim();
    relativeUrl = relativeUrl.trim();
    rootUrl = trimEnd(rootUrl, '/');
    relativeUrl = trimStart(relativeUrl, '/');
    return rootUrl + '/' + relativeUrl;
}
