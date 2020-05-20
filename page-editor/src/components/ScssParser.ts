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
            case 'UI':
            case 'UI.List':
            case 'WithText':
            case 'FindBy':
            case 'FindBys':
            case 'Frame':
            case 'Name':
            case 'Title':
            case 'JDropdown':
            case 'JMenu':
            case 'JTable':
            case 'WithText': {
                this.scss = this.value;
                break;
            }
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
