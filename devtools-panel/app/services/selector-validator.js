import $ from 'jquery';
import Service from '@ember/service';
import RSVP from 'rsvp';

export default Service.extend({
	validate(selector, onValidated){
		// if( !selector || (!selector.css && !selector.xpath)){
		// 	return Promise.resolve(null);
		// }
		// return RSVP.hash({
		// 	css: selector.css ? this.validateCss(selector.css) : { isValid:false },
		// 	xpath: selector.xpath ? this.validateXpath(selector.xpath) : { isValid:false }
		// });

		if(!selector){
			return;
		}
		if(selector.css){
			this.validateCss(selector.css, onValidated);
		}
		else if(selector.xpath){
			this.validateXpath(selector.xpath, onValidated);
		}else{
			throw Error('invalid selector');
		}
	},
	validateCss(css, onValidated){
		return this._callEval('evaluateCss(`' + css + '`)', onValidated);
	},
	validateXpath(xpath, onValidated){
		return this._callEval('evaluateXpath(`' + xpath + '`)', onValidated);
	},
	_callEval(script, onValidated){
		let deferred = $.Deferred();
		chrome.devtools.inspectedWindow.eval(
			script,
			{ useContentScriptContext: true },
			function(result, isException) {
				let validationData = {};
				if(isException){
					validationData.isValid = false;
					validationData.count = 0;
				}
				else{
					validationData.isValid = true;
					validationData.count = this._getNodesCount(result);
					validationData.displayedCount = this._getNodesCount(result, true);
				}
				deferred.resolve(validationData);
				if(onValidated){
					onValidated(result, isException);
				}
			}.bind(this));
		return deferred.promise();
	},
	_getNodesCount(iframesDataList, displayedOnly){
		var count=0;
		iframesDataList.forEach(function(iframeData){
			count += displayedOnly?
				iframeData.elements.filter(e=>e.displayed).length:
				iframeData.elements.length;
		});
		return count;
	}
});
