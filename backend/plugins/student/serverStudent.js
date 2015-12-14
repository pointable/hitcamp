'use strict';

var _ = require('underscore');
var PLUGIN_API = require('../../pluginAPI');
var PLUGIN_NAME = 'STUDENT';

var namesUsed = [];

function App(idSession, plugins, redis, mongo) {
  this.idSession = idSession;
//  this.grouperPlugin = grouperPlugin

  this.pluginStudentMessageListener = function(socket, pluginMessageType, data) {
//    console.log("isTeacher?" + socket.customIsTeacher);

    switch (pluginMessageType) {
      case 'StudentSetName':
        studentSetName(socket, data);
        break;
      case 'StudentUpdateStatus':
        studentUpdateStatus(socket, data);
        break;
      case 'StudentJoin':
        studentJoin(socket, data);
        break;
      case 'StudentDisconnect':
        studentDisconnect(socket, data);
        break;
      default:
    }
  };

  this.pluginTeacherMessageListener = function(socket, pluginMessageType, data) {
    switch (pluginMessageType) {
      default:
    }
  };

  function studentDisconnect(socket, data) {
    var previousNameIndex = namesUsed.indexOf(socket.customName);
    if (previousNameIndex != -1)
      namesUsed.splice(previousNameIndex, 1);
  }

  function studentSetName(socket, data) {

    var name = data.name;
    var previousName = socket.customName;
    var isSuccess;
//    console.log(namesUsed);
    if (namesUsed.indexOf(name) == -1) {
      //don't have such name
      var previousNameIndex = namesUsed.indexOf(previousName);
      if (previousNameIndex > 0)
        namesUsed.splice(previousNameIndex, 1);

      namesUsed.push(name);

      var studentSockets = PLUGIN_API.GetSocketGroup(socket, idSession + 'User' + socket.customID);

      _.each(studentSockets, function(studentSocket, i) {
        studentSocket.customName = name;
      });

      isSuccess = true;
    } else {
      name = socket.customName;
//      if (name.indexOf('Guest') == 0){
//        //generate new name
//        var generatedName = NameGenerator.GenerateName();
//        console.log(generatedName);
//        name = generatedName;
//      }
      isSuccess = false;
    }


    var dataToSend = {
      success: isSuccess,
      name: name
    };
//    console.log(dataToSend);
    PLUGIN_API.SendToSocketGroup(socket, idSession, PLUGIN_NAME,
        'StudentSetNameResponse', dataToSend);
    if (isSuccess) {
      var dataToSend = plugins["GROUPER"].getGroupingMessage(idSession, socket);
      PLUGIN_API.SendToAllTeachers(socket, idSession, 'GROUPER',
          'StudentGrouping', dataToSend);
      PLUGIN_API.SendToAllStudentsInSameGroup(socket, idSession, "GROUPER",
          'StudentGrouping', dataToSend);


      var studentWallPost = {
        studentID: socket.customID,
        message: "Changed name from " + previousName + " to " + name
      };
      plugins["WALL_STUDENT"].studentWallAddPost(studentWallPost);

      //add to database
      var query = {
        idStudent: socket.customID,
        idClassroom: socket.customSessionID
      };
      var object = {
        name: socket.customName
      };

      if (!mongo) {
        console.log("Mongo UNDEFINED");
        return;
      }
      
      mongo.models.StudentData.update(query, object, {upsert: true}, function(err, studentData) {
        if (studentData)
//          console.log("Student Data: " + studentData);
          if (err)
            console.log(err);
      });
    }
  }

  function studentUpdateStatus(socket, data) {
    var studentSockets = PLUGIN_API.GetSocketGroup(socket, idSession + 'User' + socket.customID);

    _.each(studentSockets, function(studentSocket, i) {
      studentSocket.customActive = data.active;
    });

    var dataToSend = {
      studentID: socket.customID,
      active: socket.customActive
    };

    PLUGIN_API.SendToAllTeachers(socket, idSession, 'GROUPER',
        'StudentUpdateStatus', dataToSend);

  }

  function studentJoin(socket, data) {
    //add to database
    var query = {
      idStudent: socket.customID,
      idClassroom: socket.customSessionID
    };
    var object = {
//      idStudent: socket.customID,
//      idClassroom: socket.customSessionID,
      deletionDate: new Date().toISOString(),
      name: socket.customName
    };

    if (!mongo) {
      console.log("Mongo UNDEFINED");
      return;
    }

    mongo.models.StudentData.findOneAndUpdate(query, object, {upsert: true}, function(err, studentData) {
      if (err) {
        console.log("Mongo ERROR");
        console.log(err);
        return;
      }
//      if (studentData)
//        console.log("Student Data: " + studentData);

      var assignedLesson = plugins["ACTIVITY"].idLesson;
//      console.log(assignedLesson);
      var refLesson = _.find(studentData.lessonsData, function(lessonData) {
//        console.log("Lesson Data " + lessonData.lesson);
//        console.log("Assigned Lesson " + assignedLesson);
        if (!lessonData)
          return;
        return lessonData.equals(assignedLesson);
      });

      if (!refLesson) {
        var fieldsToSet = {
          idStudent: socket.customID,
          classroom: socket.customSessionID,
          lesson: assignedLesson
        };
        mongo.models.StudentDataLesson.create(fieldsToSet, function(err, studentDataLesson) {
          if (err) {
            return;
          }
//          var lessonData = new mongo.models.StudentDataLesson(fieldsToSet);
          studentData.lessonsData.push(studentDataLesson._id);
          studentData.save(function(err) {
            if (err) {

            }

          });
        });
      }
    });

  }
}

module.exports = App;

