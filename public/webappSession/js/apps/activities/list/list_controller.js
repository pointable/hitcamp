define(["app", "apps/activities/list/list_view"], function(TeacherSession, View) {
  TeacherSession.module("ActivitiesApp.List", function(List, TeacherSession, Backbone, Marionette, $, _) {
    var MAX_LENGTH = 12;

    List.Controller = {
      //Server
      listActivities: function(options) {
        if (options === undefined || options === null) {
          require(["entities/activity/activity_collection"], function() {
            var fetchingActivities = TeacherSession.request("activity:entities");
            $.when(fetchingActivities).done(function(activities) {
              listView(activities);
            });
          });
          //HTML
        } else if (options.initialized) {
          console.log("options.initialized");
          require(["entities/activity/activity_collection"], function() {
            var activities = TeacherSession.request("activity:entities:initialized");
            listView(activities);
          });
        }
      }
    };
    function listView(activities) {
      console.log(activities);

      //preload imagesz
      _.each(activities.models, function(model) {
        _.each(model.attributes.elements.models, function(elementModel) {
          var attributes = elementModel.attributes;
          if (attributes.isImage)
          {
            //console.log(attributes.resourceUrl);
            window.imgPreloader.push(attributes.resourceUrl);
          }
        });
      });

      var model = new Backbone.Model({lessonName: activities.lessonName});
      var activitiesListView = new View.Activities({
        collection: activities,
        model: model
      });

      TeacherSession.mainRegion.show(activitiesListView);


//      parent.document.addEventListener('ServerToApp', function(e){
//        console.log('Message Received: %O', e.detail);  
////        var elements = model.get("elements");
//        TeacherSession.trigger("element:show",elements);
//      });
//              
      activitiesListView.on("childview:elements:list:local", function(activity) {
        TeacherSession.trigger("elements:list:local", activity);
      });

      activitiesListView.on("plugin:show:adventurePicker", function(activity) {        
        var url = "/plugins/lessonPicker/lessonPickerTeacher.html";
        TeacherSession.trigger("plugin:show", url);
      });

      activitiesListView.on("adventure:show:editor", function(args) {
        var url = "/adventures/edit/" + args.collection.lessonEditorId;
        window.open(url, "_self");
        //console.log("show editor");
      });

      activitiesListView.on("adventure:new", function(args) {
        var url = "/adventures/edit/";
        window.open(url, "_self");
        //console.log("show editor");
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
//            
//            //remove backdrop due to bug when called twice
//            $('.modal-backdrop').remove();
//            TeacherSession.trigger("dialog:show", url, messageReceived.title);
//            break;
//        }
//      });

    }

    function showHideAddButton(activities) {
      activities.length >= MAX_LENGTH ? $("#addOne").hide() : $("#addOne").show();
    }


  });
  return TeacherSession.ActivitiesApp.List.Controller;
});


