define(["app",
  "apps/activities/listActivities/listActivities_view",
  "interact",
  "bootbox",
  "bootstrap"],
    function(StudentManager, View, interact, bootbox) {
      StudentManager.module("ActivitiesApp.ListActivities",
          function(List, StudentManager, Backbone, Marionette, $, _) {
            var MAX_LENGTH = 25;

            List.Controller = {
              listActivities: function(options) {
                //Server
                if (options === undefined || options === null) {
                  require(["entities/activity/activity_collection"], function() {
                    var fetchingActivities = StudentManager.request("activity:entities");
                    $.when(fetchingActivities).done(function(activities) {
                      listActivityView(activities);
                    });
                  });
                  //HTML
                } else if (options.initialized) {
                  console.log("options.initialized");
                  require(["entities/activity/activity_collection"], function() {
                    var activities = StudentManager.request("activity:entities:initialized");
                    if(options.activityIDToBeAnimated){
                      activities.get(options.activityIDToBeAnimated).set("animate", true);
                    }
                    listActivityView(activities);
                  });
                  //Inner List call - need to pass activities
                } else if (options.activities) {
                  listActivityView(options.activities);
                  //Not used
                }
              }
//              ,
//              moveActivities: function() {
//                $(".js-edit-state").toggleClass("js-edit");
//                $(".js-rename-state").toggleClass("js-rename");
//                interact('.drag-drop')
//                    .draggable({
//                      onmove: function(event) {
//                        var target = event.target;
//
//                        target.x = (target.x | 0) + event.dx;
//                        target.y = (target.y | 0) + event.dy;
//
//                        target.style.webkitTransform = target.style.transform =
//                            'translate(' + target.x + 'px, ' + target.y + 'px)';
//                      }
//                    })
//                    .inertia(false)
//                    .restrict({drag: 'parent', endOnly: false});
//              },
//              moveStopActivities: function() {
//                $(".js-edit-state").toggleClass("js-edit");
//                $(".js-rename-state").toggleClass("js-rename");
//                console.log("stop");
//                interact('.drag-drop')
//                    .draggable(false);
//              }
            };
            function listActivityView(activities) {
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
                var fetchingLessonModel = StudentManager.request("lesson:entity:initialized");
                $.when(fetchingLessonModel).done(function(lesson) {
                  var activityListView = new View.Activities({
                    collection: activities,
                    model: lesson
                  });
                  StudentManager.mainRegion.show(activityListView);
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

                    //Position the tiles
                    //Array of activity status

                    var activity_tiles = $(".activity-coordinate");
                    _.each(activity_tiles, function(activity_tile) {
                      var tile_coordinate = $(activity_tile).data();
                      var tile_x = tile_coordinate.x;
                      var tile_y = tile_coordinate.y;

                      $(activity_tile).parent().parent().css({
                        left: tile_x * TILE_X_SIZE,
                        top: tile_y * TILE_Y_SIZE
                      });
                      //console.log("x: " + tile_x + " y: " + tile_y);
                    });

//                    activityMapView.on("itemview:tile:toggle:hor", function(args) {
//                      var target = $(args.el).find(".horizontal-line");
//                      target.toggleClass("tile-non-active");
//                      if (target.hasClass("tile-non-active")) {
//                        console.log("tile non active");
//                        args.model.set("activated", false);
//                      } else {
//                        args.model.set("activated", true);
//                      }
////                      console.log("horizontal");
////                      console.log(args.model);
//                      var tempLesson = lesson.clone();
//                      tempLesson.save({}, {
//                        success: function(res) {
//                          tempLesson.trigger('destroy', tempLesson, tempLesson.collection);
//                        },
//                        error: function(res) {
//                        }
//                      });
//                    });

//                    activityMapView.on("itemview:tile:toggle:ver", function(args) {
//                      console.log("toggle tiles");
//                      var target = $(args.el).find(".vertical-line");
//                      target.toggleClass("tile-non-active");
//                      if (target.hasClass("tile-non-active")) {
//                        args.model.set("activated", false);
//                      } else {
//                        args.model.set("activated", true);
//                      }
////                      console.log("vertical");
////                      console.log(args.model);
//                      var tempLesson = lesson.clone();
//                      tempLesson.save({}, {
//                        success: function(res) {
//                          tempLesson.trigger('destroy', tempLesson, tempLesson.collection);
//                        },
//                        error: function(res) {
//                        }
//                      });
//                    });
                  }

//                  activityListView.on("itemview:activity:setCoordinates", function(view) {
//                    curCheckpoint = view;
//                    console.log("set coordinates");
//
//                  });
//
//                  activityListView.on("itemview:checkpoint:xChanged", function(view) {
//                    console.log("checkpoint:xChanged");
//                    arrangePosition(view);
//                    console.log(activities);
//                  });
//
//                  activityListView.on("itemview:checkpoint:yChanged", function(view) {
//                    console.log("checkpoint:xChanged");
//                    arrangePosition(view);
//                  });

//                  function arrangePosition(view) {
//                    var pos_x = view.model.get("x");
//                    var pos_y = view.model.get("y");
//                    //console.log("x_arrange:" + pos_x, ", y_arrange" + pos_y);
//                    $(view.$el).css({
//                      left: pos_x * TILE_X_SIZE,
//                      top: pos_y * TILE_Y_SIZE,
//                    });
//                  }

//                  activityListView.on("itemview:activity:delete", function(childView, model) {
//                    bootbox.confirm("Do you want to delete the activity?", function(result) {
//                      console.log(result);
//                      if (result) {
//                        model.destroy();
//                        //Reset all the index attributes when one of them is being deleted and relist the items
//                        _.each(activities.models, function(activityModel) {
//                          activityModel.set("index", activities.indexOf(activityModel) + 1);
//                        });
//                        showHideAddButton(activities);
//                        console.log("delete activity");
//                      } else {
//                        return;
//                      }
//                    });
//
//                  });
//                  //TODO launching the modal for activites
//                  activityListView.on("itemview:activity:edit", function(activity) {
//                    console.log("Clicked Edit activity ->");
//                    console.log(activity.model.get("elements"));
//                    //Giving the activity model, so that elements can be saved on that activity model         
//                    require(["entities/element/element_collection"], function() {
//                      StudentManager.trigger("elements:list:local", activity.model);
//                    });
//                  });

                  activityListView.on("itemview:element:show", function(args) {
                    var activity = args.model;
                    var activityType = activity.get("activityType");
                    switch (activityType) {
                      case "wordList":
                        console.log("Clicked show  app -> %O", activity);
                        // activity url
                        StudentManager.trigger("plugin:show:app", activity);
//                        var pluginTypes;
//                        var pluginApp;
//                        var pluginFound;
//                        pluginTypes = StudentManager.request("plugins");
//                        pluginApp = activity.get("pluginApp");
//                        console.log("plugins requested %O", pluginTypes);
//                        console.log("app", activity.get("pluginApp"));
//                        _.each(pluginTypes.models, function(pluginType) {
//                          var plugins = pluginType.get("plugins");
//                          pluginFound = plugins.findWhere({plugin: pluginApp});
//                          console.log("pluginFound -> %O", pluginFound);
//                        });
//
//                        if (pluginFound !== "undefined") {
//                          var options = {
//                            mode: "internal",
//                            title: pluginFound.get("pluginTitle"),
//                            activity: activity
//                          };
//                          var wordLists = activity.get("wordLists");
//                          var parameters = "?isSingle=true&listID1=" + wordLists[0] + "&listID2=" + wordLists[1];
//                          var pluginURL = pluginFound.get("pluginURL") + parameters;
//
//
//                          if (window.isDevelopment) {
//                            StudentManager.trigger("plugin:show:app:local", pluginFound.get("pluginURL"), options);
//                          } else {
//                            StudentManager.trigger("plugin:show:app:local", pluginFound.get("pluginURLDist"), options);
//                          }
//
//                        } else {
//                          console.log("app not found ->" + pluginApp);
//                        }

                        break;
                      case "media":
                        console.log("Clicked show media ->");
                        StudentManager.trigger("element:show", activity);
                        break;
                    }
                  });


//                  activityListView.on("activity:new", function() {
//                    var newActivity = StudentManager.request("activity:entity:new");
//                    newActivity.set("index", activities.length + 1);
//                    activities.create(newActivity);
//                    showHideAddButton(activities);
//                  });
//
//                  activityListView.on("itemview:activity:rename", function(args) {
//                    bootbox.prompt("Rename Activity Title", function(result) {
//                      if (result === null) {
//                        return;
//                      } else if (result === '') {
//                        args.model.set("activityTitle", "");
//                        args.model.save();
//                      } else {
//                        args.model.set("activityTitle", result);
//                        args.model.save();
//                      }
//                    });
//                  });

                  //Adding the tiles to the main view

                  //Remove drag-drop for dropzones
//                  $(".activity-dropzone").parent().removeClass("drag-drop");
//                  var isEnter = false;
//                  //Making the tiles draggable  
//                  var start, end;
//                  var curCheckpoint;
//
//                  interact('.drag-drop')
//                      .draggable({
//                        onmove: function(event) {
//                          var target = event.target;
//
//                          target.x = (target.x | 0) + event.dx;
//                          target.y = (target.y | 0) + event.dy;
//
//                          target.style.webkitTransform = target.style.transform =
//                              'translate(' + target.x + 'px, ' + target.y + 'px)';
//                          start = new Date()
//                        },
//                        onend: function(event) {
//                          end = new Date();
//                          var target = event.target;
//                          var jtarget = $(event.target);
//                          if (isEnter) {
//                            //reset the current position as the new position
//                            event.target.classList.remove('checkpoint-dropped');
//                            $(event.target).css('webkit-transform', '');
//                            target.x = 0;
//                            target.y = 0;
//                          } else
//                          {
//                            //Snap Back to position if not enter
//                            target.style.webkitTransform = target.style.transform =
//                                'translate(' + 0 + 'px, ' + 0 + 'px)';
//                            $(event.target).css('webkit-transform', '');
//                            target.x = 0;
//                            target.y = 0;
//                            //reset position
//                          }
//                        }
//                      })
//                      .restrict({drag: 'parent', endOnly: true});
//                  //Making the tiles droppable
//                  interact('.dropzone')
//                      // enable draggables to be dropped into this
//                      .dropzone(true)
//                      // only accept elements matching this CSS selector
//                      .accept('.activity-wrapper')
//                      // listen for drop related events
//                      .on('dragenter', function(event) {
//                        var draggableElement = event.relatedTarget,
//                            dropzoneElement = event.target;
//
//                        isEnter = true;
//                        // feedback the possibility of a drop
//                        dropzoneElement.classList.add('checkpoint-dropped');
//                        draggableElement.classList.add('can-drop');
//                        draggableElement.background = 'Dragged in';
//                      })
//                      .on('dragleave', function(event) {
//                        isEnter = false;
//                        // remove the drop feedback style
//                        event.target.classList.remove('checkpoint-dropped');
//                        event.relatedTarget.classList.remove('can-drop');
//
//                        //event.relatedTarget.textContent = 'Dragged out';
//                      })
//                      .on('drop', function(event) {
//                        isEnter = true;
//                        //event.target == dropzone
//                        //event.relatedTarget == checkpoint
//                        var dropzone = event.target;
//                        var checkpoint = event.relatedTarget;
//                        var beforeDropLocation = $(checkpoint).find(".activity-coordinate").data();
//                        var x_before = beforeDropLocation.x;
//                        var y_before = beforeDropLocation.y;
//                        dropzone.classList.remove('checkpoint-dropped');
//                        //checkpoint.textContent = 'Dropped';
//                        var drop_location = $(dropzone).find(".activity-coordinate").data();
//                        //Set the element being dropped with the new coordinate data
//
//                        $(checkpoint).find(".activity-coordinate").data({"x": drop_location.x, "y": drop_location.y});
//                        var drop_location_set = $(checkpoint).find(".activity-coordinate").data();
////                        console.log("set x:" + drop_location_set.x + " ,set y:" + drop_location_set.y);
//                        //Swap activites position if found they are the same
//                        _.each(activities.models, function(activity) {
//                          if (drop_location.x === activity.get("x") && drop_location.y === activity.get("y")) {
//                            console.log("space occupied");
//                            //swap activity position
//
//                            activity.set({
//                              "x": x_before,
//                              "y": y_before
//                            });
//                            
//                            saveActivity(activity);
//                          }
//                        });
////                        console.log(activities);
//                        //activities saved all their positions                        
//                        modelSaveCoordinates();
////                        checkpoint.style.webkitTransform = checkpoint.style.transform ='translate(' + 0 + 'px, ' + 0 + 'px)';
//                      });
//
//                  function modelSaveCoordinates() {
//                    var curCoordinates = $(curCheckpoint.el).find(".activity-coordinate").data();
//                    console.log("model x: " + curCoordinates.x + " model y:" + curCoordinates.y);
//                    curCheckpoint.model.set("x", curCoordinates.x);
//                    curCheckpoint.model.set("y", curCoordinates.y);
//                    curCheckpoint.model.save();
//                  }

//                  function saveActivity(activity) {
//                    var tempActivity = activity.clone();
//                    tempActivity.save({}, {
//                      success: function(res) {
//                        tempActivity.trigger('destroy', tempActivity, tempActivity.collection);
//                      },
//                      error: function(res) {
//                      }
//                    });
//                  }

                });

                //console.log(activities);
              });
            }


//            function showHideAddButton(activities) {
//              activities.length >= MAX_LENGTH ? $("#addOne").hide() : $("#addOne").show();
//            }

          });

      return StudentManager.ActivitiesApp.ListActivities.Controller;
    });


