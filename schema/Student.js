'use strict';

exports = module.exports = function(app, mongoose) {

  var studentSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    usernameLower: {type: String},
    name: String,
    password: String,
    email: {type: String},
    isActive: String,
    roles: {
      student: {type: Boolean, default: true}
    },
    classroomPath: String,
    data: {type: String, default: ''},
    timeCreated: {type: Date, default: Date.now}
  });

  studentSchema.methods.canPlayRoleOf = function(role) {
    if (role === "student" && this.roles.student) {
      console.log(role);
      return true;
    }

    return false;
  };

  studentSchema.methods.defaultReturnUrl = function() {
    var returnUrl = '/';
    if (this.canPlayRoleOf('student')) {
      returnUrl = '/' + this.classroomPath;
    }
    return returnUrl;
  };

  studentSchema.statics.encryptPassword = function(password, done) {
    var bcrypt = require('bcrypt-nodejs');
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        return done(err);
      }

      bcrypt.hash(password, salt, null, function(err, hash) {
        done(err, hash);
      });
    });
  };

  studentSchema.statics.validatePassword = function(password, hash, done) {
    var bcrypt = require('bcrypt-nodejs');
    bcrypt.compare(password, hash, function(err, res) {
      done(err, res);
    });
  };


//  studentSchema.index({ username: 1 }, { unique: true });

//  studentSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Student', studentSchema);

};
