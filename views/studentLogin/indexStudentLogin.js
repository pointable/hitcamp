'use strict';

exports.init = function(req, res, next) {
  if (false) {//req.isAuthenticated()) {
    res.redirect(req.user.defaultReturnUrl());
  }
  else {
    req.params.path = req.params.path.toLowerCase();

    req.app.db.models.Classroom.findOne({path: req.params.path}).populate({path: 'lesson', select: 'backgroundImageURL'})
        .exec(function(err, classroom) {
          if (err) {
            return next(err);
          }
          if (!classroom) {
            return next(false);
          }
          var backgroundImageURL = "about:blank";
          if (classroom.lesson) {
            backgroundImageURL = classroom.lesson.backgroundImageURL;
          }
//          console.log(classroom);
          res.render('studentLogin/indexStudentLogin', {
            oauthMessage: '',
            data: req.params.path,
            name: classroom.name,
            backgroundImageURL: backgroundImageURL,
            classroomPath: '/' + classroom.path 
          });
        });

  }
};

exports.signup = function(req, res) {
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.username) {
      workflow.outcome.errfor.username = 'required';
    }
    else if (!/^[a-zA-Z0-9\-\_ ]+$/.test(req.body.username)) {
      workflow.outcome.errfor.username = 'only use letters, numbers, \'-\', \'_\'';
    }
    if (!req.body.pin) {
      //workflow.outcome.errfor.pin = 'required';
    }
    if (!req.body.password) {
      workflow.outcome.errfor.password = 'required';
    } else if (req.body.password.length < 6) {
      workflow.outcome.errfor.password = 'Minimum 6 characters';
    }
    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('duplicateUsernameCheck');
  });

  workflow.on('duplicateUsernameCheck', function() {
    req.app.db.models.Classroom.findOne({path: req.params.path, 'students.usernameLower': req.body.username.toLowerCase()}, function(err, user) {
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
    req.app.db.models.User.encryptPassword(req.body.password, function(err, hash) {
      if (err) {
        return workflow.emit('exception', err);
      }

      var fieldsToSet = {
        isActive: 'yes',
        name: req.body.username,
        username: req.body.username,
        usernameLower: req.body.username.toLowerCase(),
        classroomPath: req.params.path,
//        pin: req.body.pin,
        password: hash,
        roles: {
          student: true
        },
        search: [
          req.body.username
        ]
      };
//      console.log(fieldsToSet);
      var student = new req.app.db.models.Student(fieldsToSet);
      req.app.db.models.Classroom.findOne({path: req.params.path}).exec(function(err, classroom) {
        if (err) {
          return workflow.emit('exception', err);
        }
        if (!classroom) {
          return workflow.emit('exception');
        }
//        console.log(classroom);
        classroom.students.push(student);
        classroom.save(function(err) {
          if (err) {
            return workflow.emit('exception', err);
          }

          workflow.user = student;
          workflow.emit('logUserIn');
        });

      });
//      req.app.db.models.User.create(fieldsToSet, function(err, user) {
//        if (err) {
//          return workflow.emit('exception', err);
//        }
//
//      });
    });
  });



  workflow.on('logUserIn', function() {
//    console.log("logging in:");
    req._passport.instance.authenticate('student', function(err, user, info) {
      if (err) {
        return workflow.emit('exception', err);
      }

//        console.log("logged in: "+ user);
      if (!user) {
        workflow.outcome.errors.push('Login failed.');
        return workflow.emit('response');
      }
      else {
        req.login(user, function(err) {
          if (err) {
            return workflow.emit('exception', err);
          }
//          console.log("final logged in: "+ user);
//          console.log(user.defaultReturnUrl());
          workflow.outcome.defaultReturnUrl = user.defaultReturnUrl();
          workflow.emit('response');
        });
      }
    })(req, res);
  });

  workflow.emit('validate');
};

exports.login = function(req, res) {
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.username) {
      workflow.outcome.errfor.username = 'required';
    }

    if (!req.body.password) {
      workflow.outcome.errfor.password = 'required';
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('abuseFilter');
  });

  workflow.on('abuseFilter', function() {
    var getIpCount = function(done) {
      var conditions = {ip: req.ip};
      req.app.db.models.LoginAttempt.count(conditions, function(err, count) {
        if (err) {
          return done(err);
        }

        done(null, count);
      });
    };

    var getIpUserCount = function(done) {
      var conditions = {ip: req.ip, user: req.body.username};
      req.app.db.models.LoginAttempt.count(conditions, function(err, count) {
        if (err) {
          return done(err);
        }

        done(null, count);
      });
    };

    var asyncFinally = function(err, results) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (results.ip >= req.app.config.loginAttempts.forIp || results.ipUser >= req.app.config.loginAttempts.forIpAndUser) {
        workflow.outcome.errors.push('You\'ve reached the maximum number of login attempts. Please try again later.');
        return workflow.emit('response');
      }
      else {
        workflow.emit('attemptLogin');
      }
    };

    require('async').parallel({ip: getIpCount, ipUser: getIpUserCount}, asyncFinally);
  });

  workflow.on('attemptLogin', function() {
    req._passport.instance.authenticate('student', function(err, user, info) {
      if (err) {
        return workflow.emit('exception', err);
      }
      if (!user) {
        var fieldsToSet = {ip: req.ip, user: req.body.username};
        req.app.db.models.LoginAttempt.create(fieldsToSet, function(err, doc) {
          if (err) {
            return workflow.emit('exception', err);
          }

//          console.log(doc);
          workflow.outcome.errors.push('Account not valid.');
          return workflow.emit('response');
        });
      }
      else {
//        console.log("continue");
        user.classroomPath = req.params.path;
        req.login(user, function(err) {
          if (err) {
            return workflow.emit('exception', err);
          }

//          console.log("final logged in: " + user);
          workflow.emit('response');
        });
      }
    })(req, res);
  });

  workflow.emit('validate');
};

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/' + req.params.path);
};


