'use strict';

var _ = require('underscore');
var PLUGIN_NAME = 'WORD_ATTACK';
var PLUGIN_API = require('../../pluginAPI');
//var idSession = '';

function App(idSession, plugins) {
  this.idSession = idSession;

  var wordList1 = {};
  var wordList2 = {};
  var wordStatus = {};

  var currentWordIndex = 0;
  var studentAnswers;
  var currentWordStartTime;
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
      case 'NextWord':
        nextWord(socket, data);
        break;
      case 'RevealAnswer':
        revealAnswer(socket, data);
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

    wordStatus = _.sample(wordStatus, _.size(wordStatus));

    currentWordIndex = 0;// = wordStatus[0];
    studentAnswers = [];

    currentWordStartTime = (new Date()).valueOf() + 3000;

    plugins["PLUGIN_HANDLER"].triggerPlugin(socket, {pluginName: PLUGIN_NAME});

    updateResults(socket);
  }

  function endActivity(socket, data) {
    plugins["PLUGIN_HANDLER"].closePlugin(socket, {pluginName: PLUGIN_NAME});
  }

  function nextWord(socket, data) {
    currentWordIndex++;
    if (!wordStatus[currentWordIndex]) {
      isComplete = true;
      currentWordIndex--;
      PLUGIN_API.SendToAllTeachers(socket, idSession, 'PLUGIN_HANDLER',
          'ShowMessage', {
            message: 'Activity Completed! '
          });

      var dataToSend = {
        isComplete: isComplete
      };
      PLUGIN_API.SendToAllStudents(socket, idSession, PLUGIN_NAME,
          'ActivityComplete', dataToSend);
      return;
    }

    studentAnswers = [];
    currentWordStartTime = (new Date()).valueOf() + 1000;

    var dataToSend = {
      currentWord: wordStatus[currentWordIndex],
      category1: wordList1.title,
      category2: wordList2.title,
      timeToStart: currentWordStartTime
    };
    PLUGIN_API.SendToAllStudents(socket, idSession, PLUGIN_NAME,
        'NextWord', dataToSend);

    updateResults(socket);
  }

  function studentOpen(socket, data) {
    var dataToSend = {
      currentWord: wordStatus[currentWordIndex],
      category1: wordList1.title,
      category2: wordList2.title,
      timeToStart: currentWordStartTime
    };
    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'NextWord', dataToSend);
  }

  function studentAnswer(socket, data) {
    var wordID = data.wordID;
    var isCorrect = data.isCorrect;

    if (wordID !== wordStatus[currentWordIndex].wordID)
    {
      return;
    }

    if (_.findWhere(studentAnswers, {studentID: socket.customID})) {
      return; //student submitted before
    }
    var position = _.size(studentAnswers) + 1;

    studentAnswers.push({
      studentID: socket.customID,
      studentName: socket.customName,
      position: position,
      choice: data.choice,
      isCorrect: isCorrect
    });

//    var dataToSend = {
//      answer: studentAnswers[position - 1]
//    };
//    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
//        'AnswerResponse', dataToSend);


    updateResults(socket);
  }

  function updateResults(socket) {
//    var studentResults = generateResults(socket);

    var dataToSend = {
      //        wordStatus: wordStatus,
      studentAnswers: studentAnswers,
      categories: {
        title1: wordList1.title, title2: wordList2.title
      }
    };
    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME,
        'Results', dataToSend);

//    checkFinish(socket, studentResults);
  }

  function revealAnswer(socket, data) {
    var dataToSend = {
      studentAnswers: studentAnswers
    };
    PLUGIN_API.SendToAllStudents(socket, idSession, PLUGIN_NAME,
        'RevealAnswer', dataToSend);


    dataToSend = {
      studentAnswers: studentAnswers,
      answer: wordStatus[currentWordIndex].category,
      categories: {
        title1: wordList1.title, title2: wordList2.title
      }
    };
    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME,
        'RevealAnswer', dataToSend);

    _.each(studentAnswers, function(studentAnswer) {
      if (studentAnswer.isCorrect) {
        plugins["SCORE"].studentScoresAdd(socket, {points: 30}, studentAnswer.studentID);
      }
    });
  }
}


module.exports = App;

