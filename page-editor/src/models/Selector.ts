import { Scss } from 'components/ScssBuilder';

export default class Selector {
    value: string;
    scss: Scss;

    constructor(type: string, value: string) {
        console.log('83045983:', 'type:', type, 'value:', value);
        this.value = value;
        this.scss = Scss.create(type, value);
    }

    static fromJSON(type: string, json: any): Selector {
        console.log('2384592', 'type:', type, 'json:', json);
        const parameter = Object.create(Selector.prototype);
        console.log(parameter);
        return Object.assign(parameter, json, { value: json, scss: Scss.create(type, json) });
    }
}
