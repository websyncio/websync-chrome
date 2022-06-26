import EmberObject, { computed } from '@ember/object';
import ScssBuilder from '../services/scss-builder';

export default EmberObject.extend({
	// viewableElements: Ember.computed('elements', function(){
	// 	var elements = this.get('elements');
	// 	console.log("Update viewable elements");
	// 	console.log(elements);
	// }),
	// fullSelectorObj: Ember.computed('fullSelector', function(){
	// 	return {
	// 		css: this.get('fullCss'),
	// 		xpath: this.get('fullXpath')
	// 	};
	// }),
	isBlank: computed('scss', function(){
		return !this.get('scss');
	}),
	selectorsEqualTo(part){
		return (this.get('scss')||'').trim()==(part.get('scss')||'').trim();
	},
	endIndex: computed('startIndex','scss', function(){
		return this.get('startIndex') + this.get('scss').length;
	}),
	getSelector(){
		let cssStatus = this.get('cssElements.length');
		let xpathStatus = this.get('xpathElements.length');
		if(this.get('fullCss') && (cssStatus || !xpathStatus)){
			return {
				scss: this.get('fullScss'),
				css: this.get('fullCss')
			};
		}
		return {
			scss: this.get('fullScss'),
			xpath: this.get('fullXpath')
		}
	}
});