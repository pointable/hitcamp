'use strict';

var _ = require('underscore');
var PLUGIN_NAME = 'BUZZER';
var PLUGIN_API = require('../../pluginAPI');
//var idSession = '';

function App(idSession, plugins) {
  this.idSession = idSession;
  var studentAnswered = [];
  var studentsPerDevice = 1;
  var hasClicked = false;
//  var studentClicked = '';
  var currentBuzzerStartTime;

  this.pluginStudentMessageListener = function(socket, pluginMessageType, data) {
    switch (pluginMessageType) {
      case 'StudentOpen':
        studentOpen(socket, data);
        break;
      case 'BuzzerClicked':
        buzzerClicked(socket, data);
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
      case 'MarkAnswer':
        teacherMarkAnswer(socket, data);
        break;
      case 'MeritStudent':
        teacherMeritStudent(socket, data);
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
    var time = data.time;
//    var studentsPerDevice = data.studentsPerDevice;
    if (data.studentsPerDevice) {
      studentsPerDevice = data.studentsPerDevice;
    }

    //buzzer activity starts within 3second of click
    currentBuzzerStartTime = (new Date()).valueOf() + 2500;
    data.timeToStart = currentBuzzerStartTime;
    hasClicked = false;
    studentAnswered = [];

    plugins["PLUGIN_HANDLER"].triggerPlugin(socket, {pluginName: PLUGIN_NAME});
//    PLUGIN_API.SendToAllStudents(socket, idSession, PLUGIN_NAME,
//        'ResetActivity', data);

    var dataToSend = {
      studentResults: studentAnswered,
      studentsPerDevice: studentsPerDevice
    }
    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME,
        'Results', dataToSend);
  }

  function endActivity(socket, data) {
    plugins["PLUGIN_HANDLER"].closePlugin(socket, {pluginName: PLUGIN_NAME});
//    resetActivity(socket, data);
  }

  function resetActivity(socket, data) {
    if (hasClicked) {
      hasClicked = false;
//      studentClicked = '';
      studentAnswered = [];
    }

    if (data.studentsPerDevice) {
      studentsPerDevice = data.studentsPerDevice;
    }

    currentBuzzerStartTime = (new Date()).valueOf() + 1500;
    data.timeToStart = currentBuzzerStartTime;
    data.studentsPerDevice = studentsPerDevice;

    PLUGIN_API.SendToAllStudents(socket, idSession, PLUGIN_NAME,
        'ResetActivity', data);

    var dataToSend = {
      studentResults: studentAnswered,
      studentsPerDevice: studentsPerDevice
    }
    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME,
        'Results', dataToSend);
  }

  function studentOpen(socket, data) {
//    var answered;
    var answers = _.where(studentAnswered, {studentID: socket.customID});

    var dataSyncWhenFirstLaunch = {
//      studentID: socket.customID,
//      studentName: socket.customName,
      answers: answers,
      timeToStart: currentBuzzerStartTime,
      studentsPerDevice: studentsPerDevice
    };

    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'StudentOpenResponse', dataSyncWhenFirstLaunch);
  }

  function teacherOpen(socket, data) {

    //update teacher
    var dataToSend = {
      studentResults: studentAnswered,
      studentsPerDevice: studentsPerDevice
    }

    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'Results', dataToSend);
  }

  function buzzerClicked(socket, data) {
    var studentNumber = data.studentNumber;

    if (_.findWhere(studentAnswered, {studentID: socket.customID, studentNumber: studentNumber})) {
      return; //student submitted before
    }
    var position = _.size(studentAnswered) + 1;

    var nameAppend = "";
    if (studentsPerDevice > 1) {
      nameAppend = " (" + (studentNumber + 1) + ")";
    }

    studentAnswered.push({
      studentID: socket.customID,
      studentNumber: studentNumber,
      studentName: socket.customName + nameAppend,
      position: position
    });

    if (!hasClicked) {
      hasClicked = true;
//      studentClicked = socket.customID + studentNumber;
      var dataToSend = {
        studentID: socket.customID,
        studentNumber: studentNumber,
        studentName: socket.customName + nameAppend,
        position: position
      };

      plugins["SCORE"].studentScoresAdd(socket, {points: 30});

      PLUGIN_API.SendToSocketGroup(socket, idSession, PLUGIN_NAME,
          'SetActivityResult', dataToSend);
      PLUGIN_API.SendToSocket(socket, idSession, 'PLUGIN_HANDLER',
          'ShowMessage', {
            message: 'You' + nameAppend + ' buzzed first! '
          });
//      PLUGIN_API.SendToOthers(socket, idSession, 'PLUGIN_HANDLER',
//          'ShowMessage', {message: 'First to Buzz: ' + dataToSend.studentName});
      var studentWallPost = {
        studentID: socket.customID,
        message: socket.customName + nameAppend + ' was the first to buzz'
      };
      plugins["WALL_STUDENT"].studentWallAddPost(studentWallPost);
    } else {
      var dataToSend = {
        studentID: socket.customID,
        studentNumber: studentNumber,
        studentName: socket.customName + nameAppend,
        position: position
      };

      PLUGIN_API.SendToSocketGroup(socket, idSession, PLUGIN_NAME,
          'SetActivityResult', dataToSend);
//      PLUGIN_API.SendToSocket(socket, idSession, 'PLUGIN_HANDLER',
//          'ShowMessage', {message: 'Better luck next time! '});
//      PLUGIN_API.SendToAllTeachers(socket, idSession, 'PLUGIN_HANDLER',
//          'ShowMessage', {message: 'First to Buzz: ' + dataToSend.studentName});

      plugins["SCORE"].studentScoresAdd(socket, {points: 10});

    }

    //update teachers
    var dataToSend = {
      studentResults: studentAnswered
    };

    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME,
        'Results', dataToSend);
    var classSize = PLUGIN_API.GetClassSize(socket, idSession) * studentsPerDevice;

    var speedScore = ((classSize - (_.size(studentAnswered) - 1)) * 100) / classSize;
    speedScore = parseInt(speedScore);
    //add stats 
    var stats = {
      speed: {
        value: speedScore, max: 100
      },
      engagement: {
        value: 100, max: 100
      }
    };
    plugins["SCORE"].studentStatsAdd(socket, stats, socket.customID);
  }

  function teacherMarkAnswer(socket, data) {
    var studentID = data.studentID;
    var studentNumber = data.studentNumber;
    var isCorrect = data.isCorrect;

    var studentAnswer = _.findWhere(studentAnswered, {studentID: studentID, studentNumber: studentNumber});
    if (!studentAnswer) {
      return;
    }

    studentAnswer.marked = {
      isCorrect: isCorrect
    };

    PLUGIN_API.SendToSocketGroupID(socket, idSession, PLUGIN_NAME,
        'MarkedAnswer', data, studentID);

    //send to others teachers
    var dataToSend = {
      studentResults: studentAnswered
    };

    PLUGIN_API.SendToOtherTeachers(socket, idSession, PLUGIN_NAME,
        'Results', dataToSend);
//    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME,
//        'MarkedAnswer', data);

    if (isCorrect) {
      plugins["SCORE"].studentScoresAdd(socket, {points: 30}, studentID);
    }
  }

  function teacherMeritStudent(socket, data) {
    var studentID = data.studentID;
    var studentNumber = data.studentNumber;
    var isGood = data.isGood;

    var studentAnswer = _.findWhere(studentAnswered, {studentID: studentID, studentNumber: studentNumber});
    if (!studentAnswer) {
      return;
    }

    studentAnswer.merited = {
      isGood: isGood
    };

    PLUGIN_API.SendToSocketGroupID(socket, idSession, PLUGIN_NAME,
        'MeritStudent', data, studentID);

    //send to others teachers
    var dataToSend = {
      studentResults: studentAnswered
    };

    PLUGIN_API.SendToOtherTeachers(socket, idSession, PLUGIN_NAME,
        'Results', dataToSend);
//    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME,
//        'MarkedAnswer', data);

    if (isGood) {
      plugins["SCORE"].studentScoresAdd(socket, {points: 30}, studentID);
    }
  }
}


module.exports = App;

