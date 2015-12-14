'use strict';

var _ = require('underscore');
var PLUGIN_NAME = 'WHEEL_WORD';
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

  var currentWordLetters = [];

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
      wordData.word = word.toUpperCase();
      wordData.isAnswered = false;
      wordData.studentID = null;
      wordData.category = wordList1.title;
      wordData.wordID = wordID++;
      if (/^[a-zA-Z]*$/.test(wordData.word))
      {
        wordStatus.push(wordData);
      }
    });
    _.each(wordList2.words, function(word) {
      var wordData = {};
      wordData.word = word.toUpperCase();
      wordData.isAnswered = false;
      wordData.studentID = null;
      wordData.category = wordList2.title;
      wordData.wordID = wordID++;
      if (/^[a-zA-Z]*$/.test(wordData.word))
      {
        wordStatus.push(wordData);
      }
    });

    wordStatus = _.sample(wordStatus, _.size(wordStatus));

    currentWordIndex = 0;// = wordStatus[0];
    studentAnswers = null;
    studentAnswers = [{}, {}];

    currentWordStartTime = (new Date()).valueOf() + 3000;

    plugins["PLUGIN_HANDLER"].triggerPlugin(socket, {pluginName: PLUGIN_NAME});
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

    studentAnswers = [[], []];
    currentWordLetters = wordStatus[currentWordIndex].word.toUpperCase().split('');

    currentWordStartTime = (new Date()).valueOf() + 1000;

    var dataToSend = {
      currentWord: wordStatus[currentWordIndex],
      timeToStart: currentWordStartTime
    };
    PLUGIN_API.SendToAllStudents(socket, idSession, PLUGIN_NAME,
        'NextWord', dataToSend);
  }

  function studentOpen(socket, data) {
    var dataToSend = {
      currentWord: wordStatus[currentWordIndex],
      timeToStart: currentWordStartTime
    };
    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'NextWord', dataToSend);
  }

  function studentAnswer(socket, data) {
    var letter = data.letter;

//    if (answerID === wordStatus[currentWordIndex].category)
//    {
//      studentAnswers[answerID-1].push ({
//            studentID: socket.customName,
//            points: 10
//        });
//    }else{
//      studentAnswers[answerID-1].push ({
//            studentID: socket.customName,
//            points: 0
//        }); 
//    }

    var dataToSend = {
      letter: letter
    };
    PLUGIN_API.SendToOtherStudents(socket, idSession, PLUGIN_NAME,
        'LetterTaken', dataToSend);
  }


}
;

module.exports = App;

