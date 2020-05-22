import Selector from './Selector';

export default class Parameter {
    name: string | undefined;
    values: Selector[];
    constructor(name: string, values: Selector[]) {
        this.name = name;
        this.values = values;
    }
    static fromJSON(type: string, json: any): Parameter {
        const parameter = Object.create(Parameter.prototype);
        console.log(parameter);
        return Object.assign(parameter, json, {
            values: json.values.map((v) => Selector.fromJSON(type, v)),
        });
    }
}
