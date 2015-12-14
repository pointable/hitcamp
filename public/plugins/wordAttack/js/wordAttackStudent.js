var PLUGIN_NAME = 'WORD_ATTACK';
var currentWord;

var answered = true;
var isSingle = false;

var countCorrect = 0;
var countWrong = 0;

//server simulation
var currentWordIndex = 0;
var wordStatus = {};
var currentWordStartTime;
var studentAnswers = [];
var wordList1 = {};
var wordList2 = {};

$(document).ready(function() {

  $(function() {
    FastClick.attach(document.body);
  });

  var parameters = parent.getUrlVars(document);
  if (parameters.isSingle) {
    isSingle = true;
    PLUGIN_NAME = 'SINGLE';
  }

//  console.log(parameters);

  if (isSingle) {
    singleInitializeWordLists(parameters.listID1, parameters.listID2);

    $(document).on('click', 'button[id^="buttonNextWord"]', function(event) {
//      parent.pluginToServer(PLUGIN_NAME, 'NextWord', { });
      if (answered)
        singleNextWord();
    });

    $("#buttonNextWord").css("visibility", "visible");
  } else {
    if (parent.isTeacher) {
    } else {//student

      $(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
//    parent.$(document).on('ServerToPlugin' + PLUGIN_NAME, function(e) {
        if (!parent) {
          return;
        }
        var messageReceived = param.detail;

        switch (messageReceived.pluginMessageType)
        {
//          case 'WordList':
//            processWordList(messageReceived.data);
//            break;
//          case 'WordTaken':
//            processWordTaken(messageReceived.data);
//            break;
//          case 'WordCorrect':
//            processWordCorrect(messageReceived.data);
//            break;
          case 'NextWord':
            processNextWord(messageReceived.data);
            break;
          case 'ActivityComplete':
            processActivityComplete(messageReceived.data);
            break;
          case 'AnswerResponse':
            processAnswerResponse(messageReceived.data);
            break;
          case 'RevealAnswer':
            processRevealAnswer(messageReceived.data);
            break;
        }
      });


      $(document).on('click', 'button[id^="buttonTriggerSpin"]', function(event) {

      });

//    $(document).on('click', 'button', function (event) {
//      if (event.target.parentElement.className === "keyboard"){        
//        var alphabet = event.target.innerHTML;
//        console.log(alphabet);
//        processAlphabet(alphabet);
//        $(this).addClass("disabled");
//      }
//    });
    }

    parent.pluginToServer(PLUGIN_NAME, 'StudentOpen', {});
  }

  $("#inner-dropzone1").click(function(event) {
    if (answered)
      return;

    $("#inner-dropzone1").addClass('selected');
    $("#inner-dropzone2").removeClass('selected');
    processAnswer(1);
  });

  $("#inner-dropzone2").click(function(event) {
    if (answered)
      return;

    $("#inner-dropzone2").addClass('selected');
    $("#inner-dropzone1").removeClass('selected');
    processAnswer(2);

  });
});


//$("#inner-dropzone1")

//var wordList1;
//var wordList2;
//var currentWord;
//var wordStatus;
//
//function processWordList(data) {
//  wordListTitle1 = data.wordList1;
//  wordListTitle2 = data.wordList2;
//  wordStatus = data.wordStatus;
//
//  $("#category1").html(wordListTitle1);
//  $("#category2").html(wordListTitle2);
//
//  var template = _.template($("#templateWord").html());
//  var fullHTML = "";
//
//  var wordsCombined = _.sample(wordStatus, _.size(wordStatus));
//  _.each(wordsCombined, function(wordData, id) {
////    if (wordData.category === 1){
//    fullHTML += template({wordData: wordData});
////    }else {      
////      fullHTML +=  template({wordData: wordData, category: "category2"} );
////    }
//  });
//
//  $("#inner-dropzone2").after(fullHTML);
//}

function sendWord(wordID, isCorrect, choice) {
  if (isCorrect) {
    countCorrect++;
  } else {
    countWrong++;
  }

  if (isSingle) {
    studentAnswers = [];
    studentAnswers.push({
//      studentID: socket.customID,
//      studentName: socket.customName,
//      position: position,
      choice: choice,
      isCorrect: isCorrect
    });


    var dataResults = {
      wordID: wordID,
      studentID: isCorrect ? parent.document.socketID : ""
//        category: wordStatus[wordID].category
    };
    setTimeout(function() {
      $("#buttonNextWord").removeClass("disabled");
      processRevealAnswer(dataResults);

      if (isCorrect) {
        dataToSend.meta = {
          points: 10,
          stats: {
            engagement: {value: 10, max: 10}
          }
        };
      }
      parent.pluginToServer(PLUGIN_NAME, 'StudentAnswer', dataToSend);
    }, 500);

    var dataToSend = {
      wordID: wordID,
      isCorrect: isCorrect
    }


  } else {
    //multiplayer mode
    var dataToSend = {
      wordID: wordID,
      isCorrect: isCorrect,
      choice: choice
    }
//  if (isCorrect) {
//    dataToSend.meta = {points: 10};
//  }
    parent.pluginToServer(PLUGIN_NAME, 'StudentAnswer', dataToSend);
  }
}

//function processWordTaken(data) {
//  var wordID = data.wordID;
//  var studentID = data.studentID;
//  var category = wordStatus[wordID].category;
//
//  $("#" + wordID).css("visibility", "hidden");
//
//  $("#categoryAnswered" + category).append('<div class="word-answered">' + wordStatus[wordID].word + "</div>");
//  $("#categoryAnswered" + category).scrollTop($("#categoryAnswered" + category).scrollHeight);
//}
//
//function processWordCorrect(data) {
//  var wordID = data.wordID;
//  var studentID = data.studentID;
//  var category = wordStatus[wordID].category;
//
//  $("#" + wordID).css("visibility", "hidden");
//
//  var categoryElement = $("#categoryAnswered" + category);
//  categoryElement.append('<div class="word-answered correct">' + wordStatus[wordID].word + "</div>");
//
//  categoryElement.scrollTop(categoryElement[0].scrollHeight);
//}

function processNextWord(data) {
  currentWord = data.currentWord;

  var millisTillStart;
  if (isSingle) {
    millisTillStart = 500;
  } else {
    var timeToStart = data.timeToStart;
    var serverTimeNow = (new Date()).valueOf() + parent.document.timeDifference;
    millisTillStart = timeToStart - serverTimeNow;
//    console.log(millisTillStart);
  }

  setTimeout(function() {
    $("#currentWord").html(currentWord.word);
    answered = false;
  }, millisTillStart);


  $("#category1").html(data.category1);
  $("#category2").html(data.category2);


  $("#currentWord").html("?");

  $("#inner-dropzone1").removeClass("selected");
  $("#inner-dropzone1").removeClass("answered");
  $("#inner-dropzone1").removeClass("answer-wrong");
  $("#inner-dropzone1").removeClass("answer-correct");


  $("#inner-dropzone2").removeClass("selected");
  $("#inner-dropzone2").removeClass("answered");
  $("#inner-dropzone2").removeClass("answer-wrong");
  $("#inner-dropzone2").removeClass("answer-correct");

}

function processAnswer(choice) {
  answered = true;

  var isCorrect = false;
  if (currentWord.category === choice) {
    isCorrect = true;
  }

  sendWord(currentWord.wordID, isCorrect, choice);
}

function processAnswerResponse(data) {
  var answer = data.answer;
  var element = $("#inner-dropzone" + answer.choice);
  element.addClass("answered");
  if (answer.isCorrect) {
    element.addClass("answer-correct");
  } else {
    element.addClass("answer-wrong");
  }
}
function processRevealAnswer(data) {
  answered = true;
//  var studentAnswers = data.studentAnswers;

  var answer;
  if (isSingle) {
    answer = studentAnswers[0];
  } else {
    answer = _.findWhere(data.studentAnswers, {studentID: parent.document.socketID});
  }

  if (!answer) {
    var correctElement = $("#inner-dropzone" + currentWord.category);
    correctElement.addClass("answer-correct");
    return;
  }
  var element = $("#inner-dropzone" + answer.choice);
  element.addClass("answered");
  if (answer.isCorrect) {
    element.addClass("answer-correct");
  } else {
    element.addClass("answer-wrong");
    var correctElement = $("#inner-dropzone" + currentWord.category);
    correctElement.addClass("answer-correct");
  }
}

function singleInitializeWordLists(listID1, listID2) {
  var session = JSON.parse(parent.$("#data-session").html());
  var wordLists = session.wordLists;

  wordList1 = _.findWhere(wordLists, {_id: listID1});
  wordList2 = _.findWhere(wordLists, {_id: listID2});

  if (!wordList1 || !wordList2) {
    return;
  }

  wordStatus = [];
  studentAnswers = [];

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

  //randomize
  wordStatus = _.sample(wordStatus, _.size(wordStatus));

  var dataToSend = {
    currentWord: wordStatus[currentWordIndex],
    category1: wordList1.title,
    category2: wordList2.title,
    timeToStart: currentWordStartTime
  };

  processNextWord(dataToSend);

}

function singleNextWord() {
  currentWordIndex++;
  if (!wordStatus[currentWordIndex]) {
    $("#buttonNextWord").html("Completed");
    $("#buttonNextWord").addClass("disabled");

    processActivityComplete();
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
  processNextWord(dataToSend);
  $("#buttonNextWord").addClass("disabled");
}


function processActivityComplete(data) {
  var template = $("#templateResults").html();
  var html = _.template(template, {
    title: "Results",
    countCorrect: countCorrect,
    countWrong: countWrong
  });
  parent.bootbox.alert(html);
}

//function demoSubmit(index) {
//  isDemo = true;
//  var intro = introJs();
//  intro.setOptions({
////    tooltipPosition: 'left',
//    showStepNumbers: false,
//    showBullets: false,
//    showButtons: false,
////    overlayOpacity: 100,
//    skipLabel: 'Exit',
//    steps: [
//      {
//        element: document.querySelector('#inner-dropzone' + index),
//        intro: "<h4>Student select answer</h4>"
//      }
//    ]
//  });
//
//  intro.onbeforechange(function(targetElement) {
//    var delay = 1500;
//
//    if (index === 2) {
//      delay = 500;
//    }
////    if ($(targetElement)[0].id === "#inner-dropzone1")
////    }    
//    setTimeout(function() {
//      $(targetElement)[0].click();
//      setTimeout(function() {
//        intro.nextStep();
//      }, delay);
//    }, delay);
//  });
//  intro.oncomplete(function() {
////    setTimeout(function() {
//    parent.parent.demoNextStep();
////    }, 1000);
//  });
//  intro.onexit(function() {
//  });
//  intro.start();
//}