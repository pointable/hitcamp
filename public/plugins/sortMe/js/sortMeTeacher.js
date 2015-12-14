var PLUGIN_NAME = 'SORT_ME';
var PLUGIN_TITLE = 'Sort Me';
var isActive = false;


google.load('visualization', '1', {packages: ['table']});

$(document).ready(function() {

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
      }
    });

    initWordLists();
    //end teacher
  }

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
  } else {
    buttonTrigger.text('Launch ' + PLUGIN_TITLE);
    buttonTrigger.removeClass('btn-danger');
    buttonTrigger.addClass('btn-success');
  }
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
    if (i == 0)
    {
      isFirst1 = true;
    } else if (i == 1) {
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

  var studentResults = data.studentResults;
  generateChart(studentResults, data.categories);
}

function generateChart(students, categories) {
  var data = new google.visualization.DataTable();
  data.addColumn('number', '#');
  data.addColumn('string', 'Student');
  data.addColumn('number', 'Words');
  data.addColumn('string', categories.title1);
  data.addColumn('string', categories.title2);

  var rows = [];
  _.each(students, function(student, i) {
    score = student.numberOfWords;
    if (!score)
      score = 0;
    var score = parseInt(score);
    var groupedWords = _.groupBy(student.words, function(wordData) {
      return wordData.category;
    });

    var category1words = "";
    _.each(groupedWords["1"], function(wordData, i) {
      if (i !== 0) {
        category1words += ", ";
      }
      category1words += wordData.word;
    });

    var category2words = "";
    _.each(groupedWords["2"], function(wordData, i) {
      if (i !== 0) {
        category2words += ", ";
      }
      category2words += wordData.word;
    });

    rows.push([(i + 1), student.studentName, score, category1words, category2words]);
  });
  console.log(rows);
  data.addRows(rows);
  var table = new google.visualization.Table(document.getElementById('table_div'));
  table.draw(data, {showRowNumber: false});
  $('.google-visualization-table-th:contains("#")').css('width', "30px");
  $('.google-visualization-table-th:contains("Words")').css('width', "30px");
//  $('.google-visualization-table-th:contains("Words")').css('text-align', "center");
}