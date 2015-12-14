var PLUGIN_NAME = 'BUZZER';
var selectedStudentID;

var studentsPerDevice = 1;
var studentsStatuses = [];
var timeToStart;

$(document).ready(function() {

  parent.sendPing();

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
        case 'StudentOpenResponse':
          processStudentOpenResponse(messageReceived.data);
          break;
        case 'MarkedAnswer':
          processMarkedAnswer(messageReceived.data);
          break;
      }
    });

    $(".js-buzzer").on('touchstart mousedown', function(event) {
      event.stopPropagation();
      event.preventDefault();
      var selectedBuzzer = $(event.target).parents(".buzzer-area");
      selectedBuzzer.find(".btn-buzzer").addClass("btn-buzzer-active");

      var studentNumber = parseInt(selectedBuzzer.attr("data-student-number"));

      buzzerClicked(studentNumber);
    });
    $(".js-buzzer").on('touchend mouseup', function(event) {
      event.stopPropagation();
      event.preventDefault();

      var selectedBuzzer = $(event.target).parents(".buzzer-area");
      selectedBuzzer.find(".btn-buzzer").removeClass("btn-buzzer-active");
//      selectedBuzzer.parent().focus();
    });
  }

  parent.pluginToServer(PLUGIN_NAME, 'StudentOpen', {});

  document.body.addEventListener('touchmove', function(event) {
    event.preventDefault();
  }, false);
});

function processResetActivity(data) {
  if (data.studentsPerDevice) {
    studentsPerDevice = data.studentsPerDevice;
  }
  resetSplitScreen();

  resetActivity();

  var timeToStart = data.timeToStart;
//  console.log("time to start:" + data.timeToStart);
  var millisTillStart = millisToStart(timeToStart);

  setTimeout(function() {
    timerDoneHitNow();
  }, millisTillStart);

}

function resetActivity() {
  studentsStatuses = [];
  if (studentsPerDevice === 1) {
    studentsStatuses.push(new studentStatus(0));
    getReady(0);
  } else if (studentsPerDevice === 2) {
    studentsStatuses.push(new studentStatus(0));
    studentsStatuses.push(new studentStatus(1));
    getReady(0);
    getReady(1);
  }
}

function getReady(studentNumber) {
  $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .timer").text("Get Ready!");
  $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .buzzer-area").attr('class', 'buzzer-area');
  $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .btn-buzzer").addClass("frosted");
}


function processMarkedAnswer(data) {
  studentNumber = data.studentNumber;
  
  if (data.isCorrect) {
    $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .buzzer-area").attr('class', 'buzzer-area');;
    $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .buzzer-area").addClass("answer-correct");
  } else {
    $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .buzzer-area").attr('class', 'buzzer-area');;
    $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .buzzer-area").addClass("answer-wrong");
  }
}

function processStudentOpenResponse(data) {
  var answers = data.answers;
  timeToStart = data.timeToStart;

  if (data.studentsPerDevice) {
    studentsPerDevice = data.studentsPerDevice;
  }

  resetSplitScreen();
  resetActivity();

  if (studentsPerDevice === 1) {
    var studentAnswer0;
    if (answers) {
      studentAnswer0 = _.findWhere(answers, {studentNumber: 0});
    }
    resetStudentAnswer(0, studentAnswer0);
  } else if (studentsPerDevice > 1) {
    var studentAnswer0;
    var studentAnswer1;

    if (answers) {
      studentAnswer0 = _.findWhere(answers, {studentNumber: 0});
      studentAnswer1 = _.findWhere(answers, {studentNumber: 1});
    }
    resetStudentAnswer(0, studentAnswer0);
    resetStudentAnswer(1, studentAnswer1);
  }
}

function resetStudentAnswer(studentNumber, studentAnswer) {
  if (studentAnswer && studentAnswer.position === 1) {
    $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .buzzer-area").addClass("win");
    $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .btn-buzzer").removeClass("frosted");
    studentsStatuses[studentNumber].clicked = true;

  } else if (studentAnswer && studentAnswer.position !== 1) {
    $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .buzzer-area").addClass("lose");
    $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .btn-buzzer").removeClass("frosted");
    studentsStatuses[studentNumber].clicked = true;
  } else { // The game just started 
    var millisTillStart = millisToStart(timeToStart);
    if (millisTillStart > 0) { //Only set timeout if there is delay
      studentsStatuses[studentNumber].clicked = true;
//      resetActivity();
      setTimeout(function() {
        updateHitNow(studentNumber);
      }, millisTillStart);
    } else if (millisTillStart <= 0) {
      studentsStatuses[studentNumber].clicked = false;

      //To indicate no countdown for click
      $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .timer").text("Hit Now!");
      $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .btn-buzzer").removeClass("frosted");

      $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .buzzer-area").addClass("buzzer-area-animation");
    }
  }

  if (studentAnswer) {
    var ordinalStr = getGetOrdinal(studentAnswer.position);
    $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .timer").text(ordinalStr + " to buzz");
  }
}

function processSetActivityResult(data) {
  var position = data.position;
  var studentNumber = data.studentNumber;

  if (position === 1) {
    $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .buzzer-area").addClass("win");
    $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .btn-buzzer").removeClass("frosted");
  } else if (position !== 1) {
    $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .buzzer-area").addClass("lose");
    $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " btn-buzzer").removeClass("frosted");
  }

  if (position) {
    var ordinalStr = getGetOrdinal(position);
    $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .timer").text(ordinalStr + " to buzz");
  }
}

function timerDoneHitNow() {
  if (studentsPerDevice === 1) {
    updateHitNow(0);
  } else if (studentsPerDevice > 1) {
    updateHitNow(0);
    updateHitNow(1);
  }
}

function updateHitNow(studentNumber)
{
  studentsStatuses[studentNumber].clicked = false;

  $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .timer").text("Hit Now!");
  $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .btn-buzzer").removeClass("frosted");
  $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .buzzer-area").addClass("buzzer-area-animation");

}

function buzzerClicked(studentNumber) {
  if (!studentsStatuses[studentNumber].clicked) {
    studentsStatuses[studentNumber].clicked = true;
    var selectedBuzzer = $("#buzzer-" + studentsPerDevice + "-" + studentNumber + " .buzzer-area");
    ;//$(event.target).parents(".buzzer-area");
    selectedBuzzer.attr('class', 'buzzer-area');
    selectedBuzzer.addClass('shake animated');
    selectedBuzzer.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
      selectedBuzzer.removeClass('shake animated');
    });
    setTimeout(function() {
      parent.pluginToServer(PLUGIN_NAME, 'BuzzerClicked', {studentNumber: studentNumber});
    }, 1);
  }
}

function millisToStart(timeToStart) {
  var timeToRun = timeToStart;
  var serverTimeNow = (new Date()).valueOf() + parent.document.timeDifference;
  var millisTillStart = timeToRun - serverTimeNow;
  return millisTillStart;
}

function getGetOrdinal(n) {
  var s = ["th", "st", "nd", "rd"],
      v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function resetSplitScreen() {
  if (studentsPerDevice === 1) {
    $("#buzzer-2-0").hide();
    $("#buzzer-2-1").hide();
    $("#buzzer-1-0").show();
  } else if (studentsPerDevice > 1) {
    $("#buzzer-1-0").hide();
    $("#buzzer-2-0").show();
    $("#buzzer-2-1").show();
  }
}

function studentStatus(studentNumber) {
  this.clicked = false;
//  this.studentID = studentID;
  this.studentNumber = studentNumber;
  this.isWin = false;
  this.position;

}
