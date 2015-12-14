var PLUGIN_NAME = 'RANDOMIZER';
var PLUGIN_TITLE = 'Randomizer';
var isActive = false;

var selectedStudentID;

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
      var messageReceived = param.detail;

      switch (messageReceived.pluginMessageType)
      {
        //set all custom message type here
        case 'StudentJoin':
          break;
        case 'StudentBlink':
          studentBlink(messageReceived.data);
          break;
        case 'StudentChosen':
          studentChosen(messageReceived.data);
          break;
        case 'Results':
          processResults(messageReceived.data);
          break;
      }
    });

//    initWordLists();
    //end teacher
  }

  $(document).on('click', 'button[id^="buttonLaunch"]', function(event) {
    var isLaunched = false;
    if (!isActive)
    {
      if (_.size(_.flatten(parent.document.students.grouping)) < 2) {
        parent.bootbox.alert("At least 2 students are required");
        return;
      }
      var randomTime = Math.floor((Math.random() * 5) + 1);
      var dataToSend = {
        time: randomTime
      };
      parent.pluginToServer(PLUGIN_NAME, 'StartActivity', dataToSend);
      isLaunched = true;

    } else {
      parent.pluginToServer(PLUGIN_NAME, 'EndActivity', {});
      isLaunched = false;
    }
    updateButtonLaunch(isLaunched);
    resetUI();

    $("#student-name").text("Get ready!");
  });


  $(document).on('click', 'button[id^="buttonReset"]', function(event) {
    resetUI();

    var randomTime = Math.floor((Math.random() * 5) + 1);
    var dataToSend = {
      time: randomTime
    };
    parent.pluginToServer(PLUGIN_NAME, 'ResetActivity', dataToSend);

  });

  $(document).on('click', '.button-correct, .button-wrong', function(event) {

    event.preventDefault();
    var element = $(event.target).closest(".marking")[0];
    element = $(element);

    var answerID = element.id;
//    var studentID = answerID.replace("student-answer-", "");
    var studentID = element.attr('data-student-id');
    var studentNumber = 0;//element.attr('data-student-number');
    studentNumber = parseInt(studentNumber);
    var studentNameDIV = $("#student-name");
    var isCorrect = false;
    if ($(event.target).hasClass('button-correct') || $(event.target).parent().hasClass('button-correct')) {
      isCorrect = true;
      studentNameDIV.addClass("answer-correct");
      studentNameDIV.removeClass("answer-wrong");
    } else {
      studentNameDIV.addClass("answer-wrong");
      studentNameDIV.removeClass("answer-correct");
    }

    dataToSend = {
      studentID: studentID,
      studentNumber: studentNumber,
      isCorrect: isCorrect
    };
    parent.pluginToServer(PLUGIN_NAME, 'MarkAnswer', dataToSend);
  });

  $(document).on('click', '.button-good, .button-bad', function(event) {
    event.preventDefault();
    var element = $(event.target).closest(".marking")[0];
    element = $(element);

    var answerID = element.id;
//    var studentID = answerID.replace("student-answer-", "");
    var studentID = element.attr('data-student-id');
    var studentNumber = 0;//element.attr('data-student-number');
    studentNumber = parseInt(studentNumber);
    var isGood = false;
    if ($(event.target).hasClass('button-good') || $(event.target).parent().hasClass('button-good')) {
      isGood = true;
//      element.addClass("answer-correct");
//      element.removeClass("answer-wrong");
    } else {
//      element.addClass("answer-wrong");
//      element.removeClass("answer-correct");
    }

    dataToSend = {
      studentID: studentID,
      studentNumber: studentNumber,
      isGood: isGood
    };
    parent.pluginToServer(PLUGIN_NAME, 'MeritStudent', dataToSend);
  });
});

function resetUI() {
  $("#student-name").removeClass();
  $("#student-name").text("");

  $(".grading-area").html("");
}

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

function processResults(data) {
  var studentResults = data.studentResults;
//  debugger;
//  resetUI();
  if (studentResults.marked) {
    if (studentResults.marked.isCorrect) {

      $("#student-name").removeClass("answer-wrong");
      $("#student-name").addClass("answer-correct");
    } else {
      $("#student-name").removeClass("answer-correct");
      $("#student-name").addClass("answer-wrong");
    }
  } else {
//    $("#student-name").addClass("color-bombed");
  }
}

function studentBlink(data) {
  var studentName = data.studentName;

  $("#student-name").text(studentName);

  $("#student-name").removeClass();
  $("#student-name").addClass("color-bombing");

  $(".grading-area").html("");
}

function studentChosen(data) {
  var studentName = data.studentName;

  $("#student-name").text(studentName);

  $("#student-name").removeClass();

//  if (data.marked) {
//    if (data.marked.isCorrect) {
//      $("#student-name").addClass("answer-correct");
//    } else {
//      $("#student-name").addClass("answer-wrong");
//    }
//  } else {

  $("#student-name").addClass("color-bombed");
//  }

  var student = data;

  var templateMark = $("#templateMark").html();
  var templateBehaviour = $("#templateBehaviour").html();
  var htmlMark = _.template(templateMark, {
    data: {
      studentID: data.studentID,
      studentNumber: 0,
      marked: false,//(student.marked) ? true : false,
      isCorrect: false//(student.marked && student.marked.isCorrect) ? true : false
    }
  });
  var htmlBehaviour = _.template(templateBehaviour, {
    data: {
      studentID: data.studentID,
      studentNumber: 0,
      merited: false,//(student.merited) ? true : false,
      isGood: false//(student.merited && student.merited.isGood) ? true : false
    }
  });

  $(".grading-area").html(htmlMark + htmlBehaviour);

  if (student.marked) {
    if (student.marked.isCorrect) {

      $("#student-name").removeClass("answer-wrong");
      $("#student-name").addClass("answer-correct");
    } else {
      $("#student-name").removeClass("answer-correct");
      $("#student-name").addClass("answer-wrong");
    }
  }

}


//var isDemo = false;
//var intro;
////guide
//function demoTrigger() {
//  isDemo = true;
//  intro = introJs();
//  intro.setOptions({
//    showStepNumbers: false,
//    showBullets: false,
//    showButtons: false,
////    overlayOpacity: 100,
//    skipLabel: 'Exit',
//    steps: [
//      {
//        element: document.querySelector('#buttonLaunch'),
//        intro: "<h4>Trigger Randomizer App on students' devices</h4> <h5> to select a random student</h5>"
//      },
//      {
//        intro: "<h4>Random student selected</h4>"
//      }
//    ]
//  });
//  intro.onbeforechange(function(targetElement) {
//    
//    if ($(targetElement)[0].id === "buttonLaunch") {
//      setTimeout(function() {
//        targetElement.click();
//      }, 1000);
//    } else {
//      setTimeout(function() {
//        intro.nextStep();
//      }, 2500);
//    }
//  });
//  intro.oncomplete(function() {
////    setTimeout(function() {
//      parent.parent.demoNextStep();
////    }, 2000);
//  });
//  intro.onexit(function() {
//  });
//  intro.start();
//}


