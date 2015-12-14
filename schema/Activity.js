'use strict';

exports = module.exports = function(app, mongoose) {
    
  var activitySchema = new mongoose.Schema({   
    activityName: { type: String, default: '' },
    elements: { type: Object, default: {} }, 
    colorTag: {type: String, default: 'dullPink'},
    thumbnail:  {type: String, default: 'about:blank'},
    activityTitle:{type: String, default: ''},
    activityType:{type: String, default: ''},
    index:{type:String,default:''},
    x:{type:Number,default:'0'},
    y:{type:Number,default:'0'},
    first:Boolean,
    active:Boolean,
    icon:{type:String,default:'fa-university'},      
    tileType:{type:String,default:'checkpoint'},
    wordLists:[String],
    pluginApp:{type: String, default: ''},
    pluginAppIcon:{type: String, default: ''},
    checkPointIcon:{type: String, default: ''},
//    owner: { type: String, default: '' },   
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

  activitySchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Activity', activitySchema);
  



};
