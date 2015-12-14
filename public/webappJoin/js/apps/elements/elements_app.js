define(["app"],function(StudentManager){
  StudentManager.module("Router.ElementsApp",
    function(ElementsAppRouter,StudentManager,Backbone,Marionette,_,$){
      ElementsAppRouter.Router = Marionette.AppRouter.extend({
        appRoutes:{          
          "adventures/:id":"showFirstElement",
          "adventures/:id/elements/:id":"showElement"
        }
      });
      
      var ElementsAPI = {
        showFirstElement: function(activity){
          require(["apps/elements/show/elementsShow_controller"],function(ShowController){
            ShowController.showFirstElement(activity);
          });
        },
        showElement:function(activityID,elementIndex){
            require(["apps/elements/show/elementsShow_controller"],function(ShowController){
            ShowController.showElement(activityID,elementIndex);
          });
        }
      };
      //Always show the first element when an activity is clicked.
      StudentManager.on("element:show",function(activity){            
        StudentManager.navigate("#adventures/"+activity.id+"/elements/1");
        ElementsAPI.showFirstElement(activity);        
      });
      
      StudentManager.addInitializer(function(){
        new ElementsAppRouter.Router({
          controller:ElementsAPI
        });
      });
  });
});

