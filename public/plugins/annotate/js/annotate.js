(function() {
  var PLUGIN_NAME = 'ANNOTATE';
  var studentSync = false;

  jq(document).ready(function() {
//  jq(document).on('AppReady', function(e) {
    if (isTeacher) {
      jq(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
        var messageReceived = param.detail;

        switch (messageReceived.pluginMessageType)
        {
          case 'TeacherDraw':
            processTeacherDraw(messageReceived.data);
            break;
          case 'TeacherWalkthroughMode':
            processTeacherWalkthroughMode(messageReceived.data);
            break;
          case 'TeacherWalkthroughModeTeacher':
            processTeacherWalkthroughModeTeacher(messageReceived.data);
            break;
        }
      });

      pluginToServer(PLUGIN_NAME, 'TeacherJoin', {});
      updateMessenger();
      //end teacher
    } else {//student
      jq(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
        var messageReceived = param.detail;

        switch (messageReceived.pluginMessageType)
        {
          case 'TeacherDraw':
            processTeacherDraw(messageReceived.data);
            break;
          case 'TeacherWalkthroughMode':
            processTeacherWalkthroughMode(messageReceived.data);
            break;
          case 'TeacherWalkthroughModeDisable':
            processTeacherWalkthroughModeDisable(messageReceived.data);
            break;
        }
      });

      pluginToServer(PLUGIN_NAME, 'StudentJoin', {});
    }

    jq(window).on('hashchange', function() {
      try {
        if (clicky) {
          clicky.log(window.location.href, document.title);
        }
      } catch (err) {
      }

      if (!isTeacher) {
        return;
      }
      document.checkWalkthrough(location.hash);
      if (msgWalkthrough) {
//        if (location.hash.indexOf("adventures") > 0 || location.hash.indexOf("activities") > 0) {
//        msgWalkthrough.show();
//        } else
//        {
//          msgWalkthrough.hide();
//        }
      }
    });

    jq(document).on('PluginNotification', function(event, param) {
      var message = param.detail;
      switch (message.type) {
        case 'UpdatePluginStatus':
          updatePluginStatus(message.active);
          break;
      }
    });
  });

  function processTeacherWalkthroughModeTeacher(data) {
    var path = data.path;
    studentSync = true;

    jq("#content-region").scrollTop(0);
    window.location.hash = path.replace("#", "");

    document.walkthroughMode = true;
    updateMessenger();
  }

  function processTeacherWalkthroughMode(data) {
    var path = data.path;

    if (!isTeacher) {
      jq("body").addClass("sync-mode");
      studentSync = true;
//      document.walkthroughMode = true;
//      updateMessenger();
    } else {

      studentSync = false;
      document.walkthroughMode = false;
      updateMessenger();
    }

    jq("#content-region").scrollTop(0);
    window.location.hash = path.replace("#", "");
  }
  function processTeacherWalkthroughModeDisable(data) {
    studentSync = false;

    if (!isTeacher) {
      jq("body").removeClass("sync-mode");
    }
  }

  function processTeacherDraw(data) {
    if (!document.canvas) {
      return;
    }
    if (location.hash !== data.hash) {
      return;
    }
    var canvas = document.canvas;

    var obj1 = data.path;
    obj1.selectable = false;
//    var obj1 = JSON.parse(data.path);
    var drawnPath = fabric.Path.fromObject(obj1, function(path) {
      canvas.add(path);
      canvas.renderAll();
    });// new fabric.Path.fromObject(obj1);

//    fabric.util.enlivenObjects([obj1], function(objects) {
//      var origRenderOnAddRemove = canvas.renderOnAddRemove;
//      canvas.renderOnAddRemove = false;
//
//      objects.forEach(function(o) {
//        canvas.add(o);
//      });
//
//      canvas.renderOnAddRemove = origRenderOnAddRemove;
//      canvas.renderAll();
//    });
  }

})();

document.walkthroughMode = false;

var currentImageSrc;

document.initCanvas = function() {
  setTimeout(function() {
    initCanvas();
  }, 300);
}

initCanvas = function() {
//  return;
//  console.log(jq("#imageDoc").css("display"));
//  debugger;
//  console.log(jq("#imageHolder").length);
  if (!jq("#imageDoc").length || jq("#imageHolder").length) {
    return;
  }

//  alert();
  if (jq("#imageDoc").attr('src') === currentImageSrc) {
    return;
  }
  currentImageSrc = jq("#imageDoc").attr('src');
//  setTimeout(function() {
  new RTP.PinchZoom(jq(".image"), {});
  jq(".pinch-zoom-container").css("height", "100%");
//  }, 500);


  var width = jq("#imageDoc").width();
  var height = jq("#imageDoc").height();
  var left = jq("#imageDoc").offset().left;// + 10;
  var top = jq("#imageDoc").offset().top - 40;

  var canvas = this.__canvas = new fabric.Canvas('c', {
    isDrawingMode: isTeacher
  });

  canvas.selection = false;
  document.canvas = canvas;

  canvas.on('path:created', function(e) {
//    console.log(e);
    if (!document.walkthroughMode) {
      return;
    }
    var path = e.path;
    var dataToSend = {path: path, hash: location.hash};
    pluginToServer('ANNOTATE', 'TeacherDraw', dataToSend);

  });


//  console.log(left);
  canvas.setWidth(width);
  canvas.setHeight(468);

  fabric.Object.prototype.transparentCorners = false;

  if (canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.color = "black";
    canvas.freeDrawingBrush.width = 4;
    canvas.freeDrawingBrush.shadowBlur = 0;
  }

//  jq(".upper-canvas").on("mousedown", function (event){
//    alert();
//  });
  jq('#divInsertFrame').on('scroll', canvas.calcOffset.bind(canvas));
  jq(".canvas-container").css("position", "initial");

//  jq(".lower-canvas").css("left", left);
//  jq(".upper-canvas").css("left", left);
//  jq(".canvas-container").css("left", left);

//  canvas.calcOffset();
//  canvas.renderAll();

  resetCanvas();

  jq(window).off("resize");
  jq(window).on("resize", function() {
    if (!jq("#imageDoc").width()) {
      jq(window).off("resize");
      return;
    }
//    setTimeout(function() {
    resetCanvas();
//    }, 300);
  });

  jq(window).off("orientationchange");
  jq(window).on("orientationchange", function() {
    jq("#content-region").scrollTop(0);
    if (!jq("#imageDoc").width()) {
      jq(window).off("orientationchange");
      return;
    }
    setTimeout(function() {
      resetCanvas();
    }, 1000);
  });
//  
//  if (document.walkthroughMode){
//    jq("#buttonWalkthrough").addClass("btn-success");    
//    jq("#buttonWalkthrough").css("visibility","hidden");
//  }else {
//    jq("#buttonWalkthrough").addClass("btn-default");    
//    jq("#buttonWalkthrough").css("visibility","visible");
//  }
//  
//  jq("#buttonWalkthrough").click (function (event) {
//    event.preventDefault();
//    if (document.walkthroughMode){
//      document.walkthroughMode = false;
//      jq("#buttonWalkthrough").addClass("btn-default");
//      jq("#buttonWalkthrough").removeClass("btn-success");
//
//    }else {
//      document.walkthroughMode = true;
//      jq("#buttonWalkthrough").addClass("btn-success");
//      jq("#buttonWalkthrough").removeClass("btn-default");
//    }
//  });
};

document.checkWalkthrough = function(path) {
  var walkthroughMode = document.walkthroughMode;
  updateMessenger(path);

  if (!walkthroughMode) {
    return;
  }

  if (path === "#adventures" || path === "#activities" || path === "#" || path === "" || (path.split('/').length - 1) === 3) {
    //submenu only
    if (path === "#adventures") {
      path = "#";
    }
//    console.log(path);
    var dataToSend = {path: path};
    pluginToServer('ANNOTATE', 'TeacherWalkthroughMode', dataToSend);

  }

};


var msgWalkthrough;
function updateMessenger(path) {
  if (document.walkthroughMode) {
    msgWalkthrough = Messenger().post({
      message: '<div style="height:20px;margin-top:-5px;"><label class="switch-light switch-android" style="width: 100px;" onclick="event.preventDefault();toggleSync();"><input id="checkbox-sync" type="checkbox" checked><span>Sync Slides<span>Off</span> <span>On</span></span><a></a></label></div>',
      type: 'success',
      hideAfter: false,
      id: PLUGIN_NAME
    });
  } else {
    msgWalkthrough = Messenger().post({
      message: '<div style="height:20px;margin-top:-5px;"><label class="switch-light switch-android" style="width: 100px;" onclick="event.preventDefault();toggleSync();"><input id="checkbox-sync" type="checkbox"><span>Sync Slides<span>Off</span> <span>On</span></span><a></a></label></div>',
      type: 'error',
      hideAfter: false,
      id: PLUGIN_NAME
    });
  }
}

function updatePluginStatus(active) {
  if (!msgWalkthrough) {
    return;
  }
  if (active) {
    console.log("hide");
    msgWalkthrough.hide();
  } else {
    console.log("show");
    msgWalkthrough.show();
  }
}

function toggleSync() {
//  console.log("walkthrough mode: " + document.walkthroughMode);
//  msgWalkthrough.hide();
  document.walkthroughMode = !document.walkthroughMode;
  if (document.walkthroughMode) {
    path = location.hash;
    if (path === "#adventures" || path === "#activities" || path === "#" || path === "" || (path.split('/').length - 1) === 3) {
      //submenu only
      if (path === "#adventures") {
        path = "#";
      }
      var dataToSend = {path: path};
      pluginToServer('ANNOTATE', 'TeacherWalkthroughMode', dataToSend);

    }

    msgWalkthrough.update({type: 'success'});
  } else {
    pluginToServer('ANNOTATE', 'TeacherWalkthroughModeDisable', {});
    msgWalkthrough.update({type: 'error'});
  }


  jq("#checkbox-sync").prop("checked", document.walkthroughMode);
// u pdateMessenger();
}

document.zoomFactor = 1;

function resetCanvas() {
  var canvas = document.canvas;
  var width = jq("#imageDoc").width();
  var height = jq("#imageDoc").height();
  var left = jq("#imageDoc").offset().left;// + 10;
  var top = jq("#imageDoc").offset().top - 44 - 40;

  var naturalWidth = jq("#imageDoc")[0].naturalWidth;
  var naturalHeight = jq("#imageDoc")[0].naturalHeight;

  var zoomFactor = width / naturalWidth;

  document.zoomFactor = zoomFactor;
  document.offsetImageX = left;
  document.offsetImageY = top;

//  console.log(zoomFactor);
//    console.log(jq("#imageDoc"));
//    console.log(naturalWidth);

  transform2d = 'scale(' + zoomFactor + ', ' + zoomFactor + ') ';
  transform2dInverse = 'scale(' + (1 / zoomFactor) + ', ' + (1 / zoomFactor) + ') ';

  jq(".lower-canvas").css({
    'webkitTransform': transform2d,
    'oTransform': transform2d,
    'msTransform': transform2d,
    'mozTransform': transform2d,
    'transform': transform2d,
    'transform-origin': 'top left',
    'position': 'absolute'
  });
  jq(".upper-canvas").css({
    'webkitTransform': transform2d,
    'oTransform': transform2d,
    'msTransform': transform2d,
    'mozTransform': transform2d,
    'transform': transform2d,
    'transform-origin': 'top left',
    'position': 'absolute'
  });
//    jq(".canvas-container").css({
//                            'webkitTransform':  transform2d,
//                            'oTransform':       transform2d,
//                            'msTransform':      transform2d,
//                            'mozTransform':     transform2d,
//                            'transform':        transform2d,
//                            'transform-origin': 'top left',
//                            'position':'absolute'
//                        });


  jq(".lower-canvas").css("left", left);
  jq(".upper-canvas").css("left", left);
  jq(".canvas-container").css("left", left);
//
  jq(".lower-canvas").css("top", top);
  jq(".upper-canvas").css("top", top);
  jq(".canvas-container").css("top", top);


  canvas.setWidth(naturalWidth);
  canvas.setHeight(naturalHeight);
  canvas.calcOffset();
  canvas.renderAll();
}