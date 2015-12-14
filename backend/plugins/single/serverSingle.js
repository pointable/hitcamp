'use strict';

var _ = require('underscore');
var PLUGIN_API = require('../../pluginAPI');
var PLUGIN_NAME = 'SINGLE';
var redis;
//var studentWall = [];

function App(idSession, plugins, redisL) {
  redis = redisL;
  this.pluginStudentMessageListener = function(socket, pluginMessageType, data) {
//    console.log("isTeacher?" + socket.customIsTeacher);

    switch (pluginMessageType) {
      case 'StudentJoin':
        studentJoin(socket, data, this);
        break;
      default:
    }
  };
  this.pluginTeacherMessageListener = function(socket, pluginMessageType, data) {
    switch (pluginMessageType) {
      case 'TeacherJoin':
        teacherJoin(socket, data, this);
        break;
      default:
    }
  };
  this.getStudentScore = function(studentID) {
    var currentScore = studentScores[studentID] ?
        studentScores[studentID].totalScore : 0;
    return currentScore;
  };
  function teacherJoin(socket, data) {
    //send other students score to this student
//    var studentsSockets = PLUGIN_API.GetSocketGroup(socket, idSession + 'Students');
    var studentsScoreData = [];
    _.each(studentScores, function(studentScore) {
//      var studentScore = studentScores[studentSocket.customID]?studentScores[studentSocket.customID].totalScore : 0;
      studentsScoreData.push({
        studentID: studentScore.id,
        studentScore: studentScore.totalScore
      });
    });
    var dataToSend = {
      studentsScoreData: studentsScoreData
    };
    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'StudentScoreAll', dataToSend);
  }

  function studentJoin(socket, data) {
    var currentScore = studentScores[socket.customID] ?
        studentScores[socket.customID].totalScore : 0;
    if (currentScore !== 0) {
      var dataToSend = {
        score: currentScore,
        pointsAdded: 0
      };
      PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
          'StudentScoreUpdate', dataToSend);
    }

    var studentsScoreData = [];
    _.each(studentScores, function(studentScore) {
//      var studentScore = studentScores[studentSocket.customID]?studentScores[studentSocket.customID].totalScore : 0;
      studentsScoreData.push({
        studentID: studentScore.id,
        studentScore: studentScore.totalScore
      });
    });
    var dataToSend = {
      studentsScoreData: studentsScoreData
    };
    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'StudentScoreAll', dataToSend);
  }

  this.studentScoresAdd = function(socket, data) {
    studentScoresAdd(socket, data);
  }

  this.studentScoresAdd = function(socket, data, studentID) {
    studentScoresAdd(socket, data, studentID);
  }

  function studentScoresAdd(socket, data, studentID) {
    if (studentID) {

    } else {
      studentID = socket.customID;
    }

    if (!studentScores[studentID]) {
      studentScores[studentID] = new StudentScore(studentID, idSession);
    }

    var previousScore = studentScores[studentID].totalScore;
    studentScores[studentID].addPoints(data);
    sendStudentScore(socket, studentID, studentScores[studentID].totalScore, data.points);
    checkReward(studentID, previousScore, studentScores[studentID].totalScore);
  }

  function sendStudentScore(socket, studentID, newScore, points) {
    var dataToSend = {
      score: newScore,
      pointsAdded: points
    };
    PLUGIN_API.SendToSocketGroupID(socket, idSession, PLUGIN_NAME,
        'StudentScoreUpdate', dataToSend, studentID);
    dataToSend = {
      studentID: socket.customID,
      studentScore: newScore
    };
    PLUGIN_API.SendToOthers(socket, idSession, PLUGIN_NAME,
        'StudentScoreOthersUpdate', dataToSend);
  }


  function checkReward(studentID, previousScore, newScore) {
//check break barriers
    var milestones = [50, 100, 500, 1000, 5000, 10000, 20000];
    var reached = _.find(milestones, function(value) {
      return (previousScore < value && newScore >= value);
    });
    if (reached) {
      var studentWallPost = {
        studentID: studentID,
        message: "Surpassed " + reached + " points"
      };
      plugins["WALL_STUDENT"].studentWallAddPost(studentWallPost);
    }
  }

  this.studentStatsAdd = function(socket, data) {
    studentStatsAdd(socket, data);
  }

  this.studentStatsAdd = function(socket, data, studentID) {
    studentStatsAdd(socket, data, studentID);
  }

  this.studentGetStats = function(socket, studentID, callback) {
    studentGetStats(socket, studentID, callback);
  }

  function studentStatsAdd(socket, data, studentID) {
    if (studentID) {
    } else {
      studentID = socket.customID;
    }

    var redisMulti = [];
    if (data.accuracy) {
      var value = data.accuracy.value;
      var max = data.accuracy.max;

      var key = "CAMP:" + idSession + ':STAT:' + studentID + ':ACC:'; //add date or lessonid
      var keyMax = "CAMP:" + idSession + ':STAT:' + studentID + ':ACCMAX:'; //add date or lessonid
      redisMulti.push(['incrby', key, value]);
      redisMulti.push(['incrby', keyMax, max]);
    }

    if (data.speed) {
      var value = data.speed.value;
      var max = data.speed.max;

      var key = "CAMP:" + idSession + ':STAT:' + studentID + ':SPD:'; //add date or lessonid
      var keyMax = "CAMP:" + idSession + ':STAT:' + studentID + ':SPDMAX:'; //add date or lessonid
      redisMulti.push(['incrby', key, value]);
      redisMulti.push(['incrby', keyMax, max]);
    }

    //importance
    redis.multi(redisMulti).exec(function(err, replies) {
//      console.log(replies);
//      console.log("Average =" + parseInt(replies[0]) / parseInt(replies[1]));
    });
  }
  function studentGetStats(socket, studentID, callback) {
    if (studentID) {
    } else {
      studentID = socket.customID;
    }

    var statsCategories = ['ENG', 'SPD', 'ACC', 'BEH', 'SOC'];
    var redisMulti = [];

    _.each(statsCategories, function(stat) {
      var key = "CAMP:" + idSession + ':STAT:' + studentID + ':' + stat + ':'; //add date or lessonid
      var keyMax = "CAMP:" + idSession + ':STAT:' + studentID + ':' + stat + 'MAX:'; //add date or lessonid

      redisMulti.push(['get', key]);
      redisMulti.push(['get', keyMax]);
    });

    if (!redis) {
      console.log("Redis Undefined in ServerSingle - Get Stats");
      callback(true);
      return;
    }

    redis.multi(redisMulti).exec(function(err, replies) {
      console.log(replies);

      var stats = [];
      _.each(statsCategories, function(category, i) {
        var value = replies[i * 2];
        var max = replies[i * 2 + 1]
        if (value && max) {
          var average = parseInt((parseInt(value) * 100) / parseInt(max));
          stats.push({
            category: category,
            average: average
          });
          console.log("Average =" + parseInt(average));
        } else {
          stats.push({
            category: category,
            average: 50
          });
        }
      });
      console.log(callback);
      callback(err, stats);
    });
  }
}

module.exports = App;

function StudentScore(studentID, idSession) {
  this.id = studentID;
  this.idSession = idSession;
  this.totalScore = 0;
//  var totalScore = this.totalScore;

  this.addPoints = function(data) {
    this.totalScore += data.points;
    var key = "CAMP:" + idSession + ':' + PLUGIN_NAME + ':' + this.id;
    
    
    if (!redis) {
      console.log("Redis Undefined in ServerSingle - Student Score");
      return;
    }
    
    redis.set(key, this.totalScore, function(err, data) {
//      console.log(data);
    });
  }
  
  this.getPoints = function() {
//    console.log(this.wallPosts);
    return this.totalScore;
  }
}

