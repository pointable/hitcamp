define(["app"], function(LessonManager) {

  LessonManager.module("ActivitiesApp", function(ActivitiesApp, LessonManager, Backbone, Marionette, $, _) {
    ActivitiesApp.onStart = function() {
      console.log("Starting ActivitiesApp");
    };

    ActivitiesApp.onStop = function() {
      console.log("Stopping ActivitiesApp");
    };
  });

  LessonManager.module("Router.ActivitiesApp", function(ActivitiesAppRouter, LessonManager, Backbone, Marionette, $, _) {
    ActivitiesAppRouter.Router = Marionette.AppRouter.extend({
      appRoutes: {
        "": "listActivities",
//        "activities": "listActivities",
        "activities/:id/elements/:id": "showActivityWithIndex"
            // "*notFound": 'listActivities'
      }
    });

    ActivitiesAPI = {
//      listActivities: function(options) {
//        require(["apps/activities/list/list_controller", "apps/header/list/headerList_controller"]
//            , function(ListController, HeaderListController) {
//              LessonManager.trigger("dialog:hide");
//              if (LessonManager.getCurrentRoute() !== "activities") {
//                LessonManager.navigate("activities");
//              }
//              ListController.listActivities(options);
//              HeaderListController.listHeader("activities");
//            });
//      },
      listActivities: function(options) {        
        require(["apps/activities/listActivities/listActivities_controller", "apps/header/list/headerList_controller"]
            , function(ListActivityController, HeaderListController) {
              ListActivityController.listActivities(options);
              HeaderListController.listHeader("activities");
            });
      },
//      moveActivities: function() {
//        require(["apps/activities/list/list_controller"]
//            , function(ListController) {
//              ListController.moveActivities();
//            });
//      },
//      moveStopActivities: function() {
//        require(["apps/activities/list/list_controller"]
//            , function(ListController) {
//              ListController.moveStopActivities();
//            });
//      },
      addActivityTypes: function(view) {
        console.log("#######show activities");
        require(["apps/activities/listActivities/listActivities_controller"]
            , function(listActivities_controller) {
              listActivities_controller.addActivity(view);
            });
      },
      showActivityTypes: function() {
        console.log("#######show adventure types");
        require(["apps/activities/newActivity/newActivity_controller"]
            , function(newActivityController) {
              newActivityController.newActivityTypes();
            });
      },
      //local
      showActivity: function(activity, element) {
        require(["apps/activities/show/activityShow_controller"]
            , function(activityShowController) {
              activityShowController.showActivity(activity, element);
            });
      },
      //server
      showActivityWithIndex: function(activityId, elementId) {
        
        require(["apps/activities/show/activityShow_controller"],
            function(activityShowController) {
              require(["entities/activity/activity_collection"], function() {
                var fetchActivity = LessonManager.request("activity:entities");
                $.when(fetchActivity).done(function(activities) {
                  var activity = activities.get(activityId);
                  var element = activity.get("elements").at(elementId - 1);
                  activityShowController.showActivity(activity, element);
                });
              });
            });
      }
    };
    //Card
    //Server //option 1 - server //option 2 - initialized //option 3 - list without route
//    LessonManager.on("activities:list", function(options) {
//      //List without route
////       if(!options.activities || options === 'undefined')
//      //if routed from element route, the dialog should be closed
//      LessonManager.trigger("dialog:hide");
//      if (typeof options === 'undefined') {
//        LessonManager.navigate("activities");
//      }
//      ActivitiesAPI.listActivities(options);
//    });
//
//    //HTML
//    LessonManager.on("activities:list:initialized", function() {
//      LessonManager.navigate("activities");
//      console.log("activities:list:initialized");
//      var options = {
//        initialized: true
//      };
//      ActivitiesAPI.listActivities(options);
//    });

    //Activities 
    //Server //option 1 - server //option 2 - initialized //option 3 - list without route
    LessonManager.on("activities:list", function(options) {
      if (typeof options === 'undefined') {
        LessonManager.navigate("");
      } else if (LessonManager.getCurrentRoute() !== "activities") {
        LessonManager.navigate("");
      }
      ActivitiesAPI.listActivities(options);
    });

    //HTML
    LessonManager.on("activities:list:initialized", function() {
      LessonManager.navigate("activities");
      console.log("activities:list:initialized");
      var options = {
        initialized: true
      };
      ActivitiesAPI.listActivities(options);
    });

    //HTML no route
    LessonManager.on("activities:list:initialized:noroute", function() {
      console.log("activities:list:initialized");
      var options = {
        initialized: true
      };
      ActivitiesAPI.listActivities(options);
    });

//    LessonManager.on("activities:move", function() {
//      ActivitiesAPI.moveActivities();
//    });
//
//    LessonManager.on("activities:stopmove", function() {
//      ActivitiesAPI.moveStopActivities();
//    });

    LessonManager.on("activityType:select", function(view) {
      ActivitiesAPI.addActivityTypes(view);
    });

    LessonManager.on("activityTypes:show", function(view) {
      ActivitiesAPI.showActivityTypes();
    });

    LessonManager.on("activity:show:first", function(activity) {
      var element = activity.get("elements").at(0);
//      LessonManager.navigate("#adventures/" + activity.id + "/elements/" + (index + 1));
      ActivitiesAPI.showActivity(activity, element);
    });

    LessonManager.on("activity:show", function(activity, element) {
      ActivitiesAPI.showActivity(activity, element);
    });

    //Initialize the router for ActivitiesApp
    LessonManager.addInitializer(function() {
      new ActivitiesAppRouter.Router({
        controller: ActivitiesAPI
      });

    });
  });
});



