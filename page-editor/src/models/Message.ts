import WebSession from './WebSession';

export default class Message {
    status: string;
    data: any;
    type: string;

    constructor(status: string, data: any, type: string) {
        this.status = status;
        this.data = data;
        this.type = type;
    }

    static fromJSON(json: any): Message {
        const message = Object.create(Message.prototype);
        return Message.getMessageforType(json, message);
    }

    static reviver(key: string, value: any): any {
        return key === '' ? Message.fromJSON(value) : value;
    }

    static getMessageforType(json: any, message: any): Message {
        if (json.type != null) {
            switch (json.type) {
                case 'modules': {
                    return Object.assign(json, {
                        status: json.status,
                        data: json.data,
                        type: json.type,
                    });
                }
                default: {
                    return Object.assign(message, json, {
                        status: json.status,
                        data: json.data = WebSession.fromJSON(json.data),
                    });
                }
            }
        } else {
            return Object.assign(message, json, {
                status: json.status,
                data: json.data = WebSession.fromJSON(json.data),
            });
        }
    }
}
