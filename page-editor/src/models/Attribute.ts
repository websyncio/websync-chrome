export class Parameter {
    name: string | undefined;
    values: string[];

    constructor(name: string, values: string[]) {
        this.name = name;
        this.values = values;
    }

    static fromJSON(json: any): Parameter {
        const parameter = Object.create(Parameter.prototype);
        return Object.assign(parameter, json);
    }
}

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
