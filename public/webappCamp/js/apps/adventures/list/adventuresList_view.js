define(["app",
  "text!apps/adventures/list/templates/adventures_item.html",
  "text!apps/adventures/list/templates/adventures_layout.html",
  "bootstrap"
],
    function(CampManager, adventuresItemTpl, adventuresLayoutTpl) {
      CampManager.module("AdventuresApp.ListAdventures.View", function(View, CampManager, Backbone, Marionette, $, _) {

        View.Adventure = Marionette.ItemView.extend({
          className: "adventure-wrapper col-md-4 col-lg-3 col-sm-12 col-xs-12",
          template: _.template(adventuresItemTpl),
          events: {
            'click .js-edit': 'editAdventureClicked',
            'click .js-share': 'shareAdventureClicked',
            'click .js-duplicate': 'duplicateAdventureClicked',
            'click .js-delete': 'deleteAdventureClicked'
          },
          triggers: {
            'click .js-activate': 'adventure:activate',
            'click .js-empty': 'adventure:empty'            
          },
          modelEvents: {
            'change:selected': "selectedChanged"            
          },
          initialize: function() {
//            this.model.on('change', this.render);
              this.style.select(this);
          },
          selectedChanged: function(args, val) {
            this.style.select(this);
          },
          onShow: function() {
            $('.dropdown-toggle').dropdown();
          },
          style: {
            select: function(view) {
              var active = view.model.get("selected");
              if (active) {
//                view.$el.find(".js-activate").text("Deactivate");
//                view.$el.css("opacity", 1.0);
                  view.$el.find(".adventure-map-holder").addClass("adventure-selected");
              } else {
//                view.$el.css("opacity", 0.5);
                view.$el.find(".adventure-map-holder").removeClass("adventure-selected");
//                view.$el.find(".js-activate").text("Activate");
              }
            }
          },
          editAdventureClicked: function(e) {
            e.preventDefault();
            this.trigger("adventure:edit", this);
          },
          shareAdventureClicked: function(e) {
            e.preventDefault();
            this.trigger("adventure:share", this);
          },
          duplicateAdventureClicked: function(e) {
            e.preventDefault();
            this.trigger("adventure:duplicate", this);
          },
          deleteAdventureClicked: function(e) {
            e.preventDefault();
            this.trigger("adventure:delete", this);
          }

        });
        View.Adventures = Marionette.CompositeView.extend({
          className: "adventuresLayout-wrapper",
          template: _.template(adventuresLayoutTpl),
          childView: View.Adventure,
          childViewContainer: "#adventures-container",
          initialize: function() {
//            this.collection.on('change', this.render);
//            this.appendHtml = function(collectionView, childView, index) {
//              collectionView.$el.find(".js-empty-adventure").after(childView.el);
//            };
          },
          triggers: {
            'click .js-new': 'adventure:new'
          },
          onRender: function() {
            console.log("####Adventures are rendered");
          },
          onShow: function() {

//            $('.dropdown-toggle').dropdown();
          }
        });
      });
      return CampManager.AdventuresApp.ListAdventures.View;
    });