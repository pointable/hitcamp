define(["app"], function(CampManager) {
  CampManager.module("ClassroomsApp", function(ClassroomsApp, CampManager, Backbone, Marionette, $, _) {
    ClassroomsApp.onStart = function() {
      console.log("Starting ClassroomsApp");
    };
    ClassroomsApp.onStop = function() {
      console.log("Stopping ClassroomsApp");
    };
  });

  CampManager.module("Router.ClassroomsApp", function(ClassroomsAppRouter, CampManager, Backbone, Marionette, $, _) {
    ClassroomsAppRouter.Router = Marionette.AppRouter.extend({
      appRoutes: {
//        "classrooms1": "listClassrooms",                       
      }
    });

    ClassroomsAPI = {
      listClassrooms: function(classroomsRegion) {
        require(["apps/classrooms/list/classroomsList_controller"]
            , function(ListController, HeaderListController) {//              
//              if (CampManager.getCurrentRoute() !== "classrooms") {
//                CampManager.navigate("classrooms");
//              }
              ListController.listClassrooms(classroomsRegion);
              
            });
      }
    };    

    CampManager.on("classrooms:list", function(classroomsRegion) {
//      CampManager.navigate("classrooms");      
      ClassroomsAPI.listClassrooms(classroomsRegion);
    });

    //Initialize the router for ClassroomsApp
    CampManager.addInitializer(function() {
      new ClassroomsAppRouter.Router({
        controller: ClassroomsAPI
      });
    });
  });
});