define(["app",
  "apps/activities/listActivities/listActivities_view",
  "interact",
  "bootbox",
  "bootstrap"],
    function(TeacherSession, View, interact, bootbox) {
      TeacherSession.module("ActivitiesApp.ListActivities",
          function(List, TeacherSession, Backbone, Marionette, $, _) {
            var MAX_LENGTH = 25;

            var Controller = Marionette.Controller.extend({
              listActivities: function(options) {
                //Server
                if (options === undefined || options === null) {
                  require(["entities/activity/activity_collection"], function() {
                    var fetchingActivities = TeacherSession.request("activity:entities");
                    $.when(fetchingActivities).done(function(activities) {
                      listActivityView(activities);
                    });
                  });
                  //HTML
                } else if (options.initialized) {
                  console.log("options.initialized");
                  require(["entities/activity/activity_collection"], function() {
                    var activities = TeacherSession.request("activity:entities:initialized");
                    listActivityView(activities);
                  });
                  //Inner List call - need to pass activities
                } else if (options.activities) {
                  listActivityView(options.activities);
                  //Not used
                }
              }
            });

            function listActivityView(activities) {
              TeacherSession.reqres.setHandler("activities", function() {
                return activities;
              });
              var self = List.Controller;
              //preload images
              _.each(activities.models, function(activityModel) {
                if (typeof activityModel.get("elements") !== 'undefined') {
                  _.each(activityModel.get("elements").models, function(elementModel) {
                    if (elementModel.get("isImage"))
                    {
                      var resourceUrl = elementModel.get("resourceUrl");
                      //            console.log(resourceUrl);
                      window.imgPreloader.push(resourceUrl);
                    }
                  });
                }
              });

              require(["entities/lesson/lesson_model"], function() {
                //Display the lesson or activity map
                var fetchingLessonModel = TeacherSession.request("lesson:entity:initialized");
                $.when(fetchingLessonModel).done(function(lesson) {
                  var activityListView = new View.Activities({
                    collection: activities,
                    model: lesson
                  });
                  TeacherSession.mainRegion.show(activityListView);
                  TeacherSession.reqres.setHandler("activity:list:view", function() {
                    return activityListView;
                  });
                  //Display the tiles from the lesson
                  var TILE_X_SIZE = 72;
                  var TILE_Y_SIZE = 60;
                  listActivityMapView(lesson.get("tiles"));

                  //Append the tiles
                  function listActivityMapView(tiles) {
                    var activityMapView = new View.ActivityTiles({
                      collection: tiles
                    });
                    $("#adventure-view").prepend($(activityMapView.render().el));
                    $(".activity-wrapper-dropzone").unwrap();
                    var activity_tiles = $(".activity-coordinate");
                    _.each(activity_tiles, function(activity_tile) {
                      var tile_coordinate = $(activity_tile).data();
                      var tile_x = tile_coordinate.x;
                      var tile_y = tile_coordinate.y;

                      $(activity_tile).parent().parent().css({
                        left: tile_x * TILE_X_SIZE,
                        top: tile_y * TILE_Y_SIZE
                      });
                    });
                  }
                  activityListView.on("childview:element:show", function(args) {
                    var activity = args.model;
                    var activityType = activity.get("activityType");
                    switch (activityType) {
                      case "wordList":
                        console.log("Clicked show  app -> %O", activity);
//                          var pluginTypes;
                        var pluginApp;
//                          var pluginFound;

                        pluginApp = activity.get("pluginApp");
                        console.log("app", activity.get("pluginApp"));
                        if (pluginApp === '') {
                          bootbox.alert("No apps assigned, please add it in your Adventure");
                          return;
                        } else {
                          TeacherSession.trigger("plugin:show", pluginApp);
                        }

//                          pluginTypes = TeacherSession.request("plugins");                          
//                          console.log("plugins requested %O", pluginTypes);
//                          
//                          _.each(pluginTypes.models, function(pluginType) {
//                            var plugins = pluginType.get("plugins");
//                            ;
//                            pluginFound = plugins.findWhere({plugin: pluginApp});
//                            console.log("pluginFound -> %O", pluginFound);
//                          });
//
//                          if (pluginFound !== "undefined") {
//                            var options = {
//                              mode: "teacher",
//                              title: pluginFound.get("pluginTitle"),
//                              trigger: "internal"
//                            };
//                            //Change to teacher URL
//                            if (window.isDevelopment) {
//                              TeacherSession.trigger("plugin:show", pluginFound.get("pluginTeacherURL"), options);
//                            } else {
//                              TeacherSession.trigger("plugin:show", pluginFound.get("pluginTeacherURLDist"), options);
//                            }
//
//                          } else {
//                            console.log("app not found ->" + pluginApp);
//                          }

                        break;
                      case "media":
                        console.log("Clicked show media ->");
                        TeacherSession.trigger("elements:list:local", activity);
                        break;
                    }
                  });

                  activityListView.on("plugin:show:adventurePicker", function(activity) {
                    var url = "/plugins/lessonPicker/lessonPickerTeacher.html";
                    var options = {
                      trigger: "internal",
                      full: true
                    };
                    TeacherSession.trigger("plugin:show:url", url, options);
                  });

                  activityListView.on("activity:show:editor", function(args) {
                    var url = "/adventures/edit/" + args.collection.lessonEditorId;
                    window.open(url, "_top");
                    console.log("show editor");
                  });

                  activityListView.on("activity:new", function(args) {
                    var url = "/adventures/edit/";
                    window.open(url, "_top");
                    //console.log("show editor");
                  });
                });
              });
            }
            List.Controller = new Controller();
          });

      return TeacherSession.ActivitiesApp.ListActivities.Controller;
    });


