define(["app"], function(StudentManager) {
  StudentManager.module("Router.ElementsApp", function(ElementsAppRouter, StudentManager, Backbone, Marionette, $, _) {
    DialogAPI = {
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
    StudentManager.on("dialog:show", function(url, title) {
      DialogAPI.showDialog(url, title);
    });
    StudentManager.on("dialog:show:loading", function() {
      DialogAPI.showLoadingDialog();
    });
  });

  StudentManager.addInitializer(function() {

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
          StudentManager.trigger("dialog:show", url, messageReceived.title);
          break;
      }
    });
  });


});