export class Scss {
    xpath: null | string = null;
    css: null | string = null;
    scss: null | string = null;

    type;
    value;

    constructor(type: string, value: string) {
        this.type = type;
        this.value = value;
    }

    static create(type: string, value: string): Scss {
        const scss: Scss = new Scss(type, value);
        scss.init();
        return scss;
    }

    init() {
        switch (this.type) {
            case 'Css':
                this.css = this.value;
                break;
            case 'XPath':
                this.xpath = this.value;
                break;
            case 'ByText':
                this.scss = "*['" + this.value + "']";
                break;
            case 'UI':
                this.scss = this.value;
                break;
            case 'WithText':
                this.scss = "*[*'" + this.value + "']";
                break;
            default:
                break;
        }
    }
}

export default class ScssParser {
    static parse(type: string, selector: string): Scss {
        const scss = new Scss(type, selector);
        return scss;
    }
}