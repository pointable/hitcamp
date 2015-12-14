'use strict';

exports = module.exports = function(app, mongoose) {
  var userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    password: String,
    email: {type: String, unique: true},
    roles: {
      admin: {type: mongoose.Schema.Types.ObjectId, ref: 'Admin'},
      account: {type: mongoose.Schema.Types.ObjectId, ref: 'Account'}
    },
    isActive: String,
    hideGuide: Boolean,
    siteCreated: {type: Boolean, default: false},
//    tutorialSeen: {
//      mainClassrooms: {type: Boolean, default: false},
//      mainAdventures: {type: Boolean, default: false}
//    },
    timeCreated: {type: Date, default: Date.now},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    twitter: {},
    github: {},
    facebook: {},
    google: {},
    tumblr: {},
    search: [String],
    lessons: [{type: mongoose.Schema.Types.ObjectId, ref: 'Lesson'}],
    classrooms: [{type: mongoose.Schema.Types.ObjectId, ref: 'Classroom'}]
  });
//  userSchema.methods.isOwnerOf = function(classroom) {
//    if (classroom === "admin" && this.roles.admin) {
//      return true;
//    }
//    
//    return false;
//  };
  userSchema.methods.canPlayRoleOf = function(role) {
    if (role === "admin" && this.roles.admin) {
      return true;
    }

    if (role === "account" && (this.roles.account || this.roles.admin)) {
      return true;
    }

    return false;
  };
  
  userSchema.methods.defaultReturnUrl = function() {
    var returnUrl = '/';
    if (this.canPlayRoleOf('account')) {
      returnUrl = '/';
    }

    if (this.canPlayRoleOf('admin')) {
      returnUrl = '/admin/';
    }

    return returnUrl;
  };
  userSchema.statics.encryptPassword = function(password, done) {
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
  userSchema.statics.validatePassword = function(password, hash, done) {
    var bcrypt = require('bcrypt-nodejs');
    bcrypt.compare(password, hash, function(err, res) {
      done(err, res);
    });
  };
  userSchema.plugin(require('./plugins/pagedFind'));
  userSchema.index({username: 1}, {unique: true});
  userSchema.index({email: 1}, {unique: true});
  userSchema.index({timeCreated: 1});
//  userSchema.index({ 'twitter.id': 1 });
//  userSchema.index({ 'github.id': 1 });
//  userSchema.index({ 'facebook.id': 1 });
  userSchema.index({'google.id': 1});
  userSchema.index({search: 1});
  userSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('User', userSchema);
};
