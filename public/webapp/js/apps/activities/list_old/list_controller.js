define(["app", "apps/activities/list/list_view", "interact", "bootbox", "bootstrap"], function(LessonManager, View, interact, bootbox) {
  LessonManager.module("ActivitiesApp.List", function(List, LessonManager, Backbone, Marionette, $, _) {
    var MAX_LENGTH = 25;

    List.Controller = {
      listActivities: function(options) {
        //Server
        if (options === undefined || options === null) {
          require(["entities/activity/activity_collection"], function() {
            var fetchingActivities = LessonManager.request("activity:entities");
            $.when(fetchingActivities).done(function(activities) {
              listView(activities);
            });
          });
          //HTML
        } else if (options.initialized) {
          console.log("options.initialized");
          require(["entities/activity/activity_collection"], function() {
            var activities = LessonManager.request("activity:entities:initialized");
            listView(activities);
          });
          //Inner List call - need to pass activities
        } else if (options.activities) {
          listView(options.activities);
          //Not used
        }
      },
      moveActivities: function() {
        $(".js-edit-state").toggleClass("js-edit");
        $(".js-rename-state").toggleClass("js-rename");
        interact('.drag-drop')
            .draggable({
              onmove: function(event) {
                var target = event.target;

                target.x = (target.x | 0) + event.dx;
                target.y = (target.y | 0) + event.dy;

                target.style.webkitTransform = target.style.transform =
                    'translate(' + target.x + 'px, ' + target.y + 'px)';
              }
            })
            .inertia(false)
            .restrict({drag: 'parent', endOnly: false});
      },
      moveStopActivities: function() {
        $(".js-edit-state").toggleClass("js-edit");
        $(".js-rename-state").toggleClass("js-rename");
        console.log("stop");
        interact('.drag-drop')
            .draggable(false);
      }
    };
    function listView(activities) {
      var activitiesListView = new View.Activities({
        collection: activities
      });

      //preload images
      _.each(activities.models, function(activityModel) {
        _.each(activityModel.get("elements").models, function(elementModel) {
          if (elementModel.get("isImage"))
          {
            var resourceUrl = elementModel.get("resourceUrl");
//            console.log(resourceUrl);
            window.imgPreloader.push(resourceUrl);
          }
        });
      });

      LessonManager.mainRegion.show(activitiesListView);

      activitiesListView.on("childview:activity:delete", function(childView, model) {
        model.destroy();
        //Reset all the index attributes when one of them is being deleted and relist the items
        _.each(activities.models, function(activityModel) {
          activityModel.set("index", activities.indexOf(activityModel) + 1);
        });
        showHideAddButton(activities);
        console.log("delete activity");
      });
      //TODO launching the modal for activites
      activitiesListView.on("childview:activity:edit", function(activity) {
        console.log("Clicked Edit activity ->");
        //        console.log(activity.model.get("elements"));
        //Giving the activity model, so that elements can be saved on that activity model         
        require(["entities/element/element_collection"], function() {
          LessonManager.trigger("elements:list:local", activity.model);
        });
      });

      activitiesListView.on("activity:new", function() {
        var newActivity = LessonManager.request("activity:entity:new");
        newActivity.set("index", activities.length + 1);
        activities.create(newActivity);
        showHideAddButton(activities);
      });

      activitiesListView.on("childview:activity:rename", function(args) {
        bootbox.prompt("Rename Activity Title", function(result) {
          if (result === null) {
            args.model.set("activityTitle", "");
            args.model.save();
            return;
          } else if (result === '') {
            args.model.set("activityTitle", "");
            args.model.save();
          } else {
            args.model.set("activityTitle", result);
            args.model.save();
          }
        });
      });
      //Dialog listener for custom message



      $(window.document).off('DialogUrl');

      $(window.document).on('DialogUrl', function(event, param) {
        var messageReceived = param.detail;
        switch (messageReceived.type)
        {
          //set all custom message type here
          case 'UrlUpdate':
            var url = messageReceived.resourceURL;
            LessonManager.trigger("dialog:show", url, messageReceived.title);
            break;
        }
      });
    }
    ;
//    var url ="https://docs.google.com/document/d/1HeNsERfR37ulbmshKaxvhWzkZFvoMIv5vB02YikswuQ/preview";
//    LessonManager.trigger("dialog:show", url);

    function showHideAddButton(activities) {
      activities.length >= MAX_LENGTH ? $("#addOne").hide() : $("#addOne").show();
    }
    ;

  });
  return LessonManager.ActivitiesApp.List.Controller;
});


