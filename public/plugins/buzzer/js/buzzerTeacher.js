var PLUGIN_NAME = 'BUZZER';
var PLUGIN_TITLE = 'Buzzer';
var isActive = false;

google.load('visualization', '1', {packages: ['table']});
$(document).ready(function() {
  $(function() {
    FastClick.attach(document.body);
  });
  if (parent.isTeacher) {
    parent.pluginToServer(PLUGIN_NAME, 'TeacherOpen', {});
    
    if (parent.document.plugin && parent.document.plugin.pluginName === PLUGIN_NAME){
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

    $(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {

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
  }

  $(".js-close").on('click', function(event) {
    event.preventDefault();
    var message = {type: 'Exit'};
    parent.jq(parent.document).trigger('MiniApp', {detail: message});
  });

  $(document).on('click', 'button[id^="buttonLaunch"]', function(event) {
    var studentsPerDevice = $("#radioNumberOfGroups > .active").data("value");

    var isLaunched = false;
    if (!isActive)
    {
      var randomTime = 0; //Math.floor((Math.random() * 5) + 1);
      var dataToSend = {
        time: randomTime,
        studentsPerDevice: studentsPerDevice
      };
      parent.pluginToServer(PLUGIN_NAME, 'StartActivity', dataToSend);
      isLaunched = true;
    } else {
      parent.pluginToServer(PLUGIN_NAME, 'EndActivity', {});
      isLaunched = false;
    }
    updateButtonLaunch(isLaunched);
  });

  $(document).on('click', 'button[id^="buttonReset"]', function(event) {
    var studentsPerDevice = $("#radioNumberOfGroups > .active").data("value");
    var buttonTrigger = $(event.target);
    var randomTime = 0; //
    // Math.floor((Math.random() * 5) + 1);
    var dataToSend = {
      time: randomTime,
      studentsPerDevice: studentsPerDevice
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
    var studentNumber = element.attr('data-student-number');
    studentNumber = parseInt(studentNumber);
    var isCorrect = false;
    if ($(event.target).hasClass('button-correct') || $(event.target).parent().hasClass('button-correct')) {
      isCorrect = true;
      element.addClass("answer-correct");
      element.removeClass("answer-wrong");
    } else {
      element.addClass("answer-wrong");
      element.removeClass("answer-correct");
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
    var studentNumber = element.attr('data-student-number');
    studentNumber = parseInt(studentNumber);
    var isGood = false;
    if ($(event.target).hasClass('button-good') || $(event.target).parent().hasClass('button-good')) {
      isGood = true;
      element.addClass("answer-correct");
      element.removeClass("answer-wrong");
    } else {
      element.addClass("answer-wrong");
      element.removeClass("answer-correct");
    }

    dataToSend = {
      studentID: studentID,
      studentNumber: studentNumber,
      isGood: isGood
    };
    parent.pluginToServer(PLUGIN_NAME, 'MeritStudent', dataToSend);
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

function processResults(data) {
  var studentResults = data.studentResults;
  generateChart(studentResults);
}

function generateChart(students) {
//  console.log(students);
  var data = new google.visualization.DataTable();
  data.addColumn('number', '#');
  data.addColumn('string', 'Student');
  data.addColumn('string', 'Grade');
  data.addColumn('string', 'Merit');
  var templateMark = $("#templateMark").html();
  var templateBehaviour = $("#templateBehaviour").html();
  var rows = [];
  _.each(students, function(student, i) {
    console.log(student.marked);
    console.log(student);
    var htmlMark = _.template(templateMark, {
      data: {
        studentID: student.studentID,
        studentNumber: student.studentNumber,
        marked: (student.marked) ? true : false,
        isCorrect: (student.marked && student.marked.isCorrect) ? true : false
      }
    });
    var htmlBehaviour = _.template(templateBehaviour, {
      data: {
        studentID: student.studentID,
        studentNumber: student.studentNumber,
        merited: (student.merited) ? true : false,
        isGood: (student.merited && student.merited.isGood) ? true : false
      }
    });
    rows.push([(i + 1), student.studentName, htmlMark, htmlBehaviour]);
  });
  data.addRows(rows);


  var table = new google.visualization.Table(document.getElementById('table_div'));
  table.draw(data, {showRowNumber: false, allowHtml: true});
  $('.google-visualization-table-th:contains("#")').css('width', "30px");
  $('.google-visualization-table-th:contains("Words")').css('width', "30px");
}
