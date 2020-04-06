class Event {
    name: string;
    callbacks: Function[];

    constructor(name) {
        this.name = name;
        this.callbacks = [];
    }

    registerCallback(callback) {
        this.callbacks.push(callback);
    }
}

export default class Reactor {
    events: Event[];

    constructor() {
        this.events = [];
    }

    registerEvent(eventName) {
        const event = new Event(eventName);
        this.events[eventName] = event;
    }

    dispatchEvent(eventName, ...eventArgs) {
        this.events[eventName].callbacks.forEach(function (callback) {
            callback(...eventArgs);
        });
    }

    addEventListener(eventName, callback) {
        this.events[eventName].registerCallback(callback);
    }
}
