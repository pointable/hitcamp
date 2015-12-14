'use strict';

var Server = require('socket.io');
var socketio = new Server({});
//var socketio = require('socket.io')({
//  // options go here
//  pingInterval: 1000
//});

var NameGenerator = require('./tools/nameGenerator');
var PLUGIN_API = require('./pluginAPI');

var parseSignedCookies = require('connect').utils.parseSignedCookies;
var _ = require('underscore');

var cookie = require('cookie');
var io;
var guestNumber = 1;
//var nickNames = {};
var namesUsed = [];
var currentRoom = {};
var app;
//var sessions = {};

exports.listen = function(server, appL) {
  app = appL;
//  appRef = app;
//  console.log(app);

//var options = {};
  var options = {
    pingInterval: process.env.SOCKET_PING_INTERVAL ? process.env.SOCKET_PING_INTERVAL : 2000,
//    pingTimeout: 10000,
    transports: [
      'polling'
          , 'websocket'
    ],
    origins: '*:*'
  };

//  if (process.env.SOCKET_PING_INTERVAL) {
//    options = {
//      pingInterval: process.env.SOCKET_PING_INTERVAL
//    }
//  }


//  socketio.disable('heartbeats');
  io = socketio.listen(server, options);


  app.socketio = io;

  if (io) {
    console.log("Socket IO Ready");
  } else {
    console.log("Socket IO Undefined");
  }

//  io.set("polling duration", 1);

  //for production
//  io.enable('browser client minification');  // send minified client
//  io.enable('browser client etag');          // apply etag caching logic based on version number
//  io.enable('browser client gzip');          // gzip the file
//  io.set('log level', 1);                    // reduce logging

//disabled websocket temporarily
//  io.set('transports', [
//    'websocket',
//    'polling'
//  ]);

  io.set('authorization', function(data, accept) {
    // check if there's a cookie header

    if (!data.headers.cookie)
      return accept('No cookie transmitted.', false);

    // if there is, parse the cookie 
//    console.log( require('../config').cryptoKey);
    data.cookie = parseSignedCookies(cookie.parse(decodeURIComponent(data.headers.cookie)), require('../config').cryptoKey);
    // note that you will need to use the same key to grad the
    // session id, as you specified in the Express setup.
    data.sessionID = data.cookie['connect.sid'];
//    console.log(data.cookie);

//    console.log(data.sessionID);
    if (data.sessionID)
    {
      app.sessionStore.load(data.sessionID, function(err, session) {
//        console.log(session);
        //if (err || !session) return accept('Error', false);
        if (err || !session)
          return accept(null, true); //temporary to prevent handshaken error 500

        data.session = session;

        return accept(null, true);
      });
    } else {
      return accept(null, true);
    }
  });

  io.sockets.on('connection', function(socket) {
//    console.log('A socket with sessionID ' + socket.handshake.sessionID 
//    + ' connected!');
//    var session = socket.handshake.session;    
//    var query = socket.manager.handshaken[socket.id].query;
    var session = socket.client.request.session;

    var query = socket.handshake.query;
    socket.customID = socket.client.request.sessionID;
    //if session id same with classroompath of user then ok
    var isValidated = false;
    var isTestUser = false;
    if (query.isTestUser) {
      var prependName = socket.customID;
      if (!prependName) {
        prependName = query.idSession;
      }
      isTestUser = true;
      socket.customID = prependName + query.username.replace(/\s/g, '');
    }
    else {
      if (session && session.passport && session.passport.user &&
          session.passport.user.isStudent) {
        isValidated = true;
        socket.customID = session.passport.user.id;
        query.username = session.passport.user.username;
//        console.log("Students name:" + query.username + " id: " + socket.customID);
      }
    }
    if (!socket.customID) {
      socket.customID = socket.id;
    }

    if (query.idSessionTeacher) {
//      socket.join(socket.customID);
      socket.customSessionID = query.idSessionTeacher;
      socket.customIsTeacher = true;
      guestNumber = assignGuestName(socket, guestNumber, namesUsed);
      joinLesson(socket, query.idSessionTeacher, true);
    } else if (query.idSession) {
      //join its own room      
      socket.customSessionID = query.idSession;
      if (query.username) {
        guestNumber = assignGuestName(socket, guestNumber, namesUsed, query.username, isTestUser);
      } else {
        guestNumber = assignGuestName(socket, guestNumber, namesUsed);
      }

      socket.join(query.idSession + 'User' + socket.customID);
//      }
      socket.customIsTeacher = false;
      joinLesson(socket, query.idSession, false);
    } else {
      //join its own room      
      guestNumber = assignGuestName(socket, guestNumber, namesUsed);
      socket.customIsTeacher = false;
      joinLesson(socket, 'Lobby', false);

      socket.join(query.idSession + 'User' + socket.customID);
    }

    handleRoomJoining(socket);
//    socket.on('rooms', function() {
//      socket.emit('rooms', io.sockets.manager.rooms);
//    });
    handleClientDisconnection(socket, namesUsed);
    handleMessageFromStudent(socket);
    handleMessageFromTeacher(socket);
    handleClientPing(socket);
  });
};

function assignGuestName(socket, guestNumber, namesUsed, requestedName, isTestUser) {

  if (socket.customIsTeacher) {
    return guestNumber + 1;
  }

  if (isTestUser) {
    socket.customName = requestedName;
    socket.customActive = true;
    socket.emit('nameResult', {
      success: true,
      name: requestedName
    });

    return;
  }


  var generatedName = '';

  var userSockets = PLUGIN_API.GetUserSockets(socket);
  if (_.size(userSockets) > 0) {
    //user already login before
    socket.customName = userSockets[0].customName;
    socket.customGroup = userSockets[0].customGroup;
    socket.customActive = true;
    socket.emit('nameResult', {
      success: true,
      name: socket.customName
    });
    return guestNumber + 1;
  }


  if (requestedName) {
    if (namesUsed.indexOf(requestedName) === -1) {
      generatedName = requestedName;
    }
  }

  if (generatedName === '') {
    do {
      generatedName = NameGenerator.GenerateName();
    } while (namesUsed.indexOf(generatedName) !== -1);

    socket.customNameIsRandom = true;
  }

  var name = generatedName;

  socket.customName = name;
  socket.customActive = true;
  namesUsed.push(name);

  socket.emit('nameResult', {
    success: true,
    name: name
  });
  return guestNumber + 1;
}


function joinLesson(socket, room, isTeacher) {
  socket.join(room);
  currentRoom[socket.customID] = room;

  socket.customSessionID = room;
  socket.emit('joinResult', {room: room, customName: socket.customName, customID: socket.customID, isRandom: socket.customNameIsRandom});

  if (room != 'Lobby')
  {
    var idSession = room;

    var session = app.sessions[idSession];
    if (!session) {
      return;
    }

    if (isTeacher) {
      session.teacherJoin(socket);
      socket.join(idSession + 'Teachers');
    } else {
      session.studentJoin(socket);
      socket.join(idSession + 'Students');
    }
  }
}


function handleRoomJoining(socket) {
  socket.on('join', function(room) {
    socket.leave(currentRoom[socket.customID]);
    joinLesson(socket, room.newRoom);
  });
}

function handleClientDisconnection(socket) {
  socket.on('disconnect', function() {
//    delete nickNames[socket.id];
    if (_.size(PLUGIN_API.GetUserSockets(socket)) > 1)
    {
      return;
    }

    var nameIndex = namesUsed.indexOf(socket.customName);
    delete namesUsed[nameIndex];
//    delete nickNames[socket.id];

//    console.log(socket.id + " disconnect from: " + currentRoom[socket.customID]);
    //if not in lobby
    if (currentRoom[socket.customID] != 'Lobby')
    {
      var session = app.sessions[currentRoom[socket.customID]];
      if (session)
        session.studentDisconnect(socket);
    }
  });
}

function handleClientPing(socket) {
  socket.on('ping', function(data) {
    var timeReceived = (new Date()).valueOf();
//    var difference = timeReceived - data.t;
//    console.log("Time difference: " + difference);
    socket.emit('pong', {
//      d: difference,
      timeServer: timeReceived,
      timeSentByClient: data.t
    });
  });
}

function teacherJoinSession(socket, message) {
  //check if idsession valid with authorization
  if (message.idSession)
  {
    var previousSessionID = currentRoom[socket.customID];
    socket.leave(previousSessionID);
//    socket.set('isTeacher', true, function(){});
    socket.customIsTeacher = true;

    joinLesson(socket, message.idSession, true);
  }
}
function studentJoinSession(socket, message) {
  //check if idsession valid with authorization
  if (message && message.idSession)
  {
    socket.leave(currentRoom[socket.customID]);

    socket.customIsTeacher = false;
//    socket.set('isTeacher', false, function(){});

    joinLesson(socket, message.idSession, false);
  }
}

function handleMessageFromTeacher(socket) {
  socket.on('teacherToServer', function(message) {
    var message = JSON.parse(message);
//    console.log('teacherToServer: ' + JSON.stringify(message));
//    console.log("From Teacher:");
//    console.log(message);
    switch (message.type) {
      case 'TeacherJoinSession':
        teacherJoinSession(socket, message);
        break;
      case 'PluginToServer':
        handlePluginDataFromTeacher(socket, message);
      default:
    }
  });
}

function handleMessageFromStudent(socket) {
  socket.on('studentToServer', function(message) {
    var message = JSON.parse(message);
//    console.log('studentToServer2: ' + message.type);
//    console.log("From Student:");
//    console.log(message);
    switch (message.type) {
      case 'StudentJoinSession':
        studentJoinSession(socket, message.data);
        break;
      case 'PluginToServer':
        handlePluginDataFromStudent(socket, message);

      default:
    }
  });
}

function handlePluginDataFromStudent(socket, message) {
//  if (message.pluginName == 'AIRWEB'){
  var session = app.sessions[currentRoom[socket.customID]];
  if (!session)
    return;

  var plugin = session.plugins[message.pluginName];
  if (!plugin)
    return;

  plugin.pluginStudentMessageListener(socket, message.pluginMessageType, message.data);

  if (message.data && message.data.meta && message.data.meta.points) {
    plugin = session.plugins['SCORE'];
    plugin.pluginStudentMessageListener(socket, 'AddPoints', message.data.meta);
  }
  if (message.data && message.data.meta && message.data.meta.stats) {
    plugin = session.plugins['SCORE'];
    plugin.pluginStudentMessageListener(socket, 'AddStats', message.data.meta);
  }
}

function handlePluginDataFromTeacher(socket, message) {
//  if (message.pluginName == 'AIRWEB'){
  var session = app.sessions[currentRoom[socket.customID]];
  if (!session)
    return;

  var plugin = session.plugins[message.pluginName];
  if (!plugin) {
    if (message.pluginMessageType === 'StartActivity') {
      console.log("StartActivity: " + message.pluginName);
      session.plugins['PLUGIN_HANDLER'].checkPluginServer(socket, message.pluginName);
      plugin = session.plugins[message.pluginName];
    } else {
      return;
    }
  }

  if (plugin) {
    plugin.pluginTeacherMessageListener(socket, message.pluginMessageType, message.data);
  }
}

