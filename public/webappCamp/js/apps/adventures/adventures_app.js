define(["app"], function(CampManager) {
  CampManager.module("AdventuresApp", function(AdventuresApp, CampManager, Backbone, Marionette, $, _) {
    AdventuresApp.onStart = function() {
      console.log("Starting AdventuresApp");
    };
    AdventuresApp.onStop = function() {
      console.log("Stopping AdventuresApp");
    };
  });

  CampManager.module("Router.AdventuresApp", function(AdventuresAppRouter, CampManager, Backbone, Marionette, $, _) {
    AdventuresAppRouter.Router = Marionette.AppRouter.extend({
      appRoutes: {
//        "adventures1": "listAdventures",                       
      }
    });

    AdventuresAPI = {
      listAdventures: function(adventuresRegion) {
        require(["apps/adventures/list/adventuresList_controller"]
            , function(ListController, HeaderListController) {//              
//              if (CampManager.getCurrentRoute() !== "adventures") {
//                CampManager.navigate("adventures");
//              }
              ListController.listAdventures(adventuresRegion);
            });
      },
      listAdventuresWeb:function(adventuresRegion) {
        require(["apps/adventures/list/adventuresList_controller"]
            , function(ListController) {//              
              ListController.listAdventuresWeb(adventuresRegion);
            });
      }
    };

    CampManager.on("adventures:list", function(adventuresRegion) {
//      CampManager.navigate("adventures");      
      AdventuresAPI.listAdventures(adventuresRegion);
    });

    CampManager.on("adventures:list:web", function(adventuresRegion) {
//      CampManager.navigate("adventures");      
      AdventuresAPI.listAdventuresWeb(adventuresRegion);
    });

    //Initialize the router for AdventuresApp
    CampManager.addInitializer(function() {
      new AdventuresAppRouter.Router({
        controller: AdventuresAPI
      });
    });
  });
});