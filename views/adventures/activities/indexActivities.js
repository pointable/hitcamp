'use strict';

var shortId = require('shortid');

exports.find = function(req, res, next) {

  req.app.db.models.Lesson.findById(req.params.id).populate('activities').populate('wordLists').exec(function(err, lesson) {
    if (err) {
      return next(err);
    }

    if (!lesson) {
      return next(null);
    }

    if (req.xhr) {
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
//      results.filters = req.query;
      res.send(lesson);
    }
    else {
      var userID = req.session.passport.user.id;

      req.app.db.models.User.findById(userID).populate([{path: 'classrooms',
          select: 'name path lesson'}]).exec(function(err, user) {
        if (err) {
          return next(err);
        }

        //web app below
        var dataToRender = {
          data: {
            results: JSON.stringify(lesson),
            classrooms: JSON.stringify(user.classrooms)
          },
          lesson: lesson,
        };
        if (req.user.canPlayRoleOf('admin') ||
            (req.session.passport && lesson.owner.equals(req.session.passport.user.id))) {
          res.render('adventures/edit/indexEdit', dataToRender);
        } else {
          return next(null);
        }
      });

    }
  });

};

exports.findDebug = function(req, res, next) {
  req.query.activityName = req.query.activityName ? req.query.activityName : '';


  req.app.db.models.Lesson.findById(req.params.id).populate('activities').exec(function(err, lesson) {
    if (err) {
      return next(err);
    }

    if (req.xhr) {
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
//      results.filters = req.query;
      res.send(lesson);
    }
    else {
//      results.filters = req.query;    
      res.render('adventures/activities/indexActivitiesList', {data: {results: JSON.stringify(lesson)}, lesson: lesson});

//      res.render('adventures/edit/index', { data: { results: JSON.stringify(lesson) }, lesson: lesson });
    }
  });

};
//  req.app.db.models.Activity.pagedFind({
//    filters: filters,
//    keys: 'activityName data',
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
//      res.render('adventures/activities/index', { data: { results: JSON.stringify(results) } });
//    }
//  });

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

//open activity - later
exports.read = function(req, res, next) {
//check valid
  req.app.db.models.Activity.findById(req.params.idActivity).exec(function(err, activity) {
    if (err) {
      return next(err);
    }

    if (req.xhr) {
      res.send(activity);
    }
    else {
//      res.render('adventures/index', { data: { record: escape(JSON.stringify(lesson)) } });
//    todo redirect to new lesson editor;
      res.redirect('adventures/activities/indexActivities');
    }
  });
};

//create activity
exports.create = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
//    console.log(req.body);
//    if (!req.body.activityName) {
//      workflow.outcome.errors.push('Please enter an activity name.');
//      return workflow.emit('response');
//    }

//    if (!/^[a-zA-Z0-9 \-\_]+$/.test(req.body.lessonName)) {
//      workflow.outcome.errors.push('only use letters, numbers, -, _');
//      return workflow.emit('response');
//    }

    workflow.emit('createActivity');
  });

//  workflow.on('duplicateActivityNameCheck', function() {
//    req.app.db.models.Activity.findOne({ activityName: req.body.activityName}, function(err, activity) {
//      if (err) {
//        return workflow.emit('exception', err);
//      }
//
//      if (activity) {
//        workflow.outcome.errors.push('That activity name has already been used.');
//        return workflow.emit('response');
//      }
//
//      workflow.emit('createActivity');
//    });
//  });

  workflow.on('createActivity', function() {
    var fieldsToSet = {
      activityName: req.body.activityName,
      activityTitle: req.body.activityTitle,
      activityType: req.body.activityType,
      elements: req.body.elements,
      x: req.body.x,
      y: req.body.y,
      first: req.body.first,
      active: req.body.active,
      icon: req.body.icon,
      wordLists: [],
      pluginApp: req.body.pluginApp,
      pluginAppIcon: req.body.pluginAppIcon,
      checkPointIcon: req.body.checkPointIcon
    };
    req.app.db.models.Activity.create(fieldsToSet, function(err, activity) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.record = activity;

      req.app.db.models.Lesson.findById(req.params.id, function(err, lesson) {
        if (err) {
          return workflow.emit('exception', err);
        }
//        console.log(activity._id);
//        console.log(require('mongoose').Types.ObjectId(activity._id));
        lesson.activities.push(require('mongoose').Types.ObjectId(activity._id.toString()));
        if (!lesson.shortID) {
          lesson.shortID = shortId.generate();
        }

        lesson.save(function(err) {
          if (err) {
            return workflow.emit('exception', err);
          }
          workflow.outcome._id = activity._id;
          workflow.outcome.elements = req.body.elements;
          return workflow.emit('response');
        });
      });
    });
  });

  workflow.emit('validate');
};


//update activity
exports.update = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
//    if (!req.body.activityName) {
//      workflow.outcome.errfor.activityName = 'required';
//    }
//    else if (!/^[a-zA-Z0-9 \-\_]+$/.test(req.body.lessonName)) {
//      workflow.outcome.errfor.activityName = 'only use letters, numbers, \'-\', \'_\'';
//    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('duplicateActivityCheck');
  });

  workflow.on('duplicateActivityCheck', function() {
    workflow.emit('patchActivity');
//    req.app.db.models.Activity.findOne({ activityName: req.body.activityName, _id: { $ne: req.params.id } }, function(err, activity) {
//      if (err) {
//        return workflow.emit('exception', err);
//      }
//
//      if (activity) {
//        workflow.outcome.errfor.activityName = 'activity name has already been used';
//        return workflow.emit('response');
//      }
//
//      workflow.emit('patchActivity');
//    });
  });


  workflow.on('patchActivity', function() {

    var fieldsToSet = {};

    if (req.body.activityName) {
      fieldsToSet.activityName = req.body.activityName;
    }
    if (req.body.elements) {
      fieldsToSet.elements = req.body.elements;
    }
    if (req.body.activityType) {
      fieldsToSet.activityType = req.body.activityType;
    }
//    if (req.body.colorTag) {
//      fieldsToSet.colorTag = req.body.colorTag;
//    }
    if (req.body.thumbnail) {
      fieldsToSet.thumbnail = req.body.thumbnail;
    }
    if (req.body.activityTitle) {
      fieldsToSet.activityTitle = req.body.activityTitle;
    }
    if (typeof req.body.x !== "undefined") {
      fieldsToSet.x = req.body.x;
    }
    if (typeof req.body.y !== "undefined") {
      fieldsToSet.y = req.body.y;
    }
    if (typeof req.body.active !== "undefined") {
      fieldsToSet.active = req.body.active;
    }
    if (typeof req.body.first !== "undefined") {
      fieldsToSet.first = req.body.first;
    }
    if (typeof req.body.icon !== "undefined") {
      fieldsToSet.icon = req.body.icon;
    }
    if (typeof req.body.wordLists !== "undefined") {
      fieldsToSet.wordLists = req.body.wordLists;
    }
    if (typeof req.body.pluginApp !== "undefined") {
      fieldsToSet.pluginApp = req.body.pluginApp;
    }
    if (typeof req.body.pluginAppIcon !== "undefined") {
      fieldsToSet.pluginAppIcon = req.body.pluginAppIcon;
    }
    if (typeof req.body.checkPointIcon !== "undefined") {
      fieldsToSet.checkPointIcon = req.body.checkPointIcon;
    }
//    var fieldsToSet = {
////      isComplete: req.body.isComplete,
//      activityName: req.body.activityName,
//      elements: req.body.elements,
//      colorTag: req.body.colorTag,
//      thumbnail: req.body.thumbnail,
//      activityTitle:req.body.activityTitle      
//    };

    req.app.db.models.Activity.findByIdAndUpdate(req.params.idActivity, fieldsToSet, function(err, activity) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome._id = req.params.idActivity;
      workflow.outcome.elements = req.body.elements;
      workflow.emit('response', activity);
    });
  });


  workflow.emit('validate');
};










exports.delete = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
//    if (!req.user.roles.admin.isMemberOf('root')) {
//      workflow.outcome.errors.push('You may not delete users.');
//      return workflow.emit('response');
//    }
//
//    if (req.user._id === req.params.id) {
//      workflow.outcome.errors.push('You may not delete yourself from user.');
//      return workflow.emit('response');
//    }

    workflow.emit('deleteActivity');
  });

  workflow.on('deleteActivity', function(err) {
    req.app.db.models.Activity.findByIdAndRemove(req.params.idActivity, function(err, activity) {
      if (err) {
        return workflow.emit('exception', err);
      }

      req.app.db.models.Lesson.findById(req.params.id, function(err, lesson) {
        if (err) {
          return workflow.emit('exception', err);
        }
        lesson.activities.remove(req.params.idActivity);
        if (!lesson.shortID) {
          lesson.shortID = shortId.generate();
        }
        lesson.save(function(err, activity) {
          if (err) {
            return workflow.emit('exception', err);
          }
          workflow.emit('response');
        });
      });
    });
  });

  workflow.emit('validate');
};
