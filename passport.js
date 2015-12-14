'use strict';

var _ = require('underscore');

exports = module.exports = function(app, passport) {
  var LocalStrategy = require('passport-local').Strategy,
      TwitterStrategy = require('passport-twitter').Strategy,
      GitHubStrategy = require('passport-github').Strategy,
      FacebookStrategy = require('passport-facebook').Strategy,
      GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
      TumblrStrategy = require('passport-tumblr').Strategy;

  passport.use(new LocalStrategy(
      function(username, password, done) {
        var conditions = {isActive: 'yes'};
        if (username.indexOf('@') === -1) {
          conditions.username = username;
        }
        else {
          conditions.email = username;
        }

        app.db.models.User.findOne(conditions, function(err, user) {
          if (err) {
            return done(err);
          }

          if (!user) {
            return done(null, false, {message: 'Not valid'});
          }

          app.db.models.User.validatePassword(password, user.password, function(err, isValid) {
            if (err) {
              return done(err);
            }

            if (!isValid) {
              return done(null, false, {message: 'Not valid'});
            }

            return done(null, user);
          });
        });
      }
  ));

  passport.use('student', new LocalStrategy(
      {passReqToCallback: true},
  function(req, username, password, done) {
    var classroomPath = req.params.path;
//      console.log("student for " + classroomPath);
    //maybe wrong. outputting all
    req.app.db.models.Classroom.findOne({path: classroomPath, 
      'students.usernameLower': username.toLowerCase()}, function(err, classroom) {
      if (err) {
        return done(err);
      }
//        console.log("user found in:" + classroom);
      if (!classroom) {
        return done(null, false, {message: 'Not valid'});
      }
      var user = _.find(classroom.students, function(student) {
        return (student.usernameLower === username.toLowerCase());
      });
//      console.log("user is " + user);
      if (!user || !user.password) {
        return done(null, false, {message: 'Not valid'});
      }

      app.db.models.User.validatePassword(password, user.password, function(err, isValid) {
        if (err) {
          console.log(err);
          return done(err);
        }
//        console.log("validating password");
        if (!isValid) {
          return done(null, false, {message: 'Not valid'});
        }

        return done(null, user);
      });
    });
  }
  ));

  if (app.config.oauth.twitter.key) {
    passport.use(new TwitterStrategy({
      consumerKey: app.config.oauth.twitter.key,
      consumerSecret: app.config.oauth.twitter.secret
    },
    function(token, tokenSecret, profile, done) {
      done(null, false, {
        token: token,
        tokenSecret: tokenSecret,
        profile: profile
      });
    }
    ));
  }

  if (app.config.oauth.github.key) {
    passport.use(new GitHubStrategy({
      clientID: app.config.oauth.github.key,
      clientSecret: app.config.oauth.github.secret,
      customHeaders: {"User-Agent": app.config.projectName}
    },
    function(accessToken, refreshToken, profile, done) {
      done(null, false, {
        accessToken: accessToken,
        refreshToken: refreshToken,
        profile: profile
      });
    }
    ));
  }

  if (app.config.oauth.facebook.key) {
    passport.use(new FacebookStrategy({
      clientID: app.config.oauth.facebook.key,
      clientSecret: app.config.oauth.facebook.secret
    },
    function(accessToken, refreshToken, profile, done) {
      done(null, false, {
        accessToken: accessToken,
        refreshToken: refreshToken,
        profile: profile
      });
    }
    ));
  }

  if (app.config.oauth.google.key) {
    passport.use(new GoogleStrategy({
      clientID: app.config.oauth.google.key,
      clientSecret: app.config.oauth.google.secret
    },
    function(accessToken, refreshToken, profile, done) {
      done(null, false, {
        accessToken: accessToken,
        refreshToken: refreshToken,
        profile: profile
      });
    }
    ));
  }

  if (app.config.oauth.tumblr.key) {
    passport.use(new TumblrStrategy({
      consumerKey: app.config.oauth.tumblr.key,
      consumerSecret: app.config.oauth.tumblr.secret
    },
    function(token, tokenSecret, profile, done) {
      done(null, false, {
        token: token,
        tokenSecret: tokenSecret,
        profile: profile
      });
    }
    ));
  }

  passport.serializeUser(function(user, done) {
    var dataToStore = {id: user._id};

    if (user.roles && (user.roles.account || user.roles.admin)) {
      dataToStore.isStudent = false;
    } else {
      dataToStore.isStudent = true;
      dataToStore.classroomPath = user.classroomPath;
      dataToStore.username = user.username;
    }
//    console.log("serialize: " + dataToStore);
    done(null, dataToStore);
  });

  passport.deserializeUser(function(storedData, done) {
    var id = storedData.id;
//    console.log("deserialize: " + JSON.stringify(storedData));
    if (storedData.isStudent) {
      app.db.models.Classroom.findOne({path: storedData.classroomPath,
        'students._id': id}, function(err, classroom) {
        if (!classroom){
          done(null, false);
        }else {        
          var student = classroom.students.id(id);
//          console.log(student);
          done(err, student);
        }
      });
    } else { //admin or normal account
      app.db.models.User.findOne({_id: id}).populate('roles.admin').populate('roles.account').exec(function(err, user) {
        if (user && user.roles && user.roles.admin) {
          user.roles.admin.populate("groups", function(err, admin) {
            done(err, user);
          });
        }
        else {
          done(err, user);
        }
      });
    }

  });
};
