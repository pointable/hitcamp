var PLUGIN_NAME = 'GROUPER';
jq(document).ready(function() {
//jq(document).on('AppReady', function(e) {
  //
//  parent.pluginToServer(PLUGIN_NAME, 'StudentOpen', {});
  //listener to receive custom plugin server messages 
  jq(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {

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


//  jq("#SURFACE").click(function() {
////    console.log("test");
//    document.pluginToServer(PLUGIN_NAME, 'StudentPingGroup', {});
//    document.changeUsername();
//
//  });

  if (!window.isPreview) {
    ifvisible.on("idle", function() {
      console.log(document.student.name + " idle");
      // Stop auto updating the live data
      pluginToServer("STUDENT", 'StudentUpdateStatus', {active: false});
    });

    ifvisible.on("wakeup", function() {
      console.log(document.student.name + " wakeup");
      // go back updating data
      pluginToServer("STUDENT", 'StudentUpdateStatus', {active: true});
    });
  }
});

function processStudentName(data) {
  var studentName = data.studentName;

  jq("#divName").html("<h1>" + studentName + "</h1>");
}

function processGetStudentsResponse(data) {
  var studentsData = data.studentsData;
  var html = "<ul>";
  _.each(studentsData, function(student) {
    html = html + "<li>" + student.studentName + "</li>";
  });
  html = html + "</ul>";

  jq("#groupAll").html(html);
}

function processStudentPingStudent(data) {
  var sourceStudent = data.studentName;

  var msg = Messenger().post({
    message: "Invitation from " + sourceStudent,
    actions: {
      retry: {
        label: 'Accept',
        phrase: 'Retrying TIME',
        auto: true,
        delay: 10,
        action: function() {
          document.pluginToServer(PLUGIN_NAME, 'StudentPingStudent', {studentID: data.studentID});
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


function processStudentGroupingForStudent(data) {
  jq("#divName").html("<h1>" + document.student.name + "</h1>");

  var groups = data.groups;
  var socketID = document.socketID;

//      console.log(socketID);

  var assignedGroup = 1;
  for (var i = 0; i < _.size(groups); i++) {
    _.each(groups[i], function(student) {
      if (student.studentID === socketID) {
        assignedGroup = i;
      }
    });
  }

  if (!document.student)
    document.student = {};
  if (!document.students)
    document.students = {};

  var previousGroup = document.student.groupNumber;
  document.student.groupNumber = assignedGroup;
  document.students.grouping = groups;
  document.students.numberOfGroups = data.numberOfGroups;
  document.students.groupType = data.groupType;

  updateGroupMenu(previousGroup, assignedGroup);

//  if (previousGroup != assignedGroup)
  if (data.isNew)
  {
    Messenger().post({
      message: 'Group: ' + (assignedGroup + 1),
      id: 'Group',
      type: 'success',
      hideAfter: 5,
      showCloseButton: true
    });
  }
}

function processStudentPingGroup(data) {
  Messenger().post({
    message: 'Ping from Group ' + (data.groupNumber + 1),
    id: 'GroupPing',
    type: 'success',
    hideAfter: 5,
    showCloseButton: true
  });
}


function updateGroupMenu(previousGroup, assignedGroup) {
  jq("#menuGroupNumber").html("Group " + (assignedGroup + 1));

  var group = document.students.grouping[assignedGroup];
  var element = jq("#regionGroupList");
  var dataInsert = '<ul class="list">';
  _.each(group, function(student) {
    if (student.studentID != document.socketID) {
      dataInsert += '<li><a href="#" onclick="event.preventDefault();clickStudentList(\'' + student.studentID +
          '\');" class="name">' + student.studentName.trunc(20, true) + '<div class="score" id="score' + student.studentID +
          '" style="float:right;text-indent:0px">' + 0 + '</div><div id="scoreValue' + student.studentID +
          '" class="scoreValue" style="display:none"></div></a> </li>';
    } else {
      dataInsert += '<li><a href="#" onclick="event.preventDefault();clickStudentList(\'' + student.studentID +
          '\');" class="name"   style="color:yellow">' +
          student.studentName.trunc(15, true) + '<div class="score" id="score' + student.studentID +
          '" style="float:right;text-indent:0px">' + 0 + '</div><div id="scoreValue' + student.studentID +
          '" class="scoreValue" style="display:none"></div></a> </li>';

    }
  });

  dataInsert += '</ul>';
  element.html(dataInsert);

  if (document.studentsScoreData) {
    _.each(document.studentsScoreData, function(studentScoreData) {
      var strScore = getRepString(studentScoreData.studentScore);
      jq("#scoreValue" + studentScoreData.studentID).html(studentScoreData.studentScore);
      jq("#score" + studentScoreData.studentID).html(strScore);
    });
  }

  var options = {
    valueNames: ['name', 'scoreValue']
  };
  var list = new List('divList', options);
  list.sort('scoreValue', {order: "desc"});

  if (previousGroup != assignedGroup) {
    jq("#toolbar").removeClass("group" + (previousGroup + 1)).addClass("group" + (assignedGroup + 1));
  }
}

function clickStudentList(studentID) {
  var studentName = getStudentName(studentID);
  var message = {
    type: 'UrlUpdate',
    title: studentName,
    resourceURL: '../../plugins/wallStudent/wallStudent.html?studentID='
        + studentID + '&studentName=' + studentName};

  jq(document).trigger('DialogUrl', {detail: message});
}

function getStudentName(studentID) {

  var students = _.flatten(document.students.grouping);

  var studentName;
  _.each(students, function(student) {
    if (student.studentID === studentID) {
      studentName = student.studentName;
    }
  });

  return studentName;
}

function getRepString(rep) {
  rep = rep + ''; // coerce to string
  if (rep < 1000) {
    return rep; // return the same number
  }
  if (rep < 10000) { // place a comma between
    return rep.charAt(0) + ',' + rep.substring(1);
  }
  // divide and format
  return (rep / 1000).toFixed(rep % 1000 != 0) + 'k';
}

String.prototype.trunc = String.prototype.trunc ||
    function(n) {
      return this.length > n ? this.substr(0, n - 1) + '&hellip;' : this;
    };