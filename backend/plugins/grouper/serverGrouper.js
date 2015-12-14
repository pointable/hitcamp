'use strict';

var _ = require('underscore');
var PLUGIN_API = require('../../pluginAPI');
var PLUGIN_NAME = 'GROUPER';


function App(idSession, plugins) {
  this.idSession = idSession;
  var numberOfGroups = 1;
  var groupType = 'random';
  var groupSelectionInProgress = false;
//  var grouping = [];
//  grouping[0] = [];
//  this.isGrouped = false;

  this.pluginStudentMessageListener = function(socket, pluginMessageType, data) {
    switch (pluginMessageType) {
      case 'StudentJoin':
        studentJoin(socket, data);
        break;
      case 'StudentOpen':
        studentOpenApp(socket, data)
        break;
      case 'StudentDisconnect':
        studentDisconnect(socket, data);
        break;
      case 'StudentPingGroup':
        studentPingGroup(socket, data)
        break;
      case 'StudentPingStudent':
        studentPingStudent(socket, data)
        break;
      case 'StudentSelectGroup':
        studentSelectGroup(socket, data);
        break;
      default:
    }
  };
  this.pluginTeacherMessageListener = function(socket, pluginMessageType, data) {
    switch (pluginMessageType) {
      case 'TeacherJoin':
        getStudents(socket, data);
        break;
      case 'TeacherOpen':
        getStudents(socket, data);
        break;
      case 'TriggerPlugin':
        triggerPlugin(socket);
        break;
      case 'StartGroup':
        startGroup(socket, data);
        break;
      case 'EndGroupSelection':
        endGroupSelection(socket, data);
        break;
      case 'GetStudents':
        getStudents(socket, data);
        break;
      case 'TeacherPingGroup':
        teacherPingGroup(socket, data)
        break;
      default:
    }
  };
  this.getGroupingMessage = function(idSession, socket) {
    var dataToSend = {
      groups: GetGroupingData(idSession, socket),
      numberOfGroups: numberOfGroups,
      groupType: groupType
    };

    return dataToSend;
  }

//  function triggerPlugin(socket, data) {
//    var dataToSend = {};
//    console.log("trigger");
//    PLUGIN_API.SendToOthers(socket, idSession, PLUGIN_NAME,
//            'triggerPlugin', dataToSend);
//  }

  function endGroupSelection(socket, data) {
    if (groupSelectionInProgress) {
      groupSelectionInProgress = false;

      rebalanceGroups(socket);
      var dataToSend = {
        groups: GetGroupingData(idSession, socket),
        numberOfGroups: numberOfGroups,
        groupType: groupType,
        isNew: true
      };

      PLUGIN_API.SendToAll(socket, idSession, PLUGIN_NAME,
          'StudentGrouping', dataToSend);

      //delay before close
//      setTimeout(function (){        
      plugins["PLUGIN_HANDLER"].closePlugin(socket, {pluginName: "GROUPER_SELECT"});
//      }, 2000);

    }
  }

  function startGroup(socket, data) {
    if (data.groupType === "random" || data.numberOfGroups === 1) {
      startGroupRandom(socket, data);
    } else {
      startGroupSelect(socket, data);
    }
  }

  function startGroupSelect(socket, data) {
    var previousNumberOfGroups = numberOfGroups;
    numberOfGroups = data.numberOfGroups;
    if (previousNumberOfGroups != numberOfGroups)
    {
      startGroupRandom(socket, data);
    }

    groupType = "select";
    groupSelectionInProgress = true;

    plugins["PLUGIN_HANDLER"].triggerPlugin(socket, {pluginName: "GROUPER_SELECT"});
  }

  function studentSelectGroup(socket, data) {
    if (groupType != "select" || !groupSelectionInProgress) {
      return;
    }

    var selectedGroup = data.groupNumber;
    var previousGroup = socket.customGroup;

    if (selectedGroup === previousGroup || selectedGroup >= numberOfGroups) {
      return;
    }

//    chosenStudentSocket.leave(idSession + 'StudentsGroup' + previousGroup);
//    chosenStudentSocket.join(idSession + 'StudentsGroup' + selectedGroup);
//    //assign group to student socket
//    chosenStudentSocket.customGroup = selectedGroup;
//    
    var userSockets = PLUGIN_API.GetUserSockets(socket);
    _.each(userSockets, function(userSocket) {
      userSocket.leave(idSession + 'StudentsGroup' + previousGroup);
      userSocket.join(idSession + 'StudentsGroup' + selectedGroup);
      userSocket.customGroup = selectedGroup;
    });

    var dataToSend = {
      groups: GetGroupingData(idSession, socket),
      numberOfGroups: numberOfGroups,
      groupType: groupType
    };

    PLUGIN_API.SendToAll(socket, idSession, PLUGIN_NAME,
        'StudentGrouping', dataToSend);
  }

  function startGroupRandom(socket, data) {
    groupType = "random";
    groupSelectionInProgress = false;
    numberOfGroups = data.numberOfGroups;

    var studentsSockets = PLUGIN_API.GetSocketGroup(socket, idSession + 'Students');
//    studentsSockets = _.uniq(studentsSockets, function (s){ return s.customID; });
//    studentsSockets = _.where(studentsSockets, {customIsTeacher: false});
    var number = _.size(studentsSockets);

    var studentsData = [];
    _.each(studentsSockets, function(studentSocket) {
      studentsData.push({
        studentID: studentSocket.customID,
        studentName: studentSocket.customName,
        socketID: studentSocket.id
      });
    });

    var groups = [];
    for (var i = 0; i < numberOfGroups; i++) {
      groups[i] = [];
    }

    var remainingStudentsData = studentsData;

    for (var i = 0; i < number; i++) {
      var randomStudent = _.sample(remainingStudentsData);
      remainingStudentsData = _.without(remainingStudentsData, randomStudent);

      var assignedGroup = i % (numberOfGroups);

      var chosenStudentSocket = socket.server.sockets.connected[randomStudent.socketID];
      var previousGroup = chosenStudentSocket.customGroup;
//      chosenStudentSocket.leave(idSession + 'StudentsGroup' + previousGroup);
//      chosenStudentSocket.join(idSession + 'StudentsGroup' + assignedGroup);
//      chosenStudentSocket.customGroup = assignedGroup;

      var userSockets = PLUGIN_API.GetUserSockets(chosenStudentSocket);
      _.each(userSockets, function(userSocket) {
        userSocket.leave(idSession + 'StudentsGroup' + previousGroup);
        userSocket.join(idSession + 'StudentsGroup' + assignedGroup);
        userSocket.customGroup = assignedGroup;

      });

      groups[assignedGroup].push(randomStudent);
    }

//    grouping = groups;

//    console.log(groups);

    var dataToSend = {
      isNew: true,
      groups: groups,
      numberOfGroups: numberOfGroups,
      groupType: groupType
    };
    PLUGIN_API.SendToAll(socket, idSession, PLUGIN_NAME,
        'StudentGrouping', dataToSend);
  }

  function getStudents(socket, data) {

    var dataToSend = {
      groups: GetGroupingData(idSession, socket),
      numberOfGroups: numberOfGroups,
      groupType: groupType
    };
    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'StudentGrouping', dataToSend);
  }

  function studentDisconnect(socket, data) {
    var groups = GetGroupingData(idSession, socket, socket);
    var dataToSend = {
      groups: groups,
      numberOfGroups: numberOfGroups,
      groupType: groupType
    };
    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME,
        'StudentGrouping', dataToSend);
  }

  //update teachers
  function studentJoin(socket, data) {
    if (!socket)
      return;

    var userSockets = PLUGIN_API.GetUserSockets(socket);


    if (_.size(userSockets) > 1) {
      //connected before      
      var currentGroup = userSockets[0].customGroup;
      socket.join(idSession + 'StudentsGroup' + currentGroup);

      var dataToSend = {
        groups: GetGroupingData(idSession, socket),
        numberOfGroups: numberOfGroups,
        groupType: groupType
      };
      PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
          'StudentGrouping', dataToSend);
      return;
    }
//    var groups = [];
    var smallestGroup = PLUGIN_API.GetSocketGroup(socket, idSession + 'StudentsGroup' + 0);

//    smallestGroup = _.uniq(smallestGroup, function (s){ return s.customID; });
    var smallestGroupNumber = 0;
    for (var i = 1; i < numberOfGroups; i++)
    {
      var currentGroupSockets = PLUGIN_API.GetSocketGroup(socket, idSession + 'StudentsGroup' + i);
//      currentGroupSockets = _.uniq(currentGroupSockets, function (s){ return s.customID; });

      if (_.size(currentGroupSockets) < _.size(smallestGroup)) {
        smallestGroup = currentGroupSockets;
        smallestGroupNumber = i;
      }
//      groups[i] = currentGroupSockets;
    }
    var assignedGroupNumber = smallestGroupNumber;
    var previousGroup = socket.customGroup;

    var userSockets = PLUGIN_API.GetUserSockets(socket);

    _.each(userSockets, function(userSocket) {
      userSocket.leave(idSession + 'StudentsGroup' + previousGroup);
      userSocket.join(idSession + 'StudentsGroup' + assignedGroupNumber);

//      console.log(userSocket);
      userSocket.customGroup = assignedGroupNumber;
    });
//    socket.leave(idSession + 'StudentsGroup' + socket.customGroup);
//    socket.join(idSession + 'StudentsGroup' + assignedGroupNumber);
//    socket.customGroup = assignedGroupNumber;


    var dataToSend = {
      groups: GetGroupingData(idSession, socket),
      numberOfGroups: numberOfGroups,
      groupType: groupType
    };
    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'StudentGrouping', dataToSend);
    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME,
        'StudentGrouping', dataToSend);
    PLUGIN_API.SendToOtherStudents(socket, idSession, PLUGIN_NAME,
        'StudentGrouping', dataToSend);
  }

  function rebalanceGroups(socket) {
    //loop until difference biggest and smallest one
    //  biggest group pluck one to smallest group

    //find biggest
    //find smallest
    do {
      var smallestGroup = PLUGIN_API.GetSocketGroup(socket, idSession + 'StudentsGroup' + 0);
      var smallestGroupNumber = 0;

      var biggestGroup = PLUGIN_API.GetSocketGroup(socket, idSession + 'StudentsGroup' + 0);
      var biggestGroupNumber = 0;

      for (var i = 1; i < numberOfGroups; i++)
      {
        var currentGroupSockets = PLUGIN_API.GetSocketGroup(socket, idSession + 'StudentsGroup' + i);
        if (_.size(currentGroupSockets) < _.size(smallestGroup)) {
          smallestGroup = currentGroupSockets;
          smallestGroupNumber = i;
        }
        if (_.size(currentGroupSockets) > _.size(biggestGroup)) {
          biggestGroup = currentGroupSockets;
          biggestGroupNumber = i;
        }
      }

      if (_.size(biggestGroup) > (_.size(smallestGroup) + 1)) {
        var assignedGroupNumber = smallestGroupNumber;
        var chosenSocket = _.last(biggestGroup);

//        chosenSocket.leave(idSession + 'StudentsGroup' + chosenSocket.customGroup);
//        chosenSocket.join(idSession + 'StudentsGroup' + assignedGroupNumber);
//        chosenSocket.customGroup = assignedGroupNumber;
        var previousGroup = chosenSocket.customGroup;
        var userSockets = PLUGIN_API.GetUserSockets(chosenSocket);
        _.each(userSockets, function(userSocket) {
          userSocket.leave(idSession + 'StudentsGroup' + previousGroup);
          userSocket.join(idSession + 'StudentsGroup' + assignedGroupNumber);
          userSocket.customGroup = assignedGroupNumber;
        });
      } else {
        break;
      }
    } while (true);


  }

  function studentOpenApp(socket, data) {
    if (!socket)
      return;

//    var dataToSend = {studentName:socket.customName};
//    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME, 'StudentName', dataToSend);

//    if (grouping){
    var dataToSend = {
      groups: GetGroupingData(idSession, socket),
      numberOfGroups: numberOfGroups,
      groupType: groupType
    };
    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'StudentGrouping', dataToSend);
//    }
  }

  function studentPingStudent(socket, data) {
    if (!socket)
      return;

    var targetStudentID = data.studentID;

    var dataToSend = {studentID: socket.customID, studentName: socket.customName};
    PLUGIN_API.SendToSocketID(socket, idSession, PLUGIN_NAME,
        'StudentPingStudent', dataToSend, targetStudentID);

//    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME, 'StudentPingGroup', dataToSend);

  }

  function studentPingGroup(socket, data) {
    if (!socket)
      return;

    var dataToSend = {groupNumber: socket.customGroup};
    PLUGIN_API.SendToAllStudentsInSameGroup(socket, idSession, PLUGIN_NAME, 'StudentPingGroup', dataToSend);

    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME, 'StudentPingGroup', dataToSend);
  }

  function teacherPingGroup(socket, data) {
    if (!socket)
      return;

    var groupNumber = data.groupNumber;

    var dataToSend = {groupNumber: groupNumber};
    PLUGIN_API.SendToAllStudentsInGroup(socket, idSession, PLUGIN_NAME, 'StudentPingGroup', dataToSend, groupNumber);

    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME, 'StudentPingGroup', dataToSend);
  }
}
;

function GetGroupingData(idSession, socket, exceptSocket) {
  var groups = [];
  for (var i = 0; i < 4; i++) {
    groups[i] = [];
  }
  for (var i = 0; i < 4; i++)
  {
    var currentGroupSockets = PLUGIN_API.GetSocketGroup(socket, idSession + 'StudentsGroup' + i);
    var studentsData = [];
    _.each(currentGroupSockets, function(studentSocket) {

      if (studentSocket !== exceptSocket) {
        studentsData.push({
          studentID: studentSocket.customID,
          studentName: studentSocket.customName,
          active: studentSocket.customActive
//          studentScore: plugins["PLUGIN_HANDLER"].getStudentScore(studentSocket.customID)
        });
      }
    });
//    studentsData
    groups[i] = studentsData;
  }
  return groups;
}



module.exports = App;
//module.exports.GetGroupingMessage = GetGroupingMessage;


