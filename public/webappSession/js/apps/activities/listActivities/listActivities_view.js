define(["app",
  "text!apps/activities/listActivities/templates/activity_item.html",
  "text!apps/activities/listActivities/templates/activity_map.html",
  "text!apps/activities/listActivities/templates/activity_tile.html",
  "interact"
],
    function(TeacherSession, activityItemTpl, activityMapTpl, activityTileTpl, interact) {
      TeacherSession.module("ActivitiesApp.ListActivities.View", function(View, TeacherSession, Backbone, Marionette, $, _) {
        View.Activity = Marionette.ItemView.extend({
          className: "activity-wrapper btnActivityNoGap col-md4 col-xs-12 col-lg-1 drag-drop",
          template: _.template(activityItemTpl),
          events: {
//          'mousedown .js-edit': 'editActivityClicked',
//            'click .js-delete': 'deleteActivityClicked',
//            'click .js-rename': 'renameActivityClicked',
            'click .js-move': 'activityClickedDetected'
          },
          modelEvents: {
            'change:x': "xChanged",
            'change:y': "yChanged"
          },
          xChanged: function(args, val) {
            this.trigger("checkpoint:xChanged", val);
          },
          yChanged: function(args, val) {
            this.trigger("checkpoint:xChanged", val);
          },
          deleteActivityClicked: function() {
            this.trigger("activity:delete", this.model);
          },
          editActivityClicked: function(e) {
            e.preventDefault();
            this.trigger("activity:edit", this.model);
          },
          renameActivityClicked: function(e) {
            this.trigger("activity:rename", this.model);
          },
          remove: function() {
            var self = this;
            Marionette.ItemView.prototype.remove.call(this);
          },
          initialize: function() {
            this.model.on('change', this.render);
          },
          activityClickedDetected:function(e){
             this.trigger("element:show", this.model);
          }
        });

        View.Activities = Marionette.CompositeView.extend({
          className: "container-fluid activity-area activity-blue-glow padding-0px",
          template: _.template(activityMapTpl),
          childView: View.Activity,
          childViewContainer: "#adventure-view",
          triggers: {
            'click .js-new-activity': 'activity:new',
            'click .js-select': 'plugin:show:adventurePicker',
//            'click .js-trigger': 'plugin:show:app',
            'click .js-edit': 'activity:show:editor'
          },
          onRender: function() {
            console.log("####Activities are rendered");
          }
        });

        View.ActivityTile = Marionette.ItemView.extend({
          className: "activity-wrapper-tiles",
          template: _.template(activityTileTpl),
          triggers: {
//            'click .js-new': 'activity:new'
            'click .js-toggle-hor': 'tile:toggle:hor',
            'click .js-toggle-ver': 'tile:toggle:ver'
          }
        });

        View.ActivityTiles = Marionette.CollectionView.extend({
          childView: View.ActivityTile,
          onRender: function() {
            console.log("####Tiles Collections are rendered");
          }
        });

      });
      return TeacherSession.ActivitiesApp.ListActivities.View;
    });