var PLUGIN_NAME = 'WHEEL_WORD';
var PLUGIN_TITLE = 'Word Wheel';
var isActive = false;

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
        //set all custom message type here
        case 'StudentJoin':
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

  $(document).on('click', 'button[id^="buttonLaunch"]', function(event) {

    var isLaunched = false;
    if (!isActive)
    {
      var listID1 = $("#comboWordLists1").val();
      var listID2 = $("#comboWordLists2").val();

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