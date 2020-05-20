export class Scss {
    xpath = '';
    css = '';
    scss = '';

    type;
    value;

    constructor(type: string, value: string) {
        this.type = type;
        this.value = value;
    }

    convert() {
        console.log('type: ' + this.type);
        console.log('value: ' + this.value);

        switch (this.type) {
            case 'Css': {
                this.css = this.value;
                break;
            }
            case 'XPath': {
                this.xpath = this.value;
                break;
            }
            case 'ByText':
                this.scss = "*['" + this.value + "']";
                break;
            case 'UI':
                this.scss = this.value;
                break;
            case 'WithText':
                this.scss = "*[*'" + this.value + "']";
                break;
            default: {
                break;
            }
        }
    }
}

export default class ScssParser {
    static parse(type: string, selector: string): Scss {
        const scss = new Scss(type, selector);
        return scss;
    }
}
