'use strict';
var shortId = require('shortid');

exports = module.exports = function(app, mongoose) {
    
//    console.log('run');
  var lessonSchema = new mongoose.Schema({
    shortID: { type: String, unique: true, index: true },    
    data: { type: String, default: 'Lesson Data' },    
    lessonName: { type: String, default: '' },
    tiles: { type: Object, default: {} },    
    isComplete: { type: String, default: 'no' },
    isPrivate: { type: Boolean, default: true },
    activities: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Activity'}],
    wordLists: [ {type: mongoose.Schema.Types.ObjectId, ref: 'WordList'}],
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
//    owner: { type: String, default: '' },
    timeCreated: { type: Date, default: Date.now },
    isLocked: { type: Boolean, default: false},
    backgroundImageURL: { type: String, default: 'about:blank' },
    backgroundThumbnailURL: { type: String, default: 'about:blank' },
    backgroundImageJSON:{ type: Object, default: {} }   
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

  lessonSchema.plugin(require('./plugins/pagedFind'));
//  
//  userSchema.index({ username: 1 }, { unique: true });

  lessonSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Lesson', lessonSchema);


};
