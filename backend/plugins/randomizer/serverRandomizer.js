'use strict';

var _ = require('underscore');
var PLUGIN_NAME = 'RANDOMIZER';
var PLUGIN_API = require('../../pluginAPI');

//var idSession = '';

function App(idSession, plugins) {
  this.idSession = idSession;

  var studentAnswered = [];
  var studentsPerDevice = 1;

  var intervalTimer;

  var chosenStudentID;
  var chosenStudentName;

  this.pluginStudentMessageListener = function(socket, pluginMessageType, data) {
//    console.log("isTeacher?" + socket.customIsTeacher);

    switch (pluginMessageType) {
//      case 'StartRandom':
//        startRandom(io, socket, data);
//          break;
      default:
    }
  };
  this.pluginTeacherMessageListener = function(socket, pluginMessageType, data) {

    switch (pluginMessageType) {
      case 'StartActivity':
        startActivity(socket, data);
        setTimeout(function() {
          startRandom(socket, data);
        }, 2000);
        break;
      case 'EndActivity':
        endActivity(socket, data);
        break;
      case 'ResetActivity':
        startRandom(socket, data);
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
//    resetPoll();
  }

  function startActivity(socket, data) {
    if (intervalTimer)
      clearInterval(intervalTimer);

    chosenStudentID = {};

    var dataToSend = {};
//    console.log("trigger");

    plugins["PLUGIN_HANDLER"].triggerPlugin(socket, {pluginName: PLUGIN_NAME});

//    PLUGIN_API.SendToAllStudents(socket, idSession, PLUGIN_NAME,
//      'ResetActivity', dataToSend);
  }

  function endActivity(socket, data) {
    if (intervalTimer)
      clearInterval(intervalTimer);
    plugins["PLUGIN_HANDLER"].closePlugin(socket, {pluginName: PLUGIN_NAME});
//    resetActivity(socket, data);
  }

  function teacherOpen(socket, data) {
    var dataToSend = {
      studentID: chosenStudentID,
      studentName: chosenStudentName
    };
    var studentAnswer = _.findWhere(studentAnswered, {studentNumber: 0});

    if (!studentAnswer) {
      return;
    }

    if (studentAnswer.marked) {
      dataToSend.marked = {
        isCorrect: studentAnswer.marked.isCorrect
      }
    }

    //send to others teachers
//    var dataToSend = {
//      studentResults: studentAnswer
//    };
    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'StudentChosen', dataToSend);
  }

  function startRandom(socket, data) {

    if (chosenStudentID) {
      PLUGIN_API.SendToSocketGroupID(socket, idSession, PLUGIN_NAME,
          'Reset', data, chosenStudentID);
    }
    
    studentAnswered = [];
//    console.log("ID " + idSession);
    var studentsSockets = PLUGIN_API.GetSocketGroup(socket, idSession + 'Students');
//    var studentsSockets =  io.sockets.clients(idSession);
//    studentsSockets = _.where(studentsSockets, {customIsTeacher: false});
//    console.log(studentsSockets);
    var number = _.size(studentsSockets);
//    _.toArray(studentsSockets);
    console.log("Randomizer size: " + number);

    var timeToChoose = 5000;
    var timeBetweenBlinks = 300;
    var maxBlinks = Math.floor(timeToChoose / timeBetweenBlinks);
    var numberOfBlinks = 0;

    if (number <= 1)
      return;

    var previousNumber = -1;

    clearInterval(intervalTimer);
    intervalTimer = setInterval(function() {
      numberOfBlinks++;

      var chosenNumber = Math.floor((Math.random() * (number)) + 0);
      while (previousNumber === chosenNumber) {
        chosenNumber = Math.floor((Math.random() * (number)) + 0);
      }
      previousNumber = chosenNumber;

//      console.log(chosenNumber); 

      if (numberOfBlinks < maxBlinks) {
        var dataToSend = {};
        PLUGIN_API.SendToSocketGroup(studentsSockets[chosenNumber], idSession, PLUGIN_NAME, 'StudentBlink', dataToSend);
        PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME, 'StudentBlink', {
          studentID: studentsSockets[chosenNumber].customID,
          studentName: studentsSockets[chosenNumber].customName
        });

      } else {
        clearInterval(intervalTimer);
//        console.log("chosen:" + chosenNumber);
        chosenStudentID = studentsSockets[chosenNumber].customID;
        chosenStudentName = studentsSockets[chosenNumber].customName;

        studentAnswered.push({
          studentID: chosenStudentID,
          studentNumber: 0,
          studentName: chosenStudentName
        });

        var dataToSend = {
          studentID: chosenStudentID,
          studentName: chosenStudentName
        };
        PLUGIN_API.SendToSocketGroup(studentsSockets[chosenNumber], idSession, PLUGIN_NAME, 'StudentChosen', dataToSend);

        PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME, 'StudentChosen', dataToSend);

        PLUGIN_API.SendToOthers(studentsSockets[chosenNumber], idSession, 'PLUGIN_HANDLER',
            'ShowMessage', {message: dataToSend.studentName + ' has been bombed!'});
        PLUGIN_API.SendToSocket(studentsSockets[chosenNumber], idSession, 'PLUGIN_HANDLER',
            'ShowMessage', {message: 'Boooommmm! '});

//        PLUGIN_API.SendToAllTeachers(socket, idSession, 'PLUGIN_HANDLER',
//          'ShowMessage', {message: 'Chosen: ' + dataToSend.studentName});
      }
    }, timeBetweenBlinks);
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
      studentResults: studentAnswer
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
      studentResults: studentAnswer
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

