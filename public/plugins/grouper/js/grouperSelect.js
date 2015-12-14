var PLUGIN_NAME = 'GROUPER';

$(document).ready(function() {
  hideGroups();
  $(function() {
      FastClick.attach(document.body);
  });    
    parent.pluginToServer(PLUGIN_NAME, 'StudentOpen', {});
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
          processStudentGrouping(messageReceived.data);
          break;
        case 'StudentPingGroup':
          processStudentPingGroupForTeacher(messageReceived.data);
          break;
      }
    });
        
    
    $("#group1").click(function() {
      if (parent.document.student.groupNumber != 0)
        parent.pluginToServer(PLUGIN_NAME, 'StudentSelectGroup', {groupNumber: 0});
    });
    $("#group2").click(function() {
      if (parent.document.student.groupNumber != 1)
        parent.pluginToServer(PLUGIN_NAME, 'StudentSelectGroup', {groupNumber: 1});
    });
    $("#group3").click(function() {
      if (parent.document.student.groupNumber != 2)
        parent.pluginToServer(PLUGIN_NAME, 'StudentSelectGroup', {groupNumber: 2});
    });
    $("#group4").click(function() {
      if (parent.document.student.groupNumber != 3)
        parent.pluginToServer(PLUGIN_NAME, 'StudentSelectGroup', {groupNumber: 3});
    });
    
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
//    html = html + '<li> <h4 style="color: #FFFFFF;">Group ' + (i+1) + "</h4></li>";
    _.each(groups[i], function(student) {
      if (parent && parent.document && student.studentID === parent.document.socketID){
        html = html + '<li><h5 style="color:yellow">' + student.studentName + "</h5></li>";
      } else {        
        html = html + "<li><h5>" + student.studentName + "</h5></li>";
      }
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


function hideGroups(){
  var numberOfGroups = parent.document.students.numberOfGroups;
  console.log(numberOfGroups);
  
  switch (numberOfGroups)
  {//waterfall
    case 1:
      $('#group2').hide();
    case 2:
      $('#group3').hide();
    case 3:
      $('#group4').hide();
    case 4:
  }
  
  if (numberOfGroups >2){
    $('div').css ("height" ,"50%");
  }else {
    $('div').css ("height" ," 100%");
    
  }
}