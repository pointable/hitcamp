'use strict';

var _ = require('underscore');
var PLUGIN_API = require('../../pluginAPI');
var PLUGIN_NAME = 'ANNOTATE';

//var studentWall = [];

function App(idSession, plugins) {
  var studentScores = {};
  var currentSyncMode = false;
  var currentSyncPath = "";

  this.pluginStudentMessageListener = function(socket, pluginMessageType, data) {
//    console.log("isTeacher?" + socket.customIsTeacher);

    switch (pluginMessageType) {
      case 'StudentJoin':
        studentJoin(socket, data);
        break;
      default:
    }
  };

  this.pluginTeacherMessageListener = function(socket, pluginMessageType, data) {
    switch (pluginMessageType) {
      case 'TeacherJoin':
        teacherJoin(socket, data);
        break;
      case 'TeacherDraw':
        teacherDraw(socket, data);
        break;
      case 'TeacherWalkthroughMode':
        teacherWalkthroughMode(socket, data);
        break;
      case 'TeacherWalkthroughModeDisable':
        teacherWalkthroughModeDisable(socket, data);
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
  this.setSync = function(activate) {
    if (activate) {
      currentSyncMode = true;
      currentSyncPath = "";
    } else {
      currentSyncMode = false;
      currentSyncPath = "";
    }
  }

  function pluginExit(socket, data) {

  }

  function teacherJoin(socket) {
    if (currentSyncMode) {
      var dataToSend = {path: currentSyncPath};

      PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
          'TeacherWalkthroughModeTeacher', dataToSend);
    }
  }

  function studentJoin(socket) {
    if (currentSyncMode) {
      var dataToSend = {path: currentSyncPath};

      PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
          'TeacherWalkthroughMode', dataToSend);
    }
  }
  function teacherWalkthroughMode(socket, data) {
    var dataToSend = data;
    currentSyncMode = true;
    currentSyncPath = data.path;

    PLUGIN_API.SendToOtherTeachers(socket, idSession, PLUGIN_NAME,
        'TeacherWalkthroughMode', dataToSend);
    PLUGIN_API.SendToAllStudents(socket, idSession, PLUGIN_NAME,
        'TeacherWalkthroughMode', dataToSend);
  }

  function teacherWalkthroughModeDisable(socket, data) {
    currentSyncMode = false;
    currentSyncPath = "";
    var dataToSend = {};
    PLUGIN_API.SendToOtherTeachers(socket, idSession, PLUGIN_NAME,
        'TeacherWalkthroughModeDisable', dataToSend);
    PLUGIN_API.SendToAllStudents(socket, idSession, PLUGIN_NAME,
        'TeacherWalkthroughModeDisable', dataToSend);
  }

  function teacherDraw(socket, data) {
    var dataToSend = {
      path: data.path,
      hash: data.hash
    };

    PLUGIN_API.SendToOtherTeachers(socket, idSession, PLUGIN_NAME,
        'TeacherDraw', dataToSend);
    PLUGIN_API.SendToAllStudents(socket, idSession, PLUGIN_NAME,
        'TeacherDraw', dataToSend);
  }

}
;

module.exports = App;


