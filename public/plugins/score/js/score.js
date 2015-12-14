(function() {
  var PLUGIN_NAME = 'SCORE';

  jq(document).ready(function() {
//  jq(document).on('AppReady', function(e) {
    if (isTeacher) {
      jq(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
        var messageReceived = param.detail;

        switch (messageReceived.pluginMessageType)
        {
          case 'StudentScoreAll':
            processStudentScoreAll(messageReceived.data);
            break;
          case 'StudentScoreOthersUpdate':
            processStudentScoreOthers(messageReceived.data);
            break;
        }
      });
      //end teacher
    } else {//student
      jq(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
        var messageReceived = param.detail;

        switch (messageReceived.pluginMessageType)
        {
          case 'StudentScoreUpdate':
            processStudentScore(messageReceived.data);
            break;
          case 'StudentScoreOthersUpdate':
            processStudentScoreOthers(messageReceived.data);
            break;
          case 'StudentScoreAll':
            processStudentScoreAll(messageReceived.data);
            break;
        }
      });
    }
  });

  function processStudentScore(data) {
    var score = data.score;

    odometer.innerHTML = score;

    if (data.pointsAdded > 0) {
      var element = jq("#pointsAdded");
      element.html("+" + data.pointsAdded);
      element.addClass('fadeOut animated');
      element.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
        element.html("");
        element.removeClass('fadeOut animated');
      });
    }

    var strScore = getRepString(score);
    jq("#scoreValue" + document.socketID).html(score);
    jq("#score" + document.socketID).html(strScore);

    //update score data
    var studentScoreData = _.find(document.studentsScoreData, function(studentScoreData) {
      return studentScoreData.studentID === document.socketID;
    });
    if (studentScoreData) {
      studentScoreData.studentScore = score;
    } else {
      if (!document.studentsScoreData) {
        document.studentsScoreData = [];
      }
      document.studentsScoreData.push({studentID: document.socketID, studentScore: score});
    }

    var options = {
      valueNames: ['name', 'score']
    };
    var list = new List('divList', options);
    list.sort('score', {order: "desc"});
  }

  function processStudentScoreOthers(data) {
    var score = data.studentScore;
    var studentID = data.studentID;

    var strScore = getRepString(score);
    jq("#scoreValue" + studentID).html(score);
    jq("#score" + studentID).html(strScore);

    var studentScoreData = _.findWhere(document.studentsScoreData, {studentID: studentID});

    if (studentScoreData) {
      studentScoreData.studentScore = score;
    } else {
      document.studentsScoreData.push({studentID: studentID, studentScore: score});
    }

    var options = {
      valueNames: ['name', 'scoreValue']
    };
    var list = new List('divList', options);
    list.sort('scoreValue', {order: "desc"});
  }

  function processStudentScoreAll(data) {
    var studentsScoreData = data.studentsScoreData;

    if (!document.studentsScoreData) {
      document.studentsScoreData = [];
    }

    _.each(studentsScoreData, function(studentScoreData) {
      document.studentsScoreData.push(studentScoreData);
    });
//    document.studentsScoreData = studentsScoreData;
//    
//    var score = data.score;
//    var studentID = data.studentID;
    var anyStudent = false;
    _.each(studentsScoreData, function(studentScoreData) {
      var strScore = getRepString(studentScoreData.studentScore);
      jq("#scoreValue" + studentScoreData.studentID).html(studentScoreData.studentScore);
      jq("#score" + studentScoreData.studentID).html(strScore);
      if (jq("#score" + studentScoreData.studentID).length) {
        anyStudent = true;
      }
    });

    var options = {
      valueNames: ['name', 'scoreValue']
    };
    if (anyStudent)
    {
      var list = new List('divList', options);
      list.sort('scoreValue', {order: "desc"});
    }
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
})();