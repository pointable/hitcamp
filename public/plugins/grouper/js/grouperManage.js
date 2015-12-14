var PLUGIN_NAME = 'GROUPER';

$(document).ready(function() {
  $(function() {
      FastClick.attach(document.body);
  });
  if (parent.isTeacher) {
    var numberOfGroups = parent.document.students.numberOfGroups;
    var groupType = parent.document.students.groupType;
//    console.log(numberOfGroups);
    $("#button" + numberOfGroups).parent().addClass("active"); 
    if (groupType=== "select")
    {
      $("#buttonSelectionStudent").parent().addClass("active");
    }else {      
      $("#buttonSelectionRandom").parent().addClass("active");
    }
    
    parent.pluginToServer(PLUGIN_NAME, 'TeacherOpen', {});
    //listener for messages from server to plugin
    $(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
      if (!parent){
        return;
      }
      var messageReceived = param.detail;

      switch (messageReceived.pluginMessageType)
      {
        //set all custom message type here
        case 'StudentJoin':
          break;
        case 'StudentChosen':
//          studentChosen(messageReceived.data);
          break;
        case 'GetStudentsResponse':
//          processGetStudentsResponse(messageReceived.data);
          break;
        case 'StudentGrouping':
//          processStudentGrouping(messageReceived.data);
//          console.log('process students');
          processStudentGrouping(messageReceived.data);
          break;
        case 'StudentPingGroup':
          processStudentPingGroupForTeacher(messageReceived.data);
          break;
      }
    });
    
    $(document).on('change', 'input:radio[id^="button1"]', function (event) {
      checkEndGroup();
    });
    $(document).on('change', 'input:radio[id^="button2"]', function (event) {
      checkEndGroup();
    });
    $(document).on('change', 'input:radio[id^="button3"]', function (event) {
      checkEndGroup();
    });
    $(document).on('change', 'input:radio[id^="button4"]', function (event) {
      checkEndGroup();
    });
    $(document).on('change', 'input:radio[id^="buttonSelectionRandom"]', function (event) {
      checkEndGroup();
    });
    $(document).on('change', 'input:radio[id^="buttonSelectionStudent"]', function (event) {
      checkEndGroup();
    });
    
    function checkEndGroup(){
      var buttonTrigger = $("#buttonTriggerGrouping");
      if (buttonTrigger.html() === "End Grouping"){
        
//        if (groupType === "select"){
          buttonTrigger.html('Start Grouping');
          buttonTrigger.removeClass('btn-danger');
          buttonTrigger.addClass('btn-success');
//        }
        
        parent.pluginToServer(PLUGIN_NAME, 'EndGroupSelection', {});
      }
    }
    
    $(document).on('click', 'button[id^="buttonTriggerGrouping"]', function (event) {
//      var selector = $("#radioSelection > .active");
      var buttonTrigger = $("#buttonTriggerGrouping");
      
      var groupType =  $("#radioSelection .active").data("value");
      var numberOfGroups = $("#radioNumberOfGroups .active").data("value");
        
      if (buttonTrigger.html() === "Start Grouping")
      {
        parent.pluginToServer(PLUGIN_NAME, 'StartGroup', {
          numberOfGroups: numberOfGroups, 
          groupType: groupType
        });

        if (groupType === "select" && numberOfGroups > 1){
          buttonTrigger.html('End Grouping');
          buttonTrigger.removeClass('btn-success');
          buttonTrigger.addClass('btn-danger');
        }
      }else {
        parent.pluginToServer(PLUGIN_NAME, 'EndGroupSelection', {});
        
        if (groupType === "select"){
          buttonTrigger.html('Start Grouping');
          buttonTrigger.removeClass('btn-danger');
          buttonTrigger.addClass('btn-success');
        }
      }
    });
    
    $(document).on('click', 'button[id^="buttonTriggerDraw"]', function (event) {
      parent.pluginToServer('PLUGIN_HANDLER', 'TriggerPlugin', {pluginName: 'AIRWEB'});
    });
    $(document).on('click', 'button[id^="buttonTriggerRandomizer"]', function (event) {
      parent.pluginToServer('PLUGIN_HANDLER', 'TriggerPlugin', {pluginName: 'RANDOMIZER'});
      parent.pluginToServer('RANDOMIZER', 'StartRandom', {});
    });
    $(document).on('click', 'button[id^="buttonTriggerWheelWord"]', function (event) {
      parent.pluginToServer('PLUGIN_HANDLER', 'TriggerPlugin', {pluginName: 'WHEEL_WORD'});
    });
    
    $("#group1").click(function() {
      //    console.log("test");
      parent.pluginToServer(PLUGIN_NAME, 'TeacherPingGroup', {groupNumber: 0});
    });
    $("#group2").click(function() {
      //    console.log("test");
      parent.pluginToServer(PLUGIN_NAME, 'TeacherPingGroup', {groupNumber: 1});
    });
    $("#group3").click(function() {
      //    console.log("test");
      parent.pluginToServer(PLUGIN_NAME, 'TeacherPingGroup', {groupNumber: 2});
    });
    $("#group4").click(function() {
      //    console.log("test");
      parent.pluginToServer(PLUGIN_NAME, 'TeacherPingGroup', {groupNumber: 3});
    });
    
    $('#button1').on('show.bs.modal', function (e) {
      if (!data) return e.preventDefault() // stops modal from being shown
    });
    //end teacher
  }
});

function processStudentName(data) {
  var studentName = data.studentName;

  $("#divName").html("<h1>" + studentName + "</h1>");
}

function processGetStudentsResponse(data) {
  var studentsData = data.studentsData;
  var html = "<ul>";
  _.each(studentsData, function(student) {
    html = html + "<li>" + student.studentName + "</li>";
  });
  html = html + "</ul>";

  $("#groupAll").html(html);
}

function processStudentPingStudent(data) {
  var sourceStudent = data.studentName;

  var msg = parent.Messenger().post({
    message: "Invitation from " + sourceStudent,
    actions: {
      retry: {
        label: 'Accept',
        phrase: 'Retrying TIME',
        auto: true,
        delay: 10,
        action: function() {
          parent.pluginToServer(PLUGIN_NAME, 'StudentPingStudent', {studentID: data.studentID});
        }
      },
      cancel: {
        label: 'Decline',
        action: function() {
          return msg.cancel();
        }
      }
    }
  });
}

function processStudentGrouping(data) {
  var groups = data.groups;

  $("#group1").html(" ");
  $("#group2").html(" ");
  $("#group3").html(" ");
  $("#group4").html(" ");

  for (var i = 0; i < data.numberOfGroups; i++) {
    var html = '<ul style="list-style: none; padding: 3px;">';
    html = html + '<li> <h4 style="color: #FFFFFF;">Group ' + (i+1) + "</h4></li>";
    _.each(groups[i], function(student) {
      html = html + "<li><h5>" + student.studentName + "</h5></li>";
    });
    html = html + "</ul>";

    $("#group" + (i + 1)).html(html);
  }
}


function processStudentPingGroup(data) {
  var groupNumber = data.groupNumber;
  var originalColor;// = $('#SURFACE').css('background');
  switch (groupNumber) {
    case 0:
      originalColor = '#324942';
      break;
    case 1:
      originalColor = '#493c32';
      break;
    case 2:
      originalColor = '#494732';
      break;
    case 3:
      originalColor = '#463249';
      break;
  }

  $('#SURFACE').css('background', '#FF0000');
  setTimeout(function() {
    $('#SURFACE').css('background', originalColor);
  }, 200);
}

function processStudentPingGroupForTeacher(data) {
  var groupNumber = data.groupNumber;

//  var originalColor = $('#group' + (groupNumber + 1)).css('background');
  switch (groupNumber) {
    case 0:
      originalColor = '#324942';
      break;
    case 1:
      originalColor = '#493c32';
      break;
    case 2:
      originalColor = '#494732';
      break;
    case 3:
      originalColor = '#463249';
      break;
  }

  $('#group' + (groupNumber + 1)).css('background', '#FF0000');
  setTimeout(function() {
    $('#group' + (groupNumber + 1)).css('background', originalColor);
  }, 200);
}


function getStudentName(studentID){
  
  var students = _.flatten(parent.document.students.grouping);
  
  var studentName;
  _.each(students, function (student){
    if (student.studentID === studentID){
      studentName = student.studentName;
    }
  });
  
 return studentName;
}


