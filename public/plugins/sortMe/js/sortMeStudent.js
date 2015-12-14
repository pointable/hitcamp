var PLUGIN_NAME = 'SORT_ME';
var isSingle = false;

var countCorrect = 0;
var countWrong = 0;

var singleAnsweredCounter = 0;

$(document).ready(function() {

  $(function() {
    FastClick.attach(document.body);
  });

  var parameters = parent.getUrlVars(document);
//  selectedStudentID = parameters.studentID;

  if (parameters.isSingle) {
    isSingle = true;
    PLUGIN_NAME = 'SINGLE';
  }

//  console.log(parameters);
//  var studentName = parameters.studentName;//decodeURIComponent(parameters.studentName);  

  if (isSingle) {
    initializeWordLists(parameters.listID1, parameters.listID2);
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


function initInteract() {
  interact('.dropzone')
      // enable draggables to be dropped into this
      .dropzone(true)
      // only accept elements matching this CSS selector
      .accept('.drag-drop')
      // listen for drop related events
      .on('dragenter', function(event) {
        var draggableElement = event.relatedTarget,
            dropzoneElement = event.target;

        // feedback the possibility of a drop
        dropzoneElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');

//        draggableElement.textContent = 'Dragged in';
      })
      .on('dragleave', function(event) {
        // remove the drop feedback style
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
//        event.relatedTarget.textContent = 'Dragged out';
      })
      .on('drop', function(event) {
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');

        if (event.target.id === "inner-dropzone1")
        {
          if ($(event.relatedTarget).hasClass("category1")) {
            sendWord(event.relatedTarget.id, true);
            event.relatedTarget.classList.add('drop-correct');
          } else {
            sendWord(event.relatedTarget.id, false);
            event.relatedTarget.classList.add('drop-wrong');

            countWrong++;
          }
        } else {
          if ($(event.relatedTarget).hasClass("category2")) {
            sendWord(event.relatedTarget.id, true);
            event.relatedTarget.classList.add('drop-correct');
          } else {
            sendWord(event.relatedTarget.id, false);
            event.relatedTarget.classList.add('drop-wrong');

            countWrong++;
          }
        }
//        event.relatedTarget.textContent = 'Dropped in';
        $(event.relatedTarget).addClass('fadeOut animated');
        $(event.relatedTarget).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
//          $(event.relatedTarget).remove();
        });
      });

  interact('.drag-drop')
      .draggable({
        onmove: function(event) {
          var target = event.target;

          target.x = (target.x | 0) + event.dx;
          target.y = (target.y | 0) + event.dy;

          target.style.webkitTransform = target.style.transform =
              'translate(' + target.x + 'px, ' + target.y + 'px)';
        }
      })
      .inertia(true)
      .restrict({drag: 'parent', endOnly: false});
}
//$("#inner-dropzone1")

//var wordList1;
//var wordList2;
var wordStatus;
function processWordList(data) {
  wordListTitle1 = data.wordList1;
  wordListTitle2 = data.wordList2;
  wordStatus = data.wordStatus;

  $("#category1").html(wordListTitle1);
  $("#category2").html(wordListTitle2);

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

  initInteract();
}

function sendWord(wordID, isCorrect) {

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
      dataToSend.meta = {points: 10};
    }
    parent.pluginToServer(PLUGIN_NAME, 'StudentAnswer', dataToSend);
  }
}

function processWordTaken(data) {
  var wordID = data.wordID;
  var studentID = data.studentID;
  var category = wordStatus[wordID].category;

  $("#" + wordID).css("visibility", "hidden");


  var categoryElement = $("#categoryAnswered" + category);
  if (studentID === parent.document.socketID) {
    categoryElement.append('<div class="word-answered correct">' + wordStatus[wordID].word + "</div>");
    countCorrect++;
  } else {
    categoryElement.append('<div class="word-answered">' + wordStatus[wordID].word + "</div>");
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

function initializeWordLists(listID1, listID2) {
  var session = JSON.parse(parent.$("#data-session").html());
  var wordLists = session.wordLists;

  var wordList1 = _.findWhere(wordLists, {_id: listID1});
  var wordList2 = _.findWhere(wordLists, {_id: listID2});

  if (!wordList1 || !wordList2) {
    return;
  }

  var wordStatus = [];

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

  var dataToSend = {
    wordList1: wordList1.title,
    wordList2: wordList2.title,
    wordStatus: wordStatus
  };

  processWordList(dataToSend);

}