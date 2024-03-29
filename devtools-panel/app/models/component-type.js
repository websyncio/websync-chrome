import { computed } from '@ember/object';
import DS from 'ember-data';
import { belongsTo, hasMany } from 'ember-data/relationships';

export default DS.Model.extend({
	baseComponentType: belongsTo('component-type', { inverse: null }),
	components: hasMany('component', { inverse: null }),
	allComponents: computed('components.[]', 'baseComponentType.components.[]', function(){
	  	var components = this.get('components');
	  	var baseComponents = this.get('baseComponentType.components') || [];
	  	return components.concat(baseComponents);
	}),
	isWebElement: computed('id', function(){
		return this.get('id').startsWith('selenium.core.Framework.PageElements.Web');
	})
});
