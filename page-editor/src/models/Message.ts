import WebSession from './WebSession';

export default class Message {
    status: string;
    data: WebSession;

    constructor(status: string, data: WebSession) {
        this.status = status;
        this.data = data;
    }

    static fromJSON(json: any): Message {
        const message = Object.create(Message.prototype);
        return Object.assign(message, json, {
            status: json.status,
            data: json.data = WebSession.fromJSON(json.data),
        });
    }

    static reviver(key: string, value: any): any {
        return key === '' ? Message.fromJSON(value) : value;
    }
}
