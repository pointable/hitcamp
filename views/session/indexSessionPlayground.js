//'use strict';
//var _ = require('underscore');
//
////create session
//exports.createPlayground = function(req, res, next) {
//
////    var userID = req.session.passport.user.id;
//  var randomPIN = Math.floor((Math.random() * 8999) + 1000);
//  var lessonIDs = req.app.config.lesson.lessonIDs;
//
//  var query = [];
//  _.each(lessonIDs, function(lessonID) {
//    query.push({
//      _id: require('mongoose').Types.ObjectId(lessonID)
//    })
//  });
//
//  req.app.db.models.Lesson.findOne({$or: query}).exec(function(err, lesson) {
//    if (err) {
//      return next(err);
//    }
//    
//    var fieldsToSet = {
//      name: "Test Playground",
//      path: randomPIN,
//      lesson: lesson._id,
////      owner: userID,
//      PIN: randomPIN,
//      isTest: true,
//      search: [
//        req.body.path
//      ]
////      between 1000 & 9999
//    };
//    req.app.db.models.Classroom.create(fieldsToSet, function(err, classroom) {
//      if (err) {
//        return workflow.emit('exception', err);
//      }
//
////      workflow.outcome.record = classroom;
//
////      console.log('success create classroom');
//      var session = new req.app.Session(String(classroom._id), req.app.redis);
//      req.app.sessions[String(classroom._id)] = session;
//      
//      res.redirect('playground/'+ randomPIN + '/teststudents/2');
////      console.log(req.app.sessions);
//      //settimeout delete
//    });
//  });
//};
//
//
//exports.delete = function(req, res, next) {
//  var workflow = req.app.utility.workflow(req, res);
//
//  workflow.on('validate', function() {
////    if (!req.user.roles.admin.isMemberOf('root')) {
////      workflow.outcome.errors.push('You may not delete users.');
////      return workflow.emit('response');
////    }
////
////    if (req.user._id === req.params.id) {
////      workflow.outcome.errors.push('You may not delete yourself from user.');
////      return workflow.emit('response');
////    }
//
//    workflow.emit('delete');
//  });
//
//  workflow.on('delete', function(err) {
////    req.app.db.models.Classroom.findByIdAndRemove(req.params.id, function(err, classroom) {
//    req.app.db.models.Classroom.findOneAndRemove({path: req.params.path, owner: req.session.passport.user.id}).exec(function(err, classroom) {
//      if (err) {
//        return workflow.emit('exception', err);
//      }
//
//      workflow.outcome.classroom = classroom;
//      if (!classroom) {
//        return workflow.emit('exception');
//      }
////      var session = new req.app.Session(String(classroom._id));
//      var session = req.app.sessions[String(classroom._id)];
//      if (session) {
//        delete req.app.sessions[String(classroom._id)];
//        session = null;
//      }
//      req.app.db.models.User.findById(req.session.passport.user.id).exec(function(err, user) {
//        if (err) {
//          return workflow.emit('exception', err);
//        }
//        console.log(user.classrooms);
//        console.log("ID: " + classroom._id);
//        user.classrooms.remove(require('mongoose').Types.ObjectId(classroom._id));
//        user.save(function(err) {
//          if (err) {
//            return workflow.emit('exception', err);
//          }
////        console.log('Student deleted: ' + req.params.id);
//          workflow.emit('response');
//        });
//      });
//    });
//  });
//
//  workflow.emit('validate');
//};
