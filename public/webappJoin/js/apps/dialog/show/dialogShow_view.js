define(["app",
  "text!apps/dialog/show/templates/dialog.html",
  "text!apps/dialog/show/templates/loadingDialog.html"],
    function(StudentManager, dialogTpl, loadingDialogTpl) {
      StudentManager.module("DialogApp.Show.View",
          function(View, StudentManager, Backbone, Marionette, $, _) {
            View.Dialog = Marionette.ItemView.extend({
              template: _.template(dialogTpl),
              className: "modal custom fade",
              id: "myModal",
              attributes: {
                "tabindex": "-1",
                "role": "dialog",
                "aria-labelledby": "myModalLabel",
                "aria-hidden": "true"
              }, onShow: function() {
                console.log("dialogshow1");
                $("#myModal").modal('show');
              }
            });
            View.LoadingDialog = Marionette.ItemView.extend({
              template: _.template(loadingDialogTpl),
              className: "modal custom fade",
              id: "myModal",
              attributes: {
                "tabindex": "-1",
                "role": "dialog",
                "aria-labelledby": "myModalLabel",
                "aria-hidden": "true"
              }, onShow: function() {
                console.log("loadingDialogShow");
                $('#myModal').modal({
                  backdrop: 'static',
                  keyboard: false
                });                
              }
            });
          });
      return StudentManager.DialogApp.Show.View;
    });
