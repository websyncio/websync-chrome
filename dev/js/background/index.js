
// function injectContentScript(tabId, callback){
//   chrome.tabs.executeScript(tabId, {
//     file: 'assets/content.js',
//     runAt: 'document_start'
//   }, callback);
// }

const Sources = {
  SelectorEditorMain : 'selector-editor-main',
  SelectorEditorAuxilliary : 'selector-editor-auxilliary',
  PageEditor : 'page-editor',
  Content: 'content',
};

const MessageTypes = {
  Init: 'init',
  TabId: "tabid"
}

var connections = {};
chrome.runtime.onConnect.addListener(function (port) {
  let storeConnection = function(tabId, sourceName, port){
    if(!connections[tabId]){
      connections[tabId] = {};
    }
    connections[tabId][sourceName] = port;
    console.log(sourceName + ' for tab ' + tabId + ' connected.');
  }

  let deleteConnection = function(){
    let tabs = Object.keys(connections);
    let sources = Object.keys(Sources);
    for (var i=0; i < tabs.length; i++) {
      let tabConnections = connections[tabs[i]];
      for (var j = sources.length - 1; j >= 0; j--) {
        if (tabConnections[sources[j]] == port) {
          console.log(sources[j] + ' for tab '+ tabs[i]+' disconnected.');
          delete connections[tabs[i]]
          return;
        }
      }
    }
  }

  var listener = function (message) {
    if(!message.tabId){
      console.error("Tab Id is not specified in the message.");
      return;
    }
    if(!message.source){
      console.error("Source is not specified in the message.");
      return;
    }
    console.log('Received message from ' + message.source + ' for tab ' + message.tabId + '.');

    console.trace(message);

    if(message.type==MessageTypes.Init){
      storeConnection(message.tabId, message.source, port);
      return;
    }

    if(message.target){
      // Relay message to target
      console.log('target', message.target, connections);
      if(!connections[message.tabId] || !connections[message.tabId][message.target]){
        console.log('No connection to '+ message.target);
        return;
      }
      console.log('Relaying the message from ' + message.source + ' to ' + (message.target||'all receivers') + ' in tab ' + message.tabId + '.');
      connections[message.tabId][message.target].postMessage(message);
    }else{
      // Relay message to all except for source itself
      let sources = Object.values(Sources);
      for (var i = sources.length - 1; i >= 0; i--) {
        let target = sources[i];
        if(target==message.source){
          continue;
        }
        let targetConnection = connections[message.tabId][target];
        if(targetConnection){
          console.log('Relaying the message from ' + message.source + ' to ' + target + ' in tab ' + message.tabId + '.');
          targetConnection.postMessage(message);
        }
      };
    }
  }

  // Listen to messages sent from Selector Editor
  port.onMessage.addListener(listener);

  // Stop listening and remove connection
  port.onDisconnect.addListener(function(port) {
      port.onMessage.removeListener(listener);
      deleteConnection(port);
  });

  // We do not need init request from content script, because we already know tab id
  if(port.name===Sources.Content){
    let tabId = port.sender.tab.id;
    storeConnection(tabId, Sources.Content, port);
    console.log("Send tabId to content script");
    port.postMessage({ type: MessageTypes.TabId, tabId, target: Sources.Content});
    return;
  }
});

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        console.log("This is a first install!");
        //chrome.tabs.create({url:"update.html"});
    }else if(details.reason == "update"){
        let thisVersion = chrome.runtime.getManifest().version;
        let thisMajorVersion = thisVersion.split('.')[0];
        let previousMajorVersion = details.previousVersion.split('.')[0];
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
        if(previousMajorVersion==0 && thisMajorVersion==1){
          chrome.tabs.create({url:"updated.html"});
        }
    }
});
