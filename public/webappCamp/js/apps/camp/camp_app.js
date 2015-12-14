define(["app"], function(CampManager) {
  CampManager.module("CampApp", function(CampApp, CampManager, Backbone, Marionette, $, _) {
    CampApp.onStart = function() {
      console.log("Starting CampApp");
    };
    CampApp.onStop = function() {
      console.log("Stopping CampApp");
    };
  });

  CampManager.module("Router.CampApp", function(CampAppRouter, CampManager, Backbone, Marionette, $, _) {
    CampAppRouter.Router = Marionette.AppRouter.extend({
      appRoutes: {
        "classrooms": "showCamp"
      }
    });

    CampAPI = {
      showCamp: function(options) {
        require(["apps/camp/show/campShow_controller"]
            , function(ShowController) {
//              if (CampManager.getCurrentRoute() !== "classrooms") {
//                CampManager.navigate("classrooms");
//              }
              ShowController.showCamp();
            });
      }
    };

    CampManager.on("camp:show", function() {
//      CampManager.navigate("classrooms");
      CampAPI.showCamp();
    });
    
    CampManager.addInitializer(function() {
      new CampAppRouter.Router({
        controller: CampAPI
      });
    });
  });
});