'use strict';
var idSession = '';
//var students = {};
//var teacher;
//var activities = {};

function Session(idSession, idLesson, redis, mongo) {
  this.idSession = idSession;
  this.idLesson = idLesson;
//  this.students = {};
//  this.teachers = {};
  var plugins = {};
  this.plugins = plugins;
  this.redis = redis;
  this.mongo = mongo;

  if (!idLesson){
    console.log("Session without idLesson");    
  }
  if (!redis){
    console.log("Session without REDIS");
  }
  if (!mongo){
    console.log("Session without MONGO");    
  }
  
  plugins['PLUGIN_HANDLER'] = new (require('./plugins/serverPluginHandler'))(idSession, plugins, redis);
  plugins['GROUPER'] = new (require('./plugins/grouper/serverGrouper'))(idSession, plugins, redis);
  plugins['STUDENT'] = new (require('./plugins/student/serverStudent'))(idSession, plugins, redis, mongo);
  plugins['WALL_STUDENT'] = new (require('./plugins/wallStudent/serverWallStudent'))(idSession, plugins, redis);
  plugins['ACTIVITY'] = new (require('./plugins/activity/serverActivity'))(idSession, idLesson, plugins, redis, mongo);
  plugins['SCORE'] = new (require('./plugins/score/serverScore'))(idSession, plugins, redis);
  plugins['ANNOTATE'] = new (require('./plugins/annotate/serverAnnotate'))(idSession, plugins, redis);
  plugins['SINGLE'] = new (require('./plugins/single/serverSingle'))(idSession, plugins, redis);

  //APPS
//  plugins['AIRWEB'] = new (require('./plugins/airweb/serverAirWeb'))(idSession, plugins);
//  plugins['RANDOMIZER'] = new (require('./plugins/randomizer/serverRandomizer'))(idSession, plugins);
//  plugins['WHEEL_WORD'] = new (require('./plugins/wheelWord/serverWheelWord'))(idSession, plugins);
//  plugins['SORT_ME'] = new (require('./plugins/sortMe/serverSortMe'))(idSession, plugins);
//  plugins['WORD_ATTACK'] = new (require('./plugins/wordAttack/serverWordAttack'))(idSession, plugins);
//  plugins['BUZZER'] = new (require('./plugins/buzzer/serverBuzzer'))(idSession, plugins);
//  plugins['QUICKPOLL'] = new (require('./plugins/quickPoll/serverQuickPoll'))(idSession, plugins);
//  plugins['OPEN_RESPONSE'] = new (require('./plugins/openResponse/serverOpenResponse'))(idSession, plugins);
//    return this;
//  this.setName = function() {
//    console.log(idSession);
//  };
  this.teacherJoin = function(socket) {
//    this.teachers[socket.id] = new Teacher(socket);
    plugins['GROUPER'].pluginTeacherMessageListener(socket, 'TeacherJoin', null);
    plugins['PLUGIN_HANDLER'].pluginTeacherMessageListener(socket, 'TeacherJoin', null);
    plugins['SCORE'].pluginTeacherMessageListener(socket, 'TeacherJoin', null);
  };

  this.studentJoin = function(socket) {
//    this.students[socket.id] = new Student(socket);
//    console.log("JOIN");
    plugins['GROUPER'].pluginStudentMessageListener(socket, 'StudentJoin', null);
    plugins['PLUGIN_HANDLER'].pluginStudentMessageListener(socket, 'StudentJoin', null);

    plugins['STUDENT'].pluginStudentMessageListener(socket, 'StudentJoin', null);
    plugins['WALL_STUDENT'].pluginStudentMessageListener(socket, 'StudentJoin', null);
    plugins['SCORE'].pluginStudentMessageListener(socket, 'StudentJoin', null);
  };
  this.studentDisconnect = function(socket) {
//      var student = new Student(socket);
    plugins['STUDENT'].pluginStudentMessageListener(socket, 'StudentDisconnect', null);
    plugins['GROUPER'].pluginStudentMessageListener(socket, 'StudentDisconnect', null);

//    delete this.students[socket.id];
  };

//  this.activityShare = function(socket, idActivity, boolShare) {
//    if (!activities[idActivity]) {
//      activities[idActivity] = new Activity(idActivity);
//    }
//    activities[idActivity].setShare(boolShare);
//    console.log(activities);
//  };
}
;

module.exports = Session;

//function Student(socket) {
//  this.socket = socket;
//  this.userX = 0;
//  this.userY = 0;
//}
//;
//
//function Teacher(socket) {
//  this.socket = socket;
//}
//
//function Activity(idActivity) {
//  this.idActivity = idActivity;
//  this.boolShare = false;
//
//  this.setShare = function(boolShare) {
//    this.boolShare = boolShare;
//  };
//
//  this.isShare = function() {
//    return this.boolShare;
//  };
//}

//});