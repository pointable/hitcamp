'use strict';

var shortId = require('shortid');

exports.find = function(req, res, next){
  req.app.db.models.Lesson.findById(req.params.id).populate('activities').populate('wordLists').exec(function(err, lesson) {
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
      res.render('adventures/edit/indexEdit', { data: { results: JSON.stringify(lesson) }, lesson: lesson });
    }
  });

};

exports.findDebug = function(req, res, next){
  req.app.db.models.Lesson.findById(req.params.id).populate('wordLists').exec(function(err, lesson) {
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
      res.render('adventures/wordLists/indexWordLists', { data: { results: JSON.stringify(lesson) }, lesson: lesson });

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

exports.read = function(req, res, next){
//  console.log('test');
//check valid
  req.app.db.models.WordList.findById(req.params.idWordList).exec(function(err, wordList) {
//    console.log(wordList);
    if (err) {
      return next(err);
    }

    if (req.xhr) {
      res.send(wordList);
    }
    else {
//      res.render('adventures/index', { data: { record: escape(JSON.stringify(lesson)) } });
//    todo redirect to new lesson editor;
      res.redirect('adventures/' + req.params.id + '/word-lists/debug');
    }
  });
};

//create word list
exports.create = function(req, res, next){
//  console.log("create");
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

    workflow.emit('create');
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

  workflow.on('create', function() {
    var fieldsToSet = {
      title: req.body.title,
      words: req.body.words
    };
    req.app.db.models.WordList.create(fieldsToSet, function(err, wordList) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.record = wordList;
      
      req.app.db.models.Lesson.findById(req.params.id, function (err, lesson){
        if (err) {
          return workflow.emit('exception', err);
        }
//        console.log(wordList._id);
//        console.log(require('mongoose').Types.ObjectId(activity._id));
        lesson.wordLists.push (require('mongoose').Types.ObjectId(wordList._id.toString()));
//        console.log(lesson);
        if (!lesson.shortID){
          lesson.shortID = shortId.generate();
        }
        lesson.save( function (err){
          if (err) {
            return workflow.emit('exception', err);
          }
//          console.log('success');
          workflow.outcome._id = wordList._id;
          return workflow.emit('response');
        });
      });          
    });
  });

  workflow.emit('validate');
};


//update word list
exports.update = function(req, res, next){
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

    workflow.emit('duplicateCheck');
  });

  workflow.on('duplicateCheck', function() {
    workflow.emit('patch');
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


  workflow.on('patch', function() {
   
   var fieldsToSet = {};
   
   if (req.body.title) {
     fieldsToSet.title = req.body.title;
   }
   if (req.body.words) {
     fieldsToSet.words = req.body.words;
   }
   if (req.body.thumbnail) {
     fieldsToSet.thumbnail = req.body.thumbnail;
   }

    req.app.db.models.WordList.findByIdAndUpdate(req.params.idWordList, 
        fieldsToSet, function(err, wordList) {
      if (err) {
        return workflow.emit('exception', err);
      }
      
      workflow.outcome._id = req.params.idWordList;
      workflow.outcome.words = req.body.words;
      workflow.emit('response', wordList);
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

    workflow.emit('delete');
  });

  workflow.on('delete', function(err) {
    req.app.db.models.WordList.findByIdAndRemove(req.params.idWordList, function(err, wordList) {
      if (err) {
        return workflow.emit('exception', err);
      }
      
      req.app.db.models.Lesson.findById(req.params.id, function(err, lesson) {
        if (err) {
          return workflow.emit('exception', err);
        }
        lesson.wordLists.remove(req.params.idWordList);
        lesson.save(function(err, wordList) {
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
