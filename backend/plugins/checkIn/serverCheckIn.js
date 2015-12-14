'use strict';

var _ = require('underscore');
var PLUGIN_NAME = 'CHECK_IN';
var PLUGIN_API = require('../../pluginAPI');

function App(idSession, plugins) {
  this.idSession = idSession;
  var studentCheckIns = {};

  this.pluginStudentMessageListener = function(socket, pluginMessageType, data) {
    switch (pluginMessageType) {
      case 'StudentOpen':
        studentOpen(socket, data);
        break;
      case 'CheckInSubmitted':
        checkInSubmitted(socket, data);
        break;
      default:
    }
  };
  this.pluginTeacherMessageListener = function(socket, pluginMessageType, data) {
    switch (pluginMessageType) {
      case 'StartActivity':
        startActivity(socket, data);
        break;
      case 'EndActivity':
        endActivity(socket, data);
        break;
      case 'ResetActivity':
        resetActivity(socket, data);
        break;
      case 'TeacherOpen':
        teacherOpen(socket, data);
        break;
      default:
    }
  };
  this.pluginHandlerMessageListener = function(socket, pluginMessageType, data) {
    switch (pluginMessageType) {
      case 'PluginExit':
        pluginExit(socket, data);
        break;
      default:
    }
  };

  function pluginExit(socket, data) {
    //store to redis before finish    

  }
  function startActivity(socket, data) {
    resetPoll(data);
    plugins["PLUGIN_HANDLER"].triggerPlugin(socket, {pluginName: PLUGIN_NAME});
  }

  function endActivity(socket, data) {
    plugins["PLUGIN_HANDLER"].closePlugin(socket, {pluginName: PLUGIN_NAME});
    //resetActivity(socket, data);
  }

  function resetActivity(socket, data) {
    resetPoll(data);

    PLUGIN_API.SendToAllStudents(socket, idSession, PLUGIN_NAME,
        'ResetActivity', data);
  }
  function teacherOpen(socket, data) {
    var dataToSend = {
      studentResults: studentCheckIns
    }

    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'Results', dataToSend);
  }
  // Initialize each student app when it is open
  function studentOpen(socket, data) {
  }

  function resetPoll(data) {
    studentCheckIns = {};
  }

  function checkInSubmitted(socket, data) {
    studentCheckIns[socket.customID] = {
      studentID: socket.customID,
      studentName: socket.customName,
      selection: data.selection
    };
//    plugins["SCORE"].studentScoresAdd(socket, {points: 30});

//    PLUGIN_API.SendToSocket(socket, idSession, 'PLUGIN_HANDLER',
//        'ShowMessage', {
//          message: 'You have checked in! '
//        });

    var studentWallPost = {
      studentID: socket.customID,
      message: socket.customName + ' checked in!'
    };
    plugins["WALL_STUDENT"].studentWallAddPost(studentWallPost);

    //update teachers
    var dataToSend = {
      studentResults: studentCheckIns
    };

    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME,
        'Results', dataToSend);

    //add stats 
    var stats = {
      engagement: {
        value: 20, max: 20
      }
    };
    plugins["SCORE"].studentStatsAdd(socket, stats, socket.customID);
  }
}

module.exports = App;

