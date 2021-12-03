import { types, Instance, getParentOfType } from 'mobx-state-tree';
import { concatUrls } from 'utils/UrlUtils';
import { PageTypeModel } from './PageType';
import { SelectableModel } from './Selectable';
import WebSite, { WebSiteModel } from './WebSite';

export const PageInstanceModel = types
    .compose(
        SelectableModel,
        types.model({
            id: types.identifier,
            pageType: types.reference(PageTypeModel),
            name: types.string,
            url: types.optional(types.string, ''),
        }),
    )
    .views((self) => ({
        get website(): WebSite {
            return getParentOfType(self, WebSiteModel);
        },
        get fullUrl(): string {
            const website = getParentOfType(self, WebSiteModel);
            return concatUrls(website.url, self.url);
        },
    }))
    .actions((self) => ({
        setUrl(newUrl) {
            self.url = newUrl;
        },
    }));

export default interface PageInstance extends Instance<typeof PageInstanceModel> {}
