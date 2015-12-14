define(["app"], function(TeacherSession) {
  TeacherSession.module("Router.ElementsApp", function(ElementsAppRouter, TeacherSession, Backbone, Marionette, $, _) {
    DialogAPI = {
      //Server
      showDialog: function(url, title) {
        require(["apps/dialog/show/dialogShow_controller"], function(DialogShowController) {
          DialogShowController.showDialog(url, title);
        });
      },
      showLoadingDialog: function() {
        require(["apps/dialog/show/dialogShow_controller"], function(DialogShowController) {
          DialogShowController.showLoadingDialog();
        });
      }
    };
    TeacherSession.on("dialog:show", function(url, title) {
      DialogAPI.showDialog(url, title);
    });
    TeacherSession.on("dialog:show:loading", function() {
      DialogAPI.showLoadingDialog();
    });
  });

  TeacherSession.addInitializer(function() {

    jq(window.document).off('DialogUrl');

    jq(window.document).on('DialogUrl', function(event, param) {
      var messageReceived = param.detail;
      switch (messageReceived.type)
      {
        //set all custom message type here
        case 'UrlUpdate':
          var url = messageReceived.resourceURL;
          //remove backdrop due to bug when called twice
          $('.modal-backdrop').remove();
          TeacherSession.trigger("dialog:show", url, messageReceived.title);
          break;
      }
    });
  });
});