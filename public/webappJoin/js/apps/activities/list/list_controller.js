define(["app", "apps/activities/list/list_view"], function(StudentManager,View) {
  StudentManager.module("ActivitiesApp.List", function(List, StudentManager, Backbone, Marionette, $, _) {
    var MAX_LENGTH = 12;

    List.Controller = {
      //Server
      listActivities: function(options) {
        if (options === undefined || options === null) {
          require(["entities/activity/activity_collection"], function() {
            var fetchingActivities = StudentManager.request("activity:entities");
            $.when(fetchingActivities).done(function(activities) {
              listView(activities);
            });
          });
          //HTML
        } else if (options.initialized) {
          console.log("options.initialized");
          require(["entities/activity/activity_collection"], function() {
            var activities = StudentManager.request("activity:entities:initialized");
            listView(activities);
          });
        }
      }
    };
    function listView(activities) {
      console.log(activities);
      
      //preload images
      _.each(activities.models, function (model) {
        _.each(model.attributes.elements.models, function (elementModel){
          var attributes = elementModel.attributes;
          if (attributes.isImage)
          {
            //console.log(attributes.resourceUrl);
            window.imgPreloader.push(attributes.resourceUrl);
          }
        });
      });
      
      var activitiesListView = new View.Activities({
        collection: activities
      });
      

      StudentManager.mainRegion.show(activitiesListView);      


      


//      parent.document.addEventListener('ServerToApp', function(e){
//        console.log('Message Received: %O', e.detail);  
////        var elements = model.get("elements");
//        StudentManager.trigger("element:show",elements);
//      });
//              
      activitiesListView.on("itemview:element:show", function(activity) {        
        StudentManager.trigger("element:show",activity.model);
      });
      
//      $(window.document).off('DialogUrl');
//      
//      $(window.document).on('DialogUrl', function(e) {
//        var messageReceived = e.originalEvent.detail;
//        switch (messageReceived.type)
//        {
//          //set all custom message type here
//          case 'UrlUpdate':
//            var url = messageReceived.resourceURL;
//            //remove backdrop due to bug when called twice
//            $('.modal-backdrop').remove();
//            StudentManager.trigger("dialog:show", url, messageReceived.title);
//            break;
//        }
//      });
      
//      document.addEventListener('DialogUrl', function(e) {
//        var messageReceived = e.detail;
//        switch (messageReceived.type)
//        {
//          //set all custom message type here
//          case 'UrlUpdate':
//            var url = messageReceived.resourceURL;
//            StudentManager.trigger("dialog:show", url, messageReceived.title);
//            break;
//        }
//      }, this);

    };

    function showHideAddButton(activities) {
      activities.length >= MAX_LENGTH ? $("#addOne").hide() : $("#addOne").show();
    };

  });
  return StudentManager.ActivitiesApp.List.Controller;
});


