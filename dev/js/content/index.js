console.log('WebSync content script injected');

// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
//     console.log("Message received from background page", message);
//     let result;
//     switch(message.name){
//     	case "removeComponentsHighlighting":
//     		removeComponentsHighlighting();
//     		break;
//     	case "removeHighlighting":
//     		removeHighlighting();
//     		break;
//     	case "highlightComponents":
//     		highlightComponents(message.data);
//     		break;
//     	case "highlightSelector":
//     		highlightSelector(message.data);
//     		break;
//     	case "highlightInspectedElement":
//     		highlightInspectedElement(message.data);
//     		break;
//     	case "inspectCssSelector":
//     		inspectCssSelector(message.data);
//     		break;
//     	case "inspectXpathSelector":
//     		inspectXpathSelector(message.data);
//     		break;
//     	case "inspectInspectedChild":
//     		inspectInspectedChild(message.data);
//     		break;
//     	case "evaluateCss":
//     		result = evaluateCss(message.data);
//     		break;
//     	case "evaluateXpath":
//     		result = evaluateXpath(message.data);
//     		break;
//     	case "loadChildrenForInspectedElement":
//     		result = loadChildrenForInspectedElement(message.data);
//     		break;
//     	case "loadChildren":
//     		result = loadChildren(message.data);
//     		break;
//     	default:
//     		console.error("Unknown message type");
//     }
//     if(sendResponse){
// 		sendResponse(result);
//     }
// });

//============================================================================================
//   Connection to background page
//============================================================================================

const Sources = {
	SelectorEditorMain : 'selector-editor-main',
	SelectorEditorAuxilliary : 'selector-editor-auxilliary',
	PageEditor : 'page-editor',
	Content: 'content',
};

const BackgroundMessages = {
	GetUrlRequest: "get-url-request",
	TabId: "tabid",
	ChangeUrl: "change-url",
	UrlChanged: "url-changed",
	TicketsUnpaid: "tickets-unpdaid"
};

let backgroundPort;
let tabId;

function sendMessageToBackground(type, target, data){
	if(!backgroundPort){
		console.log("Unable to send message. Connection to background page is not available.", type);
	}
	let message = {
		type,
		source: Sources.Content,
		target,
		tabId,
		data
	};
	console.log('Send message to background page', message);
	backgroundPort.postMessage(message);
}

function connectToBackgroundPage(){
	try{
		backgroundPort = chrome.runtime.connect({ name: "content" });
	}catch(e){
		console.log("WebSync is unable to connect to background.", e);
		if(e.message!='Extension context invalidated.'){
			setTimeout(connectToBackgroundPage, 1000);
		}
		return;
	}
	console.log("WebSync has created a connection to background.");
	backgroundPort.onDisconnect.addListener(function(){
		console.log("Connection to background from WebSync has broken.");
		backgroundPort = null;
		setTimeout(connectToBackgroundPage, 1000);
	});

	addBackgroundPageListeners();
}

function onTabIdReceived(msg){
	tabId = msg.tabId;
	sendUrlChangedMessage();
}

function onChangeUrlRequest(msg){
	window.location.href = msg.data.url;
	//history.pushState({}, null, msg.data.url);
}

function addBackgroundPageListeners(){
	if(!backgroundPort){
		throw new Error("Connection to background page is not available.");
	}
	backgroundPort.onMessage.addListener(function(msg) {
		console.log("Content script receive message", msg);

		switch(msg.type){
			case BackgroundMessages.TabId:
				onTabIdReceived(msg);
				break;
			case BackgroundMessages.ChangeUrl:
				onChangeUrlRequest(msg);
				break;
			case BackgroundMessages.GetUrlRequest:
				sendUrlChangedMessage();
				break;
			case BackgroundMessages.TicketsUnpaid:
				alert("Tickets for VSITNI are updaid!");
				break
		}
	});
}

connectToBackgroundPage();
//============================================================================================
//   URL Polling
//============================================================================================

let urlPollingIntervalId;
let previoustUrl = window.location.href;

function startUrlPolling() {
	try{
		urlPollingIntervalId = window.setInterval(urlPollingCallback, 1000);
	}
	catch(e){
		console.error("startUrlPolling", e);
	}
}

function stopUrlPolling() {
	try{
		window.clearInterval(urlPollingIntervalId);
	}catch(e){
		console.error("stopUrlPolling", e);
	}
}

function getCurrentUrl(){
	return window.location.href;
}

function urlPollingCallback(){
	const currentUrl = getCurrentUrl();
	if (currentUrl!==previoustUrl) {
		previoustUrl = currentUrl;
		sendUrlChangedMessage();
	}
}

window.addEventListener("visibilitychange", function(){
	if (document.visibilityState === 'visible'){
		console.log("visibilitychange: visible");
		stopUrlPolling();
		startUrlPolling();
	}else{
		console.log("visibilitychange: not visible");
		stopUrlPolling();
	}
});

function sendUrlChangedMessage() {
	let data = {
		url: getCurrentUrl()
	};
	console.log('send url changed message', data);
	sendMessageToBackground(BackgroundMessages.UrlChanged, Sources.PageEditor, data);
}

startUrlPolling();
//============================================================================================
//   Selector validation
//============================================================================================

window.getIframes = function(){
	let iframes = document.querySelectorAll('iframe');
	let validIframes = [];
	iframes.forEach(function(iframeNode){
		try{
			if(iframeNode.contentDocument){
				validIframes.push(iframeNode);
			}
		}
		catch(err){
			// We can't access contendDocument from iFrame with different origin,
			// and it is OK.
		}
	});
	return validIframes;
}

function evaluteSelectorInAllIframes(selector, evaluateFunc){
	var result = [];
	result.push({
		documentNode: document,
		elements: evaluateFunc(document, selector)
	});
	getIframes().forEach(function(iframeNode){
		result.push({
			documentNode: iframeNode.contentDocument,
			elements: evaluateFunc(iframeNode.contentDocument, selector)
		});
	});
	return result;
}

function serializeElements(elements){
	return elements.map(e=>{
		return {
			domElement: e,
			isInspected: e===$0,
			tagName: e.tagName,
			id: e.id,
			name: e.name,
			type: e.type,
			classNames: Array.from(e.classList),
			innerText: getFirstLevelText(e),
			displayed: getIsDisplayed(e),
			containsTags: e.innerHTML.indexOf('<') != -1,
			hasChildren: !!e.children.length,
		};
	});
}

function serializeiFrames(iframeData){
	for (var i = iframeData.length - 1; i >= 0; i--) {
		iframeData[i].elements = serializeElements(iframeData[i].elements);
	};
	return iframeData;
}

function getIsDisplayed(element){
	return !!( element.offsetWidth || element.offsetHeight || element.getClientRects().length );
}



function getFirstLevelText(e){
	var firstText = "";
	for (var i = 0; i < e.childNodes.length; i++) {
	    var curNode = e.childNodes[i];
	    if (curNode.nodeType === Node.TEXT_NODE) {
	        firstText += curNode.nodeValue;
	    }
	}
	return firstText.trim();
}

window.locateInspectedElement = function(cssSelectors, xpathSelectors){
	if(!$0){
		return null;
	}
	let partIndex=-1;
	let partElements;
	let isXpathElements;
	let blankPartIndex=-1;
	let blankPartElements;
	let inspectedElement = $0;

	let maxLength = Math.max(cssSelectors.length, xpathSelectors.length);
	if(maxLength){
		// find out if inspected element belongs to any of current selector parts
		let partsElements = [];
		for (var i = maxLength-1; i >= 0; i--) {
			let elements = {
				css: null,
				xpath: null
			};
			partsElements.push(elements);
			if(cssSelectors[i]){
				elements.css = evaluateCss(cssSelectors[i]);
				if(getElementIndex(elements.css, inspectedElement)!=-1){
					partIndex=i;
					partElements = elements.css;
					isXpathElements = false;
					break;
				}
			}
			if(xpathSelectors[i]){
				elements.xpath = evaluateXpath(xpathSelectors[i]);
				if(getElementIndex(elements.xpath, inspectedElement)!=-1){
					partIndex=i;
					partElements = elements.xpath;
					isXpathElements = true;
					break;
				}
			}
		}

		if(partIndex==-1){
			// inspected element does not belong to any of the current selector parts
			// we should find a location for the blank part
			blankPartIndex = getBlankPartIndex(partsElements.reverse(), inspectedElement);
		}
	}else{
		// selector has no parts, so blank part will be the first one
		blankPartIndex=0;
	}

	// we gonna create a blank part, so will need inspected element data
	if(blankPartIndex!=-1){
		blankPartElements = serializeiFrames([{
			documentNode: getDocumentOf(inspectedElement),
			elements: [inspectedElement]
		}]);
	}

	return {
		partIndex: partIndex,
		partElements: partElements,
		isXpathElements: isXpathElements,
		blankPartIndex: blankPartIndex,
		blankPartElements: blankPartElements
	};
}

window.getBlankPartIndex = function(partsElements, blankPartElement){
	return getElementPartIndex(partsElements, blankPartElement.parentNode) + 1;
}

window.getElementPartIndex = function(partsElements, element){
	if(!element){
		return -1;
	}
	for (var i = partsElements.length - 1; i >= 0; i--) {
		if(partsElements[i].css && getElementIndex(partsElements[i].css, element)!=-1){
			return i;
		}
		if(partsElements[i].xpath && getElementIndex(partsElements[i].xpath, element)!=-1){
			return i;
		}
	}
	return getElementPartIndex(partsElements, element.parentNode);
}

window.getElementIndex = function(iframeData, element){
	let elementIndex=0;
	for (var i = 0; i<iframeData.length ; i++ ) {
		for (var j = 0; j < iframeData[i].elements.length; j++) {
			if(iframeData[i].elements[j].domElement==element){
				return elementIndex;
			}
			elementIndex++;
		};
	};
	return -1;
}

window.getDocumentOf = function(element){
	if(element.parentNode){
		return getDocumentOf(element.parentNode);
	}
	return element;
}

window.evaluateXpath = function find(xpath) {
    if(!xpath){
    	return [];
    }
    var start = performance.now();
	var result = serializeiFrames(evaluteSelectorInAllIframes(xpath, function(rootElement, selector){
	    var result = [];
	    var nodes = document.evaluate(selector, rootElement, null, XPathResult.ANY_TYPE, null);
	    var currentNode = nodes.iterateNext();
	    while (currentNode) {
	        result.push(currentNode);
	        currentNode = nodes.iterateNext();
	    }
	    return result;
	}));
	result[0].timeStatus = xpath + ": " + (performance.now()-start) + " ms.";
	return result;
};

window.evaluateCss = function find(css) {
	if(!css){
		return {};
	}
	var start = performance.now();
	var result = serializeiFrames(evaluteSelectorInAllIframes(css, function(rootElement,selector){
		return Array.from(rootElement.querySelectorAll(selector));
	}));

	result[0].timeStatus = css + ": " + (performance.now()-start) + " ms.";
	return result;
};

window.evaluateSelector = function(selector, isXpath){
	return isXpath?evaluateXpath(selector):evaluateCss(selector);
};

window.locateChild = function(element, childIndicesChain){
	childIndicesChain = childIndicesChain.split(',');
	for (var i = 0; i<childIndicesChain.length;i++) {
		let childIndex = childIndicesChain[i];
		element=element.children[childIndex];
		if(!element){
			return null;
		}
	};
	return element;
};

window.locateByIndex = function(iframeDataList, iframeIndex, elementIndex){
	let element;
	if(iframeIndex !=undefined && elementIndex!=undefined){
		var iframeData = iframeDataList[iframeIndex];
		if(!iframeData){
			return null;
		}
		element = iframeData.elements[elementIndex];
	}else{
		var arr = [].concat.apply([], iframeDataList.map(function(iframeData){return iframeData.elements;}));
		element = arr[0];
	}
	if(!element){
		return null;
	}
	return element.domElement;
}

window.loadChildrenForInspectedElement = function(){
	return loadChildrenForElement($0);
};

window.loadChildren = function(selector, isXpath, iframeIndex, elementIndex){
	var iframeDataList = evaluateSelector(selector, isXpath);

	var iframeData = iframeDataList[iframeIndex];
	if(!iframeData){
		console.log('No element for specified iframeIndex: ' + iframeIndex);
	}

	let element = iframeData.elements[elementIndex];
	if(!element){
		console.log('No element for specified elementIndex: ' + elementIndex);
	}
	return loadChildrenForElement(element.domElement);
};

window.loadChildrenForElement = function(element){
	var result = serializeElements(Array.from(element.children));
	for (var i = element.children.length - 1; i >= 0; i--) {
		result[i].children = loadChildrenForElement(element.children[i]);
	};
	return result;
};

function inspectElement(element){
	if(element!=$0){
		element.scrollIntoViewIfNeeded();
		inspect(element);
	}
};

window.inspectInspectedChild = function(childIndicesChain){
	if(!childIndicesChain){
		throw Error('childIndicesChain was be specified.');
	}

	element = locateChild($0, childIndicesChain);
	if(!element){
		console.log('Child was not located. ' + childIndicesChain);
		return;
	}

	inspectElement(element);
};

window.locateElement = function(iframeDataList, iframeIndex, elementIndex, childIndicesChain){
	let element = locateByIndex(iframeDataList, iframeIndex, elementIndex);
	if(!element){
		console.log("Element was not located by index. " + iframeIndex + ',' + elementIndex);
	}
	if(childIndicesChain){
		element = locateChild(element, childIndicesChain);
		if(!element){
			console.log('Child was not located. ' + childIndicesChain);
			return;
		}
	}
	return element;
};

window.inspectXpathSelector = function(xpath, iframeIndex, elementIndex, childIndicesChain){
	let element = locateElement(evaluateXpath(xpath), iframeIndex, elementIndex, childIndicesChain);
	inspectElement(element);
};

window.inspectCssSelector = function(css, iframeIndex, elementIndex, childIndicesChain){
	let element = locateElement(evaluateCss(css), iframeIndex, elementIndex, childIndicesChain);
	inspectElement(element);
};

window.createHighlighterElement = function(documentNode, clientRect, highlightColor, opacity, className){
	var highlighterElement = documentNode.createElement('div');
	highlighterElement.classList.add(className);
	highlighterElement.style.left = (documentNode.scrollingElement.scrollLeft + clientRect.left) + 'px';
	highlighterElement.style.top = (documentNode.scrollingElement.scrollTop + clientRect.top) +'px';
	highlighterElement.style.width = clientRect.width+'px';
	highlighterElement.style.height = clientRect.height+'px';
	highlighterElement.style.position = 'absolute';
	highlighterElement.style.backgroundColor = highlightColor;
	// highlighterElement.style.border = '3px dashed firebrick';
	highlighterElement.style.opacity = opacity;
	highlighterElement.style.boxSizing = 'border-box';
	highlighterElement.style.zIndex = '999999999999999999999999999999999999999999999999999999999999999';
	let bodyElement = documentNode.documentElement.querySelector('body');
	bodyElement.appendChild(highlighterElement);
};

window.higlightElement = function(documentNode, element, highlightColor, opacity, className){
	let clientRects = Array.from(element.getClientRects());
	clientRects.forEach((clientRect)=>{
		createHighlighterElement(documentNode, clientRect, highlightColor, opacity, className);
	});
}

window.higlightElement2 = function(documentNode, element, highlightOptions){
	for(let name in highlightOptions){
		element.style.setProperty(name, highlightOptions[name], 'important');
	}
}

window.hightlightElementsInIframe = function(iframeNode, iframeElements, highlightColor){
	if(iframeElements[0]){
		// .scroll to first
		iframeElements[0].scrollIntoViewIfNeeded();
		// iframeElements[0].scrollIntoView({
		//   	behavior: "smooth",
		//     block:   "end"
		// });
	}
	iframeElements.forEach((iframeElement)=>{
		higlightElement(iframeNode, iframeElement, highlightColor, 0.66, 'websync-highlighter');
	});
};

window.hightlightElementsInIframe2 = function(iframeNode, iframeElements, highlightOptions){
	iframeElements.forEach((iframeElement)=>{
		higlightElement2(iframeNode, iframeElement, highlightOptions);
	});
};

window.hightlightComponentsInIframe = function(iframeNode, iframeElements){
	iframeElements.forEach((iframeElement)=>{
		higlightComponent(iframeNode, iframeElement);
	});
}

window.higlightComponent = function(documentNode, element){
	// let clientRects = Array.from(element.getClientRects());
	// if(element.tagName=='IMG'){
	// 	element.setAttribute('data-actualsrc',element.getAttribute('src'));
	// 	element.setAttribute('src', "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8v5ThPwAG9AKluA28GQAAAABJRU5ErkJggg==");
	// }
	element.setAttribute('ws-highlight', '');
	element.setAttribute('ws-list-selector', '');
	// clientRects.forEach((clientRect)=>{
	// 	createHighlighterElement(documentNode, clientRect, "rgba(255, 165, 0, 1)", 1, 'websync-component-highlighter');
	// });
};

window.HL_GREEN = "rgb(106, 166, 219)";
//rgb(244, 128, 36);
window.HL_YELLOW = "rgb(106, 166, 219)";

window.highlightInspectedElement = function(childIndicesChain){
	removeHighlighting();
	let element = $0;
	if(childIndicesChain){
		element = locateChild(element, childIndicesChain);
		if(!element){
			console.log('Child was not located. ' + childIndicesChain);
			return;
		}
	}
	higlightElement(document, element, window.HL_GREEN, 0.66, 'websync-highlighter');
};

window.highlightSelector = function(selector, isXpath, iframeIndex, elementIndex, childIndicesChain){
	removeHighlighting();

	var iframeDataList = evaluateSelector(selector, isXpath);

	let elementsCount = iframeDataList.reduce(function(prev, id) {return prev + id.elements.length;}, 0);
	if(!elementsCount){
		return;
	}

	let highlightColor = elementsCount==1?HL_GREEN:HL_YELLOW;

	if(iframeIndex !=undefined && elementIndex!=undefined){
		if(iframeDataList[iframeIndex]){
			var iframeData = iframeDataList[iframeIndex];
			if(!iframeData){
				console.log('Iframe not found. ' + selector + ', ' + iframeIndex);
				return;
			}
			let element = iframeData.elements[elementIndex].domElement;
			if(childIndicesChain){
				element = locateChild(element, childIndicesChain);
				if(!element){
					console.log('Child was not located. ' + selector + ', ' + childIndicesChain);
					return;
				}
			}

			hightlightElementsInIframe(iframeData.documentNode, [element], highlightColor);
		}
		else{
			console.log('No element for specified iframeIndex and elementIndex: ' + iframeIndex + ', ' + elementIndex);
		}
	}
	else{
		iframeDataList.forEach((iframeData)=>{
			hightlightElementsInIframe(iframeData.documentNode, iframeData.elements.map(e=>e.domElement), highlightColor);
		});
	}
};

window.highlightRootSelector = function(selector, isXpath){
	removeHighlighting();
	let iframeDataList = evaluateSelector(selector, isXpath);
	let highlightOptions = {
		outline: '1px dashed black'
	};
	iframeDataList.forEach((iframeData)=>{
		hightlightElementsInIframe2(iframeData.documentNode, iframeData.elements.map(e=>e.domElement), highlightOptions);
	});
}

window.removeRootHighlighting = function(selector, isXpath){
	removeHighlighting();
	let iframeDataList = evaluateSelector(selector, isXpath);
	let highlightOptions = {
		outline: ''
	};
	iframeDataList.forEach((iframeData)=>{
		hightlightElementsInIframe2(iframeData.documentNode, iframeData.elements.map(e=>e.domElement), highlightOptions);
	});
}

window.highlightComponents = function(json){
	if(!json){
		// remove all highlighting
		removeComponentsHighlighting();
	}
	var selectors = JSON.parse(json);
	selectors.forEach(selector=>{
		var iframeDataList=[];
		if(selector.xpath){
			iframeDataList = evaluateSelector(selector.xpath, true);
		}else if(selector.css){
			iframeDataList = evaluateSelector(selector.css, false);
		}
		iframeDataList.forEach((iframeData)=>{
			hightlightComponentsInIframe(iframeData.documentNode, iframeData.elements.map(e=>e.domElement));
		});
	});
}

window.removeHighlightingInIframe = function(iframeNode, highlighterSelector){
	if(!iframeNode){
		return;
	}
	let highlighterElements = Array.from(iframeNode.querySelectorAll(highlighterSelector));
	highlighterElements.forEach(function(highlighterElement){
		highlighterElement.remove();
	});
};

window.removeHighlighting = function(){
	removeHighlightingInIframe(document, '.websync-highlighter');
	getIframes().forEach(function(iframeNode){
		removeHighlightingInIframe(iframeNode.contentDocument,'.websync-highlighter');
	});
};

window.removeComponentHighlightingInIframe = function(iframeNode, iframeElements){
	if(!iframeNode){
		return;
	}
	iframeElements.forEach((iframeElement)=>{
		// if(iframeElement.tagName=='IMG'){
		// 	iframeElement.setAttribute('src', iframeElement.getAttribute('data-actualsrc'));
		// 	iframeElement.removeAttribute('data-actualsrc');
		// }
		iframeElement.removeAttribute('ws-highlight');
		iframeElement.removeAttribute('ws-list-selector');
		// higlightComponent(iframeNode, iframeElement);
	});

	// let highlightedElements = Array.from(iframeNode.querySelectorAll(highlightedSelector));
	// highlightedElements.forEach(function(highlightedElement){
	// 	highlightedElement.removeAttribute('ws-highlight');
	// 	highlightedElement.removeAttribute('ws-list-selector');
	// });
};

window.removeComponentsHighlighting = function(json){
	var selectors = json?
		JSON.parse(json):
		[{css: '*[ws-highlight][ws-list-selector]'}];
	selectors.forEach(selector=>{
		var iframeDataList=[];
		if(selector.xpath){
			iframeDataList = evaluateSelector(selector.xpath, true);
		}else if(selector.css){
			iframeDataList = evaluateSelector(selector.css, false);
		}
		iframeDataList.forEach((iframeData)=>{
			removeComponentHighlightingInIframe(iframeData.documentNode, iframeData.elements.map(e=>e.domElement));
		});
	});
	// var selectors = JSON.parse(json);
	// removeComponentHighlightingInIframe(document, '*[ws-highlight][ws-list-selector]');
	// getIframes().forEach(function(iframeNode){
	// 	removeComponentHighlightingInIframe(iframeNode.contentDocument, '*[ws-highlight][ws-list-selector]');
	// });
}