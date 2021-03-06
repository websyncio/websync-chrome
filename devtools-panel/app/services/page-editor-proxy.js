import Service from '@ember/service';
import Reactor from './reactor';

export const MessageTypes = {
	InitConnection: 'init',
	EditSelector: 'edit-selector',
	ValidateSelector: 'validate-selector',
	HighlightSelector: 'highlight-selector',
	RemoveHighlighting: 'remove-highlighting',
	
	GetSelectorsList: 'get-selectors-list',
	
	SelectorUpdated: 'selector-updated',
	SelectorsListUpdated: 'selectors-list-updated',
};

export const MessageTargets = {
	SelectorEditorMain: 'selector-editor-main',
	SelectorEditorAuxilliary: 'selector-editor-auxilliary',
	PageEditor: 'page-editor'
}

export default Service.extend({
	scssParser: Ember.inject.service(),
	selectorValidator: Ember.inject.service(),
	selectorHighlighter: Ember.inject.service(),
	selectorInspector: Ember.inject.service(),
	reactor: Ember.inject.service(),

	init(){
		this.get('reactor').registerEvent(MessageTypes.EditSelector);
		this.get('reactor').registerEvent(MessageTypes.GetSelectorsList);
		this.get('reactor').registerEvent(MessageTypes.SelectorsListUpdated);
	},
	start(isAuxilliary){
		let sourceName = isAuxilliary?MessageTargets.SelectorEditorAuxilliary:MessageTargets.SelectorEditorMain;
		this.set('sourceName', sourceName);
		
		let backgroundConnection = chrome.runtime.connect();
	    backgroundConnection.onMessage.addListener(this.receiveMessage.bind(this));
	    this.set('backgroundConnection', backgroundConnection);
	    this.postMessage(MessageTypes.InitConnection);
	},
	receiveMessage(message){
		console.log('page-editor-proxy received', message);
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
			case MessageTypes.SelectorsListUpdated:
				this.updateSelectorList(message);
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
	updateSelectorList(message){
		this.get('reactor').dispatchEvent(
			MessageTypes.SelectorsListUpdated,
			message.data
		);
	},
	getSelectorsList(message){
		this.get('reactor').dispatchEvent(
			MessageTypes.GetSelectorsList
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
				this.postMessage(MessageTypes.ValidateSelector, result, message.source, isException, message.acknowledgment);
			}.bind(this));
		}
		catch(e){
			this.postMessage(MessageTypes.ValidateSelector, null, message.source, true, acknowledgment);
		}
	},
	getSelector(selector) {
		if (selector.scss) {
			selector = this.get('scssParser').parse(selector.scss);
		}
		return selector;
	},
	postMessage(type, data, target, isException, acknowledgment){
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
	sendSelectorsList(selectors){
		let data = selectors.map(s=>({
			id: s.id,
			name: s.name,
			type: s.type,
			selector: s.selector.scss
		}));
		this.postMessage(MessageTypes.SelectorsListUpdated, data, MessageTargets.PageEditor);
	},
	updateSelector(componentId, parameterName, parameterValueIndex, newSelector){
		this.postMessage(
			MessageTypes.SelectorUpdated,
			{
				componentId: componentId,
				parameterName: parameterName,
				parameterValueIndex: parameterValueIndex,
				selector: newSelector
			},
			MessageTargets.PageEditor);
	}
});