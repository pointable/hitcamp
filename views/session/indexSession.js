'use strict';
var _ = require('underscore');
exports.findSessions = function(req, res, next) {
//  console.log(req.session.passport.user);
  var userID = req.session.passport.user.id;

  req.query.name = req.query.name ? req.query.name : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 30;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '-_id';

  var filters = {};

  filters.owner = userID;

  if (req.query.name) {
    filters.name = new RegExp('^.*?' + req.query.name + '.*$', 'i');
  }

  if (req.query.isComplete) {
    filters.isComplete = req.query.isComplete;
  }

//  console.log('Retrieve UserID:' + userID);

  req.app.db.models.User.findById(userID).populate('classrooms').exec(function(err, user) {
    if (err) {// TODO handle err
      console.log(err);
    }
//    console.log('Classrooms :' + user.lessons);
  });

  var queryKeys = 'name path owner isComplete PIN lesson isLocked';
  if (req.user.canPlayRoleOf('admin')) {
    queryKeys = 'name path isComplete PIN lesson';
    delete filters.owner;
  }

  req.app.db.models.Classroom.pagedFind({
    filters: filters,
    keys: queryKeys,
    limit: req.query.limit,
    page: req.query.page,
    sort: req.query.sort
  }, function(err, results) {
    if (err) {
      return next(err);
    }
//    console.log(results);
    req.app.db.models.User.findById(userID).populate({path: 'lessons',
      select: 'shortID lessonName backgroundThumbnailURL'}).exec(function(err, user) {
      if (err) {
        return next(err);
      }
//      console.log(user);
      if (!_.findWhere(user.lessons, {_id: require('mongoose').Types.ObjectId(req.app.config.lesson.lessonIDs[0])})) {
        user.lessons.push({_id: require('mongoose').Types.ObjectId(req.app.config.lesson.lessonIDs[0]),
          lessonName: req.app.config.lesson.lessonName, backgroundThumbnailURL: req.app.config.lesson.backgroundThumbnailURL, isLocked: true});
      }

      if (req.xhr) {
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        results.filters = req.query;
        res.send(results);
      }
      else {
        results.filters = req.query;
        res.render('session/indexClassroomListNew', {
          data: {
            results: JSON.stringify(results),
            lessons: JSON.stringify(user.lessons),
            hideGuide: user.hideGuide
          }
        });
      }
    });
  });
};

exports.find = function(req, res, next) {
//  req.query.name = req.query.name ? req.query.name : '';
//  req.app.db.models.Classroom.findById(req.params.id).exec(function(err, classroom) {
//,owner:req.session.passport.user
  req.params.path = req.params.path.toLowerCase();

  req.app.db.models.Classroom.findOne({path: req.params.path}).exec(function(err, classroom) {
    if (err) {
      return next(err);
    }
    if (!classroom) {
      require('../http/index').http404(req, res);
      return;
    }

    //get activities
    req.app.db.models.Lesson.findById(classroom.lesson).populate('activities').populate('wordLists').exec(function(err, lesson) {
      if (err) {
        return next(err);
      }

      if (!lesson) {
        lesson = {};
//        require('../http/index').http404(req,res);
//        return;
      }

      var isTeacher = false;
      if (classroom.owner && req.session.passport.user) {
        if (classroom.owner.equals(req.session.passport.user.id)) {
          isTeacher = true;
        }
      }

//      if (classroom.isTest) {
//        isTeacher = true;
//      }

      var serverHostname = "hit.camp";
      if (process.env.SERVER_HOSTNAME && process.env.SERVER_HOSTNAME != "") {
        serverHostname = process.env.SERVER_HOSTNAME;
      }

      var sessionData = {
        idSession: classroom._id,
        PIN: classroom.PIN,
        path: classroom.path,
        isTeacher: isTeacher,
        port: process.env.SOCKET_PORT,
        activities: lesson.activities,
        wordLists: lesson.wordLists,
        tiles: lesson.tiles,
        lessonName: lesson.lessonName,
        backgroundImageURL: lesson.backgroundImageURL,
//        backgroundImageJSON: lesson.backgroundImageJSON,
        isLocked: lesson.isLocked,
        idLesson: lesson._id,
//        isTest: classroom.isTest,
        isDevelopment: (process.env.NODE_ENV !== 'production')
      };
//      console.log("Session Data: ");
//      console.log(sessionData);

      if (req.xhr) {
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.send(sessionData);
      }
      else {
        var dataForRender = {
          data: {results: JSON.stringify(classroom)},
          classroom: classroom,
          fullPath: req.getUrl(),
//          lesson: lesson,
          sessionData: JSON.stringify(sessionData),
          serverHostname: serverHostname
        };

        if (classroom.owner.equals(req.session.passport.user.id)) {
          res.render('session/indexSession', dataForRender);
        } else {
          //not correct owner
//          res.render('join/indexJoin', dataForRender);
//          var backgroundImageURL = "about:blank";
//          if (classroom.lesson) {
//            backgroundImageURL = classroom.lesson.backgroundImageURL;
//          }
          res.render('studentLogin/indexStudentLogin', {
            oauthMessage: '',
            data: classroom.path,
            name: classroom.name,
            backgroundImageURL: lesson.backgroundImageURL,
            isTeacher: true,
            classroomPath: '/' + classroom.path
          });
        }
      }

      //check and create classroom session instance if not exist
      if (!req.app.sessions[String(classroom._id)]) {
        var session = new req.app.Session(classroom._id, classroom.lesson, req.app.redis, req.app.db);
        req.app.sessions[String(classroom._id)] = session;
        console.log("Create Session: " + classroom.path);
      } else {
//        console.log(classroom.path + " already existed");
      }
    });
  });
};

exports.teststudents = function(req, res, next) {
//  req.query.name = req.query.name ? req.query.name : '';
//  req.app.db.models.Classroom.findById(req.params.id).exec(function(err, classroom) {
  req.app.db.models.Classroom.findOne({path: req.params.path}).exec(function(err, classroom) {

    console.log(req.params.path);

    if (err) {
      return next(err);
    }
    if (!classroom) {
      return;
    }

    //get activities
    req.app.db.models.Lesson.findById(classroom.lesson).populate('activities').exec(function(err, lesson) {
      if (err) {
        return next(err);
      }

      var sessionData = {
        idSession: classroom._id,
        PIN: classroom.PIN,
        isTeacher: true,
        isTest: classroom.isTest,
//        activities: lesson.activities
      };

      var idNumber = req.params.idNumber;

      res.render('session/indexSessionTestStudents' + idNumber, {
        data: {results: JSON.stringify(classroom)},
        lesson: lesson,
        classroomPath: req.getHost() + '/' + classroom.path,
        classroom: classroom,
        sessionData: JSON.stringify(sessionData),
        idSession: req.params.path,
        pathData: "",
        idLesson: false
      });
    });
  });
};

exports.preview = function(req, res, next) {
//  req.query.name = req.query.name ? req.query.name : '';
//  req.app.db.models.Classroom.findById(req.params.id).exec(function(err, classroom) {

  var userID = req.session.passport.user.id;

  req.app.db.models.Classroom.findOne({owner: userID, isLocked: true}).exec(function(err, classroom) {
    req.params.path = classroom.path;

    if (err) {
      return next(err);
    }
    if (!classroom) {
      return;
    }

    classroom.lesson = req.params.idLesson;
    classroom.save(function(err, classroom) {
      if (err) {
        return next(err);
      }
      //get activities
      req.app.db.models.Lesson.findById(classroom.lesson).populate('activities').exec(function(err, lesson) {
        if (err) {
          return next(err);
        }

        var sessionData = {
          idSession: classroom._id,
          PIN: classroom.PIN,
          isTeacher: true,
          isTest: classroom.isTest,
//        activities: lesson.activities
        };

        var idNumber = req.params.idNumber;
        var pathDataFull = req.query.path;
        if (pathDataFull) {
          var pathData = new Buffer(pathDataFull, 'base64'); // Ta-da
          pathDataFull = "?path=" + pathDataFull;
        } else {
          pathData = "";
          pathDataFull = "";
        }

        res.render('session/indexSessionTestStudents' + idNumber, {
          data: {results: JSON.stringify(classroom)},
          lesson: lesson,
          classroomPath: req.getHost() + '/' + classroom.path,
          classroom: classroom,
          sessionData: JSON.stringify(sessionData),
          idSession: req.params.path,
          pathData: pathData,
          pathDataFull: pathDataFull,
          idLesson: lesson._id
        });
      });
    });

    var session = req.app.sessions[String(classroom._id)];

//    console.log(session);
    if (session) {
      var plugin = session.plugins.PLUGIN_HANDLER;
      if (plugin) {
        plugin.resetClassroom(req.app.socketio);
      }
    }
  });
};

//open session - later
exports.read = function(req, res, next) {
  console.log('test');
  req.app.db.models.Activity.findById(req.params.id).exec(function(err, activity) {
    if (err) {
      return next(err);
    }

    if (req.xhr) {
      res.send(activity);
    }
    else {
//      res.render('adventures/index', { data: { record: escape(JSON.stringify(lesson)) } });
//    todo redirect to new lesson editor;
      res.redirect('session/indexSession');
    }
  });
};

//create session
exports.create = function(req, res, next) {
//  console.log(req);
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
//    console.log(req.body);
    if (!req.body.name) {
      workflow.outcome.errors.push('Please enter a Classroom name.');
      return workflow.emit('error');
    }

    if (req.body.name.length < 6) {
      workflow.outcome.errors.push('Minimum 6 characters.');
//      var error = 'Minimum 6 characters.';
//      return workflow.emit('response');
//      console.log(workflow.outcome.errors);
      return workflow.emit('error');
    }

    if (!/^[a-zA-Z0-9 \'\-]+$/.test(req.body.name)) {
      workflow.outcome.errors.push('Only use letters, numbers, \', -');
      return workflow.emit('error');
    }
    if (!req.body.path) {
//      workflow.outcome.errors.push('Please enter a path name.');
//      return workflow.emit('response');
      var generatedPathName = req.body.name.replace(/[^a-zA-Z0-9\-]/g, '');
      generatedPathName = generatedPathName.toLowerCase();
      req.body.path = generatedPathName;
    }
    if (req.body.path.replace(" ", "").length < 6) {
      workflow.outcome.errors.push('Minimum 6 characters.');
//      var error = 'Minimum 6 characters.';
//      return workflow.emit('response');
//      console.log(workflow.outcome.errors);
      return workflow.emit('error');
    }

//    if (!/^[a-zA-Z0-9\-\_]+$/.test(req.body.path)) {
//      workflow.outcome.errors.push('only use letters, numbers, -, _');
//      return workflow.emit('response');
//    }
    workflow.emit('duplicateNameCheck');
  });

  workflow.on('duplicateNameCheck', function() {
    req.app.db.models.Classroom.findOne({path: req.body.path}, function(err, classroom) {
      if (err) {
        return workflow.emit('error', err);
      }

      if (classroom) {
        workflow.outcome.errors.push('The chosen Classroom address has already been taken.');
        return workflow.emit('error');
      }

      workflow.emit('createClassroom');
    });
  });


  workflow.on('createClassroom', function() {

    var userID = req.session.passport.user.id;

    var fieldsToSet = {
      name: req.body.name,
      path: req.body.path,
//      lesson: req.params.idLesson,
      owner: userID,
      PIN: Math.floor((Math.random() * 8999) + 1000),
      search: [
        req.body.path
      ]
//      between 1000 & 9999
    };
    req.app.db.models.Classroom.create(fieldsToSet, function(err, classroom) {
      if (err) {
        return workflow.emit('error', err);
      }

      workflow.outcome.record = classroom;

      var session = new req.app.Session(String(classroom._id), null, req.app.redis, req.app.db);
      req.app.sessions[String(classroom._id)] = session;


      req.app.db.models.User.findById(userID, function(err, user) {
        if (err) {
          return workflow.emit('error', err);
        }
        user.classrooms.push(require('mongoose').Types.ObjectId(classroom._id.toString()));
        user.save(function(err) {
          if (err) {
            return workflow.emit('error', err);
          }

          //success
          return workflow.emit('success');
        });
      });
//      res.redirect('classroom/'+ classroom._id + '/');
//      return workflow.emit('response');
    });

//    function pad (str, max) {
//      return str.length < max ? pad("0" + str, max) : str;
//    }
  });

  workflow.emit('validate');
};

//create session
exports.createTestClassroom = function(req, res, user, lessonID) {
  var userID = user._id;
  var accountID = user.roles.account;
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    req.app.db.models.Account.findOne({_id: accountID}, function(err, account) {
//      console.log(user);
      if (err) {
        return next(err);
      }

      workflow.userName = account.name;

      workflow.emit('generateName');
    });
  });

  workflow.on('generateName', function() {
    req.body.idLesson = lessonID;
    var name = workflow.userName.first;
    if (!name || name === "") {
      name = workflow.userName.full;
    }

    req.body.name = name + "'s Test Class";
//    req.body.path = userName.first + "sClassroom";
    var generatedPathName = req.body.name.replace(/[^a-zA-Z0-9]/g, '');
    generatedPathName = generatedPathName.toLowerCase();

    req.app.db.models.Classroom.findOne({path: generatedPathName}, function(err, classroom) {
      //check duplicate
      if (!classroom) {
        req.body.path = generatedPathName;
        workflow.emit('createClassroom');
      } else {
        generatedPathName += Math.floor((Math.random() * 9999));

        req.app.db.models.Classroom.findOne({path: generatedPathName}, function(err, classroom) {
          //check duplicate
          if (!classroom) {
            req.body.path = generatedPathName;
            workflow.emit('createClassroom');
          } else {
            generatedPathName += Math.floor((Math.random() * 9999));

            req.body.path = generatedPathName;
            workflow.emit('createClassroom');
          }
        });
      }
    });
  });


  workflow.on('createClassroom', function() {
    var fieldsToSet = {
      name: req.body.name,
      path: req.body.path,
      lesson: req.body.idLesson,
      owner: userID,
      isLocked: true,
      PIN: Math.floor((Math.random() * 8999) + 1000),
      search: [
        req.body.path
      ]
//      between 1000 & 9999
    };

//    console.log(fieldsToSet);
    req.app.db.models.Classroom.create(fieldsToSet, function(err, classroom) {
      if (err) {
        return;// workflow.emit('exception', err);
      }
      workflow.outcome.record = classroom;

      var session = new req.app.Session(String(classroom._id), lessonID, req.app.redis, req.app.db);
      req.app.sessions[String(classroom._id)] = session;

      req.app.db.models.User.findById(userID, function(err, user) {
        if (err) {
          return;// workflow.emit('exception', err);
        }
        user.siteCreated = true;
        user.classrooms.push(require('mongoose').Types.ObjectId(classroom._id.toString()));
//        console.log(user);
        user.save(function(err) {
          if (err) {
            return;// workflow.emit('exception', err);
          }
          return;
//          return workflow.emit('response');
        });
      });
//      res.redirect('classroom/'+ classroom._id + '/');
//      return workflow.emit('response');
    });
  });

  workflow.emit('validate');
};


//update session
exports.update = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);
  workflow.on('validate', function() {
//    if (!req.body.idLesson) {
//      workflow.outcome.errfor.lesson = 'required';
//    }
    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('patch');
  });
  workflow.on('patch', function() {
    if (!req.body.idLesson || req.body.idLesson === "undefined") {
      req.app.db.models.Classroom.findById(req.params.id, function(err, classroom) {
        if (err) {
          return workflow.emit('exception', err);
        }
        classroom.lesson = undefined;
        classroom.save();
        var session = req.app.sessions[String(req.params.id)];

        if (session) {
          var plugin = session.plugins.PLUGIN_HANDLER;
          if (plugin) {
            plugin.activityChanged(req.app.socketio, req.body.idLesson);
          }
        }
        return workflow.emit('response');
      });
    } else {
      var fieldsToSet = {
        lesson: req.body.idLesson,
      };

      req.app.db.models.Classroom.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, classroom) {
        if (err) {
          return workflow.emit('exception', err);
        }
        var session = req.app.sessions[String(req.params.id)];
        if (session) {
          var plugin = session.plugins.PLUGIN_HANDLER;
          if (plugin) {
            plugin.activityChanged(req.app.socketio, req.body.idLesson);
          }
        }

        return workflow.emit('response');
//      workflow.emit('results', classroom);
      });
    }
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

    workflow.emit('delete');
  });

  workflow.on('delete', function(err) {
//    req.app.db.models.Classroom.findByIdAndRemove(req.params.id, function(err, classroom) {
    req.app.db.models.Classroom.findOneAndRemove({path: req.params.path, owner: req.session.passport.user.id}).exec(function(err, classroom) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.classroom = classroom;
      if (!classroom) {
        return workflow.emit('exception');
      }
//      var session = new req.app.Session(String(classroom._id));
      var session = req.app.sessions[String(classroom._id)];
      if (session) {
        delete req.app.sessions[String(classroom._id)];
        session = null;
      }
      req.app.db.models.User.findById(req.session.passport.user.id).exec(function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }
//        console.log(user.classrooms);
//        console.log("ID: " + classroom._id);
        user.classrooms.remove(require('mongoose').Types.ObjectId(classroom._id));
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

  workflow.emit('validate');
};
