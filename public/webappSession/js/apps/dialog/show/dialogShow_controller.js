define(["app", "apps/dialog/show/dialogShow_view", "bootstrap","bootbox"], function(TeacherSession, View) {
  TeacherSession.module("DialogApp.Show", function(Show, TeacherSession, Backbone, Marionette, $, _) {
    Show.Controller = {      
      showDialog:function(url,title){
        var dialogModel = new Backbone.Model({resourceUrl:url, title:title});
        var dialogView = new View.Dialog({model:dialogModel});        
        TeacherSession.dialogRegion.show(dialogView);
      },
      showLoadingDialog:function(){
        var dialogView = new View.LoadingDialog();
        if (!document.socketID){
          TeacherSession.dialogRegion.show(dialogView);
        }
      }
    };
    
    
  });
  return TeacherSession.DialogApp.Show.Controller;
});