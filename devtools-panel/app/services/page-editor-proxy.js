import Service from '@ember/service';

const MSG_VALIDATE_SELECTOR = 'validate-selector';

export default Service.extend({
	scssParser: Ember.inject.service(),
	selectorValidator: Ember.inject.service(),
	selectorHighlighter: Ember.inject.service(),
	selectorInspector: Ember.inject.service(),
	start(){
		window.addEventListener("message", this.receiveMessage.bind(this), false);
	},
	receiveMessage(event){
		// Do we trust the sender of this message?
	  	if (!chrome.runtime.getURL("").startsWith(event.origin)){
	    	return;
		}

		switch(event.data.type){
			case MSG_VALIDATE_SELECTOR:
				this.validateSelector(event);
				break;
			default:
				console.log("Page edito proxy received message of unknown type.", event.data.type);
		}
	},
	validateSelector(event){
		try{
			var selector = this.get('scssParser').parse(event.data.selector);
			this.get('selectorValidator').validate(selector, function(result, isException){
				this.postResult(event, MSG_VALIDATE_SELECTOR, result, isException);
			}.bind(this));
		}
		catch(e){
			this.postResult(event, MSG_VALIDATE_SELECTOR, null, true);
		}
	},
	postResult(event, messageType, result, isException){
		// Assuming you've verified the origin of the received message (which
		// you must do in any case), a convenient idiom for replying to a
		// message is to call postMessage on event.source and provide
		// event.origin as the targetOrigin.
		event.source.postMessage({
			type: messageType,
			result: result,
			isException: isException
		}, event.origin);
	}
});