export default class Selector {
    value: string;

    constructor(value: string) {
        this.value = value;
    }

    static fromJSON(json: any): Selector {
        const parameter = Object.create(Selector.prototype);
        return Object.assign(parameter, json);
    }
}
