define(["app",
  "text!apps/activities/newAdventure/templates/newAdventure_item.html",
  "text!apps/activities/newAdventure/templates/newAdventure_dialog.html",
  "bootstrap"
],
    function(LessonManager, newAdventureItemTpl, newAdventureDialogTpl) {
      LessonManager.module("ActivitiesApp.NewAdventure.View", function(View, LessonManager, Backbone, Marionette, $, _) {

        View.AdventureType = Marionette.ItemView.extend({
          className: "adventure-types-area ",
          template: _.template(newAdventureItemTpl),
          events: {
//          'mousedown .js-edit': 'editActivityClicked',
            'click .js-delete': 'deleteActivityClicked'
//            'click .adventure-types-area': 'adventureTypeClicked'
          },
          triggers:{
             'click .js-adventure-type': 'adventureType:select'
          },
          adventureTypeClicked: function(e) {
            alert("clicked");
            console.log("adventureTypeClicked");
            e.preventDefault();
            this.trigger("adventureType:select", this);
          },
          onRender: function() {
            //this.style.activate(this);            
            $(".adventure-types-area").on("click", function() {
              alert("test");
            });
          },
          onShow: function() {

          },
          initialize: function() {
            this.model.on('change', this.render);
          }
        });

        View.AdventureTypes = Marionette.CompositeView.extend({
          className: "modal custom fade",
          id: "myModal",
          template: _.template(newAdventureDialogTpl),
          childView: View.AdventureType,
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
            //$(".adventure-types-area").responsiveEqualHeightGrid();
          }
        });

      });
      return LessonManager.ActivitiesApp.NewAdventure.View;
    });