define(["app"], function(TeacherSession) {

  TeacherSession.module("ActivitiesApp", function(ActivitiesApp, TeacherSession, Backbone, Marionette, $, _) {
    ActivitiesApp.onStart = function() {
      console.log("Starting ActivitiesApp");
    };

    ActivitiesApp.onStop = function() {
      console.log("Stopping ActivitiesApp");
    };
  });

  TeacherSession.module("Router.ActivitiesApp", function(ActivitiesAppRouter, TeacherSession, Backbone, Marionette, $, _) {
    ActivitiesAppRouter.Router = Marionette.AppRouter.extend({
      appRoutes: {
        "": "listActivitiesInitialized",
//        "adventures": "listActivitiesInitialized",
//        //Temperoray route all in between path to activities
//        "adventures/:id": "listActivitiesInitialized"

//        '*notFound': 'listActivitiesInitialized'
      }
    });

    ActivitiesAPI = {
//      listActivities: function(options) {
//        require(["apps/activities/list/list_controller"], function(ListController) {
//          ListController.listActivities(options);
//        });
//      },
//      listActivitiesInitialized: function(options) {
//        if (TeacherSession.getCurrentRoute() !== "activities") {
//          TeacherSession.navigate("activities");
//        }
//        require(["apps/activities/list/list_controller"], function(ListController) {
//          var options = {
//            initialized: true
//          };
//          ListController.listActivities(options);
//        });
//      },
      listActivities: function(options) {
        require(["apps/activities/listActivities/listActivities_controller"]
            , function(ListAdventureController, HeaderListController) {
              //ListAdventureController.listActivities(options);

            });
      },
      listActivitiesInitialized: function(options) {
//        if (TeacherSession.getCurrentRoute() !== "activities") {
//          TeacherSession.navigate("activities", {trigger: false});
//        }
        require(["apps/activities/listActivities/listActivities_controller"]
            , function(ListAdventureController) {
              var options = {
                initialized: true
              };
              ListAdventureController.listActivities(options);
            });
      }
    };


//    TeacherSession.on("activities:list", function() {
//      //TeacherSession.navigate("activities");
//      console.log("activitiesAppList");
//      ActivitiesAPI.listActivities();
//      console.log("activities:list");
//    });
//
//    TeacherSession.on("activities:list:initialized", function() {
//      TeacherSession.navigate("activities");
//      console.log("activities:list:initialized");
//      var options = {
//        initialized: true
//      };
//      ActivitiesAPI.listActivities(options);
//    });

    //Activities 
    //Server //option 1 - server //option 2 - initialized //option 3 - list without route
    TeacherSession.on("activities:listActivities", function(options) {
//      if (typeof options === 'undefined') {
//        TeacherSession.navigate("activities");
//      }
      ActivitiesAPI.listActivities(options);
    });

    //HTML
    TeacherSession.on("activities:listActivities:initialized", function() {
//      TeacherSession.navigate("activities");
      console.log("activities:listActivities:initialized");
      var options = {
        initialized: true
      };
      ActivitiesAPI.listActivitiesInitialized(options);
    });
    //HTML no route
    TeacherSession.on("activities:listActivities:initialized:noroute", function() {
      console.log("activities:listActivities:initialized:noroute");
      var options = {
        initialized: true
      };
      ActivitiesAPI.listActivities(options);
    });


    //Initialize the router for ActivitiesApp
    TeacherSession.addInitializer(function() {
      new ActivitiesAppRouter.Router({
        controller: ActivitiesAPI
      });

      var plugins;
      TeacherSession.reqres.setHandler("plugins", function(bar) {
        return plugins;
      });
      //  Getting the data for the plugins initially
      require(["entities/pluginType/pluginType_collection"], function() {
        var fetchPlugins = TeacherSession.request("pluginTypes:entities");
        $.when(fetchPlugins).done(function(fetchedplugins) {
          // console.log("fetchPlugins -> %O", fetchedplugins);
          plugins = fetchedplugins;
        });
      });
    });
  });

});



