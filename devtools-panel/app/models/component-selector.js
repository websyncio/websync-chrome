import EmberObject, { computed } from '@ember/object';

export default EmberObject.extend({
	nameIsEdited: false,
	value: computed('selector', function(){
		return this.get('selector.css')?
			this.get('selector.css'):
			this.get('selector.xpath');
	})
});
