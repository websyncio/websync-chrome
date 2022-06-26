import Route from '@ember/routing/route';

export default Route.extend({
	model: function(params){
		return this.store.peekAll('page-type');
	},
	setupController: function(controller, model){
  		this._super(controller, model);
  	}
});
