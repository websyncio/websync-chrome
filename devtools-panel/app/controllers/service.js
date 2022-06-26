import { observer } from '@ember/object';
import { alias, sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';

export default Controller.extend({
	vsclient: service('vsclient'),
	pages: alias('model.pages'),
	pagesSorting: ['id:desc'],
	sortedPages: sort('pages','pagesSorting'),
	applicationCtrl: controller('application'),
	pageCtrl: controller('service.page'),
	currentUrl: null,
	urlMatchResult: null,
	urlMatchResultObserver: observer("applicationCtrl.urlMatchResult", function(){
		var urlMatchResult = this.get("applicationCtrl.urlMatchResult");
		if(urlMatchResult != null) {
			this.transitionToRoute('service.page', 'SpikeService', urlMatchResult.PageId);
		}
	}),
	currentUrlObserver: observer("currentUrl", function(){
		var vsclient = this.get('vsclient');
		var currentUrl = this.get('currentUrl');
		vsclient.matchUrl(currentUrl).then(urlMatchResult=>{
			this.set('applicationCtrl.urlMatchResult', urlMatchResult);
		});
	})
});
