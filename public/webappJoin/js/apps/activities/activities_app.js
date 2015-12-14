define(["app"], function(StudentManager) {

  StudentManager.module("ActivitiesApp", function(ActivitiesApp, StudentManager, Backbone, Marionette, $, _) {
    ActivitiesApp.onStart = function() {
      console.log("Starting ActivitiesApp");
    };

    ActivitiesApp.onStop = function() {
      console.log("Stopping ActivitiesApp");
    };
  });

  StudentManager.module("Router.ActivitiesApp", function(ActivitiesAppRouter, StudentManager, Backbone, Marionette, $, _) {
    ActivitiesAppRouter.Router = Marionette.AppRouter.extend({
      appRoutes: {
        "": "listActivitiesInitialized"
            //'*notFound': 'listActivitiesInitialized'
      }
    });

    ActivitiesAPI = {
//      listActivities: function(options) {
//        require(["apps/activities/list/list_controller"], function(ListController) {
//          ListController.listActivities(options);
//        });
//      },
//      listActivitiesInitialized: function(options) {
//        if (StudentManager.getCurrentRoute() !== "activities") {
//          StudentManager.navigate("activities");
//        }
//        console.log("###listActivitiesInitialized being called");
//        require(["apps/activities/list/list_controller"], function(ListController) {
//          var options = {
//            initialized: true
//          };
//          ListController.listActivities(options);
//        });
//      },
      listActivities: function(options) {
        require(["apps/activities/listActivities/listActivities_controller"]
            , function(ListActivityController) {
              ListActivityController.listActivities(options);
            });
      },
      listActivitiesInitialized: function(options) {
        require(["apps/activities/listActivities/listActivities_controller"]
            , function(ListActivityController) {
              if (StudentManager.getCurrentRoute() !== "activities") {
//          StudentManager.navigate("activities",{ trigger: false,replace:true });
                console.log("#########triggered list activities");
              }
              if (options) {
                options.initialized = true;
                ListActivityController.listActivities(options);
              } else {
                var options1 = {
                  initialized: true
                };
                ListActivityController.listActivities(options1);
              }
              
            });
      }
    };

//    StudentManager.on("activities:list", function() {
//      //StudentManager.navigate("activities");
//      ActivitiesAPI.listActivities();
//    });
//
//    StudentManager.on("activities:list:initialize", function() {
//      StudentManager.navigate("activities");
//      var options = {
//        initialized: true
//      };
//      ActivitiesAPI.listActivities(options);
//    });

    //Activities 
    //Server //option 1 - server //option 2 - initialized //option 3 - list without route
    StudentManager.on("activities:listActivities", function(options) {
//      if (typeof options === 'undefined') {
//        StudentManager.navigate("activities");
//      }
      ActivitiesAPI.listActivities(options);
    });

    //HTML
    StudentManager.on("activities:listActivities:initialized", function(options) {
//      StudentManager.navigate("activities");
      console.log("activities:listActivities:initialized");
      ActivitiesAPI.listActivitiesInitialized(options);
    });




    //Initialize the router for ActivitiesApp
    StudentManager.addInitializer(function() {
      new ActivitiesAppRouter.Router({
        controller: ActivitiesAPI
      });

      var plugins;
      StudentManager.reqres.setHandler("plugins", function(bar) {
        return plugins;
      });
      //  Getting the data for the plugins initially
      require(["entities/pluginType/pluginType_collection"], function() {
        var fetchPlugins = StudentManager.request("pluginTypes:entities");
        $.when(fetchPlugins).done(function(fetchedplugins) {
          // console.log("fetchPlugins -> %O", fetchedplugins);
          plugins = fetchedplugins;
        });
      });


    });
  });



});



