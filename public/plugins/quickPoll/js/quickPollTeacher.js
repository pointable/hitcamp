var PLUGIN_NAME = 'QUICKPOLL';
var PLUGIN_TITLE = 'Poll';

var isActive = false;

var selectedStudentID;

var chart;
var pollDatas;
var pollType;
var numberOfChoices;
google.load("visualization", "1", {packages: ["corechart"]});
//Load google then load jquery,google does not work in jquery ready
google.setOnLoadCallback(function() {
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
        if (!parent) {
          return;
        }

        var messageReceived = param.detail;

        switch (messageReceived.pluginMessageType)
        {
          //set all custom message type here
          case 'StudentJoin':
            break;
          case 'UpdatePoll':
            updatePoll(messageReceived.data);
            break;

        }
      });


      //var poll_template = $("script#poll_template").html();

    }

    $(document).on('click', 'button[id^="buttonLaunch"]', function(event) {
//      var buttonTrigger = $(event.target);
//      console.log(buttonTrigger.text());

      if (!isActive)
      {

        initializeMap(getPollType());
        var pollType = getPollType();
        var dataToSend = {
          numberOfChoices: numberOfChoices,
          pollType: pollType
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
      initializeMap(getPollType());
//      var num = getNumberOfChoices();
      var pollType = getPollType();
      dataToSend = {
        numberOfChoices: numberOfChoices,
        pollType: pollType
      };
      parent.pluginToServer(PLUGIN_NAME, 'ResetActivity', dataToSend);

    });

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

function drawBarChart() {
  var data = google.visualization.arrayToDataTable(pollDatas);
  var options = {
    vAxis: {titleTextStyle: {color: 'black'}},
    legend: {position: 'none'},
    chartArea: {'left': '40'},
    hAxis: {maxValue: 20}
  };
  chart = new google.visualization.BarChart(document.getElementById('pollchart'));
  chart.draw(data, options);
}

function nextChar(c) {
  return String.fromCharCode(c.charCodeAt(0) + 1);
}

function updatePoll(data) {
  setGraphData(data.pollDatas);
  drawBarChart();
}

function setGraphData(data) {
  pollDatas = data;
}

function getNumberOfChoices() {
  var num = $(".js-number-choices").val();
  return num;
}

function getPollType() {
  var selectedVal = "";
  var selected = $(".js-poll-type .radio input[type='radio']:checked");
  if (selected.length > 0) {
    selectedVal = selected.val();
  }
  return selectedVal;
}
function initializeMap(pollType) {

  var colorMap = [
    '#00CC00',
    '#CBCC00',
    '#00CBCC',
    '#0065CC',
    '#0000CC',
    '#6600CC',
    '#CC00CB',
    '#CC0065',
    '#CC0000',
    '#CC6600'
  ];
  switch (pollType) {
    case "mc":
      numberOfChoices = getNumberOfChoices();
      var alpha = 'A';
      pollDatas = [['choice', 'number of students', {role: "style"}]];
      for (var i = 0; i < numberOfChoices; i++) {
        //Initialize the poll Data
        pollDatas.push([alpha, 0, colorMap[i]]);
        alpha = nextChar(alpha);
      }
      break;
    case "yn":
      pollDatas = [['choice', 'number of students', {role: "style"}]];
      pollDatas.push(["Yes", 0, '#00CC00'], ["No", 0, '#CC0000']);
      break;
    case "tf":
      pollDatas = [['choice', 'number of students', {role: "style"}]];
      pollDatas.push(["True", 0, '#00CC00'], ["False", 0, '#CC0000']);
      break;
    case "ld":
      pollDatas = [['choice', 'number of students', {role: "style"}]];
      pollDatas.push(["Like", 0, '#00CC00'], ["Dislike", 0, '#CC0000']);
      break;
  }

  drawBarChart();
}