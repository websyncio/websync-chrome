import { Scss } from 'components/ScssParser';

export default class Selector {
    value: string;
    scss: Scss;

    constructor(type: string, value: string) {
        this.value = value;
        this.scss = Scss.create(type, value);
    }

    static fromJSON(json: any): Selector {
        const parameter = Object.create(Selector.prototype);
        return Object.assign(parameter, json);
    }
}
