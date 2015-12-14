define(["app",
  "text!apps/dialog/show/templates/dialog.html",
  "text!apps/dialog/show/templates/loadingDialog.html"],
  function(TeacherSession, dialogTpl,loadingDialogTpl) {
    TeacherSession.module("DialogApp.Show.View",
      function(View, TeacherSession, Backbone, Marionette, $, _) {
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
            //TeacherSession.DialogApp.Show.View.trigger("dialog:show:url",this.model);
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
    return TeacherSession.DialogApp.Show.View;
  });
