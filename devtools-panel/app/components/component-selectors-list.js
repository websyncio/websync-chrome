import { scheduleOnce } from '@ember/runloop';
import { observer, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
	elementId: 'selectorsList',
	classNameBindings:[
		'isExpanded:expanded'
	],
	selectorHighlighter: service(),
	selectorInspector: service(),
	pluralizer: service(),
	clipboard: service(),
	onComponentsListChange: observer('selectors.[]', function(){
		if(this.get("componentsAreHighlighted")){
			const componentSelectors = this.get('selectors').map(s=>s.selector);
			this.get("selectorHighlighter").highlightComponents(componentSelectors);
		}
	}),
	selectorsCountStatus: computed('selectors.[]', function(){
		return this.get('pluralizer').pluralize(this.get('selectors.length'), "selector");
	}),
	highlightComponentsCheched(){
 		return $(highlightComponents).prop("checked");
	},
	didInsertElement(){
        this._super(...arguments);
        $(document).on('keydown', this.keyDownHandler.bind(this));
    },
    willDestroyElement(){
        this._super(...arguments);
        $(document).off('keypress', 'document', this.keyDownHandler.bind(this));
    },
    keyDownHandler(e){
    	if(this.get("isExpanded")){
    		switch(event.code){
    			case "ArrowUp":
    				this.selectPrevious();
    				break;
    			case "ArrowDown":
    				this.selectNext();
    				break;
    			case "Delete":
    				this.removeSelected();
    				break;
    			case "KeyE":
    				if(event.shiftKey){
    					this.editSelected();
    				}
    				break;
    			case "KeyR":
    				if(event.shiftKey){
    					this.beginRenameSelected();
    				}
    				break;
    		}
    		console.log(event.target);
    		event.preventDefault();
    	}
    },
    beginRenameSelected(){
    	let selected = this.getSelected();
    	if(selected){
			this.beginRename(selected);
    	}
    },
    editSelected(){
    	let selected = this.getSelected();
    	if(selected){
			this.edit(selected);
    	}
    },
    removeSelected(){
    	let selectors = this.get('selectors');
    	for(let i=0;i<selectors.length;i++){
    		if(selectors.objectAt(i).get('isSelected')){
				let toSelect = selectors.objectAt(i+1)?
					selectors.objectAt(i+1):
					selectors.objectAt(i-1);
				this.remove(selectors.objectAt(i));
				if(toSelect){
					toSelect.set('isSelected', true);
				}
				break;
    		}
    	}
    },
    getSelected(){
    	let selectors = this.get('selectors');
    	for(let i=0;i<selectors.length;i++){
    		if(selectors.objectAt(i).get('isSelected')){
    			return selectors.objectAt(i);
    		}
    	}
    },
    selectPrevious(){
    	let selectors =this.get('selectors');
    	for(let i=1;i<selectors.length;i++){
    		if(selectors.objectAt(i).get('isSelected')){
				selectors.objectAt(i).set('isSelected', false);
				selectors.objectAt(i-1).set('isSelected', true);
				this.highlightComponentSelector(selectors.objectAt(i-1));
				break;
    		}
    	}
    },
    selectNext(){
    	let selectors =this.get('selectors'); 
    	for(let i=0;i<selectors.length-1;i++){
    		if(selectors.objectAt(i).get('isSelected')){
				selectors.objectAt(i).set('isSelected', false);
				selectors.objectAt(i+1).set('isSelected', true);
				this.highlightComponentSelector(selectors.objectAt(i+1));
				break;
    		}
    	}
    },
    beginRename(componentSelector){
		componentSelector.toggleProperty("nameIsEdited");		
		// var nameSpanEl = window.event.target.tagName=="TD"?
		// 	window.event.target.children[0]:
		// 	window.event.target;
		scheduleOnce('afterRender', function(){
			var nameSpanEl = document.querySelector('.name.editing');
        	nameSpanEl.focus();
        	var range = document.createRange();
        	range.selectNodeContents(nameSpanEl);
        	window.getSelection().removeAllRanges();
        	window.getSelection().addRange(range);	        	
		});
    },
    submitRename(componentSelector, newName){
		componentSelector.set("nameIsEdited", false);
		if(newName){
			componentSelector.set("name", newName);
		}else{
			window.event.target.innerText = componentSelector.get("name");
		}	
    },
    edit(componentSelector){
		if(this.get("onEdit")){
			this.get("onEdit")(componentSelector);
		}
    },
    remove(componentSelector){
    	this.selectors.removeObject(componentSelector);
		this.get('selectorHighlighter').removeHighlighting();
    },
    highlightComponentSelector(componentSelector){
    	this.get('selectorHighlighter').highlight(componentSelector.get('selector'));
    },
	actions:{
		expandSelectorsList(){
			this.toggleProperty('isExpanded');
		},
		onSelect(componentSelector){
			this.get('selectors').forEach(function(s){
				s.set('isSelected', s == componentSelector);
			});
			this.highlightComponentSelector(componentSelector);
		},
		onMouseEnter(componentSelector){
			this.highlightComponentSelector(componentSelector);
		},
		onMouseLeave(){
			this.get('selectorHighlighter').removeHighlighting();
		},
		onEdit(componentSelector){
			this.edit(componentSelector);
		},
		onRemove(componentSelector){
			this.remove(componentSelector);
		},
		onClear(){
			this.selectors.clear();
		},
		onCopy(){
			var text="";
			this.selectors.forEach(function(item){
				text+=item.get('selector.scss')+"|"+item.get('name')+"\r\n";
			});
			this.get('clipboard').copy(text);
		},
		onRename(componentSelector){
			this.beginRename(componentSelector);
		},
		onHighlightComponents(){
			this.set("componentsAreHighlighted", this.highlightComponentsCheched());
			if(this.get("componentsAreHighlighted")){
				this.get("selectorHighlighter").highlightComponents(this.get('selectors').map(s=>s.selector));
			}else{
				this.get("selectorHighlighter").removeComponentsHighlighting(this.get('selectors').map(s=>s.selector));
			}
		},
		onNameKeydown(componentSelector){
			if(event.code=="Enter"){
				let newName = window.event.target.innerText.trim();
				this.submitRename(componentSelector, newName);
				window.event.preventDefault();
			}else if(event.code=="Escape"){
				this.submitRename(componentSelector);
			}
		},
		onNameBeforeInput(){
			let name = window.event.target.innerText.trim();
			if(name.length==100 || !window.event.key.match(/[A-Za-z0-9_$]+/g)){
				window.event.preventDefault();
			}
		},
		onNameBlur(componentSelector){
			let newName = window.event.target.innerText.trim();
			this.submitRename(componentSelector, newName);
		}
	}
});
