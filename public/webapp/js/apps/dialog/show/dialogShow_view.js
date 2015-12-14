define(["app",
        "text!apps/dialog/show/templates/dialog.html"],
  function(LessonManager,dialogTpl){
    LessonManager.module("DialogApp.Show.View",
      function(View,LessonManager,Backbone,Marionette,$,_){
        View.Dialog= Marionette.ItemView.extend({
          template:_.template(dialogTpl)  
        });
    });
    return LessonManager.DialogApp.Show.View;
});
