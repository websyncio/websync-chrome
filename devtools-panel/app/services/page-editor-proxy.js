import Service from '@ember/service';
import Reactor from './reactor';

export const MessageTypes = {
	EditComponentSelector: 'edit-component-selector',
	UpdateComponentSelector: 'update-component-selector',
	ValidateSelector: 'validate-selector',
	HighlightSelector: 'highlight-selector',
	RemoveHighlighting: 'remove-highlighting'
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
				break;
			case MessageTypes.HighlightSelector:
				this.highlightSelector(event);
				break;
			case MessageTypes.RemoveHighlighting:
				this.removeHighlighting();
				break;
			default:
				console.log("Page edito proxy received message of unknown type.", event.data.type);
		}
	},
	highlightSelector(event){
		let selector = this.getSelector(event);
		this.get('selectorHighlighter').highlight(selector);
	},
	removeHighlighting(){
		this.get('selectorHighlighter').removeHighlighting();
	},
	editComponentSelector(event){
		this.get('reactor').dispatchEvent(
			MessageTypes.EditComponentSelector,
			event.data.data
		);
	},
	validateSelector(event){
		try{
			let selector = this.getSelector(event);
			this.get('selectorValidator').validate(selector, function(result, isException){
				this.postResult(event, result, isException);
			}.bind(this));
		}
		catch(e){
			this.postResult(event, null, true);
		}
	},
	getSelector(event) {
		let selector = event.data.data;
		if (selector.scss) {
			selector = this.get('scssParser').parse(selector.scss);
		}
		return selector;
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
	postMessage(type, data){
		pageEditor.contentWindow.postMessage({
			type: type,
			data: data
		}, "*");
	},
	addListener(messageType, listener){
		this.get('reactor').addEventListener(messageType, listener);
	},
	updateComponentSelector(componentId, parameterName, parameterValueIndex, newSelector){
		this.postMessage(
			MessageTypes.UpdateComponentSelector,
			{
				componentId: componentId,
				parameterName: parameterName,
				parameterValueIndex: parameterValueIndex,
				selector: newSelector
			});
	}
});