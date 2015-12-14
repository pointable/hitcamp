define(["app",
  "text!apps/activities/list/templates/activities_item.html",
  "text!apps/activities/list/templates/activities_template.html"
  ],
  function(LessonManager, activitiesItemTpl, activitiesTpl) {
    LessonManager.module("ActivitiesApp.List.View", function(View, LessonManager, Backbone, Marionette, $, _) {
      View.Activity = Marionette.ItemView.extend({
        className: "activityWrapper btnActivityNoGap col-md4 col-xs-12 col-lg-1 drag-drop",
        template: _.template(activitiesItemTpl),
        events: {
//          'click .js-edit': 'editActivityClicked',
          'click .js-delete': 'deleteActivityClicked',
          'click .js-rename': 'renameActivityClicked'
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
        }, initialize: function() {
          this.model.on('change', this.render);
        }
      });

      View.Activities = Marionette.CompositeView.extend({
        className: "container-fluid",
        template: _.template(activitiesTpl),
        childView: View.Activity,
        childViewContainer: "#lessonView",
        initialize: function() {
          this.appendHtml = function(collectionView, childView, index) {
            collectionView.$el.find("#addOne").before(childView.el);
          };
          this.listenTo(this.collection, "add", function(collectionView, childView, index) {
            this.appendHtml = function(collectionView, childView, index) {
              collectionView.$el.find("#addOne").before(childView.el);
            };
          });
        },
        triggers: {
          'click .js-new': 'activity:new'
        },
        onRender: function() {
          console.log("####Activities are rendered");

        }
      });

    });
    return LessonManager.ActivitiesApp.List.View;
  });