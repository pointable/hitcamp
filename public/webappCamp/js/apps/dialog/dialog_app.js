define(["app"], function(LessonManager) {
  LessonManager.module("Router.ElementsApp", function(ElementsAppRouter, LessonManager, Backbone, Marionette, $, _) {
    DialogAPI = {
      //Server
      showDialog: function(url) {
        require(["apps/dialog/show/dialogShow_controller"], function(DialogShowController) {
          DialogShowController.showDialog(url);
        });
      },
      hideDialog: function(url) {
        require(["apps/dialog/show/dialogShow_controller"], function(DialogShowController) {
          DialogShowController.hideDialog();
        });
      }
    };
    LessonManager.on("dialog:show", function(url) {
      DialogAPI.showDialog(url);
    });

    LessonManager.on("dialog:hide", function() {
      DialogAPI.hideDialog();
    });
  });
});