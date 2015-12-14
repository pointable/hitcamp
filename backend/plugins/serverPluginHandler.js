'use strict';

var _ = require('underscore');
var PLUGIN_API = require('../pluginAPI');
var PLUGIN_NAME = 'PLUGIN_HANDLER';


//TODO : Choose  minified or development according to the current node
// environment test
var PLUGINS = {};

if (process.env.NODE_ENV == 'production') {
  PLUGINS = {
//    AIRWEB: {    
//      pluginURL:'/plugins/airweb/dist/index_b.html',
//      pluginTeacherURL:'',
//      pluginTitle: 'Annotation'
//    },
    GROUPER_SELECT: {
      pluginURL: '/plugins/grouper/grouperSelect.html',
      pluginTeacherURL: '',
      pluginTitle: 'Select Group',
      isDaemon: true
    },
    RANDOMIZER: {
      pluginURL: '/plugins/randomizer/dist/randomizerStudent.html',
      pluginTeacherURL: '/plugins/randomizer/dist/randomizerTeacher.html',
      pluginTitle: 'Randomizer',
      pluginServerPath: './randomizer/serverRandomizer'
    },
    WHEEL_WORD: {
      pluginURL: '/plugins/wheelWord/dist/wheelWordStudent.html',
      pluginTeacherURL: '/plugins/wheelWord/dist/wheelWordTeacher.html',
      pluginTitle: 'Word Wheel',
      pluginServerPath: './wheelWord/serverWheelWord'
    },
    SORT_ME: {
      pluginURL: '/plugins/sortMe/dist/sortMeStudent.html',
      pluginTeacherURL: '/plugins/sortMe/dist/sortMeTeacher.html',
      pluginTitle: 'Sort Me',
      pluginServerPath: './sortMe/serverSortMe'
    },
    WORD_ATTACK: {
      pluginURL: '/plugins/wordAttack/dist/wordAttackStudent.html',
      pluginTeacherURL: '/plugins/wordAttack/dist/wordAttackTeacher.html',
      pluginTitle: 'Word Attack',
      pluginServerPath: './wordAttack/serverWordAttack'
    },
    WORD_SEARCH: {
      pluginURL: '/plugins/wordSearch/dist/wordSearchStudent.html',
      pluginTeacherURL: '/plugins/wordSearch/dist/wordSearchTeacher.html',
      pluginTitle: 'Word Search',
      pluginServerPath: './wordSearch/serverWordSearch'
    },
    BUZZER: {
      pluginURL: '/plugins/buzzer/dist/buzzerStudent.html',
      pluginTeacherURL: '/plugins/buzzer/dist/buzzerTeacher.html',
      pluginTitle: 'Buzzer',
      pluginServerPath: './buzzer/serverBuzzer'
    },
    QUICKPOLL: {
      pluginURL: '/plugins/quickPoll/dist/quickPollStudent.html',
      pluginTeacherURL: '/plugins/quickPoll/dist/quickPollTeacher.html',
      pluginTitle: 'Quick Poll',
      pluginServerPath: './quickPoll/serverQuickPoll'
    },
    CHECK_IN: {
      pluginURL: '/plugins/checkIn/dist/checkInStudent.html',
      pluginTeacherURL: '/plugins/checkIn/dist/checkInTeacher.html',
      pluginTitle: 'Check In',
      pluginServerPath: './checkIn/serverCheckIn'
    },
    OPEN_RESPONSE: {
      pluginURL: '/plugins/openResponse/dist/openResponseStudent.html',
      pluginTeacherURL: '/plugins/openResponse/dist/openResponseTeacher.html',
      pluginTitle: 'Open Response',
      pluginServerPath: './openResponse/serverOpenResponse'
    },
    POSTER_MAKER: {
      pluginURL: '/plugins/posterMaker/dist/posterMakerStudent.html',
      pluginTeacherURL: '/plugins/posterMaker/dist/posterMakerTeacher.html',
      pluginTitle: 'Poster Maker',
      pluginServerPath: './posterMaker/serverPosterMaker'
    }
  };
} else {
  PLUGINS = {
//    AIRWEB: {    
//      pluginURL:'/plugins/airweb/index_b.html',
//      pluginTeacherURL:'',
//      pluginTitle: 'Annotation'
//    },    
    GROUPER_SELECT: {
      pluginURL: '/plugins/grouper/grouperSelect.html',
      pluginTeacherURL: '',
      pluginTitle: 'Select Group',
      isDaemon: true
    },
    RANDOMIZER: {
      pluginURL: '/plugins/randomizer/randomizerStudent.html',
      pluginTeacherURL: '/plugins/randomizer/randomizerTeacher.html',
      pluginTitle: 'Randomizer',
      pluginServerPath: './randomizer/serverRandomizer'
    },
    WHEEL_WORD: {
      pluginURL: '/plugins/wheelWord/wheelWordStudent.html',
      pluginTeacherURL: '/plugins/wheelWord/wheelWordTeacher.html',
      pluginTitle: 'Word Wheel',
      pluginServerPath: './wheelWord/serverWheelWord'
    },
    SORT_ME: {
      pluginURL: '/plugins/sortMe/sortMeStudent.html',
      pluginTeacherURL: '/plugins/sortMe/sortMeTeacher.html',
      pluginTitle: 'Sort Me',
      pluginServerPath: './sortMe/serverSortMe'
    },
    WORD_ATTACK: {
      pluginURL: '/plugins/wordAttack/wordAttackStudent.html',
      pluginTeacherURL: '/plugins/wordAttack/wordAttackTeacher.html',
      pluginTitle: 'Word Attack',
      pluginServerPath: './wordAttack/serverWordAttack'
    },
    WORD_SEARCH: {
      pluginURL: '/plugins/wordSearch/wordSearchStudent.html',
      pluginTeacherURL: '/plugins/wordSearch/wordSearchTeacher.html',
      pluginTitle: 'Word Search',
      pluginServerPath: './wordSearch/serverWordSearch'
    },
    BUZZER: {
      pluginURL: '/plugins/buzzer/buzzerStudent.html',
      pluginTeacherURL: '/plugins/buzzer/buzzerTeacher.html',
      pluginTitle: 'Buzzer',
      pluginServerPath: './buzzer/serverBuzzer'
    },
    QUICKPOLL: {
      pluginURL: '/plugins/quickPoll/quickPollStudent.html',
      pluginTeacherURL: '/plugins/quickPoll/quickPollTeacher.html',
      pluginTitle: 'Quick Poll',
      pluginServerPath: './quickPoll/serverQuickPoll'
    },
    CHECK_IN: {
      pluginURL: '/plugins/checkIn/checkInStudent.html',
      pluginTeacherURL: '/plugins/checkIn/checkInTeacher.html',
      pluginTitle: 'Check In',
      pluginServerPath: './checkIn/serverCheckIn'
    },
    OPEN_RESPONSE: {
      pluginURL: '/plugins/openResponse/openResponseStudent.html',
      pluginTeacherURL: '/plugins/openResponse/openResponseTeacher.html',
      pluginTitle: 'Open Response',
      pluginServerPath: './openResponse/serverOpenResponse'
    },
    POSTER_MAKER: {
      pluginURL: '/plugins/posterMaker/posterMakerStudent.html',
      pluginTeacherURL: '/plugins/posterMaker/PosterMakerTeacher.html',
      pluginTitle: 'Poster Maker',
      pluginServerPath: './posterMaker/serverPosterMaker'
    }
  };
}

function App(idSession, plugins, redis) {
  this.idSession = idSession;

  var currentCampfireApp;

  this.pluginStudentMessageListener = function(socket, pluginMessageType, data) {
//    console.log("isTeacher?" + socket.customIsTeacher);

    switch (pluginMessageType) {
      case 'StudentDisconnect':
        break;
      case 'StudentJoin':
        studentJoin(socket, data);
        break;
      default:
    }
  };

  this.pluginTeacherMessageListener = function(socket, pluginMessageType, data) {

    switch (pluginMessageType) {
      case 'TeacherJoin':
        teacherJoin(socket, data);
        break;
      case 'TriggerPlugin':
        this.triggerPlugin(socket, data);
        break;
      case 'ExitPlugin':
        this.exitPlugin(socket, data);
        break;
      default:
    }
  };

  this.exitPlugin = function(socket, data) {
//    console.log(data);
    if (!data.pluginName) {
      return;
    }
    this.closePlugin(socket, data);

  }

  this.triggerPlugin = function(socket, data) {
    if (!data.pluginName) {
      return;
    }

    var pluginProperties = PLUGINS[data.pluginName];
    if (!pluginProperties) {
//      console.log("Plugin properties not found: " + data.pluginName);
      return;
    }

    checkPluginServer(socket, data.pluginName);


    var dataToSend = {
      pluginTitle: pluginProperties.pluginTitle,
      pluginName: data.pluginName,
      pluginURL: pluginProperties.pluginURL,
      isLocked: false
    };
    PLUGIN_API.SendToAllStudents(socket, idSession, PLUGIN_NAME,
        'TriggerPlugin', dataToSend);

    dataToSend.pluginTeacherURL = pluginProperties.pluginTeacherURL;

    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME,
        'TriggerPluginNotification', dataToSend);
  }

  var checkPluginServer = this.checkPluginServer = function(socket, pluginName) {
    if (currentCampfireApp) {
      if (currentCampfireApp.pluginName === pluginName) {
        //plugin running
//        console.log("Plugin Running");
        return;
      } else {
        //terminate currentCampfireApp        
        destroyPluginServer(socket, currentCampfireApp.pluginName);
      }
    }

    //instantiate new plugin
    instantiatePluginServer(pluginName);

    currentCampfireApp = {};
    currentCampfireApp.pluginName = pluginName;

  }

  function instantiatePluginServer(pluginName) {
    if (plugins[pluginName]) {
      //already loaded
      return;
    }
//    console.log("Loading: " + pluginName);
    var pluginProperties = PLUGINS[pluginName];
    if (!pluginProperties) {
//      console.log("Plugin Properties not found:" + pluginName);
    }
    if (pluginProperties.isDaemon) {
//      console.log("isDaemon: " + pluginName);
    }
    else {
      plugins[pluginName] = new (require(pluginProperties.pluginServerPath))(idSession, plugins);
//      console.log("Loaded: " + pluginName);
    }
  }
  ;

  function destroyPluginServer(socket, pluginName) {
//    var pluginProperties = PLUGINS[pluginName];
    var plugin = plugins[pluginName];

    if (PLUGINS[pluginName].isDaemon) {
      console.log("isDaemon: " + pluginName);
      return;
    }

    console.log("Destroying: " + plugin);
    if (plugin) {
      try {
        plugin.pluginHandlerMessageListener(socket, "PluginExit");
        delete plugins[pluginName];
        currentCampfireApp = null;
        console.log("Destroyed: " + pluginName);
      } catch (err) {
        console.log(err.stack);
      }
    }
  }
  ;

  this.closePlugin = function(socket, data) {
    if (!data.pluginName) {
      return;
    }

    var pluginObject = PLUGINS[data.pluginName];

    var dataToSend = {
      pluginName: data.pluginName,
      pluginTitle: pluginObject.pluginTitle
    };
    PLUGIN_API.SendToAllStudents(socket, idSession, PLUGIN_NAME,
        'ClosePlugin', dataToSend);
    PLUGIN_API.SendToAllTeachers(socket, idSession, PLUGIN_NAME,
        'ClosePluginNotification', dataToSend);

    PLUGIN_API.SendToAllTeachers(socket, idSession, data.pluginName,
        'ActivityEnded', dataToSend);


    destroyPluginServer(socket, data.pluginName);
  }

  function studentJoin(socket, data) {

    if (!currentCampfireApp) {
      return;
    }

    var pluginObject = PLUGINS[currentCampfireApp.pluginName];

    var dataToSend = {
      pluginTitle: pluginObject.pluginTitle,
      pluginURL: pluginObject.pluginURL,
      pluginName: currentCampfireApp.pluginName,
      isLocked: currentCampfireApp.isLocked
    };
    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'TriggerPlugin', dataToSend);
  }


  function teacherJoin(socket, data) {

    if (!currentCampfireApp) {
      return;
    }

    var pluginObject = PLUGINS[currentCampfireApp.pluginName];

    var dataToSend = {
      pluginTitle: pluginObject.pluginTitle,
      pluginURL: pluginObject.pluginURL,
      pluginTeacherURL: pluginObject.pluginTeacherURL,
      pluginName: currentCampfireApp.pluginName,
      isLocked: currentCampfireApp.isLocked
    };
    PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
        'TriggerPluginNotification', dataToSend);
  }

  this.activityChanged = function(socketio, idLesson) {
    plugins['ACTIVITY'].activityChanged(idLesson);

    var dataToSend = {
      idLesson: idLesson
    };
    PLUGIN_API.SocketIOSendToAll(socketio, idSession, PLUGIN_NAME,
        'ActivityChanged', dataToSend);
  }
  this.classroomSettingsChanged = function(socketio, path) {
//    plugins['ACTIVITY'].activityChanged(idLesson);

    var dataToSend = {
      path: path
    };
    PLUGIN_API.SocketIOSendToAll(socketio, idSession, PLUGIN_NAME,
        'ActivityChanged', dataToSend);
  }

  this.resetClassroom = function(socket) {
    if (currentCampfireApp) {
      destroyPluginServer(socket, currentCampfireApp.pluginName);
    }
    plugins['ANNOTATE'].setSync(false);
//    var dataToSend = {
//      idLesson: idLesson
//    };
//    PLUGIN_API.SocketIOSendToAll(socketio, idSession, PLUGIN_NAME,
//        'ActivityChanged', dataToSend);
  }
//  this.broadcastMessageToEveryConnectedUser = function(socketio, message) {
//    PLUGIN_API.SocketIOSendToEveryConnectedUser(socket, null , 'PLUGIN_HANDLER',
//        'ShowMessage', {
//          message: message
//        });
//  }
}
;

module.exports = App;

