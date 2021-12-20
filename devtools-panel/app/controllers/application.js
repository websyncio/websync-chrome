import Ember from 'ember';
import { A } from '@ember/array';
import { once } from '@ember/runloop';
import ComponentSelector from '../models/component-selector';
import Notification from '../models/notification';
import {MessageTypes} from '../services/page-editor-proxy';

export default Ember.Controller.extend({
	selectorPartFactory: Ember.inject.service(),
	scssParser: Ember.inject.service(),
	scssBuilder: Ember.inject.service(),
	selectorBuilder: Ember.inject.service(),
	elementLocator: Ember.inject.service(),
	selectorHighlighter: Ember.inject.service(),
	clipboard: Ember.inject.service(),
	pluralizer: Ember.inject.service(),
	pageEditorProxy: Ember.inject.service(),
	inputValue: '',
	rootComponent: '',
	rootParts: A([]),
	parts: A([]),
	selectors: A([]),
	elements: A([]),
	withPageEditor: false,
	elementsSlice: Ember.computed('elements', function(){
		return this.get('elements');	//.slice(0, 50);
	}),
	init(){
		this._super(...arguments);
		console.log("Init ConvertController...");

		chrome.devtools.panels.elements.onSelectionChanged.addListener(this.locateInspectedElement.bind(this));
    	this.set('withPageEditor', this.getParamValue('withPageEditor')==='true');

		this.configurePageEditor();
		
		Ember.run.schedule("afterRender", this, function() {
      		this.focusInput();
      		this.locateInspectedElement();
      		resizeHandlerFrame.onresize = this.adjustLayout.bind(this);
      		this.bindSourceInputEvents();
    	});
	},
	configurePageEditor(){
		let pageEditor = this.get('pageEditorProxy'); 

		pageEditor.addListener(MessageTypes.SetRootComponent, this.onSetRootComponent.bind(this));
		pageEditor.addListener(MessageTypes.RemoveRootComponent, this.onRemoveRootComponent.bind(this));
		pageEditor.addListener(MessageTypes.EditSelector, this.onEditComponentSelector.bind(this));
		pageEditor.addListener(MessageTypes.RequestSelectorEditorState, this.sendSelectorEditorState.bind(this));
		pageEditor.addListener(MessageTypes.SelectorEditorStateUpdated, this.onSelectorEditorStateUpdated.bind(this));
		pageEditor.addListener(MessageTypes.GetSelectorsList, this.sendSelectorsList.bind(this));
		pageEditor.addListener(MessageTypes.SelectorsListUpdated, this.onUpdateSelectorsList.bind(this));

		pageEditor.start(this.get('withPageEditor'));
	},
	bindSourceInputEvents(){
		let element = this.getInputElement();
		element.addEventListener('keyup', this.onCaretPositionChange.bind(this));
		element.addEventListener('click', this.onCaretPositionChange.bind(this));
	},
	onCaretPositionChange(){		
		let previousPosition = this.get('caretPosition');
		let position = this.getInputElement().selectionEnd;
		if(previousPosition!=position){
			let partUnderCaret = this.getPartForCaretPosition(position);
			if(partUnderCaret){
				let xpathElements = partUnderCaret.get('xpathElements');
				let cssElements = partUnderCaret.get('cssElements');
				let elements = cssElements && cssElements.length? cssElements:xpathElements;
				this.selectPart(partUnderCaret, elements || A());
				this.set('caretPosition', position);
				//console.log('caret position changed: '+position);
			}
		}
	},
	getParamValue(paramName)
	{
	    var url = window.location.search.substring(1); //get rid of "?" in querystring
	    var qArray = url.split('&'); //get key-value pairs
	    for (var i = 0; i < qArray.length; i++) 
	    {
	        var pArr = qArray[i].split('='); //split key and value
	        if (pArr[0] == paramName) 
	            return pArr[1]; //return value
	    }
	},
	getPartForCaretPosition(position){
		let parts = this.get('parts');
		for (var i = 0; i<parts.length; i ++) {
			if(position<=parts[i].get('endIndex')){
				return parts[i];
			}
		};
		return null;
	},
	adjustLayout(){
		$(bottomPanel).css('top', selectorsConverter.offsetHeight+'px');
	},
	collapseSelectorsList(){
		this.set('selectorsListIsExpanded', false);
		this.get('selectorHighlighter').removeHighlighting();
	},
	expandSelectorsList(){
		this.set('selectorsListIsExpanded', true);	
	},
	locateInspectedElement(){
		console.log('Inspected element changed.');
		this.collapseSelectorsList();
		this.get('elementLocator').locateInspectedElement(this.get('parts'), (result, exception)=>{
			this.removeBlankParts();
			if(exception){
				console.log('Unable to locate inspected element.', exception);
				return;
			}
			if(!result){
				return;
			}
			if(result.partIndex!=-1){
				console.log('elementLocated - select existing part');
				this.selectLocatedPart(result.partIndex, result.partElements, result.isXpathElements);
			}else{
				console.log('elementLocated - create blank part', result.blankPartElements);
				this.createBlankPart(result.blankPartIndex, result.blankPartElements);
			}
		});
	},
	isEditable: Ember.computed('selectedPart', function(){
		let selectedPart = this.get('selectedPart');
		let scss = this.get('scss');
		return selectedPart && selectedPart.get('isEditable') && (!scss || scss.isCssStyle);
	}),
	isEditMode: Ember.computed('selectorToUpdate', 'componentSelectorToUpdate', function(){
		return this.get('selectorToUpdate') || this.get('componentSelectorToUpdate');
	}),
	rootScss: Ember.computed('rootParts.[]', function(){
		return this.get('rootParts.lastObject.fullScss');
	}),
	lastPart: Ember.computed('parts.[]', function(){
		return this.get('parts').rejectBy('isBlank').get('lastObject');
	}),
	status: Ember.computed(
		'lastPart.xpathElements.[]',
		'lastPart.cssElements.[]', function(){
		let lastPart = this.get('lastPart');
		let xpathStatus = lastPart.get('xpathElements.length')||0;
		let cssStatus = lastPart.get('cssElements.length')||0;
		return Math.max(xpathStatus, cssStatus);
	}),
	// isExist: Ember.computed('status', function(){
	// 	return this.get('status')>0;
	// }),
	// isSeveral: Ember.computed('status', function(){
	// 	return this.get('status')>1;
	// }),
	removeBlankParts(){
		this.get('parts').removeObjects(this.get('parts').filterBy('isBlank'));
	},
	selectLocatedPart(partIndex, partElements, isXpathElements){
		let part = this.get('parts').objectAt(partIndex);
		let elements = this.get('selectorPartFactory').generateElements(part, partElements, isXpathElements);
		this.selectPart(part, elements);
	},
	createBlankPart(blankPartIndex, blankPartElements){
		let scss = this.get('scss');
		let blankPart = this.get('selectorPartFactory').generateBlankPart(!scss || scss.isCssStyle);
		let elements = this.get('selectorPartFactory').generateElements(blankPart, blankPartElements);
		this.get('parts').insertAt(blankPartIndex, blankPart);
		this.selectPart(blankPart, elements);
	},
	focusInput(){
		this.getInputElement().focus();
	},
	selectInput(){
		this.getInputElement().select();
	},
	selectPartInInput(part){
		// .calculate highlighter position
		let prevPartScss = '';
		let parts = this.get('parts');
		for (var i = 0; i<parts.length; i++) {
			if(parts[i]==part){
				break;
			}
			prevPartScss+= parts[i].get('scss');
		}
		let partScss = part.get('scss');

		let inputElement = this.getInputElement()
		let inputStyle = window.getComputedStyle(inputElement);
		let inputFont =  inputStyle.fontSize +' '+ inputStyle.fontFamily;

		let left = this.getTextWidth(prevPartScss, inputFont);
		let width = this.getTextWidth(partScss, inputFont);

		this.setHighlighter(left, width);

		// .set caret position
		if(!part.get('isBlank') && (this.get('updateCaretPosition') || window.document.activeElement!==inputElement)){
			let caretPosition = part.get('endIndex');
			inputElement.setSelectionRange(caretPosition, caretPosition);
			this.set('caretPosition', caretPosition);
			//console.log('caret position changed 2: '+caretPosition);
			inputElement.focus();
			this.set('updateCaretPosition', false);
		}
	},
	setHighlighter(left, width){
		let $partHighlighter = $('#partHighlighter');
		$partHighlighter.css('left', left+'px');
		$partHighlighter.css('width', width+'px');
	},
	getTextWidth(text, font) {
	    // if given, use cached canvas for better performance
	    // else, create new canvas
	    var canvas = this.getTextWidth.canvas || (this.getTextWidth.canvas = document.createElement("canvas"));
	    var context = canvas.getContext("2d");
	    context.font = font;
	    var metrics = context.measureText(text);
	    return metrics.width;
	},
	getInputElement(){
		return document.getElementById('source');
	},
	parseSelector(selector){
		let scss;
		try {
			var scssParser = this.get('scssParser');
			scss = scssParser.parse(selector);            
		} catch (e) {
			console.log('Unable to convert scss selector "' + selector + '"');
		}
		return scss || {
				parts: [],
				css: null,
				xpath: null,
				isCssStyle: true
			};
	},
	onSourceSelectorChanged: Ember.observer('inputValue', function(){
		var inputValue = this.get('inputValue').trim();
		const scss = this.parseSelector(inputValue);
		this.set('scss', scss);

		let newParts = this.get('selectorPartFactory').generateParts(scss.parts);

		if(this.get('rootParts.length') && newParts.length){
			var space = newParts.get('firstObject.isCssStyle') && newParts.get('firstObject.combinator') ?'':' ';
			let rootPart = this.get('rootParts.lastObject');
			let rootScss = rootPart.get('fullScss');
			let rootCss = rootPart.get('fullCss');
			let rootXpath = rootPart.get('fullXpath');
			newParts.forEach(function(p){
				p.set('fullScss', rootScss+space+p.get('fullScss'));
				if(rootCss && p.get('fullCss')){
					p.set('fullCss', rootCss+space+p.get('fullCss'));
				}
				if(rootXpath && p.get('fullXpath')){
					p.set('fullXpath', rootXpath + p.get('fullXpath'));
				}
			});
		}

		this.updateParts(newParts);

		if(!inputValue){
			this.focusInput();
		}
	}),
	updateParts(newParts){
		let oldParts = this.get('parts');

		//let partsMatch = true;
		for(let i=0; i<newParts.length || i<oldParts.length;i++){
			let newPart = newParts.objectAt(i);
			let oldPart = oldParts.objectAt(i);
			let curPartsMatch = newPart && oldPart && newPart.selectorsEqualTo(oldPart);
			//partsMatch &= curPartsMatch;
			// if(partsMatch){
			// 	// .no changes encountered, continue
			// 	continue;
			// }
			if(curPartsMatch){
				// .current parts match, but some prevous are different - update 
				newPart.set('isSelected', oldPart.get('isSelected'));
 				oldParts.replace(i, 1, [newPart]);
			}else{
				if(!newPart){
					// .remove old part
					oldParts.removeAt(i--);
				}else if(!oldPart){
					// .add new part
					oldParts.pushObject(newPart);
				}else{
					let nextNewPart = newParts.objectAt(i+1);
					let nextOldPart = oldParts.objectAt(i+1);
					if(!nextNewPart && !nextOldPart ||
						(nextNewPart && nextOldPart && nextNewPart.selectorsEqualTo(nextOldPart))){
						newPart.set('isSelected', oldPart.get('isSelected'));
 						oldParts.replace(i, 1, [newPart]);
					}else if(nextOldPart && newPart.selectorsEqualTo(nextOldPart)){
						// .part was removed
						oldParts.removeAt(i--);
					}else if(nextNewPart && nextNewPart.selectorsEqualTo(oldPart)){
						// .part was added
						oldParts.insertAt(i, newPart);
					}else{
						oldParts.replace(i, 1, [newPart]);
					}
				}
			}
		}

		// .if selected part was changed - clear elements list
		if(!oldParts.some(p=>p.get('isSelected'))){
			// this.set('elements', A());
			this.locateInspectedElement();
			// if(oldParts.length){
			// 	oldParts.objectAt(0).set('isSelected',true);
			// }
		}
	},
	getSelectorRootElement(isXpath){
		// TODO: get rid of this shit
		return isXpath?$('#targetXPath'):$('#targetCss');
	},
	copyToClipboard(text) {
		this.get('clipboard').copy(text);
	},
	selectPart(part, elements){
		this.set('selectedPart', part);
		this.set('elements', elements);

		// .update selected part state
		this.get('parts').forEach(function(p){
			p.set('isSelected', p == part);
		});

		if(!elements){
			debugger;
		}

		// .select first if no element is selected
		// if(elements.length && elements.every(e=>!e.get('isSelected'))){
		// 	elements.objectAt(0).set('isSelected', true);
		// }

		this.selectPartInInput(part);
	},
	setInputValue(value, noStateChange){
		this.set('inputValue', value);
		this.set('updateCaretPosition', true);
		// .old highlighter is not valid anymore
		this.setHighlighter(0,0);
		if(!noStateChange){
			this.sendSelectorEditorState();
		}
	},
	selectElement(elements, element){
		elements.forEach(e=>{
			e.set('isSelected', e === element);
			if(e.get('children.length')){
				this.selectElement(e.get('children'), element);
			}
		});
	},
	generateSelectorName(){
		const prefix = 'Element';
		let indexes = this.get('selectors').map(s=>{
			let match = s.name.match(new RegExp('^'+prefix+'(\\d+)','i'));
			return match?parseInt(match[1]):null;
		}).filter(i=>i);
		let index = 1;
		while(indexes.indexOf(index)!==-1){
			index++;
		}
		return prefix+index;
	},
	getSelector(){
		let lastPart = this.get('lastPart');
		return lastPart?this.get('lastPart').getSelector():{scss:'',css:''};
	},
	addToList(){
		const inputValue = this.get('inputValue').trim();
		if(inputValue){
			const selector = this.get('rootComponent')
				? this.parseSelector(inputValue)
				: this.getSelector();
			let componentSelector = ComponentSelector.create({
				id: Math.random()+'',
				name: this.generateSelectorName(),
				selector: selector,
				elementsCount: this.get('status'),
				stateText: this.get('pluralizer').pluralize(this.get('status'), "element"),
				isSelected: !this.get('selectors.length')
			});
			this.get('selectors').pushObject(componentSelector);
			this.setInputValue('');
			this.showNotification("Selector was added to the list.");
		}
	},
	updateSelector(){
		if(this.get('inputValue')){
			let componentSelector = this.get('selectorToUpdate');
			componentSelector.set('selector', this.getSelector());
			componentSelector.set('wasUpdated', true);
			window.setTimeout(function(){
				componentSelector.set('wasUpdated', false);
			}, 2000);						
			componentSelector.set('elementsCount', this.get('status'));
			componentSelector.set('stateText', this.get('pluralizer').pluralize(this.get('status'), "element"));
			this.set('selectorToUpdate', null);
			this.setInputValue('', true);
			this.expandSelectorsList();
			this.sendSelectorEditorState();
		}
	},
	onEditComponentSelector(editedComponent){
		// let editedComponent = this.get('componentSelectorToUpdate');
		// if(editedComponent){
		// 	let {componentId, componentName, parameterName, parameterValueIndex, parameterValue} = editedComponent;
		// 	if(componentId===data.componentId && 
		// 		parameterName===data.parameterName && 
		// 		parameterValueIndex===data.parameterValueIndex &&
		// 		this.get('inputValue')===data.parameterValue){
		// 		// .nothing to update
		// 		console.log("set editedComponent BREAK");
		// 		return;
		// 	}
		// }
		// else if(!data){
		// 	// current editedComponent is null
		// 	// new editedComponent is null
		// 	// nothing to reset, just ignore this event
		// 	return;
		// }

		console.log("set editedComponent");
		this.removeRoot(true);
		this.setInputValue(editedComponent?editedComponent.parameterValue:'', true);
		this.collapseSelectorsList();
		this.set('selectorToUpdate', null);
		this.set('componentSelectorToUpdate', editedComponent);
	},
	combineRoots(xcssSelector){
		let selector = this.get('scssParser').parse(xcssSelector.xcss);
		let rootSelector;
		if(xcssSelector.root){
			rootSelector = this.combineRoots(xcssSelector.root);
		}
		return this.get('selectorBuilder').innerSelector(rootSelector, selector);
	},
	onSetRootComponent(rootComponent){
		this.set('disableSelectorsListObserver', true);
		let scssString = this.combineRoots(rootComponent.rootSelector).scss;
		let scss;
		try {
			scss = this.get('scssParser').parse(scssString);
		} catch (e) {
			console.log('Unable to convert scss selector "' + scssString + '"');
		}
		scss = scss || {
				parts: [],
				css: null,
				xpath: null,
				isCssStyle: true
			};
		
		this.set('rootComponent', rootComponent);
		let parts = this.get('selectorPartFactory').generateParts(scss.parts);
		if(parts.length){
			this.set('rootParts', parts);
			this.get('selectorHighlighter').highlightRootSelector(this.get('rootParts.lastObject').getSelector());
			this.sendSelectorEditorState();
		}
		this.set('disableSelectorsListObserver', false);
	},
	onRemoveRootComponent(){
		this.set('rootComponent', null);
		this.removeRoot(true, true);
	},
	// stateObserver: Ember.observer('inputValue', 'rootParts.[]', 'componentSelectorToUpdate', 'selectorToUpdate', function(){
	// 	console.log('selector editor state changed. isAuxilliary: ' + this.get('withPageEditor'));
	// 	Ember.run.next(this, () => this.sendSelectorEditorState());
	// }),
	sendSelectorEditorState(){
		let inputValue = this.get('inputValue');
		let rootScss = this.get('rootScss');
		let rootComponent = this.get('rootComponent');
		let editedSelector = this.get('selectorToUpdate');
		let editedComponent = this.get('componentSelectorToUpdate');
		this.get('pageEditorProxy').sendSelectorEditorState(rootScss, rootComponent, inputValue, editedSelector, editedComponent);
	},
	onSelectorEditorStateUpdated(state){
		let inputValue = this.get('inputValue');
		let rootComponent = this.get('rootComponent');
		let editedListSelector = this.get('selectorToUpdate');
		let editedComponentSelector = this.get('componentSelectorToUpdate');

		console.log('selector editor state changed. isAuxilliary: ' + this.get('withPageEditor'), state);
		if(this.isRootComponentUpdated(rootComponent, state.rootComponent)){
			this.onSetRootComponent(state.rootComponent);
		}else if(this.isEditedListSelectorUpdated(editedListSelector, state.editedListSelector)){
			this.onEditSelector(state.editedListSelector);
		}else if(this.isEditedComponentUpdated(editedComponentSelector, state.editedComponent)){
			this.onEditComponentSelector(state.editedComponent);
		}else if(inputValue!=state.inputValue){
			this.setInputValue(state.inputValue);
		}
	},
	isRootComponentUpdated(rc1,rc2){
		const componentId1 = rc1?rc1.componentId:null;
		const componentId2 = rc2?rc2.componentId:null; 
		return componentId1!==componentId2;
	},
	isEditedListSelectorUpdated(s1,s2){
		const listSelectorId1 = s1?s1.id:null;
		const listSelectorId2 = s2?s2.id:null;
		return listSelectorId1!==listSelectorId2;
	},
	isEditedComponentUpdated(ec1, ec2){
		let componentId1 = ec1?ec1.componentId:null;
		let componentId2 = ec2?ec2.componentId:null;
		return componentId1!==componentId2;
	},
	updateComponentSelector(){
		if(this.get('inputValue')){
			let {componentId, parameterName, parameterValueIndex} = this.get('componentSelectorToUpdate');
			this.get('pageEditorProxy').updateSelector(
				componentId,
				parameterName, 
				parameterValueIndex,
				this.getSelector().scss
			);
			this.set('componentSelectorToUpdate', null);
			this.setInputValue('', true);
			this.sendSelectorEditorState();
		}
	},
	cancelEditMode(){
		this.set('selectorToUpdate', null);
		this.set('componentSelectorToUpdate', null);
		this.setInputValue('', true);
		this.expandSelectorsList();
		this.sendSelectorEditorState();
	},
	removePart(part){
		let toRemoveIndex = this.get('parts').indexOf(part);
		let scssList = this.get('parts').map(p=>p.scss);
		scssList.splice(toRemoveIndex, 1);
		let modifiedScss = scssList.join('');
		if(toRemoveIndex==0){
			// if next part starts with space - trim it
			modifiedScss = modifiedScss.trimStart();
		}
		this.setInputValue(modifiedScss);
	},
	makeRoot(part){
		if(this.get('rootParts.length')){
			this.get('selectorHighlighter').removeRootHighlighting(this.get('rootParts.lastObject').getSelector());
		}
		let newRootParts=A([]);
		let current;
		do{
			current = this.get('parts').shiftObject();
			newRootParts.pushObject(current);
		} while(current != part);
		this.get('rootParts').pushObjects(newRootParts);

		let scssWithoutRoot = this.get('parts').map(p=>p.scss).join('').trimStart();
		this.setInputValue(scssWithoutRoot, true);
		this.get('selectorHighlighter').highlightRootSelector(this.get('rootParts.lastObject').getSelector());
		this.sendSelectorEditorState();
	},
	removeRoot(noStateChange, doNotRestoreInput){
		if(this.get('rootParts.length')){
			this.get('selectorHighlighter').removeRootHighlighting(this.get('rootParts.lastObject').getSelector());
			if(!doNotRestoreInput){
				this.get('parts').unshiftObjects(this.get('rootParts'));
				this.setInputValue(this.get('lastPart.fullScss'), true);
			}
			this.get('rootParts').clear();
			if(!noStateChange){
				this.sendSelectorEditorState();
			}
		}
		this.set('rootComponent', null);
	},
	showNotification(message){
		if(this.get("notification")){
			// .what should we do in this case?
		}else{
			this.set('notification', Notification.create({
				message: message
			}));
			setTimeout(function(){
				this.set('notification', null);
			}.bind(this), 2500);
		}
	},
	selectorsListUpdatedObserver: Ember.observer('selectors.@each.name','selectors.@each.selector', function(){
		if(this.get('disableSelectorsListObserver')){
			return;
		}
		this.sendSelectorsList();
	}),
	sendSelectorsList(){
		this.get('pageEditorProxy').sendSelectorsList(this.get('selectors'));
	},
	onUpdateSelectorsList(updatedSelectors){
		this.set('disableSelectorsListObserver', true);
		let selectors = this.get('selectors');
		for (var i = updatedSelectors.length - 1; i >= 0; i--){
			let selector = selectors.find(s=>s.id===updatedSelectors[i].id);
			if(selector){
				selector.set('name', updatedSelectors[i].name);
				selector.set('type', updatedSelectors[i].type);
			}else{
				console.error('Unknown selector ' + updatedSelectors[i].name);
			}
		};
		let updatedSelectorIds = updatedSelectors.map(s=>s.id);
		let removedSelectors = selectors.filter(s=>updatedSelectorIds.indexOf(s.id)===-1);
		selectors.removeObjects(removedSelectors);
		this.set('disableSelectorsListObserver', false);
	},
	actions:{
		copySelectorStart(isXpath){
			this.getSelectorRootElement(isXpath).addClass('selected');
			let noBlank = this.get('parts').rejectBy('isBlank');
			let lastPart = noBlank.length?noBlank[noBlank.length-1]:null;
			if(lastPart){
				let selector = isXpath?lastPart.get('fullXpath'):lastPart.get('fullCss');
				this.copyToClipboard(selector);
			}
		},
		copySelectorEnd(isXpath){
			this.getSelectorRootElement(isXpath).removeClass('selected');
		},
		onRemovePart(part){
			// if(part.get('isSelected')){
			// 	this.set('elements', A([]));
			// }
			this.removePart(part);
		},
		onRemoveSelector(){
			this.setInputValue('');
		},
		onCopySelector(){
			if(this.get('inputValue')){
				this.copyToClipboard(this.get('inputValue'));
				this.selectInput();
			}
		},
		onPartAttributeToggle(part){
			// .rebuild selector
			let parts = this.get('parts');
			let scssBuilder = this.get('scssBuilder');
			
			let partScss = scssBuilder.buildScssPart(part);

			let scssParts = parts.map(p=>p==part?partScss:p.get('scss'));

			// .if first part attribute was toggled
			if(part==parts.objectAt(0)){
				// .remove leading space for the first part selector
				scssParts[0] = scssParts[0].trim();

				let secondPart = parts.objectAt(1);
				if(secondPart){
					if(scssParts[0]){
						// .part added or updated
						if(secondPart.get('combinator').length==0){
							// . no combinator - add space
							scssParts[1] = ' ' + scssParts[1];
						}
					}else{
						// . part removed - trim leading space
						scssParts[1] = scssParts[1].trimStart();
					}
				}
			}	

			// .and set new selector to input
			this.setInputValue(scssParts.join(''));
		},
		onPartSelected(part, elements){
			this.removeBlankParts();
			this.selectPart(part, elements);
		},
		onPartElementSelected(element){
			this.selectElement(this.get('elements'), element);
		},
		onCopyButtonEnter(){
			let lastPart = this.get('parts.lastObject');
			if(lastPart && !lastPart.get('isBlank')){
				this.get('selectorHighlighter').highlight({
					css: lastPart.get('fullCss'),
					xpath: lastPart.get('fullXpath')
				});
			}
		},
		onCopyButtonLeave(){
			this.get('selectorHighlighter').removeHighlighting();
		},
		onAddToList(){
			this.addToList();
		},
		onEditSelector(componentSelector){
			this.removeRoot();
			this.set('selectorToUpdate', componentSelector);
			this.set('componentSelectorToUpdate', null);
			this.setInputValue(componentSelector.selector.scss, true);			
			this.selectPartInInput(this.get('parts.lastObject'));
			this.collapseSelectorsList();
			this.sendSelectorEditorState();
		},
		onSelectorConverterFocus(){
			this.collapseSelectorsList();
		},
		onInputKeyDown(){
			switch(event.code){
				case "Enter":
					if(this.get('selectorToUpdate')){
						this.updateSelector();
					}else if(this.get('componentSelectorToUpdate')){
						this.updateComponentSelector();
					}else{
						this.addToList();
					}
				break;
				case "Escape":
					if(this.get('selectorToUpdate') || this.get('componentSelectorToUpdate')){
						this.cancelEditMode();
					}
				break;
			}
		},
		onInputValueChange(){
			this.sendSelectorEditorState();	
		},
		onCancelSelectorUpdate(){
			this.cancelEditMode();
		},
		onUpdateSelector(){
			if(this.get('selectorToUpdate')){
				this.updateSelector();
			}else if(this.get('componentSelectorToUpdate')){
				this.updateComponentSelector();
			}else{
				throw new Error("Invalid state.");
			}
		},
		onRemoveRoot(){
			this.removeRoot();
		},
		onRootMouseEnter(){
			this.get('selectorHighlighter').highlight(this.get('rootParts.lastObject').getSelector());
		},
		onRootMouseLeave(){
			this.get('selectorHighlighter').removeHighlighting();
		}
	}
});