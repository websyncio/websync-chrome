import EmberObject, { computed } from '@ember/object';

export default EmberObject.extend({
	isUnlocked: computed('isSelected', 'part.isCssStyle', 'part.isEditable', function(){
		return this.get('isSelected') && this.get('part.isCssStyle') && this.get('part.isEditable');
	}),
	isChild: computed('parentElement', function(){
		return !!this.get('parentElement');
	}),
	rootElement: computed('parentElement', function(){
		if(this.get('parentElement')){
			return this.get('parentElement.rootElement');
		}
		return this;
	}),
	level : computed('childIndicesChain', function(){
		return (this.get('childIndicesChain')||[]).length;
	}),
	getSelector(){
		let selector;

		if(this.get('isChild')){
			selector = this.get('rootElement').getSelector();
			selector.childIndicesChain = this.get('childIndicesChain');
		}
		else{
			if(this.get('part.isBlank')){
				selector = { inspected: true};
			}else{
				selector = this.get('foundByXpath')?
					{ xpath: this.get('part.fullXpath') }:
					{ css: this.get('part.fullCss') };
				selector.iframeIndex = this.get('iframeIndex');
				selector.elementIndex = this.get('elementIndex');
			}
		}

		return selector;
	}
});