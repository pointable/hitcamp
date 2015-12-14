'use strict';

//open session
exports.read = function(req, res, next) {
//  req.app.db.models.Classroom.findOne({path: req.params.path, 'students._id': req.params.id}, function(err, classroom) {
  var query = req.app.db.models.Classroom.findOne({path: req.params.path,
    owner: req.session.passport.user.id});
  query.select('lesson owner path PIN name isLocked');
  query.exec(function(err, classroom) {
    if (err) {
      return next(err);
    }
    if (!classroom) {
      return next(null);
    }
    console.log("Classroom details: " + classroom);
    if (req.xhr) {
      res.send(classroom);
    }
    else {
      res.render('session/settings/indexSessionSettings', {data: {record: JSON.stringify(classroom)}});
    }
  });
};



//update session
exports.update = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.name) {
      workflow.outcome.errfor.name = 'Classroom name required';
      return workflow.emit('response');
    }

//    if (req.body.name.length < 6) {
//      workflow.outcome.errfor.name = 'Minimum 6 characters.';
//      return workflow.emit('response');
//    }

    if (!/^[a-zA-Z0-9 \'\-]+$/.test(req.body.name)) {
      workflow.outcome.errfor.name = 'only use letters, numbers, \', - ';
      return workflow.emit('response');
    }

    if (!req.body.PIN) {
      workflow.outcome.errfor.PIN = 'enter a Classroom PIN.';
      return workflow.emit('response');
    }

    if (req.body.PIN.length < 4) {
      workflow.outcome.errfor.PIN = 'minimum 4 characters.';
      return workflow.emit('response');
    }

    if (!req.body.path) {
      workflow.outcome.errfor.path = 'enter a path name.';
      return workflow.emit('response');
    }

    if (req.body.path.length < 6) {
      workflow.outcome.errfor.path = 'minimum 6 characters.';
      return workflow.emit('response');
    }

    if (!/^[a-zA-Z0-9\-]+$/.test(req.body.path)) {
      workflow.outcome.errfor.path = 'only use letters, numbers, or -';
      return workflow.emit('response');
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('duplicateCheck');
  });

  workflow.on('duplicateCheck', function() {
    if (req.body.path === req.params.path) {
      //unchanged
      workflow.emit('patch');
    } else {
      req.app.db.models.Classroom.findOne({path: req.body.path}, function(err, classroom) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (classroom) {
//          workflow.outcome.errors.push('The chosen Classroom address has already been taken.');
          workflow.outcome.errfor.path = 'Chosen Classroom address has already been taken.';
          return workflow.emit('response');
        }

        workflow.emit('patch');
      });
    }
  });


  workflow.on('patch', function() {
    var fieldsToSet = {
      name: req.body.name,
      path: req.body.path.toLowerCase(),
////      lesson: req.params.idLesson,
//      owner: userID,
      PIN: req.body.PIN,
      search: [
        req.body.path
      ]
    };

    req.app.db.models.Classroom.findOneAndUpdate({path: req.params.path}, fieldsToSet, function(err, classroom) {
      if (err) {
        return workflow.emit('exception', err);
      }
      if (!classroom) {
        return workflow.emit('exception', "Classroom not found");
      }
//      console.log('success saved: ' + classroom);

      var session = req.app.sessions[String(classroom.id)];
      if (session) {
//        console.log("found session");
        var plugin = session.plugins.PLUGIN_HANDLER;
        if (plugin) {
          plugin.classroomSettingsChanged(req.app.socketio, req.body.path);
        }
      }

      workflow.outcome.classroom = classroom;
      return workflow.emit('response');
//      workflow.emit('results', classroom);
    });
  });


  workflow.emit('validate');
};
