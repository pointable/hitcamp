define(["app",
  "apps/activities/newActivity/newActivity_view",
  "bootbox",
  "bootstrap"
],
    function(LessonManager, View, bootbox) {
      LessonManager.module("ActivitiesApp.NewActivity",
          function(NewActivity, LessonManager, Backbone, Marionette, $, _) {
            NewActivity.Controller = {
              newActivityTypes: function(options) {

                var ActivityType = Backbone.Model.extend({
                  idAttribute: '_id',
                  defaults: {
                    "title": "",
                    "type": "",
                    "desc": "",
                    "icon": ""
                  }

                });
                var ActivityTypeCollection = Backbone.Collection.extend({
                  model: ActivityType
                });

                var initializedActivityTypes = [
                  {
                    "_id": "1", "title": "Slides with Questions",
                    "type": "media",
                    "desc": "Import PowerPoint, PDF, YouTube and add Questions to your lesson",
//                    "icon": "fa-file-image-o"
                    "icon": "/webapp/images/checkpoint_blue.svg"
                  },
                  {"_id": "2", "title": "Words List + App",
                    "type": "wordList",
                    "desc": "Categories with list of words/phrases. Select an App to use with the Word List",
//                   "icon": "fa-th-list"
                    "icon": "/webapp/images/checkpoint_brown.svg"
                  }
//                  {"_id": "3","title":"Picture List", "desc": "fa-random", "icon": "Randomizer"}
                ];
                var activity_types = new ActivityTypeCollection(initializedActivityTypes);
                newActivityView(activity_types);
//                //Server                
//                require(["entities/activity/activity_collection"], function() {
//                  var fetchingActivities = LessonManager.request("activity:entities");
//                  $.when(fetchingActivities).done(function(activities) {
//                    listActivityView(activities);
//                  });
//                });
              }
            };
            function newActivityView(activity_types) {

              var activityTypesView = new View.ActivityTypes({
                //model: activity,
                collection: activity_types
              });

              LessonManager.dialogRegion.show(activityTypesView);

              $("#myModal").modal(
                  {
//          backdrop: 'static',
//          keyboard: false
                  });
              activityTypesView.on("childview:activityType:select", function(view) {
                console.log("activityType %O", view);
                LessonManager.trigger("activityType:select", view);
                LessonManager.dialogRegion.closeDialog();
              });

              activityTypesView.on("activity:new:close", function(element) {
                LessonManager.dialogRegion.closeDialog();                
              });
            }
          });

      return LessonManager.ActivitiesApp.NewActivity.Controller;
    });


