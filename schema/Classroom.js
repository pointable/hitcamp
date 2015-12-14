'use strict';

exports = module.exports = function(app, mongoose) {

//    console.log('run');
  var classroomSchema = new mongoose.Schema({
    data: {type: String, default: 'Session Data'},
    name: {type: String, default: ''},
    PIN: {type: Number, default: 0},
    path: {type: String, default: ''},
    isLocked: {type: Boolean, default: false},
    isComplete: {type: String, default: 'no'},
    lesson: {type: mongoose.Schema.Types.ObjectId, ref: 'Lesson'},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    students: [mongoose.modelSchemas.Student],
    studentData: [{type: mongoose.Schema.Types.ObjectId, ref: 'StudentData'}],
    lessonData: [{type: mongoose.Schema.Types.ObjectId, ref: 'LessonData'}],
//    owner: { type: String, default: '' },
    timeCreated: {type: Date, default: Date.now}
//    isTest: { type: Boolean, default: false }
  });

  //METHODS
//  userSchema.methods.canPlayRoleOf = function(role) {
//    if (role === "admin" && this.roles.admin) {
//      return true;
//    }
//
//    if (role === "account" && this.roles.account) {
//      return true;
//    }
//
//    return false;
//  };

//STATICS
//    userSchema.statics.validatePassword = function(password, hash, done) {
//    var bcrypt = require('bcrypt-nodejs');
//    bcrypt.compare(password, hash, function(err, res) {
//      done(err, res);
//    });
//  };

  classroomSchema.plugin(require('./plugins/pagedFind'));
//  
//  userSchema.index({ username: 1 }, { unique: true });
  classroomSchema.index({owner: 1, path: 1}, {unique: false});
  classroomSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Classroom', classroomSchema);

};
