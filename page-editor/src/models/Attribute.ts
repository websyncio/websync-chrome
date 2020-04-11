import Parameter from './Parameter';

export default class Attribute {
    name: string;
    parameters: Array<Parameter>;
    constructor(name: string, parameters: Array<Parameter>) {
        this.name = name;
        this.parameters = parameters;
    }

    static fromJSON(json: any): Attribute {
        const attribute = Object.create(Attribute.prototype);
        return Object.assign(attribute, json, {
            parameters: json.parameters.map((p) => Parameter.fromJSON(p)),
        });
    }
}
