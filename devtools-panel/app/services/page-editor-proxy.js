import Service from '@ember/service';
import Reactor from './reactor';

export const MessageTypes = {
	InitConnection: 'init',
	ValidateSelector: 'validate-selector',
	HighlightSelector: 'highlight-selector',
	RemoveHighlighting: 'remove-highlighting',
	HighlightComponents: 'highlight-components',
	RemoveComponentsHighlighting: 'remove-components-highlighting',
	
	EditSelector: 'edit-selector',
	SelectorUpdated: 'selector-updated',
	RequestSelectorEditorState: 'request-selector-editor-state',

	GetSelectorsList: 'get-selectors-list',
	SelectorsListUpdated: 'selectors-list-updated',

	SelectorEditorStateUpdated: 'selector-editor-state-updated'
};

export const MessageTargets = {
	SelectorEditorMain: 'selector-editor-main',
	SelectorEditorAuxilliary: 'selector-editor-auxilliary',
	PageEditor: 'page-editor'
}

export default Service.extend({
	scssParser: Ember.inject.service(),
	selectorBuilder: Ember.inject.service(),
	selectorValidator: Ember.inject.service(),
	selectorHighlighter: Ember.inject.service(),
	selectorInspector: Ember.inject.service(),
	reactor: Ember.inject.service(),

	init(){
		this.get('reactor').registerEvent(MessageTypes.EditSelector);
		this.get('reactor').registerEvent(MessageTypes.GetSelectorsList);
		this.get('reactor').registerEvent(MessageTypes.SelectorsListUpdated);
		this.get('reactor').registerEvent(MessageTypes.RequestSelectorEditorState);
		this.get('reactor').registerEvent(MessageTypes.SelectorEditorStateUpdated);
	},
	start(isAuxilliary){
		if(isAuxilliary){
			this.set('currentSelectorEditor', MessageTargets.SelectorEditorAuxilliary);
			this.set('secondSelectorEditor', MessageTargets.SelectorEditorMain);
		}else{
			this.set('currentSelectorEditor', MessageTargets.SelectorEditorMain);
			this.set('secondSelectorEditor', MessageTargets.SelectorEditorAuxilliary);
		}

		let backgroundConnection = chrome.runtime.connect();
	    backgroundConnection.onMessage.addListener(this.receiveMessage.bind(this));
	    this.set('backgroundConnection', backgroundConnection);
	    this.postMessage(MessageTypes.InitConnection);
	    this.requestSelectorEditorState();
	},
	receiveMessage(message){
		switch(message.type){
			case MessageTypes.ValidateSelector:
				this.validateSelector(message);
				break;
			case MessageTypes.HighlightSelector:
				this.highlightSelector(message);
				break;
			case MessageTypes.RemoveHighlighting:
				this.removeHighlighting();
				break;
			case MessageTypes.HighlightComponents:
				this.highlightComponents(message);
				break;
			case MessageTypes.RemoveComponentsHighlighting:
				this.removeComponentsHighlighting(message);
				break;
			case MessageTypes.EditSelector:
				this.editComponentSelector(message);
				break;
			case MessageTypes.RequestSelectorEditorState:
				this.onRequestSelectorEditorState();
				break;
			case MessageTypes.SelectorEditorStateUpdated:
				this.onSelectorEditorStateUpdated(message);
				break;
			case MessageTypes.GetSelectorsList:
				this.getSelectorsList(message);
				break;
			case MessageTypes.SelectorsListUpdated:
				this.updateSelectorList(message);
				break;
			default:
				console.log("Page edito proxy received message of unknown type.", message.type);
		}
	},
	highlightSelector(message){
		let selector = this.getSelector(message.data);
		this.get('selectorHighlighter').highlight(selector);
	},
	removeHighlighting(){
		this.get('selectorHighlighter').removeHighlighting();
	},
	highlightComponents(message){
		let selectors = message.data.map(s=>this.getSelector(s));
		this.get('selectorHighlighter').highlightComponents(selectors);
	},
	removeComponentsHighlighting(message){
		let selectors = message.data.map(s=>this.getSelector(s));
		this.get('selectorHighlighter').removeComponentsHighlighting(selectors);
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
	validateSelector(message){
		try{
			let selector = this.getSelector(message.data);
			this.get('selectorValidator').validate(selector, function(result, isException){
				this.postMessage(MessageTypes.ValidateSelector, message.source, result, isException, message.acknowledgment);
			}.bind(this));
		}
		catch(e){
			this.postMessage(MessageTypes.ValidateSelector, message.source, null, true, message.acknowledgment);
		}
	},
	getSelector(xcssSelector) {
		let selector;
		if (!xcssSelector.css && !xcssSelector.xpath){
			selector = this.get('scssParser').parse(xcssSelector.xcss);
		}
		// TODO: create separate package for xcss parser and remove this code
		if(xcssSelector.root){
			let rootSelector = this.get('scssParser').parse(xcssSelector.root.xcss);
			selector = this.get('selectorBuilder').innerSelector(rootSelector, selector);
		}
		return selector;
	},
	postMessage(type, target, data, isException, acknowledgment){
		if(!type){
			throw new Error("Message type is not specified.");
		}
		this.get('backgroundConnection').postMessage({
			source: this.get('currentSelectorEditor'),
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
		this.postMessage(MessageTypes.SelectorsListUpdated, MessageTargets.PageEditor, data);
	},
	editComponentSelector(message){
		this.get('reactor').dispatchEvent(
			MessageTypes.EditSelector,
			message.data
		);
	},
	requestSelectorEditorState(){
		let target = this.get('secondSelectorEditor')
		this.postMessage(MessageTypes.RequestSelectorEditorState, target);
	},
	onRequestSelectorEditorState(){
		this.get('reactor').dispatchEvent(MessageTypes.RequestSelectorEditorState);
	},
	onSelectorEditorStateUpdated(message){
		this.get('reactor').dispatchEvent(
			MessageTypes.SelectorEditorStateUpdated,
			message.data
		);
	},
	sendSelectorEditorState(rootSelector, inputValue, editedSelector, editedComponent){
		let target = this.get('secondSelectorEditor')
		let data = {
				rootSelector: rootSelector,
				inputValue: inputValue,
				editedSelector: editedSelector,
				editedComponent: editedComponent
			};
		this.postMessage(MessageTypes.SelectorEditorStateUpdated, target, data);
	},
	updateSelector(componentId, parameterName, parameterValueIndex, newSelector){
		this.postMessage(
			MessageTypes.SelectorUpdated,
			MessageTargets.PageEditor,
			{
				componentId: componentId,
				parameterName: parameterName,
				parameterValueIndex: parameterValueIndex,
				parameterValue: newSelector
			});
	}
});