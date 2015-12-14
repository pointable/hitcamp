'use strict';

exports = module.exports = function(app, mongoose) {
    
  var wordListSchema = new mongoose.Schema({   
    title: { type: String, default: '' },
    words: [{type: String, default: '' }], 
    thumbnail:  {type: String, default: 'about:blank'},
    timeCreated: { type: Date, default: Date.now }
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

//  activitySchema.plugin(require('./plugins/pagedFind'));
//  
//  userSchema.index({ username: 1 }, { unique: true });

  wordListSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('WordList', wordListSchema);



};
