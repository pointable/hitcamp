define(['app'],function(LessonManager){
  LessonManager.module("Server",
    function(Server,LessonManager,Backbone,Marionette,$,_){
      Server.Sync ={
        MessageToServerStudentAnswer: function(answer) {
          window.appToServer('StudentAnswer', {value: answer});
        }
      };
  });
  return LessonManager.Server.Sync;
});

