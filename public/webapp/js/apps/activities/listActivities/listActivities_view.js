define(["app",
  "text!apps/activities/listActivities/templates/activities_layout.html",
  "text!apps/activities/listActivities/templates/activity_item.html",
  "text!apps/activities/listActivities/templates/activity_map.html",
  "text!apps/activities/listActivities/templates/activity_tile.html",
  "bootstrap"
],
    function (LessonManager, activitiesLayoutTpl, activityItemTpl, activityMapTpl, activityTileTpl) {
      LessonManager.module("ActivitiesApp.ListActivities.View", function (View, LessonManager, Backbone, Marionette, $, _) {

        var TILE_X_SIZE = 72;
        var TILE_Y_SIZE = 60;
        View.ActivitiesLayout = Marionette.LayoutView.extend({
          template: _.template(activitiesLayoutTpl),
          regions: {
            wordListsRegion: "#wordLists-region",
            adventureMapRegion: "#adventureMap-region"
          }
        });
        var activityItemViewHelpers = {
          checkpoint_marker: function () {
            console.log("pluginAppIcon" + this.pluginAppIcon);
          }
        };
        View.Activity = Marionette.ItemView.extend({
          className: "activity-wrapper btnActivityNoGap drag-drop",
          template: _.template(activityItemTpl),
          templateHelpers: activityItemViewHelpers,
          events: {
            'click .js-delete': 'deleteActivityClicked',
            'click .js-rename': 'renameActivityClicked',
            'mousedown .js-move': 'mouseDownDetected',
            'touchstart .js-move': 'touchStartDetected',
            'click .js-add': "addActivity",
            'click .js-edit': 'editActivityClicked',
            'click .js-first': 'makeActivityFirst',
            'click .js-activate': 'activateActivity',
            'click .js-color': 'changeColorClicked'
          },
          modelEvents: {
            'change:x': "xChanged",
            'change:y': "yChanged",
            'change:active': "aChanged"
          },
          initialize: function () {
            this.model.on('change', this.render);
          },
          xChanged: function (args, val) {
            this.style.arrange(this);
          },
          yChanged: function (args, val) {
            this.style.arrange(this);
          },
          aChanged: function (args, val) {
            this.style.activate(this);
          },
          colorChanged: function (args, val) {
            this.sytle.color(this);
          },
          onRender: function () {
            this.style.arrange(this);
            this.style.activate(this);
            // this.style.animate(this);
            $('.dropdown-toggle').dropdown();

          },
          onShow: function () {
            this.style.animate(this);
          },
          style: {
            arrange: function (view) {
              //alert("arranging");
              var pos_x = view.model.get("x");
              var pos_y = view.model.get("y");
              //console.log("x_arrange:" + pos_x, ", y_arrange" + pos_y);
              $(view.$el).css({
                left: pos_x * TILE_X_SIZE,
                top: pos_y * TILE_Y_SIZE
              });
            },
            activate: function (view) {
              var active = view.model.get("active");
              if (active) {
                view.$el.find(".js-activate").text("Deactivate");
                view.$el.find(".activity-emblem").css("opacity", 1.0);
              } else {
                view.$el.find(".activity-emblem").css("opacity", 0.5);
                view.$el.find(".js-activate").text("Activate");
              }
            },
            animate: function (view) {
              var animate = view.model.get("animate");
              if (animate) {
                view.$el.addClass("animated fadeInDown");
                view.$el.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                  view.$el.removeClass("animated fadeInDown");
                });
              }
            },
            color: function (view) {
              var checkpointIcon = view.model.get("checkPointIcon");
              if (checkpointIcon === "markerBlue") {
                view.$el.find(".checkpoint").attr("checkpoint markerBlue");
              } else if (checkpointIcon === "markerBrown") {
                view.$el.find(".checkpoint").attr("checkpoint markerBrown");
              } else if (checkpointIcon === "markerGreen") {
                view.$el.find(".checkpoint").attr("checkpoint markerGreen");
              } else if (checkpointIcon === "markerPink") {
                view.$el.find(".checkpoint").attr("checkpoint markerPink");
              } else if (checkpointIcon === "markerRed") {
                view.$el.find(".checkpoint").attr("checkpoint markerRed");
              } else if (checkpointIcon === "markerYellow") {
                view.$el.find(".checkpoint").attr("checkpoint markerYellow");
              }
            }
          },
          changeColorClicked: function (e) {
            e.preventDefault();
            var that = this;
            that.e = e;
            this.trigger("activity:color", that);
          },
          makeActivityFirst: function (e, args) {
            e.preventDefault();
            var curClass = args;
            //this.$el.find(".fa").removeClass(this.model.get("icon")).addClass("fa-university");
            this.trigger("activity:first", this);
          },
          activateActivity: function (e) {
            e.preventDefault();
            this.trigger("activity:activate", this);
          },
          deleteActivityClicked: function () {
            this.trigger("activity:delete", this.model);
          },
          editActivityClicked: function (e) {
            e.preventDefault();
            var curActivity = $(e.currentTarget).closest('.activity-wrapper');
            if (this.model.get("activityType") === 'media') {
              curActivity.addClass("animated bounce infinite-animation");
            }
            this.trigger("activity:edit", this.model);
          },
          renameActivityClicked: function (e) {
            this.trigger("activity:rename", this.model);
          },
          remove: function () {
            var self = this;
            Marionette.ItemView.prototype.remove.call(this);
          },
          mouseDownDetected: function (e) {
            var that = this;
            if (e.which !== 3)//not right click
            {
              var that = this;
              e.preventDefault();
              //Check whether the cursor has moved, then trigger 
              //the appropriate action
              var mousemoved = false;
              var startingMousePosX = e.pageX;
              var startingMousePosY = e.pageY;
              var currentTouchPosX = 0;
              var currentTouchPosY = 0;
              $(e.target).on("mousemove", function (event) {
                currentTouchPosX = event.pageX;
                currentTouchPosY = event.pageY;
//                console.log("StartMousePosX" + startingMousePosX);
//                console.log("StartMousePosY" + startingMousePosY);
//                console.log("CurMousePosX" + currentTouchPosX);
//                console.log("CurMousePosY" + currentTouchPosY);

                if ((currentTouchPosX - startingMousePosX) > 0) {
                  mousemoved = true;
                } else if ((currentTouchPosX - startingMousePosX) < 0) {
                  mousemoved = true;
                }

                if ((currentTouchPosY - startingMousePosY) > 0) {
                  mousemoved = true;
                } else if ((currentTouchPosY - startingMousePosY) < 0) {
                  mousemoved = true;
                }

                if (mousemoved === true) {
                  $(e.target).off("mousemove");
                }
                console.log("mousemoved: " + mousemoved);
              });
              //Register for the mouseup event for one time trigger
              $(e.target).one("mouseup", function () {
                $(e.target).off("mousemove");
                //$(e.target).off("mouseup"); 
                //$(e.target).off("mousemove");
                //if no mouse move that trigger the element
                if (!mousemoved) {
                  var curActivity = $(e.currentTarget).closest('.activity-wrapper');
                  if (that.model.get("activityType") === 'media') {
                    curActivity.addClass("animated bounce infinite-animation");
                  }
                  that.trigger("activity:edit", that.model);
                } else {
                  //else set coordinate
                  that.trigger("activity:setCoordinates", that.view);
                }
              });
//              var end, start;
//              var target = e.target;
//              start = new Date();
//              var callDrag = setTimeout(function() {
//                //register a callback for setting the model            
//              }, 100);
//              $(e.target).mouseup(function() {
//                clearTimeout(callDrag);
//                //console.log("click");
//                end = new Date();
//                if ((end.getTime() - start.getTime()) < 150) {
//                  that.trigger("activity:edit", that.model);
//
//                } else {
//                  //set the activity new coordinate
//                  that.trigger("activity:setCoordinates", that.view);
//                }
//                //if time less than 100ms
//                //is a click
//              });
            }

          },
          touchStartDetected: function (e) {
            var that = this;
            e.preventDefault();
//            var end, start;

            var touchmoved = false;
            var startingTouchPosX = e.originalEvent.touches[0].pageX;
            var startingTouchPosY = e.originalEvent.touches[0].pageY;
            var currentTouchPosX = 0;
            var currentTouchPosY = 0;
            $(e.target).on("touchmove", function (event) {
              currentTouchPosX = event.originalEvent.touches[0].pageX;
              currentTouchPosY = event.originalEvent.touches[0].pageY;
//                console.log("StartMousePosX" + startingTouchPosX);
//                console.log("StartMousePosY" + startingTouchPosY);
//                console.log("CurMousePosX" + currentTouchPosX);
//                console.log("CurMousePosY" + currentTouchPosY);
              if ((currentTouchPosX - startingTouchPosX) > 0) {
                touchmoved = true;
              } else if ((currentTouchPosX - startingTouchPosX) < 0) {
                touchmoved = true;
              }

              if ((currentTouchPosY - startingTouchPosY) > 0) {
                touchmoved = true;
              } else if ((currentTouchPosY - startingTouchPosY) < 0) {
                touchmoved = true;
              }
              console.log("touchmoved: " + touchmoved);
              if (touchmoved === true) {
                $(e.target).off("touchmove");
              }
            });
            $(e.target).one({'touchend': function () {
//                console.log("click");
                $(e.target).off("touchmove");
                if (!touchmoved) {
                  var curActivity = $(e.currentTarget).closest('.activity-wrapper');
                  if (that.model.get("activityType") === 'media') {
                    curActivity.addClass("animated bounce infinite-animation");
                  }
                  that.trigger("activity:edit", that.model);
                } else {
                  //set the activity new coordinate
                  that.trigger("activity:setCoordinates", that.view, that.model);
                }
              }
            });
//            var target = e.target;
//            start = new Date();
//            var callDrag = setTimeout(function() {
//              //register a callback for setting the model            
//            }, 100);
//            $(e.target).on({'touchend': function() {
//                clearTimeout(callDrag);
////                console.log("click");
//                end = new Date();
//                if ((end.getTime() - start.getTime()) < 100) {
//                  that.trigger("activity:edit", that.model);
//                } else {
//                  //set the activity new coordinate
//                  that.trigger("activity:setCoordinates", that.view, that.model);
//                }
//                //if time less than 100ms
//                //is a click
//              }
//            });
          }
        });
        View.Activities = Marionette.CompositeView.extend({
          className: "container-fluid activity-area activity-blue-glow ",
          template: _.template(activityMapTpl),
          childView: View.Activity,
          childViewContainer: "#adventure-view",
//        initialize: function() {
//          this.appendHtml = function(collectionView, childView, index) {
//            collectionView.$el.find("#addOne").before(childView.el);
//          };
//          this.listenTo(this.collection, "add", function(collectionView, childView, index) {
//            this.appendHtml = function(collectionView, childView, index) {
//              collectionView.$el.find("#addOne").before(childView.el);
//            };
//          });
//        },
          onRenderTemplate: function (view, view2) {
            console.log("render template");
//            alert("here");
          },
          modelEvents: {
            'change:lessonName': "lessonNameChanged"
          },
          lessonNameChanged: function () {
            this.render();
          },
          activityAdded: function (model, collection) {
            console.log("model %O", model);
            console.log("view %O", collection);

          },
          initialize: function () {
            //this.model.on('change', this.render);
            var this_view = this;
            //this_view.listenTo(this_view.collection,"add",this_view.activityAdded,this_view);
//            $(document).off('BackgroundImageUpdate');
//            $(document).on('BackgroundImageUpdate', function(e, fileData) {
//              debugger;
            $(document).off('BackgroundImageUpdate');
            $(document).on('BackgroundImageUpdate', function (event, param) {
              var messageReceived = param.detail; //JSON.parse(event.detail);
//              console.log(messageReceived);
              switch (messageReceived.type)
              {
                //set all custom message type here
                case 'ResourceUpdate':
                  var data = {
                    backgroundImageURL: messageReceived.backgroundImageURL,
                    backgroundThumbnailURL: messageReceived.backgroundThumbnailURL,
                    backgroundImageJSON: messageReceived.backgroundImageJSON
                  };
                  this_view.trigger("backgroundImage:update", this_view, data);
                  break;
              }
            });
          },
          triggers: {
            'click .js-new': 'activity:new',
            'click .js-rename-lesson': 'lesson:rename',
            'click .js-guide': 'editor:show:guide'
//            'click .js-guide': 'backgroundImage:update',            

          },
          onRender: function () {
            console.log("####Activities are rendered");
            this.trigger("activity:tiles", this);
          },
          onShow: function () {

            $('.dropdown-toggle').dropdown();
          }
        });
        View.ActivityTile = Marionette.ItemView.extend({
          className: "activity-wrapper-tiles",
          template: _.template(activityTileTpl),
          events: {
            'click .js-toggle-tile': 'tileToggleClicked'
          },
          tileToggleClicked: function (e) {
            e.preventDefault();
            this.trigger("tile:toggle", this);
          },
          modelEvents: {
            'change:a': "aChanged"
          },
          aChanged: function () {
            console.log("aChanged");
            this.style.activate(this);
          },
          style: {
            activate: function (view) {
              var active = view.model.get("a");
              console.log("active:" + active);
              if (active) {
                console.log("set style as active");
                view.$el.find(".js-toggle-tile").removeClass("tile-non-active").addClass("tile-active");
              } else {
                console.log("set style as non active");
                view.$el.find(".js-toggle-tile").removeClass("tile-active").addClass("tile-non-active");
              }
            }
          },
          ui: {
            activityWrapper: ".activity-wrapper-tiles"
          },
          onRender: function () {
            this.$el.css({
              left: this.model.get("x") * TILE_X_SIZE,
              top: this.model.get("y") * TILE_Y_SIZE
            });
          }

        });
        View.ActivityTiles = Marionette.CollectionView.extend({
          className: 'tile-collection',
          childView: View.ActivityTile,
          onRender: function () {
            console.log("####Tiles Collections are rendered");
          }
        });
      });
      return LessonManager.ActivitiesApp.ListActivities.View;
    });