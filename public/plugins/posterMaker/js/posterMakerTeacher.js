var PLUGIN_NAME = 'POSTER_MAKER';

var pollType;
var numberOfChoices;
//google.load("visualization", "1", {packages: ["corechart"]});
//Load google then load jquery,google does not work in jquery ready
google.setOnLoadCallback(function() {
  $(document).ready(function() {
    $(function() {
      FastClick.attach(document.body);
    });

    if (parent.isTeacher) {
      parent.pluginToServer(PLUGIN_NAME, 'TeacherOpen', {});
      //listener for messages from server to plugin
      $(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
        if (!parent) {
          return;
        }

        var messageReceived = param.detail;

        switch (messageReceived.pluginMessageType)
        {
          //set all custom message type here
          case 'StudentJoin':
            break;
          case 'AnswerSubmitted':
            processAnswerSubmitted(messageReceived.data);
            break;
          case 'StudentAnswersAll':
            processStudentAnswersAll(messageReceived.data);
          case 'MarkedAnswer':
            processMarkedAnswer(messageReceived.data);
            break;
          case 'ResetActivity':
            processResetActivity(messageReceived.data);
            break;
          case 'ActivityEnded':
            processActivityEnded(messageReceived.data);
            break;
        }
      });

    }

    $(document).on('click', 'button[id^="buttonLaunch"]', function(event) {
      var buttonTrigger = $(event.target);
      console.log(buttonTrigger.text());

      if (buttonTrigger.text() === "Launch Open Response")
      {
        var pollType = getPollType();
        var dataToSend = {
          numberOfChoices: numberOfChoices,
          pollType: pollType
        };
        $("#submissions").html("");

        parent.pluginToServer(PLUGIN_NAME, 'StartActivity', dataToSend);

        buttonTrigger.text('End Campfire App');
        buttonTrigger.removeClass('btn-success');
        buttonTrigger.addClass('btn-danger');
      } else {
//        parent.pluginToServer(PLUGIN_NAME, 'EndActivity', {});

        parent.pluginToServer('PLUGIN_HANDLER', 'ExitPlugin', {pluginName: PLUGIN_NAME});

        buttonTrigger.text('Launch Open Response');
        buttonTrigger.removeClass('btn-danger');
        buttonTrigger.addClass('btn-success');
      }
    });

    $(document).on('click', 'button[id^="buttonReset"]', function(event) {
//      initializeMap(getPollType());
//      var num = getNumberOfChoices();
      var pollType = getPollType();
      dataToSend = {
        numberOfChoices: numberOfChoices,
        pollType: pollType
      };
      parent.pluginToServer(PLUGIN_NAME, 'ResetActivity', dataToSend);

      $("#submissions").html("");
    });

    $(document).on('click', '.button-correct, .button-wrong', function(event) {

      event.preventDefault();
      var answerID = $(event.target).closest(".student-answer")[0].id;
      var studentID = answerID.replace("student-answer-", "");

      var isCorrect = false;
      if ($(event.target).hasClass('button-correct') || $(event.target).parent().hasClass('button-correct')) {
        isCorrect = true;
        $("#student-answer-" + studentID).addClass("answer-correct");
        $("#student-answer-" + studentID).removeClass("answer-wrong");
      } else {
        $("#student-answer-" + studentID).addClass("answer-wrong");
        $("#student-answer-" + studentID).removeClass("answer-correct");
      }

      dataToSend = {
        studentID: studentID,
        isCorrect: isCorrect
      };
      parent.pluginToServer(PLUGIN_NAME, 'MarkAnswer', dataToSend);

    });

    $(document).on('click', '.student-answer', function(event) {
      if ($(event.target).hasClass('btn') || $(event.target).hasClass('glyphicon')) {
        return;
      }
      var answerID = $(event.target).id;
      if (!answerID)
        answerID = $(event.target).closest(".student-answer")[0].id;
      var studentID = answerID.replace("student-answer-", "");

//      console.log(studentID);

      var unselect = false;
      if ($("#student-answer-" + studentID).hasClass("selected")) {
        unselect = true;
      }
//      var children = $("#submissions").children(".student-answer");
      _.each($("#submissions").children(".student-answer"), function(element) {
        $(element).removeClass("selected");
      });

      if (!unselect) {
        $("#student-answer-" + studentID).addClass("selected");
        $('html, body').animate({
          scrollTop: parseInt($("#student-answer-" + studentID).offset().top)
        }, 100);
      }

    });

  });
});

function getPollType() {
  var selectedVal = "";
  var selected = $(".js-poll-type .radio input[type='radio']:checked");
  if (selected.length > 0) {
    selectedVal = selected.val();
  }
  return selectedVal;
}
function processAnswerSubmitted(data) {
  var drawingData = data.drawingData;
  drawingData = drawingData.replace('<svg ', '<svg viewBox="0 0 550 550"');

  var template = $("#student_drawing_template").html();
  var html = _.template(template, {
    data: {
      drawingData: drawingData,
      studentName: data.studentName,
      studentID: data.studentID}
  });
  $("#submissions").append(html);

}
function processStudentAnswersAll(data) {
  $("#submissions").append("");
  _.each(data.studentAnswers, function(studentAnswer) {
    console.log(studentAnswer);
    var drawingData = studentAnswer.drawingData;
    drawingData = drawingData.replace('<svg ', '<svg viewBox="0 0 550 550"');

    var template = $("#student_drawing_template").html();
    var html = _.template(template, {
      data: {
        drawingData: drawingData,
        studentName: studentAnswer.studentName,
        studentID: studentAnswer.studentID
      }
    });
    $("#submissions").append(html);

    if (studentAnswer.marked) {
      if (studentAnswer.marked.isCorrect) {
        $("#student-answer-" + studentAnswer.studentID).addClass("answer-correct");
      } else {
        $("#student-answer-" + studentAnswer.studentID).addClass("answer-wrong");
      }
    }
  });

}

function processMarkedAnswer(data) {
  var studentID = data.studentID;
  var isCorrect = data.isCorrect;
  if (isCorrect) {
    $("#student-answer-" + studentID).addClass("answer-correct");
    $("#student-answer-" + studentID).removeClass("answer-wrong");
  } else {
    $("#student-answer-" + studentID).addClass("answer-wrong");
    $("#student-answer-" + studentID).removeClass("answer-correct");
  }
}

function processResetActivity(data) {
  $("#submissions").html("");
}

function processActivityEnded(data) {
  $("#buttonLaunch").text('Launch Open Response');
  $("#buttonLaunch").removeClass('btn-danger');
  $("#buttonLaunch").addClass('btn-success');
}


//guide
function demoTrigger() {
  var intro = introJs();
  intro.setOptions({
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
//    overlayOpacity: 100,
    skipLabel: 'Exit',
    steps: [
      {
        element: document.querySelector('#buttonLaunch'),
        intro: "<h4>Trigger Open Response App on all devices</h4>"
      }
    ]
  });
  intro.onbeforechange(function(targetElement) {
    var delay = 1100;


    setTimeout(function() {
      targetElement.click();

      setTimeout(function() {
        intro.nextStep();
      }, delay);
    }, delay);
  });

  intro.oncomplete(function() {
//    setTimeout(function() {
    parent.parent.demoNextStep();
//    }, 2000);
  });
  intro.onexit(function() {
  });
  intro.start();
}

function demoOpenResponseGrade() {
  var intro = introJs();
  intro.setOptions({
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
//    overlayOpacity: 100,
    skipLabel: 'Exit',
    steps: [
      {
        element: document.querySelector('.student-answer'),
        intro: "<h4>Student's response</h4>"
      },
      {
        element: document.querySelector('.button-correct'),
        intro: "<h4>Grade instantly</h4>"
      },
      {
        element: $('.student-answer')[1],
        intro: "<h4>Student's response</h4>"
      },
      {
        element: $('.button-wrong')[1],
        intro: "<h4>Grade instantly</h4>"
      }
    ]
  });
  intro.onbeforechange(function(targetElement) {
    var delay = 1500;

    if ($(targetElement).hasClass("student-answer")) {

    } else if ($(targetElement).hasClass("button-correct") || $(targetElement).hasClass("button-wrong")) {
      delay = 3000;

      setTimeout(function() {
        targetElement.click();
      }, 1000);
    }

    setTimeout(function() {
      intro.nextStep();
    }, delay);
  });
  intro.oncomplete(function() {
//    setTimeout(function() {
    parent.parent.demoNextStep();
//    }, 2000);
  });
  intro.onexit(function() {
  });
  intro.start();
}