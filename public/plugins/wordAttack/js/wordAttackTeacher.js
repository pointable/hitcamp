var PLUGIN_NAME = 'WORD_ATTACK';
var PLUGIN_TITLE = 'Word Attack';
var isActive = false;

google.load('visualization', '1', {packages: ['table']});

$(document).ready(function() {

  $("#buttonNextWord").hide();
  $("#buttonRevealAnswer").hide();

  if (parent.isTeacher) {
    parent.pluginToServer(PLUGIN_NAME, 'TeacherOpen', {});
    if (parent.document.plugin && parent.document.plugin.pluginName === PLUGIN_NAME) {
      updateButtonLaunch(true);
    }

    $(document).on('PluginStatus', function(event, param) {
      if (!parent) {
        return;
      }
      var messageReceived = param.detail;
      switch (messageReceived.type)
      {
        case 'UpdatePluginStatus':
          updatePluginStatus(messageReceived);
          break;
      }
    });

    //listener for messages from server to plugin
    $(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
//    parent.$(document).on('ServerToPlugin' + PLUGIN_NAME, function(e) {
      if (!parent) {
        return;
      }
      var messageReceived = param.detail;

      switch (messageReceived.pluginMessageType)
      {
        case 'StudentJoin':
          break;
        case 'Results':
          processResults(messageReceived.data);
          break;
        case 'RevealAnswer':
          processRevealAnswer(messageReceived.data);
          break;

      }
    });


    initWordLists();
    //end teacher
  }

  $(document).on('click', 'button[id^="buttonNextWord"]', function(event) {
    parent.pluginToServer(PLUGIN_NAME, 'NextWord', {
    });
  });

  $(document).on('click', 'button[id^="buttonRevealAnswer"]', function(event) {
    parent.pluginToServer(PLUGIN_NAME, 'RevealAnswer', {});
  });


  $(document).on('click', 'button[id^="buttonLaunch"]', function(event) {
    var isLaunched = false;

    if (!isActive)
    {
      var listID1 = $("#comboWordLists1").val();
      var listID2 = $("#comboWordLists2").val();

      if (listID1 === listID2) {
        parent.bootbox.alert("Choose two different Word Lists");
        return;
      }

      var dataStored = JSON.parse(parent.$('#data-session').html());
      var wordList1 = _.find(dataStored.wordLists, function(wordList) {
        return wordList._id === listID1;
      });
      var wordList2 = _.find(dataStored.wordLists, function(wordList) {
        return wordList._id === listID2;
      });
      parent.pluginToServer(PLUGIN_NAME, 'StartActivity', {
//        wordListID1: listID1,
        wordList1: wordList1,
//        wordListID2: listID2,
        wordList2: wordList2
      });
      isLaunched = true;

    } else {
      parent.pluginToServer(PLUGIN_NAME, 'EndActivity', {});
      isLaunched = false;
    }
    updateButtonLaunch(isLaunched);
  });
});
function updatePluginStatus(data) {
  var isLaunched = false;
  if (data.pluginName === PLUGIN_NAME) {
    if (data.active) {
      isLaunched = true;
    }
  }

  updateButtonLaunch(isLaunched);
}

function updateButtonLaunch(isLaunched) {
  isActive = isLaunched;
  var buttonTrigger = $("#buttonLaunch");
  if (isLaunched) {
    buttonTrigger.text('End ' + PLUGIN_TITLE);
    buttonTrigger.removeClass('btn-success');
    buttonTrigger.addClass('btn-danger');

    $("#buttonNextWord").show();
    $("#buttonRevealAnswer").show();
  } else {
    buttonTrigger.text('Launch ' + PLUGIN_TITLE);
    buttonTrigger.removeClass('btn-danger');
    buttonTrigger.addClass('btn-success');

    $("#buttonNextWord").hide();
    $("#buttonRevealAnswer").hide();
  }
}

function getUrlVars() {
  var vars = {};
  var frameURL = decodeURIComponent(document.location.href);
//  console.log(frameURL);

  var parts = frameURL.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value;
  });
  return vars;
}

function initWordLists() {
  var dataStored = JSON.parse(parent.$('#data-session').html());
//  console.log(dataStored);
  var wordLists = dataStored.wordLists;

  console.log(wordLists);
  var template = _.template($("#templateWordLists").html());
  var fullHTML1 = '';
  var fullHTML2 = '';

  _.each(wordLists, function(wordList, i) {
    var isFirst1, isFirst2 = false;
    if (i === 0)
    {
      isFirst1 = true;
    } else if (i === 1) {
      isFirst2 = true;
    }
    fullHTML1 += template({wordList: wordList, isFirst: isFirst1});
    fullHTML2 += template({wordList: wordList, isFirst: isFirst2});
  });

  $("#comboWordLists1").html(fullHTML1);
  $("#comboWordLists2").html(fullHTML2);

//  $('.combobox').combobox();
}

function processResults(data) {
//  console.log(data.wordStatus);

  var studentAnswers = data.studentAnswers;
  generateChart(studentAnswers, data.categories);
}

function processRevealAnswer(data) {
//  console.log(data.wordStatus);

  var studentAnswers = data.studentAnswers;
  var answer = data.answer;
  generateChartReveal(studentAnswers, data.categories, answer);
}

function generateChart(students, categories) {
  var data = new google.visualization.DataTable();
  data.addColumn('number', '#');
  data.addColumn('string', '');
  data.addColumn('string', categories.title1);
  data.addColumn('string', categories.title2);

  var rows = [];
  _.each(students, function(student, i) {
//    score = student.numberOfWords;
//    if (!score)
//      score = 0;
//    var score = parseInt(score);
//    var groupedWords = _.groupBy(student.words, function(wordData) {
//      return wordData.category;
//    });

//    var category1words = "";
//    _.each(groupedWords["1"], function(wordData, i) {
//      if (i !== 0) {
//        category1words += ", ";
//      }
//      category1words += wordData.word;
//    });
//
//    var category2words = "";
//    _.each(groupedWords["2"], function(wordData, i) {
//      if (i !== 0) {
//        category2words += ", ";
//      }
//      category2words += wordData.word;
//    });

    rows.push([(i + 1), student.studentName, "?", "?"]);
  });
  data.addRows(rows);
  var table = new google.visualization.Table(document.getElementById('table_div'));
  table.draw(data, {showRowNumber: false});
  $('.google-visualization-table-th:contains("#")').css('width', "30px");
  $('.google-visualization-table-th:contains("Words")').css('width', "30px");
//  $('.google-visualization-table-th:contains("Words")').css('text-align', "center");
}

function generateChartReveal(students, categories, answer) {
  var data = new google.visualization.DataTable();
  data.addColumn('number', '#');
  data.addColumn('string', '');
  if (answer === 1) {
    categories.title1 += " ✓ ";
    categories.title2 += " X ";
  } else {
    categories.title1 += " X ";
    categories.title2 += " ✓ ";
  }

  data.addColumn('string', categories.title1);
  data.addColumn('string', categories.title2);

  var rows = [];
  _.each(students, function(student, i) {
    var category1 = "";
    var category2 = "";

    var template;
    if (student.isCorrect) {
      template = $("#templateCorrect").html();
    } else {
      template = $("#templateWrong").html();
    }

    if (student.choice === 1) {
      category1 = template;
    } else {
      category2 = template;
    }
    rows.push([(i + 1), student.studentName, category1, category2]);
  });
  data.addRows(rows);
  var table = new google.visualization.Table(document.getElementById('table_div'));
  table.draw(data, {showRowNumber: false, allowHtml: true});
  $('.google-visualization-table-th:contains("#")').css('width', "30px");
  $('.google-visualization-table-th:contains("Words")').css('width', "30px");

//  $('.google-visualization-table-th:contains('+categories.title1+')').css('background-color', "#ccffcc");
//  $('.google-visualization-table-th:contains('+categories.title2+')').css('background-color', "lightpink");
}


//guide
//function demoTrigger() {
//  var intro = introJs();
//  intro.setOptions({
//    showStepNumbers: false,
//    showBullets: false,
//    showButtons: false,
////    overlayOpacity: 100,
//    skipLabel: 'Exit',
//    steps: [
//      {
//        element: document.querySelector('#buttonLaunch'),
//        intro: "<h4>Trigger Word Attack App on students' devices</h4>"
//      }
//    ]
//  });
//  intro.onbeforechange(function(targetElement) {
//    var delay = 1100;
//
//    setTimeout(function() {
//      targetElement.click();
//
//      setTimeout(function() {
//        intro.nextStep();
//      }, delay);
//    }, delay);
//  });
//  intro.oncomplete(function() {
////    setTimeout(function() {
//    parent.parent.demoNextStep();
////    }, 2000);
//  });
//  intro.onexit(function() {
//  });
//  intro.start();
//}
//
//function demoRevealAnswerAndExit() {
//  var intro = introJs();
//  intro.setOptions({
//    showStepNumbers: false,
//    showBullets: false,
//    showButtons: false,
////    overlayOpacity: 100,
//    skipLabel: 'Exit',
//    steps: [
//      {
//        element: document.querySelector('#buttonRevealAnswer'),
//        intro: "<h4>Reveal Answer</h4>"
//      },
//      {
//        element: document.querySelector('#table_div'),
//        intro: "<h4>Results</h4>"
//      }
////      {
////        intro: "Close",
////        element: document.querySelector('.js-close'),
////        position: "left"
////      }
//    ]
//  });
//  intro.onbeforechange(function(targetElement) {
//    var delay = 1500;
//
//    if ($(targetElement)[0].id === "buttonRevealAnswer") {
//      setTimeout(function() {
//        $(targetElement)[0].click();
//      }, delay);
//    } else if ($(targetElement)[0].id === "table_div") {
//      delay = 3000;
//    } else if ($(targetElement).hasClass("table_div")) {
//      $(targetElement)[0].click();
//    }
//
//    setTimeout(function() {
//      intro.nextStep();
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