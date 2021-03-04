import Service from '@ember/service';
import Reactor from './reactor';

export const MessageTypes = {
	InitConnection: 'init',
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
		let sourceName = isAuxilliary?'selector-editor-auxilliary':'selector-editor-main';
		this.set('sourceName', sourceName);
		
		let backgroundConnection = chrome.runtime.connect();
	    backgroundConnection.onMessage.addListener(this.receiveMessage.bind(this));
	    this.set('backgroundConnection', backgroundConnection);
	    this.postMessage(MessageTypes.InitConnection);
	},
	receiveMessage(message){
		switch(message.type){
			case MessageTypes.ValidateSelector:
				this.validateSelector(message);
				break;
			case MessageTypes.EditSelector:
				this.editComponentSelector(message);
				break;
			case MessageTypes.HighlightSelector:
				this.highlightSelector(message);
				break;
			case MessageTypes.RemoveHighlighting:
				this.removeHighlighting();
				break;
			case MessageTypes.GetSelectorsList:
				this.getSelectorsList(message);
				break;
			case MessageTypes.UpdateSelectorName:
				this.updateSelectorName(message);
				break;
			default:
				console.log("Page edito proxy received message of unknown type.", event.data.type);
		}
	},
	highlightSelector(message){
		let selector = this.getSelector(message.data);
		this.get('selectorHighlighter').highlight(selector);
	},
	removeHighlighting(){
		this.get('selectorHighlighter').removeHighlighting();
	},
	updateSelectorName(message){
		throw new Error("Not implemented");
	},
	getSelectorsList(message){
		this.get('reactor').dispatchEvent(
			MessageTypes.GetSelectorsList,
			message.data
		);
	},
	editComponentSelector(message){
		this.get('reactor').dispatchEvent(
			MessageTypes.EditSelector,
			message.data
		);
	},
	validateSelector(message){
		try{
			let selector = this.getSelector(message.data);
			this.get('selectorValidator').validate(selector, function(result, isException){
				this.postMessage(MessageTypes.ValidateSelector, result, isException, message.acknowledgment, message.source);
			}.bind(this));
		}
		catch(e){
			this.postMessage(MessageTypes.ValidateSelector, null, true, acknowledgment, message.source);
		}
	},
	getSelector(selector) {
		if (selector.scss) {
			selector = this.get('scssParser').parse(selector.scss);
		}
		return selector;
	},
	postMessage(type, data, isException, acknowledgment, target){
		this.get('backgroundConnection').postMessage({
			source: this.get('sourceName'),
			tabId: chrome.devtools.inspectedWindow.tabId,
			type: type,
			data: data,
			isException: isException,
			acknowledgment: acknowledgment,
			target: target
		});
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