var _ = require('underscore');//function ServerToPlugin () {
//  
//  ServerToPlugin.SendToAll = function (socket, idSession, pluginName, pluginMessageType, data) {
//    socket.broadcast.to(idSession).emit('serverToStudent', {
//      type: 'ServerToPlugin',
//      pluginName: pluginName,
//      pluginMessageType: pluginMessageType,
//      data: data
//    });
//  };
//  
//};


//  var dataToSend = {drawingData:data};
//  require('../../pluginAPI').SendToOthers(socket, idSession, PLUGIN_NAME, 'StudentDraw', dataToSend);
//  
exports.TriggerPlugin = function(socket, idSession, pluginName, pluginMessageType, data) {

  socket.broadcast.to(idSession).emit('serverToStudent', {
    type: 'TriggerApp',
//    pluginName: pluginName,
//    pluginMessageType: pluginMessageType,
    data: {
      pluginName: pluginName
    }
  });
};

exports.SocketIOSendToEveryConnectedUser = function(socketio, idSession, pluginName, pluginMessageType, data) {

  socketio.sockets.emit('ServerToApp', {
    type: 'ServerToPlugin',
    pluginName: pluginName,
    pluginMessageType: pluginMessageType,
    data: data
  });
};

exports.SendToOthers = function(socket, idSession, pluginName, pluginMessageType, data) {

  socket.broadcast.to(idSession).emit('ServerToApp', {
    type: 'ServerToPlugin',
    pluginName: pluginName,
    pluginMessageType: pluginMessageType,
    data: data
  });
};

//  var dataToSend = {drawingData:data};
//  require('../../pluginAPI').SendToSocket(socket, idSession, PLUGIN_NAME, 'StudentDraw', dataToSend);

exports.SendToSocket = function(socket, idSession, pluginName, pluginMessageType, data) {

  socket.emit('ServerToApp', {
    type: 'ServerToPlugin',
    pluginName: pluginName,
    pluginMessageType: pluginMessageType,
    data: data
  });
};

//send to all instances of the same user
exports.SendToSocketGroup = function(socket, idSession, pluginName, pluginMessageType, data) {
  socket.server.sockets.in(idSession + 'User' + socket.customID).emit('ServerToApp', {
    type: 'ServerToPlugin',
    pluginName: pluginName,
    pluginMessageType: pluginMessageType,
    data: data
  });
};

//send to all instances of the same user
exports.SendToSocketGroupID = function(socket, idSession, pluginName, pluginMessageType, data, socketID) {
  socket.server.sockets.in(idSession + 'User' + socketID).emit('ServerToApp', {
    type: 'ServerToPlugin',
    pluginName: pluginName,
    pluginMessageType: pluginMessageType,
    data: data
  });
};

exports.SendToSocketID = function(socket, idSession, pluginName, pluginMessageType, data, socketID) {
  if (socket.server.sockets.connected[socketID]) {
    socket.server.sockets.connected[socketID].emit('ServerToApp', {
      type: 'ServerToPlugin',
      pluginName: pluginName,
      pluginMessageType: pluginMessageType,
      data: data
    });
  }
};

exports.SendToAll = function(socket, idSession, pluginName, pluginMessageType, data) {

  socket.server.sockets.in(idSession).emit('ServerToApp', {
    type: 'ServerToPlugin',
    pluginName: pluginName,
    pluginMessageType: pluginMessageType,
    data: data
  });
};
exports.SocketIOSendToAll = function(socketio, idSession, pluginName, pluginMessageType, data) {

  socketio.sockets.in(idSession).emit('ServerToApp', {
    type: 'ServerToPlugin',
    pluginName: pluginName,
    pluginMessageType: pluginMessageType,
    data: data
  });
};
exports.SendToAllTeachers = function(socket, idSession, pluginName, pluginMessageType, data) {

  socket.server.sockets.in(idSession + 'Teachers').emit('ServerToApp', {
    type: 'ServerToPlugin',
    pluginName: pluginName,
    pluginMessageType: pluginMessageType,
    data: data
  });
};

exports.SendToOtherTeachers = function(socket, idSession, pluginName, pluginMessageType, data) {

  socket.broadcast.to(idSession + 'Teachers').emit('ServerToApp', {
    type: 'ServerToPlugin',
    pluginName: pluginName,
    pluginMessageType: pluginMessageType,
    data: data
  });
};

exports.SendToAllStudents = function(socket, idSession, pluginName, pluginMessageType, data) {
  socket.server.sockets.in(idSession + 'Students').emit('ServerToApp', {
    type: 'ServerToPlugin',
    pluginName: pluginName,
    pluginMessageType: pluginMessageType,
    data: data
  });
};

exports.SendToOtherStudents = function(socket, idSession, pluginName, pluginMessageType, data) {
  socket.broadcast.to(idSession + 'Students').emit('ServerToApp', {
    type: 'ServerToPlugin',
    pluginName: pluginName,
    pluginMessageType: pluginMessageType,
    data: data
  });
};

exports.SendToAllStudentsInSameGroup = function(socket, idSession, pluginName, pluginMessageType, data) {
  var groupNumber = socket.customGroup;

  exports.SendToAllStudentsInGroup(socket, idSession, pluginName, pluginMessageType, data, groupNumber);

};

exports.SendToAllStudentsInGroup = function(socket, idSession, pluginName, pluginMessageType, data, groupNumber) {
  socket.server.sockets.in(idSession + 'StudentsGroup' + groupNumber).emit('ServerToApp', {
    type: 'ServerToPlugin',
    pluginName: pluginName,
    pluginMessageType: pluginMessageType,
    data: data
  });
};

exports.SendToOtherStudentsInSameGroup = function(socket, idSession, pluginName, pluginMessageType, data) {
  var groupNumber = socket.customGroup;

  socket.broadcast.to(idSession + 'StudentsGroup' + groupNumber).emit('ServerToApp', {
    type: 'ServerToPlugin',
    pluginName: pluginName,
    pluginMessageType: pluginMessageType,
    data: data
  });
};

exports.GetSocketGroup = function(socket, groupName) {
//  var socketGroupRaw = socket.adapter.rooms[groupName];
  var socketGroupRaw = findClientsSocketByRoomId(socket, groupName);

  var minimizedGroup = _.uniq(socketGroupRaw, function(s) {
    return s.customID;
  });
  return minimizedGroup;
}

exports.GetUserSockets = function(socket) {
  var userSockets = findClientsSocketByRoomId(socket, socket.customSessionID + 'User' + socket.customID);
//  var userSockets = socket.adapter.rooms[socket.customSessionID + 'User' + socket.customID];
  return  userSockets;
}

exports.GetClassSize = function(socket, idSession) {
//  var socketGroupRaw = socket.adapter.rooms[idSession + 'Students'];
  var socketGroupRaw = findClientsSocketByRoomId(socket, idSession + 'Students');

  var minimizedGroup = _.uniq(socketGroupRaw, function(s) {
    return s.customID;
  });
  return _.size(minimizedGroup);
}

function findClientsSocketByRoomId(socket, roomId) {
  var res = []
      , room = socket.adapter.rooms[roomId];
  if (room) {
    for (var id in room) {
      res.push(socket.adapter.nsp.connected[id]);
    }
  }
  return res;
}

//send to 