import Service from '@ember/service';

/**********************************************************************************************************************/
// taken from http://stackoverflow.com/questions/15308371/custom-events-model-without-using-dom-events-in-javascript

export default Service.extend({
  events: {},
  registerEvent(eventName){
    this.events[eventName] = new Event(eventName);
  },
  dispatchEvent(eventName, ...eventArgs){
    this.events[eventName].callbacks.forEach(function(callback){
      callback(...eventArgs);
    });
  },
  addEventListener(eventName, callback){
    this.events[eventName].registerCallback(callback);
  }
});

class Event{
  constructor(name){
    this.name = name;
    this.callbacks = [];
  }
  
  registerCallback(callback){
    this.callbacks.push(callback);
  }
};