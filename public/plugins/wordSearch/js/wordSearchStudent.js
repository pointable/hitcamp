var PLUGIN_NAME = 'WORD_SEARCH';
var isSingle = false;

var countCorrect = 0;
var countWrong = 0;

var singleAnsweredCounter = 0;

$(document).ready(function() {


  $(function() {
    FastClick.attach(document.body);
  });

  var parameters = parent.getUrlVars(document);

  if (parameters.isSingle) {
    isSingle = true;
    PLUGIN_NAME = 'SINGLE';
  }

  if (isSingle) {
    initializeWordLists(parameters.listID1);
  } else {

    if (parent.isTeacher) {
    } else {//student

      $(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
//    parent.$(parent.document).on('ServerToPlugin' + PLUGIN_NAME, function(e) {
        if (!parent) {
          return;
        }
//    var test = parent.$(parent.document);
        var messageReceived = param.detail;

        switch (messageReceived.pluginMessageType)
        {
          case 'WordList':
            processWordList(messageReceived.data);
            break;
          case 'WordTaken':
            processWordTaken(messageReceived.data);
            break;
//          case 'WordCorrect':
//            processWordCorrect(messageReceived.data);
//            break;
        }
      });

    }

    parent.pluginToServer(PLUGIN_NAME, 'StudentOpen', {});

  }//end isSelf
});

//var wordList1;
//var wordList2;
var wordStatus;
function processWordList(data) {
  var seed = data.seed;
  wordListTitle1 = data.wordList1;
//  wordListTitle2 = data.wordList2;
  wordStatus = data.wordStatus;

  $("#category1").html(wordListTitle1);
//  $("#category2").html(wordListTitle2);

  var wordsArray = [];
  _.each(wordStatus, function(wordData) {
    wordsArray.push(wordData.word);
  });

  var template = _.template($("#templateWord").html());
  var fullHTML = "";

  var wordsUnanswered = _.where(wordStatus, {isAnswered: false});
  var wordsAnswered = _.where(wordStatus, {isAnswered: true});

  var wordsCombined = _.sample(wordsUnanswered, _.size(wordsUnanswered));
  _.each(wordsCombined, function(wordData, id) {
//    if (wordData.category === 1){
    fullHTML += template({wordData: wordData});
//    }else {      
//      fullHTML +=  template({wordData: wordData, category: "category2"} );
//    }
  });

  $("#dropzoneBlock").after(fullHTML);


  _.each(wordsAnswered, function(wordAnswered) {
    var category = wordAnswered.category;
    if (wordAnswered.studentID === parent.document.socketID) {
      $("#categoryAnswered" + category).append('<div class="word-answered correct">' + wordAnswered.word + "</div>");
    } else {
      $("#categoryAnswered" + category).append('<div class="word-answered">' + wordAnswered.word + "</div>");
    }

    $("#categoryAnswered" + category).scrollTop($("#categoryAnswered" + category).scrollHeight);
  });

//  initInteract();
  initGrid(wordsArray, seed);
}

function sendWord(wordID, isCorrect) {
  if (wordStatus[wordID].isAnswered) {
    return;
  } else {
    wordStatus[wordID].isAnswered = true;
  }

  if (isSingle) {
    singleAnsweredCounter++
    //check completed
    var isComplete = false;
    if (singleAnsweredCounter >= _.size(wordStatus)) {
      isComplete = true;
    }

    var dataResults = {
      wordID: wordID,
      studentID: isCorrect ? parent.document.socketID : "",
      isComplete: isComplete
//        category: wordStatus[wordID].category
    };
    setTimeout(function() {
      processWordTaken(dataResults)
    }, 500);

    var dataToSend = {
      wordID: wordID,
      isCorrect: isCorrect
    }
    if (isCorrect) {
      dataToSend.meta = {
        points: 5,
        stats: {
          engagement: {value: 10, max: 10}
        }
      };
    }
    parent.pluginToServer(PLUGIN_NAME, 'StudentAnswer', dataToSend);


  } else {
    //multiplayer mode
    var dataToSend = {
      wordID: wordID,
      isCorrect: isCorrect
    }
    if (isCorrect) {
//      dataToSend.meta = {points: 10};
    }
    parent.pluginToServer(PLUGIN_NAME, 'StudentAnswer', dataToSend);
  }
}

function processWordTaken(data) {
  var wordID = data.wordID;
  var studentID = data.studentID;
  var category = wordStatus[wordID].category;

  $("#" + wordID).css("visibility", "hidden");

//  debugger;

  var categoryElement = $("#categoryAnswered" + category);
  if (studentID === parent.document.socketID) {
    categoryElement.append('<div class="word-answered correct">' + wordStatus[wordID].word + "</div>");
    countCorrect++;
  } else {
    categoryElement.append('<div class="word-answered">' + wordStatus[wordID].word + "</div>");

    document.gameWordTaken(wordID);
  }
  categoryElement.scrollTop($("#categoryAnswered" + category).scrollHeight);

  if (data.isComplete) {
    var count = 0;
    if (isSingle) {
      count = countCorrect;
    } else {
      var words = data.wordStatus;
      var answered = _.where(words, {studentID: parent.document.socketID});
      if (answered) {
        count = _.size(answered);
      }
    }

    var template = $("#templateResults").html();
    var html = _.template(template, {
      title: "Results",
      countCorrect: count,
      countWrong: countWrong
    });
    parent.bootbox.alert(html);//'Activity Completed!<br><br><strong>Test</strong>');
//    setTimeout(function() {
//      parent.bootbox.hideAll();
//    }, 20000);
  }
}

function processWordCorrect(data) {
  var wordID = data.wordID;
  var studentID = data.studentID;
  var category = wordStatus[wordID].category;

  $("#" + wordID).css("visibility", "hidden");

  var categoryElement = $("#categoryAnswered" + category);
  categoryElement.append('<div class="word-answered correct">' + wordStatus[wordID].word + "</div>");

  categoryElement.scrollTop(categoryElement[0].scrollHeight);
}

function initializeWordLists(listID1) {
  var session = JSON.parse(parent.$("#data-session").html());
  var wordLists = session.wordLists;

  var wordList1 = _.findWhere(wordLists, {_id: listID1});
//  var wordList2 = _.findWhere(wordLists, {_id: listID2});

  if (!wordList1) {// || !wordList2) {
    return;
  }

  var wordStatus = [];
  seed = Math.floor((Math.random() * 100) + 1);

  var wordID = 0;

  _.each(wordList1.words, function(word) {
    var wordData = {};
    wordData.word = word;
    wordData.isAnswered = false;
    wordData.studentID = null;
    wordData.category = 1;
    wordData.wordID = wordID++;

    if (/^[a-zA-Z]*$/.test(wordData.word))
    {
      wordStatus.push(wordData);
    }
  });
//  _.each(wordList2.words, function(word) {
//    var wordData = {};
//    wordData.word = word;
//    wordData.isAnswered = false;
//    wordData.studentID = null;
//    wordData.category = 2;
//    wordData.wordID = wordID++;
//    wordStatus.push(wordData);
//  });

  var dataToSend = {
    wordList1: wordList1.title,
//    wordList2: wordList2.title,
    wordStatus: wordStatus,
    seed: seed
  };

  processWordList(dataToSend);
}

function initGrid(wordsArray, seed) {
  window.randomSeed = seed;
  $("#theGrid").wordsearchwidget({"wordlist": wordsArray, "gridsize": 10, startSeed: seed});
}