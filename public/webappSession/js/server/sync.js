define(['app'],function(TeacherSession){
  TeacherSession.module("Server",
    function(Server,TeacherSession,Backbone,Marionette,$,_){
      var PLUGIN_NAME = 'ACTIVITY';
      Server.Sync ={
//        TriggerPlugin: function(pluginName) {
//          window.pluginToServer('GROUPER', 'TriggerPlugin', {});
//        },
//        StartRandom: function(pluginName) {
//          window.pluginToServer('RANDOMIZER', 'StartRandom', {});
//        },         
        MessageToServerStudentAnswersReset: function(options) {
          var dataToSend = {
            idElement: options.idElement,
            idActivity: options.idActivity
          }
          window.pluginToServer(PLUGIN_NAME, 'StudentAnswersReset', dataToSend);
        }
      };
  });
  return TeacherSession.Server.Sync;
});

