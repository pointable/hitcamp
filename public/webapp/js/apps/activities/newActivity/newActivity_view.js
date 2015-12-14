define(["app",
  "text!apps/activities/newActivity/templates/newActivity_item.html",
  "text!apps/activities/newActivity/templates/newActivity_dialog.html",
  "bootstrap"
],
    function(LessonManager, newActivityItemTpl, newActivityDialogTpl) {
      LessonManager.module("ActivitiesApp.NewActivity.View", function(View, LessonManager, Backbone, Marionette, $, _) {

        View.ActivityType = Marionette.ItemView.extend({
          className: "activity-types-area ",
          template: _.template(newActivityItemTpl),
          events: {
//          'mousedown .js-edit': 'editActivityClicked',
            'click .js-delete': 'deleteActivityClicked'
//            'click .activity-types-area': 'activityTypeClicked'
          },
          triggers:{
             'click .js-activity-type': 'activityType:select'
          },
          activityTypeClicked: function(e) {
            console.log("activityTypeClicked");
            e.preventDefault();
            this.trigger("activityType:select", this);
          },
          onRender: function() {
            //this.style.activate(this);            
            $(".activity-types-area").on("click", function() {
            });
          },
          onShow: function() {

          },
          initialize: function() {
            this.model.on('change', this.render);
          }
        });

        View.ActivityTypes = Marionette.CompositeView.extend({
          className: "modal custom fade",
          id: "myModal",
          template: _.template(newActivityDialogTpl),
          childView: View.ActivityType,
          childViewContainer: ".modal-body",
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
          triggers: {
            'click .js-new': 'activity:new'
          },
          onRender: function() {
            console.log("####Activities are rendered");
          },
          onShow: function() {
            $('.dropdown-toggle').dropdown();
            //$(".activity-types-area").responsiveEqualHeightGrid();
          }
        });

      });
      return LessonManager.ActivitiesApp.NewActivity.View;
    });