var Chat = function(socket, isTeacher) {
  this.socket = socket;
  this.isTeacher = isTeacher;
};

Chat.prototype.sendMessage = function(room, text) {
  var message = {
//    room: room,
    text: text
  };
  this.socket.emit('message', message);
};

Chat.prototype.changeRoom = function(room) {
  this.socket.emit('join', {
    newRoom: room
  });
};

Chat.prototype.toServer = function(message) {
  if (this.isTeacher)
  {
    this.socket.emit('teacherToServer', message);  
  }else{
    this.socket.emit('studentToServer', message);
  }
};

Chat.prototype.studentToServer = function(message) {
  this.socket.emit('studentToServer', message);
};
Chat.prototype.teacherToServer = function(message) {
  this.socket.emit('teacherToServer', message);
};

