define(["app", "apps/elements/list/elementsList_view", "bootstrap"], function(TeacherSession, View) {
  TeacherSession.module("ElementsApp.List", function(List, TeacherSession, Backbone, Marionette, $, _) {
    List.Controller = {
      //Server
      listElements: function(activityID) {
        require(["entities/activity/activity_collection"], function() {
          var fetchActivities = TeacherSession.request("activity:entities");
          $.when(fetchActivities).done(function(activities) {
            var options = {
              activities: activities
            };
            // TeacherSession.trigger("activities:listActivities:initialized:noroute");
            var activity = activities.get(activityID);
            elementListView(activity);

          });
        });
      },
      //local
      listElementsLocal: function(activity) {
        elementListView(activity);
      },
      //Maybe should be deleted as we don't get the data from the HTML anymore.
      //Next is to get the elements when the activities are being obtained from
      //server
//      listElementsInitialized: function(id,initialized) {                
//        //Initialized
//        $.when(getActivitiesDataFromHTML()).done(function(data){
//          //Getting the elements from activity then displayed it.
//            var activityID = id;
//            var activity=data.get(activityID);
//
//            //Relist activities when closing the elements view.
//            if(!initialized){
//             TeacherSession.trigger("activities:list",activityID);
//            }            
//            require(["entities/element/element_collection"],function(){
//              //Return a new collection of elements with activityID embedded in it
//              var elements = TeacherSession.request("element:entities:new",activity.get("elements"),activityID);              
//              
//              elementListView(activity,elements);
//            });
//        });
//      }
    };

    function elementListView(activity) {
      console.log(activity);
      var elements = activity.get("elements");
      var elementsView = new View.Elements({
        model: activity,
        collection: elements
      });
      TeacherSession.dialogRegion.show(elementsView);
      $("#myModal").modal({
        backdrop: 'static',
        keyboard: false
      });

      elementsView.on("childview:element:show", function(args) {
        //this.trigger("dialog:close");
        TeacherSession.dialogRegion.closeDialog();
        TeacherSession.trigger("element:show", activity, args.model);
        TeacherSession.trigger("header:list:questionHeader");
      });

      elementsView.on("element:list:close", function(args) {
//        TeacherSession.navigate("adventures",{trigger:false});
        var activityListView = TeacherSession.request("activity:list:view");
        var newActivity = TeacherSession.request("activities").get(activity);
        var newActivityView = activityListView.children.findByModel(newActivity);
        // check whether the new contact view is displayed (it could be
        // invisible due to the current filter criterion)
        if (newActivityView) {
          newActivityView.$el.addClass("animated fadeInDown");
          console.log("animate");
          newActivityView.$el.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            newActivityView.$el.removeClass("animated fadeInDown");
          });
        }
//        console.log(activityListView.get(childViewren.);
        TeacherSession.navigate("", {trigger: false});
        TeacherSession.dialogRegion.closeDialog();




        //this.trigger("dialog:close");
      });

      elementsView.on("element:list:escape", function(view) {

        console.log(view);
      });
    }
    ;
  });
  return TeacherSession.ElementsApp.List.Controller;
});


