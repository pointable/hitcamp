define(["app", "apps/dialog/show/dialogShow_view", "bootstrap"], function(LessonManager, View) {
  LessonManager.module("DialogApp.Show", function(Show, LessonManager, Backbone, Marionette, $, _) {
    Show.Controller = {      
      showDialog:function(url){
        var dialogModel = new Backbone.Model({resourceUrl:url});
        var dialogView = new View.Dialog({model:dialogModel});        
        LessonManager.dialogRegion.show(dialogView);
        $("#mymodal").modal({          
        });
      },
      hideDialog:function(){
        LessonManager.dialogRegion.hideModal();
      }
    };      
  });
  return LessonManager.DialogApp.Show.Controller;
});