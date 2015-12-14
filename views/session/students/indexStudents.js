'use strict';
var _ = require('underscore');

exports.find = function(req, res, next) {
  req.query.username = req.query.username ? req.query.username : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {};
  if (req.query.username) {
    filters.username = new RegExp('^.*?' + req.query.username + '.*$', 'i');
  }

  if (req.query.isActive) {
    filters.isActive = req.query.isActive;
  }

//  if (req.query.roles && req.query.roles === 'admin') {
//    filters['roles.admin'] = { $exists: true };
//  }
//
//  if (req.query.roles && req.query.roles === 'account') {
//    filters['roles.account'] = { $exists: true };
//  }
  var query = req.app.db.models.Classroom.findOne({path: req.params.path});
  query.select('name students._id students.username students.name students.isActive students.email');
  query.exec(function(err, results) {
    if (err) {
      return next(err);
    }
    console.log("classroom:" + results);
    var count = _.size(results.students);
    var output = {
      data: results.students,
      pages: {
        current: 1,
        prev: 0,
        hasPrev: false,
        next: 0,
        hasNext: false,
        total: 1
      },
      items: {
        begin: count ? 0 : 1,
        end: count,
        total: count,
      }
    };

    output.data = results.students;


    if (req.xhr) {
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
//      results.filters = req.query;
      res.send(output);
    }
    else {
//      results.filters = req.query;
      res.render('session/students/indexStudents', {data: {results: JSON.stringify(output), name: results.name}});
    }
  });
};

exports.read = function(req, res, next) {
//  req.app.db.models.Classroom.findOne({path: req.params.path, 'students._id': req.params.id}, function(err, classroom) {
  var query = req.app.db.models.Classroom.findOne({path: req.params.path, 
    owner:req.session.passport.user.id});
  query.select('students._id students.username students.name students.isActive students.email');
  query.exec(function(err, classroom) {
    if (err) {
      return next(err);
    }
    console.log("user found in:" + classroom);
    var user = _.find(classroom.students, function(student) {
      console.log(student._id + "  " + req.params.id);
      return (student._id.equals(req.params.id));
    });
    user = JSON.stringify(user);
    user = JSON.parse(user);
    user.path = req.params.path;
    user = JSON.stringify(user);
    console.log("user is " + user);

    if (req.xhr) {
      res.send(user);
    }
    else {
      res.render('session/students/detailsStudents', {data: {record: escape(user)}});
    }
  });
};

exports.create = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.username) {
      workflow.outcome.errors.push('Please enter a username.');
      return workflow.emit('response');
    }

    if (!/^[a-zA-Z0-9\-\_ ]+$/.test(req.body.username)) {
      workflow.outcome.errors.push('only use letters, numbers, -, _');
      return workflow.emit('response');
    }

    workflow.emit('duplicateUsernameCheck');
  });

  workflow.on('duplicateUsernameCheck', function() {
    req.app.db.models.Classroom.findOne({path: req.params.path,
      'students.usernameLower': req.body.username.toLowerCase()}, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (user) {
        workflow.outcome.errfor.username = 'username already taken';
        return workflow.emit('response');
      }

      workflow.emit('createUser');
    });
  });

  workflow.on('createUser', function() {
    var fieldsToSet = {
      username: req.body.username,
      usernameLower: req.body.username.toLowerCase(),
      name: req.body.username,
      classroomPath: req.params.path,
      search: [
        req.body.username
      ]
    };
    var student = new req.app.db.models.Student(fieldsToSet);
    req.app.db.models.Classroom.findOne({path: req.params.path}).exec(function(err, classroom) {
      if (err) {
        return workflow.emit('exception', err);
      }
      console.log(classroom);
      classroom.students.push(student);
      classroom.save(function(err) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.record = student;
        return workflow.emit('response');
      });

    });
//    req.app.db.models.User.create(fieldsToSet, function(err, user) {
//      if (err) {
//        return workflow.emit('exception', err);
//      }
//
//      workflow.outcome.record = user;
//      return workflow.emit('response');
//    });
  });

  workflow.emit('validate');
};

exports.update = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.isActive) {
      req.body.isActive = 'no';
    }

    if (!req.body.username) {
      workflow.outcome.errfor.username = 'required';
    }
    else if (!/^[a-zA-Z0-9\-\_ ]+$/.test(req.body.username)) {
      workflow.outcome.errfor.username = 'only use letters, numbers, \'-\', \'_\'';
    }

    if (!req.body.name) {
      workflow.outcome.errfor.name = 'required';
    }
    else if (!/^[a-zA-Z0-9\-\_ ]+$/.test(req.body.name)) {
      workflow.outcome.errfor.name = 'only use letters, numbers, \'-\', \'_\'';
    }

    if (!req.body.email) {
//      workflow.outcome.errfor.email = 'required';
    }
    else if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(req.body.email)) {
      workflow.outcome.errfor.email = 'invalid email format';
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('duplicateUsernameCheck');
  });

  workflow.on('duplicateUsernameCheck', function() {
    req.app.db.models.Classroom.findOne({path: req.params.path,
      'students.usernameLower': req.body.username.toLowerCase(),
      'students._id': {$ne: req.params.id}}, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (user) {
        workflow.outcome.errfor.username = 'username already taken';
        return workflow.emit('response');
      }

      workflow.emit('patchUser');
    });
  });


  workflow.on('patchUser', function() {
    var fieldsToSet = {
      isActive: req.body.isActive,
      username: req.body.username,
      usernameLower: req.body.usernameLower,
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      search: [
        req.body.username,
        req.body.email
      ]
    };
//    var student = new req.app.db.models.Student(fieldsToSet);
    req.app.db.models.Classroom.findOne({path: req.params.path}).exec(function(err, classroom) {
      if (err) {
        return workflow.emit('exception', err);
      }
      console.log(classroom);
//      classroom.students.push(student);
      var student = classroom.students.id(req.params.id);
      student.set(fieldsToSet);
      classroom.save(function(err) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.user = student;
        workflow.emit('response');
      });

    });
//    req.app.db.models.User.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, user) {
//      if (err) {
//        return workflow.emit('exception', err);
//      }
//
//      workflow.outcome.user = user;
//      workflow.emit('response');
//    });
  });


  workflow.emit('validate');
};

exports.password = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.newPassword) {
      workflow.outcome.errfor.newPassword = 'required';
    }

    if (!req.body.confirm) {
      workflow.outcome.errfor.confirm = 'required';
    }

    if (req.body.newPassword !== req.body.confirm) {
      workflow.outcome.errors.push('Passwords do not match.');
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('patchUser');
  });

  workflow.on('patchUser', function() {
    req.app.db.models.User.encryptPassword(req.body.newPassword, function(err, hash) {
      if (err) {
        return workflow.emit('exception', err);
      }

      var fieldsToSet = {password: hash};
//      var student = new req.app.db.models.Student(fieldsToSet);
      req.app.db.models.Classroom.findOne({path: req.params.path}).exec(function(err, classroom) {
        if (err) {
          return workflow.emit('exception', err);
        }
        console.log(classroom);
        var student = classroom.students.id(req.params.id);
        student.set(fieldsToSet);
        classroom.save(function(err) {
          if (err) {
            return workflow.emit('exception', err);
          }

          workflow.outcome.user = student;
          workflow.outcome.newPassword = '';
          workflow.outcome.confirm = '';
          workflow.emit('response');
        });

      });
//      req.app.db.models.User.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, user) {
//        if (err) {
//          return workflow.emit('exception', err);
//        }
//
//        user.populate('roles.admin roles.account', 'name.full', function(err, user) {
//          if (err) {
//            return workflow.emit('exception', err);
//          }
//
//          workflow.outcome.user = user;
//          workflow.outcome.newPassword = '';
//          workflow.outcome.confirm = '';
//          workflow.emit('response');
//        });
//      });
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

    workflow.emit('deleteUser');
  });

  workflow.on('deleteUser', function(err) {
    req.app.db.models.Classroom.findOne({path: req.params.path}).exec(function(err, classroom) {
      if (err) {
        return workflow.emit('exception', err);
      }
      classroom.students.id(req.params.id).remove();
      classroom.save(function(err) {
        if (err) {
          return workflow.emit('exception', err);
        }
//        console.log('Student deleted: ' + req.params.id);
        workflow.emit('response');
      });
    });

  });

  workflow.emit('validate');
};
