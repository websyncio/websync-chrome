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
        const obj = Object.assign(parameter, json, {
            values: json.values.map((v) => {
                return Selector.fromJSON(type, v);
            }),
        });
        return obj;
    }
}
