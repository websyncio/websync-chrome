import Parameter from './Parameter';
import { toDictionary } from 'utils/convert';

export default class Attribute {
    name: string;
    parameters: Parameter[];
    constructor(name: string, parameters: Parameter[]) {
        this.name = name;
        this.parameters = parameters;
    }

    static fromJSON(json: any): Attribute {
        const attribute = Object.create(Attribute.prototype);
        return Object.assign(attribute, json, {
            parameters: json.parameters.map((p) => Parameter.fromJSON(json.name, p)),
        });
    }
}
