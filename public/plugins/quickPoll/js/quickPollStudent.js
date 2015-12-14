var PLUGIN_NAME = 'QUICKPOLL';
var clicked = false;
var pollData = [['choice', 'number of students']];

$(document).ready(function() {
  $(function() {
    FastClick.attach(document.body);
  });

  if (parent.isTeacher) {
  } else {//student

    $(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
      if (!parent) {
        return;
      }

      var messageReceived = param.detail;

      switch (messageReceived.pluginMessageType)
      {
        case 'ResetActivity':
          processResetActivity(messageReceived.data);
          break;
        case 'SetActivityResult':
          processSetActivityResult(messageReceived.data);
          break;
      }
    });

    //initChoices();
  }

  //Send when the app is ready, next server will initialize the app
  parent.pluginToServer(PLUGIN_NAME, 'StudentOpen', {});
});

function processResetActivity(data) {

  var timeToStart = data.timeToStart;
  console.log("time to start:" + data.timeToStart);
  var millisTillStart = millisToStart(timeToStart);

//  setTimeout(function() {
//    ResetActivity(data);
//  }, millisTillStart);
  ResetActivity(data);
}

function ResetActivity(data) {
  clicked = false;
  pollData = [['choice', 'number of students']];
  $("#choices-area").empty();
  processSetActivityResult(data);
}

function nextChar(c) {
  return String.fromCharCode(c.charCodeAt(0) + 1);
}

function processSetActivityResult(data) {
  initializeChoices(data);
}

function timer()
{
  if (count <= 0)
  {
    $("#timer").text("Hit Now!");
    clearInterval(counter);
    return;
  }
  console.log("timer: " + count);
  $("#timer").text(count);
  count--;
}

function millisToStart(timeToStart) {
  var timeToRun = timeToStart;
  console.log("timeDifference :ms" + timeToRun);
  console.log("timeDifference :ms" + parent.document.timeDifference);
  var serverTimeNow = (new Date()).valueOf() + parent.document.timeDifference;
  var millisTillStart = timeToRun - serverTimeNow;
  console.log(millisTillStart);
  return millisTillStart;
}

function initializeChoices(data) {
  var studentButtonsData = {choices: []};
  switch (data.pollType) {
    case "mc":
      var numberOfChoices = data.numberOfChoices;
      var alpha = 'A';
      for (var i = 0; i < numberOfChoices; i++) {
        studentButtonsData.choices.push({desc: alpha});
        alpha = nextChar(alpha);
      }
      break;
    case "yn":
      studentButtonsData.choices.push({desc: "Yes"});
      studentButtonsData.choices.push({desc: "No"});
      break;
    case "tf":
      studentButtonsData.choices.push({desc: "True"}, {desc: "False"});
      break;
    case "ld":
      studentButtonsData.choices.push({desc: "Like"}, {desc: "Dislike"});
      break;
  }

  var choicesTemplate = $("#poll_btn_template").html();

  $("#choices-area").append(_.template(choicesTemplate, {data: studentButtonsData}));

  if (data.pollChoice !== '' && typeof (data.pollChoice) !== 'undefined') {
    clicked = true;
    $(".js-choice").filter(function(index) {
      console.log($(this).text());
      return $(this).text() === data.pollChoice;
    }).addClass("btn-success");
  }

  $(".js-choice").on('click', function(event) {
    event.preventDefault();
    if (!clicked) {
      clicked = true;
      //alert($(event.target).text());
      //Change the text label to green
      $(event.target).addClass("btn-success");
      var pollChoice = $(event.target).text();
      var dataToSend = {
        pollChoice: pollChoice,
        meta: {
          points: 10
        }
      };
      parent.pluginToServer(PLUGIN_NAME, 'PollClicked', dataToSend);
    } else {
      return;
    }
  });
}