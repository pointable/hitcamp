'use strict';

var _ = require('underscore');
var PLUGIN_NAME = 'SORT_ME';
var PLUGIN_API = require('../../pluginAPI');
//var idSession = '';

function App(idSession, plugins) {
  this.idSession = idSession;

  var wordList1 = {};
  var wordList2 = {};
  var wordStatus = {};
  var isComplete = false;

  this.pluginStudentMessageListener = function(socket, pluginMessageType, data) {
    switch (pluginMessageType) {
      case 'StudentOpen':
        studentOpen(socket, data);
        break;
      case 'StudentAnswer':
        studentAnswer(socket, data);
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
    wordList1 = data.wordList1;
    wordList2 = data.wordList2;

    if (!wordList1 || !wordList2) {
      return;
    }

    wordStatus = [];
    isComplete = false;
    var wordID = 0;

    _.each(wordList1.words, function(word) {
      var wordData = {};
      wordData.word = word;
      wordData.isAnswered = false;
      wordData.studentID = null;
      wordData.category = 1;
      wordData.wordID = wordID++;
      wordStatus.push(wordData);
    });
    _.each(wordList2.words, function(word) {
      var wordData = {};
      wordData.word = word;
      wordData.isAnswered = false;
      wordData.studentID = null;
      wordData.category = 2;
      wordData.wordID = wordID++;
      wordStatus.push(wordData);
    });

    plugins["PLUGIN_HANDLER"].triggerPlugin(socket, {pluginName: PLUGIN_NAME});

    var dataToSend = {
//      wordStatus: wordStatus,
      studentResults: [],
      categories: {
        title1: wordList1.title,
        title2: wordList2.title
      }
    };
//    PLUGIN_API.SendToAll(socket, idSession, PLUGIN_NAME,
//        'Results', dataToSend);
  }
  function endActivity(socket, data) {
    plugins["PLUGIN_HANDLER"].closePlugin(socket, {pluginName: PLUGIN_NAME});
  }


  function studentOpen(socket, data) {
    var dataToSend = {
      wordList1: wordList1.title,
      wordList2: wordList2.title,
      wordStatus: wordStatus
    };
    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'WordList', dataToSend);
  }

  function studentAnswer(socket, data) {
    var wordID = data.wordID;
//    word = word.trim();
    var isCorrect = data.isCorrect;
    var isFirst = false;
    var stats = {};
    if (isCorrect && !wordStatus[wordID].isAnswered) {
      wordStatus[wordID].isAnswered = true;
      wordStatus[wordID].studentID = socket.customID;
      isFirst = true;

      //checkcomplete
      if (!_.findWhere(wordStatus, {isAnswered: false})) {
        isComplete = true;
      }
    }

    if (isFirst) {
      var dataToSend = {
        wordID: wordID,
        studentID: socket.customID,
        isComplete: isComplete
//        category: wordStatus[wordID].category
      };
      if (isComplete) {
        dataToSend.wordStatus = wordStatus;

        PLUGIN_API.SendToAllTeachers(socket, idSession, 'PLUGIN_HANDLER',
            'ShowMessage', {
              message: 'Activity Completed!'
            });
      }
//      PLUGIN_API.SendToOtherStudentsInSameGroup(socket, idSession, PLUGIN_NAME,
//          'WordTaken', dataToSend);
      PLUGIN_API.SendToAllStudents(socket, idSession, PLUGIN_NAME,
          'WordTaken', dataToSend);
//      PLUGIN_API.SendToSocketGroup(socket, idSession, PLUGIN_NAME,
//          'WordCorrect', dataToSend);

//      stats.speed = {value: 100, max: 100};
    }


    if (isCorrect) {
      stats.accuracy = {value: 100, max: 100};
    } else {
      stats.accuracy = {value: 0, max: 100};
    }
    plugins["SCORE"].studentStatsAdd(socket, stats);


    updateResults(socket);
  }

  function teacherOpen(socket, data) {
    var studentResults = generateResults(socket);

    var dataToSend = {
      //        wordStatus: wordStatus,
      studentResults: studentResults,
      categories: {
        title1: wordList1.title, title2: wordList2.title
      }
    };
    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'Results', dataToSend);
  }

  function checkFinish(socket, studentResults) {
    if (!_.findWhere(wordStatus, {isAnswered: false})) {
      //finish

      //process stats
      //fastest student - 100%
      var numberOfStudents = _.size(studentResults);
      _.each(studentResults, function(studentResult, i) {
        var score = (numberOfStudents - i) * 100 / numberOfStudents;
        score = parseInt(score);
        console.log(score);
        var stats = {
          speed: {
            value: score, max: 100
          }
        };
        plugins["SCORE"].studentStatsAdd(socket, stats, studentResult.studentID);
      });
    }
  }

  function updateResults(socket) {
    var studentResults = generateResults(socket);

    var dataToSend = {
      //        wordStatus: wordStatus,
      studentResults: studentResults,
      categories: {
        title1: wordList1.title, title2: wordList2.title
      }
    };
    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME,
        'Results', dataToSend);

    checkFinish(socket, studentResults);
  }


  function generateResults(socket) {
    var studentResults = [];
    var studentsSockets = PLUGIN_API.GetSocketGroup(socket, idSession + 'Students');

    _.each(studentsSockets, function(studentSocket) {
      //        var wordCount = _.countBy(wordStatus, function(word) {
      //          return word.studentID === studentSocket.customID;
//        });

      var wordsByStudent = _.filter(wordStatus, function(word) {
        return word.studentID === studentSocket.customID;
      });

      var wordCount = _.size(wordsByStudent);

      studentResults.push({
        studentID: studentSocket.customID,
        studentName: studentSocket.customName,
        numberOfWords: wordCount,
        words: wordsByStudent
      });
    });

    studentResults = _.sortBy(studentResults, function(studentResult) {
      return studentResult.numberOfWords;
    });

    studentResults = studentResults.reverse();

    return studentResults;
  }
}

module.exports = App;

