'use strict';

var _ = require('underscore');
var PLUGIN_NAME = 'QUICKPOLL';
var PLUGIN_API = require('../../pluginAPI');
//var idSession = '';

function App(idSession, plugins) {
  this.idSession = idSession;
  var studentAnswered = [];
  var pollType;
  var pollDatas = [['choice', 'number of students']];

  var choices = [];
  var numberOfChoices;
  var currentBuzzerStartTime;
  var numberOfChoices;
  this.pluginStudentMessageListener = function(socket, pluginMessageType, data) {
    switch (pluginMessageType) {
      case 'StudentOpen':
        studentOpen(socket, data);
        break;
      case 'PollClicked':
        pollClicked(socket, data);
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
    //Set number of choices when started
    numberOfChoices = data.numberOfChoices;
    pollType = data.pollType;
    currentBuzzerStartTime = (new Date()).valueOf() + 3000;
    data.timeToStart = currentBuzzerStartTime;
    resetPoll(data);
    plugins["PLUGIN_HANDLER"].triggerPlugin(socket, {pluginName: PLUGIN_NAME});
  }

  function nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
  }

  function endActivity(socket, data) {
    plugins["PLUGIN_HANDLER"].closePlugin(socket, {pluginName: PLUGIN_NAME});
//    resetActivity(socket, data);
  }

  function resetActivity(socket, data) {
    resetPoll(data);
    pollType = data.pollType;
    numberOfChoices = data.numberOfChoices;
    currentBuzzerStartTime = (new Date()).valueOf() + 1500;
    data.timeToStart = currentBuzzerStartTime;

    PLUGIN_API.SendToAllStudents(socket, idSession, PLUGIN_NAME,
        'ResetActivity', data);
  }

  function teacherOpen(socket, data) {

    //update teacher
    var dataToSend = {
      pollDatas: pollDatas
    };

    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'UpdatePoll', dataToSend);
  }
  // Initialize each student app when it is open
  function studentOpen(socket, data) {
    var dataToSend = {
      studentID: socket.customID,
      studentName: socket.customName
    };

//    console.log("Student Open socket");
    var pollChoice = '';
    //If found that the student has answered then the poll to true
    _.each(studentAnswered, function(student) {

      if (student[0].customID === socket.customID) {
        pollChoice = student[1].pollChoice;
        console.log("Student Poll Choice :");
        console.log(student[1]);
        return;
      }
    });

    var dataSyncWhenFirstLaunch = {
      studentID: socket.customID,
      studentName: socket.customName,
      timeToStart: currentBuzzerStartTime,
      numberOfChoices: numberOfChoices,
      pollChoice: pollChoice,
      pollType: pollType
    };
    //Send to Student
    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'SetActivityResult', dataSyncWhenFirstLaunch);
    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME,
        'StudentOpened', dataToSend);
  }

  function pollClicked(socket, data) {
    studentAnswered.push([socket, data]);

    //Update the pollData

    _.each(pollDatas, function(pollData) {
      if (pollData[0] === data.pollChoice) {
        pollData[1] += 1;
        console.log(pollData);
        return;
      }
    });
    var dataToSend = {
      studentID: socket.customID,
      studentName: socket.customName,
      pollDatas: pollDatas
    };


    PLUGIN_API.SendToSocket(socket, idSession, 'PLUGIN_HANDLER',
        'ShowMessage', {message: 'You have chosen ' + data.pollChoice});
    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME,
        'UpdatePoll', dataToSend);
//      var studentWallPost = {
//        studentID: socket.customID,
//        message: socket.customName + ' was the first to buzz'
//      };
//      plugins["WALL_STUDENT"].studentWallAddPost(studentWallPost);

  }

  function resetPoll(data) {
    studentAnswered = [];
    var colorMap = [
      '#00CC00',
      '#CBCC00',
      '#00CBCC',
      '#0065CC',
      '#0000CC',
      '#6600CC',
      '#CC00CB',
      '#CC0065',
      '#CC0000',
      '#CC6600'
    ];

    pollDatas = [['choice', 'number of students', {role: "style"}]];
    switch (data.pollType) {
      case "mc":
        var numberOfChoices = data.numberOfChoices;
        var alpha = 'A';
        for (var i = 0; i < numberOfChoices; i++) {
          pollDatas.push([alpha, 0, colorMap[i]]);
          alpha = nextChar(alpha);
        }
        break;
      case "yn":
        pollDatas = [['choice', 'number of students', {role: "style"}]];
        pollDatas.push(["Yes", 0, '#00CC00'], ["No", 0, '#CC0000']);
        break;
      case "tf":
        pollDatas = [['choice', 'number of students', {role: "style"}]];
        pollDatas.push(["True", 0, '#00CC00'], ["False", 0, '#CC0000']);
        break;
      case "ld":
        pollDatas = [['choice', 'number of students', {role: "style"}]];
        pollDatas.push(["Like", 0, '#00CC00'], ["Dislike", 0, '#CC0000']);
        break;
    }
  }
}

module.exports = App;

