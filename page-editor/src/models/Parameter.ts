import Selector from './Selector';

export default class Parameter {
    name: string | undefined;
    values: Selector[];
    constructor(name: string, values: Selector[]) {
        console.log('kfhsdjf', 'name', name, 'values', values);
        this.name = name;
        this.values = values;
    }
    static fromJSON(type: string, json: any): Parameter {
        console.log('34234', 'type:', type, 'json:', json);
        const parameter = Object.create(Parameter.prototype);
        console.log(parameter);
        return Object.assign(parameter, json, {
            values: json.values.map((v) => Selector.fromJSON(type, v)),
        });
    }
}
