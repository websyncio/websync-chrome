import XcssSelector from 'entities/XcssSelector';

export default class XcssBuilder {
    public static concatSelectors(
        rootSelector: XcssSelector | null,
        relativeSelector: XcssSelector | null,
    ): XcssSelector | null {
        if (!rootSelector) {
            return relativeSelector;
        }
        if (!relativeSelector) {
            return rootSelector;
        }
        const invalidRootCss = !rootSelector.css && rootSelector.xpath;
        const invalidRootXpath = rootSelector.css && !rootSelector.xpath;
        const css = invalidRootCss ? null : this.concatCss(rootSelector.css, relativeSelector.css);
        let xpath = invalidRootXpath ? null : this.concatXpath(rootSelector.xpath, relativeSelector.xpath);
        xpath = this.normalizeXpath(xpath);
        return new XcssSelector(css || xpath, css, xpath);
    }

    private static normalizeXpath(xpath) {
        return xpath.startsWith('//') ? xpath : '//' + xpath;
    }

    private static concatCss(rootScss, relativeScss) {
        if (rootScss && relativeScss) {
            return rootScss + ' ' + relativeScss;
        } else if (rootScss) {
            return rootScss;
        } else if (relativeScss) {
            return relativeScss;
        }
        return null;
    }

    private static concatXpath(root, relative) {
        if (root && relative) {
            if (relative.startsWith('//')) {
                return root + relative;
            } else if (this.hasAxis(relative)) {
                return root + '/' + relative;
            } else {
                return root + '//' + relative;
            }
        } else if (root) {
            return root;
        } else if (relative) {
            return relative;
        }
        return null;
    }

    private static hasAxis(xpath) {
        xpath = xpath.trim();
        const axises = [
            'descendant::',
            'ancestor::',
            'ancestor-or-self::',
            'attribute::',
            'child::',
            'descendant-or-self::',
            'following::',
            'following-sibling::',
            'namespace::',
            'parent::',
            'preceding::',
            'preceding-sibling::',
            'self::',
        ];
        return axises.some((axis) => xpath.startsWith(axis));
    }
}
