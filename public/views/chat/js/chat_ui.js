
var imgPreloader = new IMGPreloader();

var socket;
var socketQuery;

jq(document).ready(function() {
//jq(document).on('AppReady', function(e) {
  jq(function() {
    FastClick.attach(document.body);
  });
//  jq(function() {
//    var xStart, yStart = 0;
//
//    document.addEventListener('touchstart',function(e) {
//      //if div overflowing then ignore this codes
//        xStart = e.touches[0].screenX;
//        yStart = e.touches[0].screenY;
//    });
//
//    document.addEventListener('touchmove',function(e) {
//        var xMovement = Math.abs(e.touches[0].screenX - xStart);
//        var yMovement = Math.abs(e.touches[0].screenY - yStart);
//        if((yMovement * 3) > xMovement) {
//            e.preventDefault();
//        }
//    });
//  });


  sessionData = JSON.parse(jq('#data-session').html());
  var idSession = sessionData.idSession;
  var idPath = sessionData.path;
  var PIN = sessionData.PIN;
  var isTeacher = sessionData.isTeacher;
  var port = sessionData.port;
  var activities = sessionData.activities;

  window.isPreview = sessionData.isPreview;
  window.isLoggedIn = sessionData.isLoggedIn;
  window.idLesson = sessionData.idLesson;
//  console.log("Start");
  if (sessionData.isDevelopment) {
    window.isDevelopment = sessionData.isDevelopment;
  }

  if (!activities) {// || activities.length === 0) {
    document.isActivitiesNull = true;
  }

  window.isTeacher = isTeacher;
  window.idSession = idSession;
  window.idPath = idPath;


  window.appToServer = appToServer;
  window.pluginToServer = pluginToServer;
  window.sendPing = sendPing;

//  console.log(sessionData);

  if (window.isPreview) {

  } else {


    var query = (isTeacher) ? 'idSessionTeacher=' + idSession : 'idSession=' + idSession;

    var parameters = getUrlVars();
    var cookieName = parameters.name;

    if (!cookieName) {
      cookieName = getCookie("username").trim();
    } else {
      //for test users
      query += '&isTestUser=true';
    }


    if (cookieName && cookieName != "") {
      query += '&username=' + cookieName;
    }
//  console.log(query);
//  var socket;
    if (port) {
//    console.log(window.location.protocol + "//" + window.location.hostname, {query: query});
//    socket = io.connect(window.location.protocol + "//" + window.location.hostname, {query: query});

//    console.log(window.location.protocol + "//socket." + window.location.hostname, {query: query});
//    socket = io.connect(window.location.protocol + "//socket." + window.location.hostname, {query: query});
//    var socketURL = 'http://128.199.182.26:80';
      var socketURL = window.location.protocol + "//socket." + window.location.hostname + ":" + port;
//    alert(socketURL);
//    socket = io.connect(socketURL,{'transports': ['polling','websocket']}, {query: query});
      socket = io.connect(socketURL, {query: query});

//    socket = io.connect(window.location.protocol + "//socket." + window.location.hostname + ":" + port, {query: query});
    } else {
//    console.log(window.location.origin + ":" + port);
//    socket = io.connect('http://192.168.1.8:3000', {query: query});
//    socket = io.connect(window.location.origin,{'transports': ['polling','websocket']}, {query: query});
      var socketURL = window.location.origin;
      socket = io.connect(socketURL, {query: query});
//    socketQuery = query;
//    socketConnect();
    }
//  var socket = io.connect(window.location.origin,{query:query});//, query2:'isTeacher=' +isTeacher}); 
//  var socket = io.connect(window.location.hostname + ":" + ,{query:query});
    var chatApp = new Chat(socket, isTeacher);

    var intervalTimer;

    socket.on('connect', function() {
//    document.socketID = socket.socket.sessionid;
      document.socketID = socket.io.engine.id;
//    console.log(socket.socket.sessionid);
      setTimeout(function() {
        jq("#myModal").modal('hide');
        jq(".modal-backdrop").remove();
      }, 1000);

      setTimeout(function() {
        socket.emit('ping', {t: (new Date()).valueOf()});
      }, 500);

      clearInterval(intervalTimer);
      intervalTimer = setInterval(function() {
        socket.emit('ping', {t: (new Date()).valueOf()});
      }, 60 * 1000 * 1);//0.5minutes

      checkLessonReady();
    });

    socket.on('disconnect', function() {
      Messenger().post({
        message: 'Disconnected',
        type: 'error',
        id: 'connection',
        hideAfter: 10,
        showCloseButton: true
      });

      clearInterval(intervalTimer);
    });

    socket.on('pong', function(data) {
      var currentTime = (new Date()).valueOf();
      var latency = currentTime - data.timeSentByClient;
      var currentServerTime = data.timeServer + latency / 2;
      difference = currentServerTime - currentTime;
      document.timeDifference = difference;
//    console.log("Time Difference (ms):" + document.timeDifference);
//    jq("#nameHeader").text(document.timeDifference);
    });

    socket.on('nameResult', function(result) {
      var message;

      if (result.success) {
        message = 'You are now known as ' + result.name + '.';
      } else {
        message = result.message;
      }
//    jq('#messages').append(divSystemContentElement(message));
    });

    socket.on('joinResult', function(result) {
      document.socketID = result.customID;
//    jq('#room').text(result.room);
//    jq('#messages').append(divSystemContentElement('Room changed.'));
//    console.log("Join Result %O", result);
      if (result.room == 'Lobby')
      {
        if (isTeacher)
        {
          var message = {type: 'TeacherJoinSession', idSession: idSession};
//        message = JSON.stringify(message);
          jq(document).trigger('teacherToServer', {detail: message});
        } else {
          appToServer('StudentJoinSession', {idSession: idSession});
        }
      } else if (result.room === idSession) {
        var message = {type: 'StudentJoinSessionSuccess', idSession: idSession};
        jq(document).trigger('serverToStudent', {detail: message});

        if (!isTeacher) {
          var serverName = result.customName;
          if (!result.isRandom) {
            randomNameFromServer = serverName;
            updateNameUI(serverName);
          } else {
            randomNameFromServer = serverName;
            setTimeout("changeUsername()", 300);
          }

          if (!document.student) {
            document.student = {};
          }
          document.student.name = randomNameFromServer;
        }

        var messageToShow = "Joined Classroom as Student!";
        if (isTeacher) {
          messageToShow = "Joined Classroom as Teacher!";
        }
        Messenger().post({
          message: messageToShow,
          type: 'success',
          id: 'connection',
          hideAfter: 5,
          showCloseButton: true
        });
      }
    });

    socket.on('serverToStudent', function(message) {
      jq(document).trigger('serverToStudent', {detail: message});

    });

    socket.on('serverToTeacher', function(message) {
      jq(document).trigger('serverToTeacher', {detail: message});
    });

    socket.on('ServerToApp', function(message) {
      if (message.type == 'ServerToPlugin') {
        console.log("ServerToPlugin" + message.pluginName + ": %O", message);
        jq(document).trigger("ServerToPlugin" + message.pluginName, {detail: message});

        var frameElement = jq("#frameMiniApp");
        if (frameElement.length > 0) {
          if (frameElement[0].contentWindow.$) {
            var bodyElement = frameElement[0].contentWindow.$(frameElement[0].contentWindow.document);
            if (bodyElement.length > 0) {
              bodyElement.trigger("ServerToPlugin" + message.pluginName, {detail: message});
            }
          }
        }

        if (message.pluginName === 'WALL_STUDENT' || message.pluginName === 'GROUPER') {
          frameElement = jq("#frameDialog");
          if (frameElement.length > 0) {
            if (frameElement[0].contentWindow.$) {
              var bodyElement = frameElement[0].contentWindow.$(frameElement[0].contentWindow.document);
              if (bodyElement.length > 0) {
                bodyElement.trigger("ServerToPlugin" + message.pluginName, {detail: message});
              }
            }
          }
        }
      } else {
        console.log("Server To App: %O", message);
        jq(document).trigger('ServerToApp', {detail: message});
      }
    });

    jq(document).on('teacherToServer', function(event, param) {
      chatApp.teacherToServer(JSON.stringify(param.detail));
    });
    jq(document).on('studentToServer', function(event, param) {
      chatApp.studentToServer(JSON.stringify(param.detail));
    });

//  document.addEventListener('teacherToServer', function(e) {
//    chatApp.teacherToServer(e.detail);
//  }, false);
//  document.addEventListener('studentToServer', function(e) {
//    chatApp.studentToServer(e.detail);
//  }, false);


  }

  function pluginToServer(pluginName, pluginMessageType, data) {
    var messageData = {
      type: 'PluginToServer',
      pluginName: pluginName,
      pluginMessageType: pluginMessageType,
      data: data
    };

    console.log('pluginToServer' + pluginName + ': %O', messageData);
    messageData = JSON.stringify(messageData);
    toServer(messageData);
  }

  function appToServer(type, data) {
    var message = {type: type, data: data};
    console.log('appToServer: %O', message);
    message = JSON.stringify(message);
    toServer(message);

  }

  function toServer(data) {
    if (window.isPreview) {
      return;
    }
    if (window.isTeacher)
      chatApp.teacherToServer(data);
    else
      chatApp.studentToServer(data);

  }

  function sendPing() {
    socket.emit('ping', {t: (new Date()).valueOf()});
  }

  //window.studentToServer = appToServer();


  jq(document).on('ServerToPlugin' + 'STUDENT', function(event, param) {
    var messageReceived = param.detail;

    switch (messageReceived.pluginMessageType)
    {
      case 'StudentSetNameResponse':
        updateUsername(messageReceived.data);
        break;
    }
  });

  jq("#open-left").click(function(event) {
    event.preventDefault();
    if (snapper.state().state === "left") {
      snapper.close();
    } else {
      snapper.open('left');
    }
  });
  jq(".open-right").click(function(event) {
    event.preventDefault();
//    console.log(snapper);
    if (snapper.state().state === "right") {
      snapper.close();
    } else {
      snapper.open('right');
    }
  });
  jq("#menuChangeName").click(function(event) {
    event.preventDefault();
    usernameSetBefore = false;
    changeUsername();
  });
  jq("body").keydown(function(e) {
    switch (e.keyCode) {
      case 37: //left
      case 33: //pageup
        var buttonElement = $(".js-question-previous")[0];
        if (buttonElement){          
          if ($(buttonElement).is(':visible'))
            buttonElement.click();
        }
        break;
      case 39: //right
      case 34: //pagedown
        var buttonElement = $(".js-question-next")[0];
        if (buttonElement)
          if ($(buttonElement).is(':visible'))
            buttonElement.click();
        break;
    }
  });


  jq(".js-fullscreen").click(function(e) {
    e.preventDefault();
    switchFullScreen();
    snapper.close();
  });

  jq(".js-nav-adventure").click(function(e) {
    jq('li').each(function() {
      jq(this).removeClass("nav-bar-active");
    });
    jq(".js-nav-adventure").parent().addClass("nav-bar-active");
  });

  jq(".js-nav-campfire").click(function(e) {
    jq('li').each(function() {
      jq(this).removeClass("nav-bar-active");
    });
    jq(".js-nav-campfire").parent().addClass("nav-bar-active");
  });
  jq(".js-nav-teststudents").click(function(e) {
    jq('li').each(function() {
      jq(this).removeClass("nav-bar-active");
    });
    jq(".js-nav-teststudents").parent().addClass("nav-bar-active");
  });
  jq(".js-nav-signout").click(function(e) {
    jq('li').each(function() {
      jq(this).removeClass("nav-bar-active");
    });
    jq(".js-nav-signout").parent().addClass("nav-bar-active");
  });

});

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++)
  {
    var c = ca[i].trim();
    if (c.indexOf(name) === 0)
      return c.substring(name.length, c.length);
  }
  return "";
}

var randomNameFromServer;


function changeUsername(nameFromServer)
{
  var currentName;
  if (document.student && document.student.name)
    currentName = document.student.name;

  if (nameFromServer)
    currentName = nameFromServer;
//  var username = prompt("Please enter your name", currentName);

  if (!currentName || currentName === "") {
    currentName = randomNameFromServer ? randomNameFromServer : "";
  }

  bootbox.hideAll();

  bootbox.prompt({
    title: "Enter your name",
    value: currentName,
    callback: function(username) {
      if (username === null || username === "" || username === currentName) {
        if (username === null || username === "") {
          username = randomNameFromServer ? randomNameFromServer : "";
        }
        updateNameUI(username);
        setCookie("username=" + username);
      } else {
        pluginToServer('STUDENT', 'StudentSetName', {name: username});
      }
    }});

}

var usernameSetBefore = false;

function updateUsername(data)
{
  updateNameUI(data.name);
  if (data.success)
  {
    document.student.name = data.name;
    if (getCookie("username").trim() === data.name) {
      setCookie("username=" + data.name);
      return;
    }

    setCookie("username=" + data.name);

    Messenger().post({
      message: 'Changed name: ' + (data.name),
      type: 'success',
      hideAfter: 5,
      showCloseButton: true
    });

    usernameSetBefore = true;
  } else {
//    document.student.name = data.name;
//    document.cookie = "username=" + data.name + "; path=/";
    if (!usernameSetBefore) {
      //ignore temporarily
      changeUsername(data.name);
    }
  }
}

document.student = {};

function checkLessonReady() {
  if (window.isTeacher && document.isActivitiesNull) {
    var message = {
      type: 'UrlUpdate',
      title: 'Lesson Picker',
      resourceURL: '/plugins/lessonPicker/lessonPickerTeacher.html'
//      isLocked: data.isLocked
    }
    setTimeout(function() {
      jq(document).trigger('MiniApp', {detail: message});
    }, 1000);
  }
}

function switchFullScreen() {
//  console.log(document.fullsscreenElement);
  if (document.fullscreenElement || // alternative standard method
      document.mozFullScreenElement ||
      document.webkitFullscreenElement || document.msFullscreenElement) {
    exitFullscreen();
  } else {
    enterFullscreen();
  }
}

function enterFullscreen() {
  var element = document.documentElement;
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
//  document.getElementById('enter-exit-fs').onclick = exitFullscreen;
}
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

function getUrlVars(documentTarget) {

  var vars = {};
  var frameURL = decodeURIComponent(document.location.href);
  if (documentTarget) {
    frameURL = decodeURIComponent(documentTarget.location.href);
  }


  if (frameURL.indexOf('?') < 0) {
    return vars;
  }
  var parts = frameURL.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value;
  });
  return vars;
}



function updateNameUI(name) {
  jq("#menuName").html(name);
  jq("#nameHeader").html(name);
}
function setCookie(params) {
  var d = new Date();
  var exdays = 10;
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = params + ";domain=" + window.location.hostname + ";path=/;" + expires + ";";
}

/* Prevent Safari opening links when viewing as a Mobile App */
(function(a, b, c) {
  if (c in b && b[c]) {
    var d, e = a.location,
        f = /^(a|html)jq/i;
    a.addEventListener("click", function(a) {
      d = a.target;
      while (!f.test(d.nodeName))
        d = d.parentNode;
      "href" in d && (d.href.indexOf("http") || ~d.href.indexOf(e.host)) && (a.preventDefault(), e.href = d.href)
    }, !1)
  }
})(document, window.navigator, "standalone");

//function socketConnect() {
//  var socketURL = window.location.origin;
//  socket = io.connect(socketURL, {query: socketQuery});
////  console.log(socket);
//}
//
//function socketDisconnect() {
//  socket.io.disconnect();
//}