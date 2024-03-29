export default class XcssSelector {
    root: XcssSelector | null = null;
    xcss: string;
    css: string | null = null;
    xpath: string | null = null;

    constructor(xcss: string, css: string | null, xpath: string | null) {
        this.xcss = xcss;
        this.css = css;
        this.xpath = xpath;
    }
}
