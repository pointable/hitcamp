'use strict';

exports.find = function(req, res, next){  
 
//  req.app.db.models.Classroom.findById(req.params.id).exec(function(err, classroom) {
  req.app.db.models.Classroom.findOne({path:req.params.path}).exec(function(err, classroom) {
    if (err) {
      return next(err);
    }
    if (!classroom){
      require('../http/index').http404(req,res);
      return;
    }
    //get activities
    req.app.db.models.Lesson.findById(classroom.lesson).populate('activities').populate('wordLists').exec(function(err, lesson) {
      if (err) {
        return next(err);
      }
      
      if (!lesson){
        lesson = {};
//        require('../http/index').http404(req,res);
//        return;
      }


      var sessionData = { 
        idSession: classroom._id,
        PIN: classroom.PIN,
        path: classroom.path,
        isTeacher: false,
        port: process.env.SOCKET_PORT,
        activities: lesson.activities,
        wordLists: lesson.wordLists,
        tiles:lesson.tiles,
        lessonName:lesson.lessonName,
        backgroundImageURL: lesson.backgroundImageURL,
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
        res.render('join/indexJoin', { 
          data: { results: JSON.stringify(classroom) }, 
          lesson: classroom,
          classroom:classroom,
          sessionData: JSON.stringify(sessionData)
        });
      }
    });
  });
};
//exports.teststudents = function(req, res, next){
//
//  req.app.db.models.Classroom.findById(req.params.id).exec(function(err, classroom) {
//    if (err) {
//      return next(err);
//    }
//    if (!classroom) {
//      return;
//    }
//    //get activities
//    req.app.db.models.Lesson.findById(classroom.lesson).populate('activities').exec(function(err, lesson) {
//      if (err) {
//        return next(err);
//      }
//
//      var sessionData = { 
//        idSession: req.params.id,
//        PIN: classroom.PIN,
//        isTeacher: false,
//        activities: lesson.activities
//      };
////      console.log("Session Data: ");
////      console.log(sessionData);
//
//      res.render('join/indexJoinTestStudents', { 
//        data: { results: JSON.stringify(classroom) }, 
//        lesson: classroom,
//        sessionData: JSON.stringify(sessionData),
//        idSession: req.params.id
//      });
//
//    });
//  });
//};
exports.getActivities = function(req, res, next){

  //need to check whether student valid request
  req.app.db.models.Classroom.findById(req.params.id).exec(function(err, classroom) {
    if (err) {
      return next(err);
    }
    if (!classroom){
      return;
    }
    
    //get activities
    req.app.db.models.Lesson.findById(classroom.lesson).populate('activities').populate('wordLists').exec(function(err, lesson) {
      if (err) {
        return next(err);
      }

      if (req.xhr) {
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.send(classroom);
      }
      else {
        var sessionData = { 
          idSession: req.params.id,
          PIN: classroom.PIN,
          isTeacher: false,
          activities: lesson.activities,
          tiles:lesson.tiles,
          lessonName:lesson.lessonName
        };
//        console.log("Session Data: ");
//        console.log(sessionData);
        
        res.render('join/indexJoin', { 
          data: { results: JSON.stringify(classroom) }, 
          lesson: classroom,
          sessionData: JSON.stringify(sessionData)
        });
      }
    });
  });

};

exports.requestpin = function(req, res, next){
  req.query.activityName = req.query.activityName ? req.query.activityName : '';

  req.app.db.models.Lesson.findById(req.params.id).populate('activities').exec(function(err, lesson) {
    if (err) {
      return next(err);
    }

//    console.log(lesson);
    if (req.xhr) {
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
//      results.filters = req.query;
      res.send(lesson);
    }
    else {
//      results.filters = req.query;

//web app below
      res.render('join/requestpin', { data: { results: JSON.stringify(lesson) }, lesson: lesson });
    }
  });

};

//post
exports.checkpin = function(req, res, next){

  console.log(req.body.pin);
  var query = req.app.db.models.Classroom.where({PIN: req.body.pin});
  
  query.findOne( function (err, session) {
    if (err) {
      return next(err);
    }
    if (session){
//      console.log(session);
      var response = {id: session._id};

      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      res.send(response);
    }else{
//      var response = {id: session._id};
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      res.send("");
    }
  });
};


exports.findDebug = function(req, res, next){
  req.query.activityName = req.query.activityName ? req.query.activityName : '';


  req.app.db.models.Lesson.findById(req.params.id).populate('activities').exec(function(err, lesson) {
    if (err) {
      return next(err);
    }

//    console.log(lesson);
    if (req.xhr) {
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
//      results.filters = req.query;
      res.send(lesson);
    }
    else {
//      results.filters = req.query;    
      res.render('adventures/activities/index', { data: { results: JSON.stringify(lesson) }, lesson: lesson });

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
exports.read = function(req, res, next){
//  console.log('test');
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
      res.redirect('adventures/activities/index');
    }
  });
};

//create activity
exports.create = function(req, res, next){
  console.log("create");
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    console.log(req.body);
//    if (!req.body.activityName) {
//      workflow.outcome.errors.push('Please enter an activity name.');
//      return workflow.emit('response');
//    }

    if (!/^[a-zA-Z0-9 \-\_]+$/.test(req.body.lessonName)) {
      workflow.outcome.errors.push('only use letters, numbers, -, _');
      return workflow.emit('response');
    }

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
      data: req.body.data
    };
    req.app.db.models.Activity.create(fieldsToSet, function(err, activity) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.record = activity;
      
      req.app.db.models.Lesson.findById(req.params.id, function (err, lesson){
        if (err) {
          return workflow.emit('exception', err);
        }
        console.log(activity._id);
//        console.log(require('mongoose').Types.ObjectId(activity._id));
        lesson.activities.push (require('mongoose').Types.ObjectId(activity._id.toString()));
//        console.log(lesson);
        lesson.save( function (err){
          if (err) {
            return workflow.emit('exception', err);
          }
          console.log('success');
          workflow.outcome._id = activity._id;
          return workflow.emit('response');
        });
      });          
    });
  });

  workflow.emit('validate');
};


//update activity
exports.update = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.activityName) {
      workflow.outcome.errfor.lessonName = 'required';
    }
    else if (!/^[a-zA-Z0-9 \-\_]+$/.test(req.body.lessonName)) {
      workflow.outcome.errfor.lessonName = 'only use letters, numbers, \'-\', \'_\'';
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('duplicateActivityCheck');
  });

  workflow.on('duplicateActivityCheck', function() {
    req.app.db.models.Activity.findOne({ activityName: req.body.activityName, _id: { $ne: req.params.id } }, function(err, activity) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (activity) {
        workflow.outcome.errfor.username = 'activity name has already been used';
        return workflow.emit('response');
      }

      workflow.emit('patchActivity');
    });
  });


  workflow.on('patchActivity', function() {
    var fieldsToSet = {
//      isComplete: req.body.isComplete,
      activityName: req.body.activityName
//      search: [
//        req.body.username,
//        req.body.email
//      ]
    };

    req.app.db.models.Activity.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, activity) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.emit('results', activity);
    });
  });


  workflow.emit('validate');
};










exports.delete = function(req, res, next){
//  console.log("test");
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
