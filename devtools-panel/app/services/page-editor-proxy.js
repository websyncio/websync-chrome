import Service from '@ember/service';
import Reactor from './reactor';

export const MessageTypes = {
	EditComponentSelector: 'edit-component-selector',
	ValidateSelector: 'validate-selector'
};

export default Service.extend({
	scssParser: Ember.inject.service(),
	selectorValidator: Ember.inject.service(),
	selectorHighlighter: Ember.inject.service(),
	selectorInspector: Ember.inject.service(),
	reactor: Ember.inject.service(),
	init(){
		this.get('reactor').registerEvent(MessageTypes.EditComponentSelector);
	},
	start(){
		window.addEventListener("message", this.receiveMessage.bind(this), false);
	},
	receiveMessage(event){
		// Do we trust the sender of this message?
	  	if (!chrome.runtime.getURL("").startsWith(event.origin)){
	    	return;
		}

		switch(event.data.type){
			case MessageTypes.ValidateSelector:
				this.validateSelector(event);
				break;
			case MessageTypes.EditComponentSelector:
				this.editComponentSelector(event);
				break
			default:
				console.log("Page edito proxy received message of unknown type.", event.data.type);
		}
	},
	editComponentSelector(event){
		this.get('reactor').dispatchEvent(
			MessageTypes.EditComponentSelector,
			event.data.data
		);
	},
	validateSelector(event){
		try{
			var selector = this.get('scssParser').parse(event.data.data.selector);
			this.get('selectorValidator').validate(selector, function(result, isException){
				this.postResult(event, result, isException);
			}.bind(this));
		}
		catch(e){
			this.postResult(event, null, true);
		}
	},
	postResult(event, result, isException){
		// Assuming you've verified the origin of the received message (which
		// you must do in any case), a convenient idiom for replying to a
		// message is to call postMessage on event.source and provide
		// event.origin as the targetOrigin.
		event.source.postMessage({
			acknowledgment: event.data.acknowledgment,
			type: event.data.type,
			result: result,
			isException: isException
		}, event.origin);
	},
	addListener(messageType, listener){
		this.get('reactor').addEventListener(messageType, listener);
	}
});