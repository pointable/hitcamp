var PLUGIN_NAME = 'STUDENTWALL';
var selectedStudentID;

$(document).ready(function() {
  
  var parameters = getUrlVars();
  selectedStudentID = parameters.studentID;
  
  var studentName = parameters.studentName;//decodeURIComponent(parameters.studentName);  
//  $("#divName").html("<h2>" + studentName + "</h2>");
    
  if (parent.isTeacher) {
    parent.pluginToServer(PLUGIN_NAME, 'TeacherOpen', {});
    //listener for messages from server to plugin
    $(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
//    parent.$(document).on('ServerToPlugin' + PLUGIN_NAME, function(e) {
      if (!parent){
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
    //end teacher
  } else {//student
    //
    parent.pluginToServer(PLUGIN_NAME, 'StudentOpen', {});
    //listener to receive custom plugin server messages 
    $(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
//    parent.$(document).on('ServerToPlugin' + PLUGIN_NAME, function(e) {
      if (!parent){
        return;
      }
      var messageReceived = param.detail;

      switch (messageReceived.pluginMessageType)
      {
        //set all custom message type here
        case 'StudentBlink':
          studentBlink();
          break;
        case 'StudentChosen':
          studentChosen(messageReceived.data);
          break;
        case 'StudentName':
          processStudentName(messageReceived.data);
          break;
        case 'StudentGrouping':
          processStudentGroupingForStudent(messageReceived.data);
          break;
        case 'StudentPingGroup':
          processStudentPingGroup(messageReceived.data);
          break;
        case 'StudentPingStudent':
          processStudentPingStudent(messageReceived.data);
          break;
      }
    });


    $("#buttonStar").click(function() {
      parent.pluginToServer(PLUGIN_NAME, 'LikeStudent', {studentID: selectedStudentID});

    });
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

  for (var i = 0; i < _.size(groups); i++) {
    var html = "<ul>";
    _.each(groups[i], function(student) {
      html = html + "<li>" + student.studentName + "</li>";
    });
    html = html + "</ul>";

    $("#group" + (i + 1)).html(html);
  }
}


function processStudentGroupingForStudent(data) {
  $("#divName").html("<h1>" + parent.document.student.name + "</h1>");

  var groups = data.groups;
  var socketID = parent.document.socketID;

//      console.log(socketID);

  var assignedGroup = 0;
  for (var i = 0; i < _.size(groups); i++) {
    _.each(groups[i], function(student) {
      if (student.studentID === socketID) {
        assignedGroup = i;
      }
    });
  }

  if (!parent.document.student)
    parent.document.student = {};
  if (!parent.document.students)
    parent.document.students = {};

  var previousGroup = parent.document.student.groupNumber;
  parent.document.student.groupNumber = assignedGroup;
  parent.document.students.grouping = groups;

  updateGroupMenu();

  var color = 'black';
  switch (assignedGroup) {
    case 0:
      color = 'skyblue';
      break;
    case 1:
      color = 'LightGoldenRodYellow';
      break;
    case 2:
      color = 'lightgreen';
      break;
    case 3:
      color = 'pink';
      break;
  }
  $('#SURFACE').css('background', color);

  if (previousGroup != assignedGroup)
  {
    parent.Messenger().post({
      message: 'Group: ' + (assignedGroup + 1),
      id: 'Group',
      type: 'success',
      hideAfter: 5,
      showCloseButton: true
    });
  }

}

function processStudentPingGroup(data) {
  console.log("Student Ping");
  var groupNumber = data.groupNumber;
  var originalColor;// = $('#SURFACE').css('background');
  switch (groupNumber) {
    case 0:
      originalColor = 'skyblue';
      break;
    case 1:
      originalColor = 'LightGoldenRodYellow';
      break;
    case 2:
      originalColor = 'lightgreen';
      break;
    case 3:
      originalColor = 'pink';
      break;
  }

  $('#SURFACE').css('background', '#FF0000');
  setTimeout(function() {
    $('#SURFACE').css('background', originalColor);
  }, 200);
}


function updateGroupMenu() {
//  if (parent.document.student.groupNumber)
  parent.$("#menuGroupNumber").html("Group " + (parent.document.student.groupNumber + 1));

  var group = parent.document.students.grouping[parent.document.student.groupNumber];
  var element = parent.$("#regionGroupList");
  var dataInsert = '<ul>';
  _.each(group, function(student) {
    if (student.studentID != parent.document.socketID) {
      dataInsert += '<li><a href="#" onclick="clickStudentList(\'' + student.studentID + '\');">' + student.studentName + '</a></li>';
    }
  });

  dataInsert += '</ul>';
  element.html(dataInsert);
}

function clickStudentList(studentID) {
  var message = {type: 'UrlUpdate', resourceURL: '../../plugins/grouper/grouper.html'};
  
  parent.jq(parent.document).trigger('DialogUrl', {detail: message});
}

function getUrlVars() {
  var vars = {};
  var frameURL =decodeURIComponent( document.location.href);
//  console.log(frameURL);
  
  var parts = frameURL.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
  });
  return vars;
}
