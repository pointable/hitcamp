function initPluginHandler() {
  var PLUGIN_NAME = 'PLUGIN_HANDLER';

//  var currentPlugin = {};

  jq(document).ready(function() {
//  jq(document).on('AppReady', function(e) {

    jq(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
      console.log("ServerToPlugin Received:, %O", param);
//    jq(document).on('ServerToPlugin' + PLUGIN_NAME, function(e) {
      var messageReceived = param.detail;

      switch (messageReceived.pluginMessageType)
      {
        case 'TriggerPlugin':
          processTriggerPlugin(messageReceived.data);
          break;
        case 'TriggerPluginNotification':
          processTriggerPluginNotification(messageReceived.data);
          break;
        case 'ClosePlugin':
          processClosePlugin(messageReceived.data);
          break;
        case 'ClosePluginNotification':
          processClosePluginNotification(messageReceived.data);
          break;
        case 'ShowMessage':
          processShowMessage(messageReceived.data);
          break;
        case 'ActivityChanged':
          processActivityChanged(messageReceived.data);
          break;
      }
    });
  });

  document.plugin = {};
  function processTriggerPluginNotification(data) {
    document.plugin.pluginName = data.pluginName;
    document.plugin.isActive = true;
    //notify you that plugin running;
    var message = {
      type: 'UpdatePluginStatus',
      pluginName: data.pluginName,
      active: true
    };
    jq(document).trigger('MiniApp', {detail: message});
    jq(document).trigger('PluginNotification', {detail: message});

    var frameElement = jq("#frameMiniApp");
    if (frameElement.length > 0) {
      if (frameElement[0].contentWindow.$) {
        var bodyElement = frameElement[0].contentWindow.$(frameElement[0].contentWindow.document);
        if (bodyElement.length > 0) {
          bodyElement.trigger("PluginStatus", {detail: message});
        }
      }
    }

    var msg;
    msg = Messenger().post({
      message: data.pluginTitle + ' running',
      type: 'info',
      hideAfter: 50000,
      id: PLUGIN_NAME,
      actions: {
        retry: {
          label: 'Open',
          action: function() {
            if (document.pluginListenerReady) {
              console.log(data.pluginName);
              var message = {
                type: 'ShowPlugin',
                pluginName: data.pluginName,
//                resourceURL: data.pluginTeacherURL,
                isLocked: false
              }
              jq(document).trigger('MiniApp', {detail: message});
            }
          }
        },
        cancel: {
          label: 'End Campfire App',
          action: function() {
            console.log(data);
            sendExitPlugin(data.pluginName);
            msg.hide();
//            return msg.update({
//              msg.hide();
//            });
          }
        }
      }
    });
  }
  var tempData;
  function processTriggerPlugin(data) {
    document.pluginHandler = {};
    document.pluginHandler.isLocked = true;
    console.log("### document.pluginListenerReady" + document.pluginListenerReady);
    if (document.pluginListenerReady) {
      bootbox.hideAll();

      console.log("Listener ready");
      var message = {
        type: 'UrlUpdate',
        title: data.pluginTitle,
        resourceURL: data.pluginURL,
        isLocked: data.isLocked
      }

      jq(document).trigger('MiniApp', {detail: message});
    } else {
      console.log("Listener not ready");
      //store and wait
      tempData = data;
    }
  }


  document.pluginHandlerCheck = function() {

    console.log("PluginHandlerCheck called by app when route ready");
    var data = tempData;
    if (!data) {
      //no mini app
//      console.log("### no miniapp");
//      var message = {
//        type: 'ListActivities'
//      };
//      var event = new CustomEvent('initializeApps', {detail: message});
//
//      setTimeout(function() {
//        document.dispatchEvent(event);
//        tempData = null;
//      }, 300);
      return;
    } else {
//      console.log("### miniapp is here");
      var message = {
        type: 'UrlUpdate',
        title: data.pluginTitle,
        resourceURL: data.pluginURL,
        isLocked: data.isLocked
      }
      setTimeout(function() {
        jq(document).trigger('MiniApp', {detail: message});
        tempData = null;
      }, 1500);
    }
  };

  function processClosePlugin(data) {
    if (document.pluginHandler) {
      document.pluginHandler.isLocked = false;
    }

    jq(document).off('ServerToPlugin' + data.pluginName);


//    jq("#myModal").modal('hide');
    var message = {
      type: 'Exit',
      title: data.pluginTitle,
      resourceURL: data.pluginURL,
      isLocked: data.isLocked
    }
    jq(document).trigger('MiniApp', {detail: message});
    bootbox.hideAll();
//    window.location.hash = window.location.hash;
  }

  function processClosePluginNotification(data) {
    document.plugin = {};
    //update you status
    var message = {
      type: 'UpdatePluginStatus',
      pluginName: data.pluginName,
      active: false
    };
    jq(document).trigger('MiniApp', {detail: message});
    jq(document).trigger('PluginNotification', {detail: message});
    
    var frameElement = jq("#frameMiniApp");
    if (frameElement.length > 0) {
      if (frameElement[0].contentWindow.$) {
        var bodyElement = frameElement[0].contentWindow.$(frameElement[0].contentWindow.document);
        if (bodyElement.length > 0) {
          bodyElement.trigger("PluginStatus", {detail: message});
        }
      }
    }
    
    if (document.pluginHandler) {
      document.pluginHandler.isLocked = false;
    }
    var msg;
    msg = Messenger().post({
      message: data.pluginTitle + ' ended',
      type: 'success',
      hideAfter: 5,
      id: PLUGIN_NAME
    });
  }

  function processShowMessage(data) {
    Messenger().post({
      message: data.message,
//      id: 'Group',
      type: 'success',
      hideAfter: 10,
      showCloseButton: true
    });
  }

  function sendExitPlugin(pluginName) {
    if (!isTeacher) {
      return;
    }

    var dataToSend = {
      pluginName: pluginName
    }
//    pluginToServer(pluginName, 'EndActivity', dataToSend);
    pluginToServer(PLUGIN_NAME, 'ExitPlugin', dataToSend);
  }

  function processActivityChanged(data) {
    var idLesson = data.idLesson;
    var urlWithoutHash = document.location.href.replace(location.hash, "");
    console.log(urlWithoutHash);

    if (window.location.href === urlWithoutHash) {
      location.reload(true);
    } else {
      window.location.href = urlWithoutHash;
    }

  }

}

initPluginHandler();

//function pluginHandlerCheck(){
//  
//}
