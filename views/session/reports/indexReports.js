'use strict';
var _ = require('underscore');

exports.read = function(req, res, next) {
//  req.app.db.models.Classroom.findOne({path: req.params.path, 'students._id': req.params.id}, function(err, classroom) {
  var query = req.app.db.models.Classroom.findOne({path: req.params.path,
    owner: req.session.passport.user.id});
  query.select('lesson owner path PIN name students').populate('students');
  query.exec(function(err, classroom) {
    if (err) {
      return next(err);
    }
    if (!classroom) {
      return next(null);
    }
    console.log("Classroom details: " + classroom);
    var classroomID = classroom._id;
    var redisQuery = [];
    _.each(classroom.students, function(student) {
      var key = "CAMP:" + classroomID + ':SCORE:' + student._id;
      redisQuery.push(['get', key]);
    });

    req.app.redis.multi(redisQuery).exec(function(err, replies) {
      if (err) {
        return next(err);
      }

      var classTotal = 0;
      var classNumber = 0;
      var studentsData = [];
      _.each(replies, function(reply, i) {

        studentsData.push({
          id: classroom.students[i]._id,
          name: classroom.students[i].name ? classroom.students[i].name : classroom.students[i].username,
          score: reply
        });
        if (reply) {
          classNumber++;
          classTotal += parseInt(reply);
          console.log(parseInt(reply));
          classroom.students[i].score = parseInt(reply);
//          console.log(classroom.students[i].score);
        }
      });
      var classAverage = 0;
      if (classNumber > 0) {
        classAverage = classTotal / classNumber;
      }

      var stats = {
        average: classAverage,
        students: studentsData
      };

      if (req.xhr) {
        res.send(classroom);
      }
      else {
        res.render('session/reports/indexReports', {data: {
            record: JSON.stringify(classroom),
            stats: JSON.stringify(stats)
          }});
      }
    });

  });

};

