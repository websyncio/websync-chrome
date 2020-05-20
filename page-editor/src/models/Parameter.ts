import Selector from './Selector';

export default class Parameter {
    name: string | undefined;
    values: Selector[];
    constructor(name: string, values: Selector[]) {
        this.name = name;
        this.values = values;
    }
    static fromJSON(json: any): Parameter {
        const parameter = Object.create(Parameter.prototype);
        return Object.assign(parameter, json, {
            values: json.values.map((v) => new Selector(json.name, v)),
        });
    }
}
