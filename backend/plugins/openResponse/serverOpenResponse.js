'use strict';

var _ = require('underscore');
var PLUGIN_NAME = 'OPEN_RESPONSE';
var PLUGIN_API = require('../../pluginAPI');


function App(idSession, plugins) {
  this.idSession = idSession;
  var studentAnswers = {};
  var pollType;

  var currentStartTime;


  this.pluginStudentMessageListener = function(socket, pluginMessageType, data) {
    switch (pluginMessageType) {
      case 'StudentOpen':
        studentOpen(socket, data);
        break;
      case 'AnswerSubmitted':
        answerSubmitted(socket, data);
        break;
      default:
    }
  };
  this.pluginTeacherMessageListener = function(socket, pluginMessageType, data) {
    console.log(pluginMessageType);
    switch (pluginMessageType) {
      case 'TeacherOpen':
        teacherOpen(socket, data);
        break;
      case 'StartActivity':
        startActivity(socket, data);
        break;
//      case 'EndActivity':
//        endActivity(socket, data);
//        break;
      case 'ResetActivity':
        resetActivity(socket, data);
        break;
      case 'MarkAnswer':
        teacherMarkAnswer(socket, data);
        break;
      case 'RepeatAnswer':
        teacherRepeatAnswer(socket, data);
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
    resetPoll();
  }

  function startActivity(socket, data) {
    console.log("StartActivity");
    //Set number of choices when started
    pollType = data.pollType;
    currentStartTime = (new Date()).valueOf() + 1000;
    data.timeToStart = currentStartTime;
    resetPoll();

    plugins["PLUGIN_HANDLER"].triggerPlugin(socket, {pluginName: PLUGIN_NAME});

    PLUGIN_API.SendToOtherTeachers(socket, idSession, PLUGIN_NAME,
        'ResetActivity', data);
  }

//  function endActivity(socket, data) {
//    plugins["PLUGIN_HANDLER"].closePlugin(socket, {pluginName: PLUGIN_NAME});
//    resetActivity(socket, data);
//  }

  function resetActivity(socket, data) {
    resetPoll();
    pollType = data.pollType;
    currentStartTime = (new Date()).valueOf() + 1500;
    data.timeToStart = currentStartTime;

    PLUGIN_API.SendToAllStudents(socket, idSession, PLUGIN_NAME,
        'ResetActivity', data);
    PLUGIN_API.SendToOtherTeachers(socket, idSession, PLUGIN_NAME,
        'ResetActivity', data);
  }

  // Initialize each student app when it is open
  function studentOpen(socket, data) {
    var studentAnswer = studentAnswers[socket.customID];

    if (!studentAnswer) {
      return;
    }

    var dataSyncWhenFirstLaunch = {
      drawingData: studentAnswer.drawingData,
      marked: studentAnswer.marked
    };
    //Send to Student
    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'SetStudentAnswer', dataSyncWhenFirstLaunch);
//    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME,
//      'StudentOpened', dataToSend);
  }

  function teacherOpen(socket, data) {
    var dataSyncWhenFirstLaunch = {
      studentAnswers: studentAnswers
    };
    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'StudentAnswersAll', dataSyncWhenFirstLaunch);
  }

  function answerSubmitted(socket, data) {

    var studentID = socket.customID;

    if (studentAnswers[studentID]) {
      return; //already answered
    }

    var dataToSend = {
      studentID: studentID,
      studentName: socket.customName,
      drawingData: data.drawingData,
    };

    studentAnswers[studentID] = dataToSend;

//    PLUGIN_API.SendToSocket(socket, idSession, 'PLUGIN_HANDLER',
//      'ShowMessage', {message: 'You choose ' + data.pollChoice});
    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME,
        'AnswerSubmitted', dataToSend);


    var studentWallPost = {
      studentID: studentID,
      message: "Open Response",
      imageData: data.drawingData
    };

    plugins["WALL_STUDENT"].studentWallAddPost(studentWallPost);
  }

  function teacherMarkAnswer(socket, data) {
    var studentID = data.studentID;
    var isCorrect = data.isCorrect;
//    console.log(studentAnswers);
    var studentAnswer = studentAnswers[studentID];
    if (!studentAnswer) {
      return;
    }

    studentAnswer.marked = {
      isCorrect: isCorrect
    }

    PLUGIN_API.SendToSocketGroupID(socket, idSession, PLUGIN_NAME,
        'MarkedAnswer', data, studentID);

    //send to others teachers
    PLUGIN_API.SendToOtherTeachers(socket, idSession, PLUGIN_NAME,
        'MarkedAnswer', data);

    if (isCorrect) {
      plugins["SCORE"].studentScoresAdd(socket, {points: 30}, studentID);
    }
  }

  function teacherRepeatAnswer(socket, data) {
    var studentID = data.studentID;
    var isCorrect = data.isCorrect;
//    console.log(studentAnswers);
    var studentAnswer = studentAnswers[studentID];
    if (!studentAnswer) {
      return;
    }

    delete studentAnswers[studentID];

    PLUGIN_API.SendToSocketGroupID(socket, idSession, PLUGIN_NAME,
        'RepeatAnswer', data, studentID);

    //send to others teachers
    PLUGIN_API.SendToOtherTeachers(socket, idSession, PLUGIN_NAME,
        'RepeatAnswer', data);

//    if (isCorrect){
//      plugins["SCORE"].studentScoresAdd(socket, {points: 30}, studentID);
//    }
  }

  function resetPoll() {
    studentAnswers = {};
  }
}

module.exports = App;

