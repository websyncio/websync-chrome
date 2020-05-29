import { Scss } from 'components/ScssBuilder';

export default class Selector {
    value: string;
    scss: Scss | undefined;

    constructor(value: string) {
        this.value = value;
        // this.scss = Scss.create(type, value);
    }

    static fromJSON(type: string, json: any): Selector {
        const parameter = Object.create(Selector.prototype);
        return Object.assign(parameter, { value: json, scss: Scss.create(type, json) });
    }
}
