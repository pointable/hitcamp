'use strict';
var _ = require('underscore');
var shortId = require('shortid');
//var async = require('async');

exports.find = function(req, res, next) {
//  console.log(req.session.passport.user);
  var userID = req.session.passport.user.id;

  req.query.lessonName = req.query.lessonName ? req.query.lessonName : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '-_id';

  var filters = {};

  filters.owner = userID;

  if (req.query.lessonName) {
    filters.lessonName = new RegExp('^.*?' + req.query.lessonName + '.*$', 'i');
  }

  if (req.query.isComplete) {
    filters.isComplete = req.query.isComplete;
  }

//  console.log('Retrieve UserID:' + userID);


//  req.app.db.models.User.findById(userID).populate('lessons').exec(function (err, user) {   
//    if (err) {// TODO handle err
//      console.log(err);
//    }
//    console.log('Lessons :' + user.lessons);
//  });

  var queryKeys = 'lessonName backgroundThumbnailURL owner isComplete isLocked';
  if (req.user.canPlayRoleOf('admin')) {
    queryKeys = 'lessonName isComplete isLocked';
    delete filters.owner;
  }

  //show Walkthrough with ID
  var filterQuery = {
    $or: [filters, {_id: req.app.config.lesson.lessonIDs[0]}]
  }

//    console.log(queryKeys);
  req.app.db.models.Lesson.pagedFind({
    filters: filterQuery, //filters,
    keys: queryKeys,
    limit: req.query.limit,
    page: req.query.page,
    sort: req.query.sort
  }, function(err, results) {
    if (err) {
      return next(err);
    }

    if (req.xhr) {
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      results.filters = req.query;
      res.send(results);
    }
    else {
      return res.redirect('/');
//      results.filters = req.query;
//      res.render('adventures/indexLessonsList', {data: {results: JSON.stringify(results)}});
    }
  });
};

//  req.app.db.models.User.pagedFind({
//    filters: filters,
//    keys: 'username email isActive',
//    limit: req.query.limit,
//    page: req.query.page,
//    sort: req.query.sort
//  }, function(err, results) {
//    if (err) {
//      return next(err);
//    }
//
//    if (req.xhr) {
//      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
//      results.filters = req.query;
//      res.send(results);
//    }
//    else {
//      results.filters = req.query;
//      res.render('adventures/index', { data: { results: JSON.stringify(results) } });
//    }
//  });
//};

//open lesson - later
exports.read = function(req, res, next) {
  req.app.db.models.Lesson.findById(req.params.id).exec(function(err, lesson) {
    if (err) {
      return next(err);
    }

    if (req.xhr) {
      res.send(lesson);
    }
    else {
//      res.render('adventures/index', { data: { record: escape(JSON.stringify(lesson)) } });
//    todo redirect to new lesson editor;
      res.redirect('adventures/');
    }
  });
};

//create lesson
exports.create = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
//    console.log(req.body);
    if (!req.body.lessonName) {
      workflow.outcome.errors.push('Please enter a lesson name.');
      return workflow.emit('error');
    }

//    if (!/^[a-zA-Z0-9 \-\_\']+$/.test(req.body.lessonName)) {
//      workflow.outcome.errors.push('only use letters, numbers, -, _, ');
//      return workflow.emit('response');
//    }

    workflow.emit('createLesson');
  });

//  workflow.on('duplicateNameCheck', function() {
//    req.app.db.models.Lesson.findOne({lessonName: req.body.lessonName, owner: req.session.passport.user.id}, function(err, lesson) {
//      if (err) {
//        return workflow.emit('exception', err);
//      }
//
//      if (lesson) {
//        workflow.outcome.errors.push('That lesson name has already been used.');
////        return workflow.emit('response');
//        res.json(500, {error: 'That lesson name has already been used.'});
//        return;
////        return workflow.emit('exception', err);
//      }
//
//      workflow.emit('createLesson');
//    });
//  });

  workflow.on('createLesson', function() {
    var userID = req.session.passport.user.id;
    var fieldsToSet = {
      shortID: shortId.generate(),
      lessonName: req.body.lessonName,
      owner: userID,
      search: [
        req.body.lessonName, userID
      ]
    };

    req.app.db.models.Lesson.create(fieldsToSet, function(err, lesson) {
      if (err) {
        return workflow.emit('error', err);
      }

      workflow.outcome.record = lesson;
//      workflow.outcome._id = lesson._id;

      //save lesson id to user model


      req.app.db.models.User.findById(userID, function(err, user) {
        if (err) {
          return workflow.emit('error', err);
        }
//        console.log(require('mongoose').Types.ObjectId(activity._id));
        user.lessons.push(require('mongoose').Types.ObjectId(lesson._id.toString()));
//        console.log(user);
        user.save(function(err) {
          if (err) {
            return workflow.emit('error', err);
          }
//          console.log('success');
          return workflow.emit('success');
        });
      });
//      return workflow.emit('response');
    });
  });

  workflow.emit('validate');
};


//update lesson
exports.update = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
//    if (!req.body.isComplete) {
//      req.body.isComplete = 'no';
//    }
//
//    if (!req.body.lessonName) {
//      workflow.outcome.errfor.lessonName = 'required';
//    }
//    else if (!/^[a-zA-Z0-9 \-\_]+$/.test(req.body.lessonName)) {
//      workflow.outcome.errfor.lessonName = 'only use letters, numbers, \'-\', \'_\'';
//    }
//
//    if (workflow.hasErrors()) {
//      return workflow.emit('response');
//    }

    workflow.emit('patch');
  });

//  workflow.on('duplicateCheck', function() {
//    var userID = req.session.passport.user.id;
//    req.app.db.models.Lesson.findOne({lessonName: req.body.lessonName,
//      _id: {$ne: req.params.id}, owner: userID}, function(err, lesson) {
//      if (err) {
//        return workflow.emit('exception', err);
//      }
//
//      if (lesson) {
//        workflow.outcome.errfor.lessonName = 'lesson name has already been used';
//        return workflow.emit('response');
//      }
//
//      workflow.emit('patch');
//    });
//  });


  workflow.on('patch', function() {

    var fieldsToSet = {};
    if (req.body.lessonName) {
      fieldsToSet.lessonName = req.body.lessonName;
      if (req.params.id === req.app.config.lesson.lessonIDs[0]) {
        req.app.config.lesson.lessonName = fieldsToSet.lessonName;
      }
    }
    if (req.body.tiles) {
      fieldsToSet.tiles = req.body.tiles;
    }
    if (req.body.backgroundImageURL) {
      fieldsToSet.backgroundImageURL = req.body.backgroundImageURL;
    }
    if (req.body.backgroundThumbnailURL) {
      fieldsToSet.backgroundThumbnailURL = req.body.backgroundThumbnailURL;
      if (req.params.id === req.app.config.lesson.lessonIDs[0]) {
        req.app.config.lesson.backgroundThumbnailURL = fieldsToSet.backgroundThumbnailURL;
      }
    }
    if (req.body.backgroundImageJSON) {
      fieldsToSet.backgroundImageJSON = req.body.backgroundImageJSON;
    }

//    console.log(fieldsToSet);
//    var fieldsToSet = {
////      isComplete: req.body.isComplete,
//      lessonName: req.body.lessonName,
//      tiles: req.body.tiles,
//      backgroundImageURL: req.body.backgroundImageURL,
//      backgroundImageJSON: req.body.backgroundImageJSON
////      search: [
////        req.body.username,
////        req.body.email
////      ]
//    };
//    console.log("id is " + req.params.id);
//    console.log("data is :" + fieldsToSet);

    req.app.db.models.Lesson.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, lesson) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome._id = req.params.id;
      if (req.body.tiles)
        workflow.outcome.tiles = req.body.tiles;

      if (req.body.lessonName)
        workflow.outcome.lessonName = req.body.lessonName;

      if (req.body.backgroundImageURL)
        workflow.outcome.backgroundImageURL = req.body.backgroundImageURL;

      if (req.body.backgroundImageJSON)
        workflow.outcome.backgroundImageJSON = req.body.backgroundImageJSON;

      if (lesson.shortID) {
        workflow.emit('response', lesson);
      } else {
        lesson.shortID = shortId.generate();
        lesson.save(
            function(err) {
              if (err) {
                return workflow.emit('exception', err);
              }
              workflow.emit('response');
            });
      }
    });
  });


  workflow.emit('validate');
};



exports.delete = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    workflow.emit('delete');
  });

  workflow.on('delete', function(err) {
    req.app.db.models.Lesson.findById(req.params.id, function(err, lesson) {
      if (lesson.isLocked) {
        return workflow.emit('exception', null);
      }
//      console.log(lesson.activities);
      _.each(lesson.activities, function(activity) {
        if (activity)
//          activity.remove();
          req.app.db.models.Activity.findByIdAndRemove(activity, function(err) {
          });
      });
      _.each(lesson.wordLists, function(wordList) {
        if (wordList)
//          wordList.remove();
          req.app.db.models.WordList.findByIdAndRemove(wordList, function(err) {
          });
      });
      lesson.remove();
      lesson.save(function(err) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.lesson = lesson;

        req.app.db.models.User.findById(req.session.passport.user.id).exec(function(err, user) {
          if (err) {
            return workflow.emit('exception', err);
          }
//          console.log(user.lessons);
//          console.log("ID: " + req.params.id);
          user.lessons.remove(require('mongoose').Types.ObjectId(req.params.id));
          user.save(function(err) {
            if (err) {
              return workflow.emit('exception', err);
            }
//        console.log('Student deleted: ' + req.params.id);
            workflow.emit('response');
          });
        });
      });
    });

//    req.app.db.models.Lesson.findByIdAndRemove(req.params.id, function(err, lesson) {
//
//    });
  });

  workflow.emit('validate');
};

exports.cloneWalkthrough = function(req, res, userID, userName) {

  exports.cloneGeneric(req, res, null, userID, userName);
};

exports.clone = function(req, res, next) {
  exports.cloneGeneric(req, res, next);
};


exports.cloneGeneric = function(req, res, next, userID, userName) {
  var workflow = req.app.utility.workflow(req, res);

  var query = [];
  var isWalkthrough = false;
  workflow.on('retrieveLesson', function() {
    if (userID) {
      //clone lesson walkthrough
      isWalkthrough = true;
      var lessonIDs = req.app.config.lesson.lessonIDs;
      _.each(lessonIDs, function(lessonID) {
        query.push({
          _id: require('mongoose').Types.ObjectId(lessonID)
        })
      });
    } else {
      userID = req.session.passport.user.id;
      query.push({
        _id: require('mongoose').Types.ObjectId(req.params.id)
      })
    }

    req.app.db.models.Lesson.findOne({$or: query}).populate('activities').populate('wordLists').exec(function(err, lesson) {
      if (err) {
        return next(err);
      }
      //clone wordlist
      var wordListRefs = [];
      _.each(lesson.wordLists, function(wordList) {
        var originalID = wordList._id.toString();
        wordList._id = require('mongoose').Types.ObjectId();
        wordListRefs.push({originalID: originalID, newID: wordList.id});
      });

      req.app.db.models.WordList.create(lesson.wordLists, function(err) {
        if (err) {
//          console.log(err);
          if (isWalkthrough)
            return;
          else
            return next(err);
        }
      });

      _.each(lesson.activities, function(activity) {
        activity._id = require('mongoose').Types.ObjectId();

        if (activity.activityType === "wordList") {
          var newWordLists = [];
          _.each(activity.wordLists, function(activityWordList) {
            var wordListRefFound = _.find(wordListRefs, function(wordListRef) {
              return wordListRef.originalID === activityWordList;
            });
            if (wordListRefFound) {
              newWordLists.push(wordListRefFound.newID.toString());
//              console.log("Replaced: " + activityWordList);
//              console.log("with: " + wordListRefFound.newID.toString());
            }
          });
          activity.wordLists = newWordLists;
        }
      });


      req.app.db.models.Activity.create(lesson.activities, function(err) {
        if (err) {
//          console.log(err);
          if (isWalkthrough)
            return;
          else
            return next(err);
        }
      });



      lesson._id = require('mongoose').Types.ObjectId();
      lesson.shortID = shortId.generate();
      lesson.owner = userID;

      if (!isWalkthrough) {
        lesson.lessonName = lesson.lessonName + '(1)';
      }

      lesson.isLocked = false;

      var fieldsToSet = lesson;
      req.app.db.models.Lesson.create(fieldsToSet, function(err, lesson) {
        if (err) {
          if (isWalkthrough)
            return;
          else
            return next(err);
        }
//        console.log(lesson);
        req.app.db.models.User.findById(userID, function(err, user) {
          if (err) {
            if (isWalkthrough)
              return;
            else
              return workflow.emit('exception', err);
          }
//        console.log(require('mongoose').Types.ObjectId(activity._id));
          user.lessons.push(require('mongoose').Types.ObjectId(lesson._id.toString()));
//          console.log(user);
          user.save(function(err) {
            if (err) {
              if (isWalkthrough)
                return;
              else
                return workflow.emit('exception', err);
            }
//            console.log('success');

            if (isWalkthrough) {
//              console.log("Lesson ID is " + lesson._id);
//              require('../session/indexSession').createTestClassroom(req, res, userID, userName, lesson._id);

              return;// lesson._id;
            }
            else {
              workflow.outcome.idLesson = lesson._id.toString();
              if (req.query.import === "true") {
                res.redirect('/adventures/edit/' + lesson._id.toString());
              } else {
                return workflow.emit('response');
              }
            }
          });
        });
      });
    });
  });
  workflow.emit('retrieveLesson');
};