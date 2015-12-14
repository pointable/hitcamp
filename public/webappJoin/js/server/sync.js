define(['app'],function(StudentManager){
  StudentManager.module("Server",
    function(Server,StudentManager,Backbone,Marionette,$,_){
      var PLUGIN_NAME = 'ACTIVITY';
      Server.Sync ={
        MessageToServerStudentAnswer: function(answer) {
          window.pluginToServer(PLUGIN_NAME, 'StudentAnswer', {answer:answer});
        }
      };
  });
  return StudentManager.Server.Sync;
});

