'use strict';

var PLUGIN_NAME = 'AIRWEB';
//var idSession = '';
var drawingDataAll = ['','','',''];
  
function AirWeb (idSession) {
  this.idSession = idSession;

  this.pluginStudentMessageListener = function (socket, pluginMessageType, data) {
    switch (pluginMessageType){
      case 'StudentDraw':
        studentDraw(socket, data);
        break;
      case 'StudentJoin':
        studentJoin(socket, data);
      default:
    }
  };
  

  function studentDraw(socket, data){
    if (!data) return;

    var dataToSend = {drawingData:data.drawingData};
    require('../../pluginAPI').SendToOtherStudentsInSameGroup(socket, idSession, PLUGIN_NAME, 'StudentDraw', dataToSend);


    if (data.drawingData == 'type=13')
      drawingDataAll[socket.customGroup] = '';
    else
      drawingDataAll[socket.customGroup] += data.drawingData[socket.customGroup] + "&";
    
  }

  function studentJoin(socket, data){
  //  if (!data) return;
    var dataToSend = {drawingData:drawingDataAll[socket.customGroup]};
    require('../../pluginAPI').SendToSocket(socket, idSession, PLUGIN_NAME, 'StudentDraw', dataToSend);

  }
};

module.exports = AirWeb;
//function Student (socket){
//  this.socket = socket;
//  this.userX = 0;
//  this.userY = 0;
//};
//
//function Teacher (socket){
//  this.socket = socket;
//}
//
//function Activity (idActivity){    
//  this.idActivity = idActivity;
//  this.boolShare = false;
//
//  this.setShare = function (boolShare){
//    this.boolShare = boolShare;
//  };
//
//  this.isShare = function (){
//   return this.boolShare; 
//  }; 
//}
