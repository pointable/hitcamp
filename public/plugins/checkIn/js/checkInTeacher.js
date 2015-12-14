var PLUGIN_NAME = 'CHECK_IN';
var PLUGIN_TITLE = 'Check In';
var isActive = false;

var selectedStudentID;
var appLaunched = false;

google.load('visualization', '1', {packages: ['table']});

//google.setOnLoadCallback(function() {
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

    $(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
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

  $(document).on('click', 'button[id^="buttonLaunch"]', function(event) {
    var isLaunched = false;
    if (!isActive)
    {
      parent.pluginToServer(PLUGIN_NAME, 'StartActivity', {});
      isLaunched = true;
    } else {
      parent.pluginToServer(PLUGIN_NAME, 'EndActivity', {});
      isLaunched = false;
    }
    updateButtonStatus(isLaunched);

  });

  $(document).on('click', 'button[id^="buttonReset"]', function(event) {
    parent.pluginToServer(PLUGIN_NAME, 'ResetActivity', {});
  });
});
//});
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
  data.addColumn('string', 'Student');
  data.addColumn('number', 'Level');
  var rows = [];
  _.each(students, function(student, i) {
    rows.push([generateColor(student.studentName, student.selection), student.selection]);
  });
  data.addRows(rows);

  var table = new google.visualization.Table(document.getElementById('table_div'));
  table.draw(data, {showRowNumber: false, allowHtml: true, sortColumn: 1});
//  $('.google-visualization-table-th:contains("#")').css('width', "30px");
//  $('.google-visualization-table-th:contains("Words")').css('width', "30px");
}

function generateColor(data, selection) {
  return '<div class="level' + selection + '">' + data + '</div>';
}