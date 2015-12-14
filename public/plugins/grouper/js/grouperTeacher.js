var PLUGIN_NAME = 'GROUPER';

jq(document).ready(function() {
//jq(document).on('AppReady', function(e) {
  if (true) {
    //listener for messages from server to plugin
    jq(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
      var messageReceived = param.detail;

      switch (messageReceived.pluginMessageType)
      {
        //set all custom message type here
        case 'StudentJoin':
          break;
        case 'StudentChosen':
          break;
        case 'GetStudentsResponse':
          break;
        case 'StudentGrouping':
          processStudentGrouping(messageReceived.data);
          break;
        case 'StudentPingGroup':
          processStudentPingGroupForTeacher(messageReceived.data);
          break;
        case 'StudentUpdateStatus':
          processStudentUpdateStatus(messageReceived.data);
          break;
      }
    });


    jq("#manageClass").click(function() {
      clickManageGrouping();
    });
    //end teacher

//    document.pluginToServer(PLUGIN_NAME, 'TeacherOpen', {});
  }
});

function processStudentUpdateStatus(data) {
  var studentID = data.studentID;
  var active = data.active;
  if (active) {
    jq("#student" + studentID).css("background-color", "");
  } else {
    jq("#student" + studentID).css("background-color", "gray");
  }
}

function processGetStudentsResponse(data) {
  var studentsData = data.studentsData;
  var html = "<ul>";
  _.each(studentsData, function(student) {
    html = html + "<li>" + student.studentName + "</li>";
  });
  html = html + "</ul>";

  jq("#groupAll").html(html);
  jq("#number-of-students").html(_.size(studentsData));
}

function processStudentPingStudent(data) {
  var sourceStudent = data.studentName;

  var msg = document.Messenger().post({
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



function processStudentPingGroup(data) {
  console.log("Student Ping");
  var groupNumber = data.groupNumber;
  var originalColor;// = jq('#SURFACE').css('background');
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

  jq('#SURFACE').css('background', '#FF0000');
  setTimeout(function() {
    jq('#SURFACE').css('background', originalColor);
  }, 200);
}

function processStudentPingGroupForTeacher(data) {
  var groupNumber = data.groupNumber;

//  var originalColor = jq('#group' + (groupNumber + 1)).css('background');
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

  jq('#group' + (groupNumber + 1)).css('background', '#FF0000');
  setTimeout(function() {
    jq('#group' + (groupNumber + 1)).css('background', originalColor);
  }, 200);
}

function processStudentGrouping(data) {
  jq("#divName").html("<h1>" + document.student.name + "</h1>");

  var groups = data.groups;
  var numberOfGroups = data.numberOfGroups;
  var groupType = data.groupType;
  if (!document.students)
    document.students = {};

//  var previousGroup = parent.document.student.groupNumber;
//  parent.document.student.groupNumber = assignedGroup;
  document.students.grouping = groups;
  document.students.numberOfGroups = numberOfGroups;
  document.students.groupType = groupType;

  updateGroupMenu();

//  if (previousGroup != assignedGroup)
//  if(data.isNew)
//  {
//    parent.Messenger().post({
//      message: 'Group: ' + (assignedGroup + 1),
//      id: 'Group',
//      type: 'success',
//      hideAfter: 5,
//      showCloseButton: true
//    });
//  }

}


function updateGroupMenu() {
//  if (parent.document.student.groupNumber)
  var dataAll = '';
  var numberOfStudents = 0;
//  console.log(document.students.numberOfGroups);
  _.each(document.students.grouping, function(group, i) {
    if (group.length === 0)
      return;

    var dataGroup;
    if (document.students.numberOfGroups && document.students.numberOfGroups > 1) {
      dataGroup = '<a href="#" onclick="clickGroupList(' + (i) + ');"><h4 id="menuGroupNumber" class="group' + (i + 1) + '">Group ' + (i + 1) + '</h4></a>';
    } else {
      dataGroup = '<h4 id="menuGroupNumber" class="group' + (i + 1) + '"></h4>';
    }
    dataGroup += '<ul class="list group' + (i + 1) + '">';
    _.each(group, function(student) {
      numberOfStudents++;
      dataGroup += '<li id=\'student' + student.studentID +
          '\' style="background-color:' + ((student.active)? '""':'gray')
          + '"><a href="#" onclick="event.preventDefault();clickStudentList(\'' + student.studentID +
          '\');" class="name">' + student.studentName.trunc(15, true) + '<div class="score" id="score' + student.studentID +
          '" style="float:right;text-indent:0px">' + 0 + '</div><div id="scoreValue' + student.studentID +
          '" class="scoreValue" style="display:none"></div></a> </li>';
      console.log(student);
    });

    dataGroup += '</ul>';
    dataAll += dataGroup;
  });


  var element = jq("#regionGroupList");
  element.html(dataAll);

  if (document.studentsScoreData) {
    _.each(document.studentsScoreData, function(studentScoreData) {
      var strScore = getRepString(studentScoreData.studentScore);
      jq("#score" + studentScoreData.studentID).html(strScore);
    });
  }


  jq("#number-of-students").html(numberOfStudents);

  var options = {
    valueNames: ['name', 'scoreValue']
  };

  if (numberOfStudents > 0) {
    var list = new List('divList', options);
    list.sort('scoreValue', {order: "desc"});
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

function clickGroupList(groupNumber) {
//  var studentName = getStudentName(studentID);
  var message = {
    type: 'UrlUpdate',
    title: 'Group ' + (groupNumber + 1),
    resourceURL: '../../plugins/wallGroup/wallGroup.html?groupNumber=' + groupNumber};

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

function clickManageGrouping() {
//  var studentName = getStudentName(studentID);
  var message = {
    type: 'UrlUpdate',
    title: 'Manage',
    resourceURL: '../../plugins/grouper/grouperManage.html'};

  jq(document).trigger('DialogUrl', {detail: message});
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