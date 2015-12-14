define(["app",
  "text!apps/activities/listActivities/templates/activity_item.html",
  "text!apps/activities/listActivities/templates/activity_map.html",
  "text!apps/activities/listActivities/templates/activity_tile.html",
  "interact"
],
    function (StudentManager, activityItemTpl, activityMapTpl, activityTileTpl, interact) {
      StudentManager.module("ActivitiesApp.ListActivities.View", function (View, StudentManager, Backbone, Marionette, $, _) {
        var TILE_X_SIZE = 72;
        var TILE_Y_SIZE = 60;
        View.Activity = Marionette.ItemView.extend({
          className: "activity-wrapper btnActivityNoGap col-md4 col-xs-12 col-lg-1 js-edit drag-drop",
          template: _.template(activityItemTpl),
          events: {
//          'mousedown .js-edit': 'editActivityClicked',
//            'click .js-delete': 'deleteActivityClicked',
//            'click .js-rename': 'renameActivityClicked',
            'click .js-move': 'activityClickedDetected'
          },
          modelEvents: {
            'change:x': "xChanged",
            'change:y': "yChanged",
            'change:active': "aChanged"
          },
          xChanged: function (args, val) {
            this.trigger("checkpoint:xChanged", val);
          },
          yChanged: function (args, val) {
            this.trigger("checkpoint:xChanged", val);
          },
          aChanged: function (args, val) {
            this.style.activate(this);
          },
          onRender: function () {
            this.style.arrange(this);
            this.style.activate(this);
          },
          onShow: function () {
            this.style.animate(this);
          },
          style: {
            arrange: function (view) {
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
            }
          },
          deleteActivityClicked: function () {
            this.trigger("activity:delete", this.model);
          },
          editActivityClicked: function (e) {
            e.preventDefault();
            this.trigger("activity:edit", this.model);
          },
          renameActivityClicked: function (e) {
            this.trigger("activity:rename", this.model);
          },
          remove: function () {
            var self = this;
            Marionette.ItemView.prototype.remove.call(this);
          },
          initialize: function () {
            this.model.on('change', this.render);
          },
          activityClickedDetected: function (e) {
            e.preventDefault();
            var curActivity = $(e.currentTarget).closest('.activity-wrapper');
              curActivity.addClass("animated bounce infinite-animation");
            this.trigger("element:show", this.model);
          }
        });

        View.Activities = Marionette.CompositeView.extend({
          className: "container-fluid activity-area activity-blue-glow padding-0px",
          template: _.template(activityMapTpl),
          itemView: View.Activity,
          itemViewContainer: "#adventure-view",
//        initialize: function() {
//          this.appendHtml = function(collectionView, itemView, index) {
//            collectionView.$el.find("#addOne").before(itemView.el);
//          };
//          this.listenTo(this.collection, "add", function(collectionView, itemView, index) {
//            this.appendHtml = function(collectionView, itemView, index) {
//              collectionView.$el.find("#addOne").before(itemView.el);
//            };
//          });
//        },
          triggers: {
            'click .js-new': 'activity:new'
          },
          onRender: function () {
            console.log("####Activities are rendered");
          }
        });

        View.ActivityTile = Marionette.ItemView.extend({
          className: "activity-wrapper-tiles",
          template: _.template(activityTileTpl),
          triggers: {
//            'click .js-new': 'activity:new'
//            'click .js-toggle-hor': 'tile:toggle:hor',
//            'click .js-toggle-ver': 'tile:toggle:ver'
          }
        });

        View.ActivityTiles = Marionette.CollectionView.extend({
          itemView: View.ActivityTile,
          onRender: function () {
            console.log("####Tiles Collections are rendered");

//            console.log("pinchzoom");
//            new RTP.PinchZoom($("#activity-view"), {});
//            $(".pinch-zoom-container").css("height", "100%");
          }
        });

      });
      return StudentManager.ActivitiesApp.ListActivities.View;
    });