'use strict';

var _ = require('underscore');
var PLUGIN_API = require('../../pluginAPI');
var PLUGIN_NAME = 'ACTIVITY';

//var studentWall = [];

function App(idSession, idLesson, plugins, redis, mongo) {
  var activities = {};
  this.idLesson = idLesson;
//  var assignedLesson;

  this.pluginStudentMessageListener = function(socket, pluginMessageType, data) {
    switch (pluginMessageType) {
      case 'Like':
        elementLike(socket, data);
        break;
      case 'StudentAnswer':
        elementAnswer(socket, data);
        break;
      case 'StudentTextAnswer':
        elementTextAnswer(socket, data);
        break;
      case 'GetStudentAnswers':
        getStudentAnswers(socket, data);
        break;
      default:
    }
  };

  this.pluginTeacherMessageListener = function(socket, pluginMessageType, data) {
    switch (pluginMessageType) {
      case 'GetStudentWall':
        getStudentWall(socket, data);
        break;
      case 'Like':
        elementLike(socket, data);
        break;
      case 'GetAllStudentAnswers':
        getAllStudentAnswers(socket, data);
        break;
      case 'StudentAnswersReset':
        studentAnswersReset(socket, data);
        break;
      default:
    }
  };
  this.activityChanged = function(assignedLesson) {
    idLesson = assignedLesson;
    activities = null;
    activities = {};
  }
//  this.studentWallAddPost = function (data){
//    
//    studentWallAddPost(data);
//  }

  function studentWallAddPost(data) {
    var studentID = data.studentID;
    var message = data.message;

    studentWalls[studentID].addPost(message);
  }


  function getStudentWall(socket, data) {
    if (!data || !data.studentID) {
      return;
    }
    var requestedID = data.studentID;
    var wallPosts = studentWalls[requestedID].getPost();

    var dataToSend = {
      studentID: requestedID,
      wallPosts: wallPosts
    };
    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'GetStudentWallResponse', dataToSend);
  }

  function elementLike(socket, data) {
    if (!data || !data.activityID || !data.elementID) {
      return;
    }
    var activityID = data.activityID;
    var elementID = data.elementID;

    var activity = activities[activityID];
    if (!activity) {
      activities[activityID] = new Activity(activityID);
      activity = activities[activityID];
    }

    activity.elementLike(socket.customID, elementID);

    var studentWallPost = {
      studentID: socket.customID,
      message: socket.customName + "liked this",
      imageURL: data.imageURL
    };
    plugins["WALL_STUDENT"].studentWallAddPost(studentWallPost);
  }

  function elementAnswer(socket, data) {

    console.log("ANSWER");
    if (!data || !data.activityID || !data.elementID) {
      return;
    }
    var activityID = data.activityID;
    var elementID = data.elementID;

    //getStudentAnswers(socket, data);

    addStudentAnswerDB({
      idClassroom: idSession,
      idLesson: idLesson,
      idStudent: socket.customID,
      idActivity: activityID,
      idElement: elementID,
      studentAnswer: data.answer,
      correctAnswer: data.correctAnswer,
      type: "mul"
    });
  }

  function elementTextAnswer(socket, data) {

    console.log("ANSWER");
    if (!data || !data.activityID || !data.elementID) {
      return;
    }
    var activityID = data.activityID;
    var elementID = data.elementID;

    //getStudentAnswers(socket, data);

    addStudentAnswerDB({
      idClassroom: idSession,
      idLesson: idLesson,
      idStudent: socket.customID,
      idActivity: activityID,
      idElement: elementID,
      studentAnswer: data.answer,
      correctAnswer: data.correctAnswer,
      type: "text"
    });
  }

  function addStudentAnswerDB(data) {
//    console.log(data);

    if (!data.idLesson) {
      console.log("AddStudentAnswerDB - No Lesson ID");
      return;
    }
    var query = {
      idStudent: data.idStudent,
      classroom: data.idClassroom,
      lesson: data.idLesson
    };

    mongo.models.StudentDataLesson.findOne(query, function(err, studentDataLesson) {
      if (err) {
        console.log(err);
        return;
      }

      if (!studentDataLesson) {
//        console.log("No Student Data Lesson");
        return;
      }
//      console.log("Student Data: " + studentDataLesson);

      var fieldsToSet = {
        idActivity: data.idActivity,
        idElement: data.idElement,
        elementData: {
          studentAnswer: data.studentAnswer,
          correctAnswer: data.correctAnswer,
          type: data.type
        }
      };
      var studentDataLessonElement = new mongo.models.StudentDataLessonElement(fieldsToSet);
      studentDataLesson.elementsData.push(studentDataLessonElement);
      studentDataLesson.save(function(err) {

      });
    });
  }

  function getStudentAnswersDB(data, callback) {

    if (!data.idLesson) {
      console.log("AddStudentAnswerDB - No Lesson ID");
      return;
    }
    
    if (data.idStudent) {
      var query = {
        idStudent: data.idStudent,
        classroom: data.idClassroom,
        lesson: data.idLesson
      };

      mongo.models.StudentDataLesson.findOne(query, function(err, studentDataLesson) {
        if (err) {
          console.log(err);
          return;
        }

//        console.log(studentDataLesson);
        if (!studentDataLesson) {
//          console.log("No Student Data Lesson");
          return;
        }
        callback(studentDataLesson.elementsData);
      });
    } else {
      var query = {
        classroom: data.idClassroom,
        lesson: data.idLesson
      };

      mongo.models.StudentDataLesson.find(query, function(err, allStudentDataLesson) {
        if (err) {
          console.log(err);
          return;
        }

//        console.log(allStudentDataLesson);
        if (!allStudentDataLesson) {
//          console.log("No Student Data Lesson");
          return;
        }
        callback(allStudentDataLesson);
      });
    }
  }

  function getStudentAnswers(socket, data) {

    getStudentAnswersDB({
      idClassroom: idSession,
      idLesson: idLesson,
      idStudent: socket.customID
    }, function(studentElementsDataDB) {
      var studentActivities = {};

//      console.log("studentElementsDataDB");
//      console.log(studentElementsDataDB);
      var activities = _.groupBy(studentElementsDataDB, 'idActivity');
//      console.log("activities");
//      console.log(activities);

      var studentActivities = {};
      _.each(activities, function(activity) {
        _.each(activity, function(element) {
          var elementData = element.elementData;
          if (elementData) {
            //if got answer
            if (!studentActivities[element.idActivity]) {
              studentActivities[element.idActivity] = {};
            }

            var studentActivity = studentActivities[element.idActivity];

            studentActivity[element.idElement] = {};
            var studentElement = studentActivity[element.idElement];
            studentElement.studentAnswer = elementData.studentAnswer;
            studentElement.correctAnswer = elementData.correctAnswer;
          }
        });
      });

//      console.log(studentActivities);
      var dataToSend = {
        activities: studentActivities
      };
      PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
          'GetStudentAnswersResponse', dataToSend);
    });
  }

  function getAllStudentAnswers(socket, data) {

    getStudentAnswersDB({
      idClassroom: idSession,
      idLesson: idLesson,
//      idStudent: socket.customID
    }, function(allStudentElementsDataDB) {
      var dataToSend = {
        activities: allStudentElementsDataDB
      };
      PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
          'GetAllStudentAnswersResponse', dataToSend);
    });
  }
}

module.exports = App;

function Activity(activityID) {
//  this.socket = socket;
  this.id = activityID;
  this.elements = {};
  var elements = this.elements;

  this.addPost = function(data) {
    //process data first
    var newPost = new WallPost(data);
    this.wallPosts.unshift(newPost);
  }
  this.getPost = function() {
//    console.log(this.wallPosts);
    return this.wallPosts;
  };
  this.elementLike = function(senderID, elementID) {
    var selectedElement = elements[elementID];
    if (!selectedElement) {
      elements[elementID] = new Element(elementID);
      selectedElement = elements[elementID];
    }


    if (!_.contains(selectedElement.likes, senderID)) {
      selectedElement.likes.push(senderID);
    }
  };
  this.elementAnswer = function(senderID, elementID, answer, correctAnswer) {
    var selectedElement = elements[elementID];
    if (!selectedElement) {
      elements[elementID] = new Element(elementID);
      selectedElement = elements[elementID];
    }

    if (correctAnswer) {
      selectedElement.correctAnswer = correctAnswer;
    }

    if (selectedElement.studentAnswers[senderID]) {
      //answered before
      return false;
    } else {
      selectedElement.studentAnswers[senderID] = new StudentAnswer(answer);
      return true;
    }
  };
}
;

function Element(elementID) {
//  this.postedTime = (new Date()).toJSON();
  this.id = elementID;
  this.likes = [];
  this.studentAnswers = {};
  this.correctAnswer;
}

function StudentAnswer(answer) {
  this.isCorrect = answer.isCorrect;
  this.answerSubmitted = answer.answerSubmitted;
  this.points = answer.score;
}