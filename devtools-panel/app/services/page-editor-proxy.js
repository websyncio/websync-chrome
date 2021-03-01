import Service from '@ember/service';
import Reactor from './reactor';

export const MessageTypes = {
	EditSelector: 'edit-selector',
	ValidateSelector: 'validate-selector',
	HighlightSelector: 'highlight-selector',
	RemoveHighlighting: 'remove-highlighting',
	
	GetSelectorsList: 'get-selectors-list',
	UpdateSelectorName: 'update-selector-name',
	
	SelectorUpdated: 'component-selector-updated',
	SelectorsListUpdated: 'selectors-list-updated'
};

export default Service.extend({
	scssParser: Ember.inject.service(),
	selectorValidator: Ember.inject.service(),
	selectorHighlighter: Ember.inject.service(),
	selectorInspector: Ember.inject.service(),
	reactor: Ember.inject.service(),

	init(){
		this.get('reactor').registerEvent(MessageTypes.EditSelector);
		this.get('reactor').registerEvent(MessageTypes.GetSelectorsList);
	},
	start(isAuxilliary){
		let sourceName = isAuxilliary?'selector-editor-main':'selector-editor-auxilliary';
		this.set('sourceName', sourceName);
		
		let backgroundConnection = chrome.runtime.connect();
	    backgroundConnection.onMessage.addListener(this.receiveMessage.bind(this));
	    this.set('backgroundConnection', backgroundConnection);
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
			case MessageTypes.EditSelector:
				this.editComponentSelector(event);
				break;
			case MessageTypes.HighlightSelector:
				this.highlightSelector(event);
				break;
			case MessageTypes.RemoveHighlighting:
				this.removeHighlighting();
				break;
			case MessageTypes.GetSelectorsList:
				this.getSelectorsList(event);
				break;
			case MessageTypes.UpdateSelectorName:
				this.updateSelectorName(event);
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
	updateSelectorName(event){
		throw new Error("Not implemented");
	},
	getSelectorsList(){
		this.get('reactor').dispatchEvent(
			MessageTypes.GetSelectorsList,
			event.data.data
		);
	},
	editComponentSelector(event){
		this.get('reactor').dispatchEvent(
			MessageTypes.EditSelector,
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
		this.get('backgroundConnection').postMessage({
			source: this.get('sourceName'),
			tabId: chrome.devtools.inspectedWindow.tabId,
			type: type,
			data: data
		});

		// pageEditor.contentWindow.postMessage({
		// 	type: type,
		// 	data: data
		// }, "*");
	},
	addListener(messageType, listener){
		this.get('reactor').addEventListener(messageType, listener);
	},
	updateSelectorsList(selectors){
		let data = selectors.map(s=>({
			id: Math.random()+'',
			name: s.name,
			selector: s.value
		}));
		this.postMessage(MessageTypes.SelectorsListUpdated, data);
	},
	updateSelector(componentId, parameterName, parameterValueIndex, newSelector){
		this.postMessage(
			MessageTypes.SelectorUpdated,
			{
				componentId: componentId,
				parameterName: parameterName,
				parameterValueIndex: parameterValueIndex,
				selector: newSelector
			});
	}
});