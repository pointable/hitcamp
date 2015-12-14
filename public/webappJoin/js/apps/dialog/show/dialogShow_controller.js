define(["app", "apps/dialog/show/dialogShow_view", "bootstrap","bootbox"], function(StudentManager, View) {
  StudentManager.module("DialogApp.Show", function(Show, StudentManager, Backbone, Marionette, $, _) {
    Show.Controller = {      
      showDialog:function(url,title){
        var dialogModel = new Backbone.Model({resourceUrl:url, title:title});
        var dialogView = new View.Dialog({model:dialogModel});        
        StudentManager.dialogRegion.show(dialogView);
      },
      showLoadingDialog:function(){
        var dialogView = new View.LoadingDialog();        
        if(!document.socketID){
          StudentManager.dialogRegion.show(dialogView);
        }
      }
    };
    
    
  });
  return StudentManager.DialogApp.Show.Controller;
});