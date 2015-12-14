define(["app","text!apps/activities/list/templates/activities_item"], function(LessonManager,activitiesItemTpl) {
  LessonManager.module("Common.View", function(View, LessonManager, Backbone, Marionette, _, $) {

    View.Activity = Marionette.ItemView.extend({
      className: "activityWrapper btnActivityNoGap col-md4 col-xs-12 col-lg-1",
      template: activitiesItemTpl,
      events: {
        'click .btnActivity': 'editActivityClicked',
        'click .js-delete': 'deleteActivityClicked'
      },
      deleteActivityClicked: function() {
        this.trigger("activity:delete", this.model);
      },
      editActivityClicked: function(e) {        
        this.trigger("activity:edit", this.model);
      }, remove: function() {
        var self = this;
        Marionette.ItemView.prototype.remove.call(this);
      }

    });

  });
  return LessonManager.Common.ActivityView;
});