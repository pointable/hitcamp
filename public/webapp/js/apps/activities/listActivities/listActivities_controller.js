define(["app",
  "apps/activities/listActivities/listActivities_view",
  "interact",
  "bootbox",
//  "introJs",
  "chardinJs",
  "tilesprocessor",
  "bootstrap"
],
    function (LessonManager, View, interact, bootbox, chardinJs) {
      LessonManager.module("ActivitiesApp.ListActivities",
          function (List, LessonManager, Backbone, Marionette, $, _) {
            var MAX_LENGTH = 25;
            var reqres = new Backbone.Wreqr.RequestResponse();
            var activtiesViewReqres = new Backbone.Wreqr.RequestResponse();
            List.Controller = {
              listActivities: function (options) {
                //Server
                if (options === undefined || options === null || options.activityIDToBeAnimated) {
                  require(["entities/activity/activity_collection"], function () {
                    var fetchingActivities = LessonManager.request("activity:entities");
                    $.when(fetchingActivities).done(function (activities) {
                      if (options !== null && options.activityIDToBeAnimated !== null) {
                        activities.get(options.activityIDToBeAnimated).set("animate", true);
                      }
                      //Fixing bug for elements which does not have actitity types                      
                      listActivitiesView(activities);

                    });
                  });
                  //HTML
                } else if (options.initialized) {
                  console.log("options.initialized");
                  require(["entities/activity/activity_collection"], function () {
                    var activities = LessonManager.request("activity:entities:initialized");
                    listActivitiesView(activities);
                  });
                  //Inner List call - need to pass activities
                } else if (options.activities) {
                  listActivitiesView(options.activities);
                  //Not used
                }
              },
              moveActivities: function () {
                $(".js-edit-state").toggleClass("js-edit");
                $(".js-rename-state").toggleClass("js-rename");
                interact('.drag-drop')
                    .draggable({
                      onmove: function (event) {
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
              moveStopActivities: function () {
                $(".js-edit-state").toggleClass("js-edit");
                $(".js-rename-state").toggleClass("js-rename");
                console.log("stop");
                interact('.drag-drop')
                    .draggable(false);
              },
              addActivity: function (view) {
                var activityType = view.model.get("type");
                var activities = reqres.request("activities");
                var activitiesView = reqres.request("activities:view");

                if (activities.length < 25) {
                  var newActivity = LessonManager.request("activity:entity:new");
                  newActivity.set("index", activities.length + 1);
                  newActivity.set("activityType", activityType);
                  require(["entities/element/element_collection"], function () {
                    var elements = LessonManager.request("element:entities:new");
                    require(["entities/element/element_model"], function () {
                      var element = LessonManager.request("element:entity:new");
//                      var activityIndex = activities.collection.indexOf(newActivity) + 1;
                      var elementIndex = elements.length + 1;
                      element.set("index", elementIndex);
                      elements.add(element);
                      console.log("elements after add %O", elements);
                      newActivity.set("elements", elements);
                      switch (activityType) {
                        case "wordList":
                          newActivity.set("icon", "fa-file-o");
                          break;
                        case "media":
                          newActivity.set("icon", "fa-file-image-o");
                          break;
                      }
                      console.log("#####activityType: " + activityType);
                      //Check for empty spots
                      var row = 9;
                      var col = 9;
                      var row_size = 5;
                      var col_size = 5;
                      var activities2D = new Array(row_size);
                      for (var i = 0; i < row; i += 2) {
                        activities2D[i] = new Array(col_size);
                      }
                      _.each(activities.models, function (activity) {
                        activities2D[activity.get("x")][activity.get("y")] = activity.get("_id");
                      });


                      for (var i = 0; i < row; i += 2) {
                        for (var j = 0; j < col; j += 2) {
                          // console.log("2D:" + i + ", " + j);
                        }
                      }
                      outerloop://for breaking double for loop
                          for (var i = 0; i < row; i += 2) {
                        for (var j = 0; j < col; j += 2) {
                          if (activities2D[i][j]) {
                            console.log("occupied:" + i + ", " + j);
                          } else {
                            // console.log("non-occupied:" + i + ", " + j);
                            newActivity.set({
                              'x': i,
                              'y': j
                            });
                            break outerloop;
                          }
                        }
                      }
                      activities.create(newActivity, {
                        success: function () {
                          //Animate the add after adding the element
                          var newActivityView = LessonManager.request("activities:view").children.findByModel(newActivity);
                          if (newActivityView) {
                            newActivityView.$el.addClass("animated bounce");
                            newActivityView.$el.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                              newActivityView.$el.removeClass("animated bounce");
                            });
                          }

                        }
                      });

                    });
                  });

                } else {
                  bootbox.alert(
                      "Maximum number of activities reached,\
                        please delete one of them before adding!",
                      function () {

                      }
                  );

                }
              }
            };
            function listActivitiesView(activities, options) {
              //Fix activities which does not has activity type
              //Self recover due to no activityType from server
              _.each(activities.models, function (activity) {
                if (activity.get("activityType") === "" && activity.get("wordLists").length === 0) {
                  activity.set("activityType", "media");
                  activity.save();
                }
              });

              //preload images
              _.each(activities.models, function (activityModel) {
                if (typeof activityModel.get("elements") !== 'undefined') {
                  _.each(activityModel.get("elements").models, function (elementModel) {
                    if (elementModel.get("isImage"))
                    {
                      var resourceUrl = elementModel.get("resourceUrl");
                      //            console.log(resourceUrl);
                      window.imgPreloader.push(resourceUrl);
                    }
                  });
                }
              });

              reqres.setHandler("activities", function () {
                return activities;
              });

              //Display the activities Layout first                            
              var activitiesLayoutView = new View.ActivitiesLayout();
              activitiesLayoutView.on("show", function () {
                console.log("render map and wordlists editor");
                //Show wordListsEditor
                LessonManager.trigger("wordLists:list", activitiesLayoutView.wordListsRegion);
                //Show Adventuremap
                require(["entities/lesson/lesson_model"], function () {
                  //Display the lesson or activity map
                  var fetchingLessonModel = LessonManager.request("lesson:entity:initialized");
                  $.when(fetchingLessonModel).done(function (lesson) {

                    var activityListView = new View.Activities({
                      collection: activities,
                      model: lesson
                    });
                    LessonManager.reqres.setHandler("activities:view", function () {
                      return activityListView;
                    });
                    activitiesLayoutView.adventureMapRegion.show(activityListView);

                    activityListView.on("backgroundImage:update", function (view, data) {
                      console.log("update activity map");
                      var lessonModel = view.model;
                      var JSON = {
                        image: "thisImage",
                        url: "this is the url"
                      }
//                    var backgroundURL2 = "http://www.joomlaworks.net/images/demos/galleries/abstract/7.jpg";
//                    var backgroundURL = "http://1.bp.blogspot.com/-hrGFLyJba3U/Uh90QVFp01I/AAAAAAAAFoY/F5R7LBbTox0/s1600/Background-Picture-Html.jpg";
//                    lessonModel.set("backgroundImageURL", backgroundURL2);
//                    lessonModel.set("backgroundImageJSON", JSON);
                      lessonModel.set(
                          {
                            "backgroundImageURL": data.backgroundImageURL,
                            "backgroundThumbnailURL": data.backgroundThumbnailURL,
                            "backgroundImageJSON": data.backgroundImageJSON,
                            "silent": true
                          }
                      );
                      var tempLesson = lessonModel.clone();
                      tempLesson.unset("tiles", "silent:true");
                      tempLesson.save({}, {
                        success: function (res) {
                          tempLesson.trigger('destroy', tempLesson, tempLesson.collection);
                        },
                        error: function (res) {
                        }
                      });

//                    lessonModel.save({}, {
//                      success: function(res) {
//                        console.log("lesson save sucess" + res);
//                      },
//                      error: function(res) {
//                        console.log("lesson save fail " + res);
//                      }
//                    });
                    });

                    activityListView.on("childview:activity:setCoordinates", function (view) {
                      curCheckpoint = view;
//                    console.log("set coordinates");
                    });

                    activityListView.on("lesson:rename", function (view) {
                      //TODO

                      var some_html = '<form class="bootbox - form"><input class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text"></form>';
                      // some_html += '<h2>You can use custom HTML too!</h2><br />';

//                    bootbox.dialog({
//                      message: some_html,
//                      title: "Rename Adventure",
//                      buttons: {
//                        main: {
//                          label: "Save",
//                          className: "btn-primary",
//                          callback: function(res) {
//                            
//                            if (res === null) {
//                              return;
//                            } else {
//                              $("#myModal").modal('hide');
//                              $(".bootbox-input-text").html();
//                              console.log("text",$(".bootbox-input-text").html());
//                              console.log("res %O",res);
////                              lesson.set("lessonName", res);
////                              var tempTiles = lesson.get("tiles").clone();
////                              lesson.save({"lessonName": lesson.get("lessonName")}, {
////                                patch: true,
////                                wait: true,
////                                success: function() {
////                                  lesson.set("tiles", tempTiles);
////                                  console.log("success %O", lesson);
////                                }
////                              });
//                            }
//                          }
//                        }
//                      }
//                    });

                      bootbox.prompt({
                        title: "Rename Adventure Title",
                        value: view.model.get("lessonName"),
                        callback: function (res) {
                          var res = $.trim(res);
                          if (res === null || res.length === 0) {
                            return;
                          } else {
                            lesson.set("lessonName", res);
                            var tempTiles = lesson.get("tiles").clone();
                            lesson.save({"lessonName": lesson.get("lessonName")}, {
                              patch: true,
                              wait: true,
                              success: function () {
                                lesson.set("tiles", tempTiles);
                                console.log("success %O", lesson);
                              }
                            });
                          }
                        }
                      });
                    });

                    activityListView.on("editor:show:guide", function () {
//                    console.log("show guide");
//                    introJs().exit();
//                    var intro = introJs();
//                    startIntro(intro, "activity");
                      $(".wordList-editor-area").css("z-index", "auto");

                      $('body').one('chardinJs:stop', function () {
                        $(".wordList-editor-area").css("z-index", "");
                      });

                      $('body').chardinJs('start');
                    });

                    activityListView.on("editor:live:demo", function () {
                      //alert($(args.view.el.target).text());
                      console.log("live demo");
                    });


                    activityListView.on("activity:tiles", function (view) {
                      //Todo                    
                      listActivityMapView(view.model.get("tiles"));
                    });

                    activityListView.on("childview:activity:color", function (view) {
                      var activity = view.model;
                      if ($(view.e.currentTarget).hasClass("blue")) {
                        activity.set("checkPointIcon", "markerBlue");
                      } else if ($(view.e.currentTarget).hasClass("brown")) {
                        activity.set("checkPointIcon", "markerBrown");
                      } else if ($(view.e.currentTarget).hasClass("green")) {
                        activity.set("checkPointIcon", "markerGreen");
                      } else if ($(view.e.currentTarget).hasClass("pink")) {
                        activity.set("checkPointIcon", "markerPink");
                      } else if ($(view.e.currentTarget).hasClass("red")) {
                        activity.set("checkPointIcon", "markerRed");
                      } else if ($(view.e.currentTarget).hasClass("yellow")) {
                        activity.set("checkPointIcon", "markerYellow");
                      }
                      saveActivity(activity);

                    });

                    activityListView.on("childview:activity:delete", function (childView, model) {
                      bootbox.confirm("Do you want to delete the activity?", function (result) {
                        console.log(result);
                        if (result) {
                          model.destroy();
                          //Reset all the index attributes when one of them is being deleted and relist the items
                          _.each(activities.models, function (activityModel) {
                            activityModel.set("index", activities.indexOf(activityModel) + 1);
                          });

                          console.log("delete activity");
                        } else {
                          return;
                        }
                      });

                    });
                    //TODO launching the modal for activites
                    activityListView.on("childview:activity:edit", function (args) {
                      //Giving the activity model, so that elements can be saved on that activity model
                      var activity = args.model;
                      var activityType = args.model.get("activityType");
                      switch (activityType) {
                        case "wordList":
                          console.log("Clicked edit activity app -> %O", args);
                          LessonManager.trigger("plugins:configureWord", args);
                          break;
                        case "media":
                          console.log("Clicked edit activity media ->");
                          //LessonManager.trigger("elements:list:local", args.model);
                          // LessonManager.trigger("element:show:first", args.model);
                          LessonManager.trigger("activity:show:first", args.model);
                          break;
                      }
                    });

                    activityListView.on("childview:activity:first", function (view) {
                      console.log("Clicked First activity ");
                      makeActivityFirst(view.model);
                      //processTiles(view.model);
//                    initTilesProcessor(tiles, activities, false); //set true if use activityTitle instead of ID
//                    console.log("###Groups");
//                    console.log(tilesProcessor.groups);
//                    console.log("###Neighbours for each activity");
//                    console.log(tilesProcessor.activityNeighbours);                    
                    });

                    activityListView.on("childview:activity:activate", function (args) {
                      console.log("Clicked activate activity");
                      if (args.model.get("active") === true) {
                        args.model.set({"active": false});
                      } else if (args.model.get("active") === false) {
                        args.model.set({"active": true});
                      }
                    });

                    activityListView.on("activity:new", function () {
                      LessonManager.trigger("activityTypes:show");
                    });

                    activityListView.on("childview:activity:rename", function (args) {

                      bootbox.prompt({
                        title: "Rename Activity Title",
                        value: args.model.get("activityTitle"),
                        callback: function (res) {

                          var res = $.trim(res);
                          if (res === null || res.length === 0) {
                            return;
                          } else {
                            args.model.set("activityTitle", res);
                            //var tempTiles = lesson.get("tiles").clone();
                            args.model.save({"activityTitle": args.model.get("activityTitle")}, {
                              wait: true,
                              success: function () {
                                console.log("success %O", args.model);
                              }
                            });
                          }
                        }
                      });

//                      bootbox.prompt("Rename Activity Title", function(result) {
//                        if (result === null) {
//                          return;
//                        } else if (result === '') {
//                          args.model.set("activityTitle", "");
//                          args.model.save();
//                        } else {
//                          args.model.set("activityTitle", result);
//                          args.model.save();
//                        }
//                      });
                    });


                    //Display the tiles from the lesson
                    var TILE_X_SIZE = 72;
                    var TILE_Y_SIZE = 60;
                    listActivityMapView(lesson.get("tiles"));
                    var tiles = lesson.get("tiles");
                    function makeActivityFirst(first_activity) {
                      initTilesProcessor(tiles, activities, false); //set true if use activityTitle instead of ID
                      // console.log("###Groups");
                      //  console.log(tilesProcessor.groups);                    
                      var setActivityAsFirst = first_activity;
                      if (setActivityAsFirst) {
                        //find the group it is in and set it as first                                         
                        var firstActivityID = first_activity.get("_id");
                        _.each(tilesProcessor.groups, function (group) {
                          var index = _.indexOf(group, first_activity.get("_id"));

                          if (index > -1) { // if found,
                            if (group.length === 1) {
                              alert("cannot mark single element as first");
                              return;
                            }
                            //set all to non-active and non-first                          
                            _.each(group, function (activityID) {
                              if (firstActivityID === activityID) {
                                setActiveFirst(group[index]);
                              } else {
                                setNonActiveNonFirst(activityID);
                              }
                            });
                            //set it as first, and activate it    

                            //ignore the element in the same group
                          }

//                        else if (index < 0) {
//                          //reset all to non-active
//                          _.each(group, function(activityID) {
//                            
//                            setNonActive(activityID);
//                          });
//                          //set first element active
//                          setActive(group[0]);
//                        }
                        });
                      }

//                    console.log("###Neighbours for each activity");
//                    console.log(tilesProcessor.activityNeighbours);

                      function firstForGroup(group) {
                        var setFirstForGroup = false;
                        _.each(group, function (activityID) {
                          if (setFirstForGroup === false) {
                            setFirstForGroup = true;
                            setActive(activityID);
                          } else {
                            setNonActive(activityID);
                          }
                        });
                      }
                    }

                    function setNonActiveNonFirst(ID) {
                      var act = activities.get({id: ID});
                      var change = false;

                      if (act.get("first") === true) {
                        change = true;
                      }

                      if (act.get("active") === true) {
                        change = true;
                      }
                      if (change) {
                        act.set({
                          "first": false,
                          "active": false
                        });
                        console.log("#####Save Non active Non First: " + act.get("activityTitle"));
                        saveActivity(act);
                      }
                    }
                    function setActiveFirst(ID) {
                      var act = activities.get({id: ID});
                      var change = false;
                      if (act.get("first") === false) {
                        change = true;
                      }

                      if (act.get("first") === false) {
                        change = true;
                      }
                      if (change) {
                        act.set({
                          "first": true,
                          "active": true
                        });
                        saveActivity(act);

                        console.log("#####Save Active First: " + act.get("activityTitle"));
                      }
                    }
                    function setNonActive(ID) {
                      var act = activities.get({id: ID});
                      var change = false;

                      if (act.get("active") === true) {
                        change = true;
                      }
                      if (change) {
                        act.set({
                          "active": false
                        });
                        console.log("#####Save non-active: " + act.get("activityTitle"));
                        saveActivity(act);
                      }
                    }
                    function setActive(ID) {
                      var act = activities.get({id: ID});
                      var change = false;

                      if (act.get("first") === false) {
                        change = true;
                      }
                      if (change) {
                        act.set({
                          "active": true
                        });
                        saveActivity(act);
                        console.log("#####Save Active: " + act.get("activityTitle"));
                      }
                    }
                    function processTiles() {
                      //Reset tile to non-active if joined group with first
                      //else determined the condition on whether it is the first
                      //element in the group

                      initTilesProcessor(tiles, activities, false);
                      _.each(tilesProcessor.groups, function (group) {
                        var activity_with_first = "";

                        //Dropping the first element from a group to outside. 
                        //Checking group with 1 activity, make sure it is non first
                        //and save it
                        if (group.length === 1) {
                          var activity = activities.get({id: group[0]});
                          var change = false;
                          if (activity.get("first") === true) {
                            activity.set({"first": false});
                            console.log("group with 1 activity, set first to false: "
                                + activity.get("activityTitle"));
                            change = true;
                          }

                          if (activity.get("active") === false) {
                            activity.set({"active": true});
                            change = true;
                            console.log("group with 1 activity, set it to active: "
                                + activity.get("activityTitle"));
                          }

                          if (change === true) {
                            saveActivity(activity);
                          }
                        } else if (group.length > 1) {
                          //Search for the last activity for each group which contains first
                          //set it as the first and reset the rest to non-first and non-active
                          var id_forFirstActivity = '';
                          _.each(group, function (activityID) {
                            var activity = activities.get({id: activityID});
                            if (activity.get("first")) {
                              activity_with_first = activity;
                              id_forFirstActivity = activityID;
                            }
                          });
                          //If there is a first for the group
                          if (activity_with_first) {
                            console.log("activity_with_first", activity_with_first.get("activityTitle"));
                            //Reset the others to non-first non-active
                            _.each(group, function (activityID) {
                              var activity = activities.get({id: activityID});
                              if (id_forFirstActivity !== activityID) {
                                setNonActiveNonFirst(activityID);
                              } else {
                                //By default the first element would be active
                                //Just for security reset it.
                                if (activity.get("active") === false) {
                                  //activity.set({"active": true});
                                  setActive(activityID);
                                  console.log("setting the last element with first to active :" + activity.get("activityTitle"));
                                }
                              }
                            });//If there is no first element,
                            // select the first one in the group to be first
                          } else if (activity_with_first === '') {
                            var id = group[0];
                            var activity = activities.get({id: id});
                            console.log("No first element, set the first element to be active and first :" + activity.get("activityTitle"));
                            //set the other element to non-active
                            _.each(group, function (activityID) {
                              activity = activities.get({id: activityID});
                              if (activityID !== id) {
                                setNonActive(activityID);
                              } else {
                                setActiveFirst(activityID);
                              }
                            });
                          }
                        }
                      });
                    }

                    //Append the tiles
                    function listActivityMapView(tiles) {
                      var activityMapView = new View.ActivityTiles({
                        collection: tiles
                      });
//                    _.each(tiles.models,function(tile){
//                      console.log("x:"+tile.get('x')+' y: '+tile.get('y')+" tile type: " + tile.get("tileType"));
//                    });
                      $("#adventure-view canvas").after($(activityMapView.render().el));
                      $(".activity-wrapper-dropzone").unwrap();

                      //Position the tiles
                      //Array of activity status
                      initTilesProcessor(tiles, activities, false); //set true if use activityTitle instead of ID
//                    console.log("###Groups");
//                    console.log(tilesProcessor.groups);
//                    console.log("###Neighbours for each activity");
//                    console.log(tilesProcessor.activityNeighbours);


                      var activity_tiles = $(".activity-coordinate");
                      _.each(activity_tiles, function (activity_tile) {
                        var tile_coordinate = $(activity_tile).data();
                        var tile_x = tile_coordinate.x;
                        var tile_y = tile_coordinate.y;

                        $(activity_tile).parent().parent().css({
                          left: tile_x * TILE_X_SIZE,
                          top: tile_y * TILE_Y_SIZE
                        });
                        //console.log("x: " + tile_x + " y: " + tile_y);
                      });

                      activityMapView.on("childview:tile:toggle", function (args) {

                        var target = $(args.el).find(".js-toggle-tile");
                        // target.toggleClass("tile-non-active");
                        if (target.hasClass("tile-non-active")) {
                          console.log("set tile active");
                          args.model.set("a", true);
                        } else if (target.hasClass("tile-active")) {
                          console.log("set tile non active");
                          args.model.set("a", false);
                        }
//                      console.log("horizontal)";
//                      console.log(args.model);
                        processTiles();
                        saveLesson();
                      });

                      activityMapView.on("childview:tile:toggle:ver", function (args) {
                        console.log("toggle tiles");
                        var target = $(args.el).find(".vertical-line");
                        target.toggleClass("tile-non-active");
                        if (target.hasClass("tile-non-active")) {
                          args.model.set("a", false);
                        } else {
                          args.model.set("a", true);
                        }

                        var tiles = lesson.get("tiles");
                        console.log("toggle lesson tiles %O", tiles);
//                      console.log("vertical");
//                      console.log(args.model);
                        processTiles();
                        saveLesson();
                      });
                    }
                    //Adding the tiles to the main view

                    //Remove drag-drop for dropzones
                    $(".activity-dropzone").parent().removeClass("drag-drop");
                    var isEnter = false;
                    //Making the tiles draggable  
                    var start, end;
                    var curCheckpoint;

                    interact('.drag-drop')
                        .draggable({
                          onmove: function (event) {
                            var target = event.target;

                            target.x = (target.x | 0) + event.dx;
                            target.y = (target.y | 0) + event.dy;

                            target.style.webkitTransform = target.style.msTransform = target.style.transform =
                                'translate(' + target.x + 'px, ' + target.y + 'px)';
                            start = new Date();
                          },
                          onend: function (event) {
                            end = new Date();
                            var target = event.target;
                            var jtarget = $(event.target);
                            if (isEnter) {
                              //reset the current position as the new position
                              event.target.classList.remove('checkpoint-dropped');
                              $(event.target).css({
                                "webkit-transform": "translate(0px,0px)",
                                "transform": "translate(0px,0px)",
                                "-ms-transform": "translate(0px,0px)"
                              });
                              target.x = 0;
                              target.y = 0;
                            } else
                            {
                              //Snap Back to position if not enter
                              target.style.webkitTransform = target.style.transform =
                                  'translate(' + 0 + 'px, ' + 0 + 'px)';
                              $(event.target).css({
                                "webkit-transform": "translate(0px,0px)",
                                "transform": "translate(0px,0px)",
                                "-ms-transform": "translate(0px,0px)"
                              });
                              target.x = 0;
                              target.y = 0;
                              //reset position
                            }
                          }
                        })
                        .restrict({drag: 'parent', endOnly: true});
                    //Making the tiles droppable
                    interact('.dropzone')
                        .dropzone({
                          accept: '.activity-wrapper',
                          overlap: 'center',
                          ondragenter: function (event) {
                            var draggableElement = event.relatedTarget,
                                dropzoneElement = event.target;

                            isEnter = true;
                            // feedback the possibility of a drop
                            dropzoneElement.classList.add('checkpoint-dropped');
                            draggableElement.classList.add('can-drop');
                            draggableElement.background = 'Dragged in';
                          },
                          ondragleave: function (event) {
                            isEnter = false;
                            // remove the drop feedback style
                            event.target.classList.remove('checkpoint-dropped');
                            event.relatedTarget.classList.remove('can-drop');

                            //event.relatedTarget.textContent = 'Dragged out';
                          },
                          ondrop: function (event) {
                            isEnter = true;
                            //event.target == dropzone
                            //event.relatedTarget == checkpoint
                            var dropzone = event.target;
                            var checkpoint = event.relatedTarget;
                            var beforeDropLocation = $(checkpoint).find(".activity-coordinate").data();
                            var x_before = beforeDropLocation.x;
                            var y_before = beforeDropLocation.y;
                            dropzone.classList.remove('checkpoint-dropped');
                            //checkpoint.textContent = 'Dropped';
                            var drop_location = $(dropzone).find(".activity-coordinate").data();
                            //Set the element being dropped with the new coordinate data

                            $(checkpoint).find(".activity-coordinate").data({"x": drop_location.x, "y": drop_location.y});
                            var drop_location_set = $(checkpoint).find(".activity-coordinate").data();
//                        console.log("set x:" + drop_location_set.x + " ,set y:" + drop_location_set.y);
                            //Swap activites position if found they are the same
                            _.each(activities.models, function (activity) {
                              if (drop_location.x === activity.get("x") && drop_location.y === activity.get("y")) {
                                console.log("space occupied");
                                //swap activity position
                                //Check if it is trhe same element, if yes do not save
                                if (curCheckpoint.model.get("_id") !== activity.get("_id")) {
                                  activity.set({
                                    "x": x_before,
                                    "y": y_before
                                  });
                                  console.log("#save for swap");
                                  saveActivity(activity);
                                }
                              }
                            });
//                        console.log(activities);
                            //activities saved all their positions

                            modelSaveCoordinates();
//                        checkpoint.style.webkitTransform = checkpoint.style.transform ='translate(' + 0 + 'px, ' + 0 + 'px)';
                          }
                        });

                  function modelSaveCoordinates() {
                    var curCoordinates = $(curCheckpoint.el).find(".activity-coordinate").data();
//                    console.log("model x: " + curCoordinates.x + " model y:" + curCoordinates.y);
                    if (curCheckpoint.model.get("x") !== curCoordinates.x || curCheckpoint.model.get("y") !== curCoordinates.y) {
                      curCheckpoint.model.set("x", curCoordinates.x);
                      curCheckpoint.model.set("y", curCoordinates.y);
                      curCheckpoint.model.save();
                      console.log("###save coordinates");
                    }
                    processTiles();
                  }

                  function saveActivity(activity) {
                    var tempActivity = activity.clone();
                    tempActivity.save({}, {
                      success: function (res) {
                        tempActivity.trigger('destroy', tempActivity, tempActivity.collection);
                      },
                      error: function (res) {
                      }
                    });
                  }

                  function saveLesson() {
                    var tempLesson = lesson.clone();
                    var tempTiles = lesson.get("tiles").clone();
//                      console.log("lesson tiles %O",lesson.get("tiles"));
//                      console.log("tiles %O",tiles);
                    var deactivated_tempTiles = tempTiles.where({"a": false});
//                      console.log("deactivated_tempTiles %O", deactivated_tempTiles);
                    tempTiles.remove(deactivated_tempTiles, {silent: true});
                    _.each(tempTiles.models, function (tempTile) {
                      tempTile.unset("tileType", {silent: true});
                      tempTile.unset("tileTitle", {silent: true});
                      tempTile.unset("activated", {silent: true});
                    });
//                      console.log('tempTiles %O', tempTiles);
                    tempLesson.set({"tiles": tempTiles});

                    tempLesson.save({}, {
                      success: function (res) {

                        var tiles = lesson.get("tiles");
                        _.each(tiles.models, function (tile) {
                          if (tile.get("x") % 2 === 0) {
                            tile.set("tileType", "linkver");
                          } else {
                            tile.set("tileType", "linkhor");
                          }
                        });
                        tempLesson.trigger('destroy', tempLesson, tempLesson.collection);
                      },
                      error: function (res) {
                      }
                    });
                  }

                });

                console.log(activities);
              });
              });
                  LessonManager.mainRegion.show(activitiesLayoutView);

            }
      });

      return LessonManager.ActivitiesApp.ListActivities.Controller;
    });