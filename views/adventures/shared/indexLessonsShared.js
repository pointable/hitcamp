'use strict';
var _ = require('underscore');
var slug = require('speakingurl');

//var async = require('async');
exports.read = function(req, res, next) {
  if (false) {//req.isAuthenticated()) {
    res.redirect(req.user.defaultReturnUrl());
  }
  else {
    var idLesson = req.params.id;

    req.app.db.models.Lesson.findById(idLesson).populate('activities').populate('wordLists').exec(function(err, lesson) {

      if (err) {
        return next(err);
      }
      if (!lesson) {
        return next(false);
      }
      var backgroundImageURL = "about:blank";
      if (lesson.backgroundImageURL) {
        backgroundImageURL = lesson.backgroundImageURL;
      }
//          console.log(classroom);
      var isTeacher = false;
      if (req.isAuthenticated() && req.user.canPlayRoleOf('account')) {
        isTeacher = true;
      }
      res.render('adventures/shared/indexLessonsPreview', {
        oauthMessage: '',
        data: req.params.path,
        name: lesson.lessonName,
        backgroundImageURL: backgroundImageURL,
        classroomPath: '/',
        isTeacher: isTeacher,
        idLesson: idLesson
      });
    });

  }
};
exports.redirect = function(req, res, next) {
  
  res.redirect('/adventures/' + req.params.id);
};
exports.preview = function(req, res, next) {
  if (false) {//req.isAuthenticated()) {
    res.redirect(req.user.defaultReturnUrl());
  }
  else {
    var idLesson = req.params.id;

    var isTeacher = false;
    if (req.isAuthenticated() && req.user.canPlayRoleOf('account')) {
      isTeacher = true;
    }

    var queryID = {_id: idLesson};
    if (idLesson.length < 20) {
      queryID = {
        shortID: idLesson
      }
    }

    req.app.db.models.Lesson.findOne(queryID).populate('activities').populate('wordLists').exec(function(err, lesson) {

      if (err) {
        return next(err);
      }

      if (!lesson) {
        lesson = {};
        require('../../http/index').http404(req, res);
        return;
      }

      var lessonBestID = lesson._id;
      if (lesson.shortID) {
        lessonBestID = lesson.shortID;
      }

      var canonicalName = slug(lesson.lessonName, {maintainCase: true});
//      console.log("canon1" + canonicalName);
//      console.log("canon2" + req.params.canonical);
//      console.log("best id1" + lessonBestID);
//      console.log("best id2" + req.params.id);

      var bestURL = '/adventures/' + lessonBestID + '/' + canonicalName;
//      console.log(bestURL);
      if (req.originalUrl === bestURL) {
        //correct path
      } else {
        //forward 301
        res.redirect(301, bestURL);

        return;
      }

      var sessionData = {
        idSession: idLesson, //classroom._id,
        idLesson: lesson._id,
        PIN: 123, //classroom.PIN,
        path: idLesson, //classroom.path,
        isTeacher: false,
        port: process.env.SOCKET_PORT,
        activities: lesson.activities,
        wordLists: lesson.wordLists,
        tiles: lesson.tiles,
        lessonName: lesson.lessonName,
        backgroundImageURL: lesson.backgroundImageURL,
        isPreview: true,
        isLoggedIn: isTeacher,
//        backgroundImageJSON: lesson.backgroundImageJSON,
        isDevelopment: (process.env.NODE_ENV !== 'production')
      };
//      console.log("Session Data: ");
//      console.log(sessionData);
      if (req.xhr) {
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.send(sessionData);
      }
      else {
        res.render('adventures/shared/indexAdventurePreview', {
          data: {results: JSON.stringify(lesson)},
          lesson: lesson,
          lessonBestID: lessonBestID,
          isLoggedIn: isTeacher,
          classroom: false,
          sessionData: JSON.stringify(sessionData)
        });
      }
    });

  }
};