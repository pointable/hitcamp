define(["app",
  "text!apps/activities/list/templates/activities_item.html",
  "text!apps/activities/list/templates/activities_template.html",
  "bootstrap"],
        function(StudentManager, activitiesItemTpl, activitiesTpl) {
          StudentManager.module("ActivitiesApp.List.View", function(View, StudentManager, Backbone, Marionette, $, _) {
            View.Activity = Marionette.ItemView.extend({
              className: "activityWrapper btnActivityNoGap col-md4 col-xs-12 col-lg-1",
              template: _.template(activitiesItemTpl),
              events: {
                'click .js-show': 'showElementClicked',
                'click .js-delete': 'deleteActivityClicked',
                'click .js-dialog':'dialogClicked'                
              },
              showElementClicked: function(event) {
                event.preventDefault();                
                this.trigger("element:show", this.model);                               
              },              
              remove: function() {
                var self = this;
                Marionette.ItemView.prototype.remove.call(this);
              },
              dialogClicked:function(){
                $("#myModal").modal('show');
              },initialize:function(){
                this.model.on('change', this.render);
              }
            });

            View.Activities = Marionette.CompositeView.extend({
              className: "container-fluid",
              template: _.template(activitiesTpl),
              itemView: View.Activity,
              itemViewContainer: "#lessonView",
              initialize: function() {              
//                this.appendHtml = function(collectionView, itemView, index) {
//                  collectionView.$el.find("#addOne").before(itemView.el);                  
//                };
//                this.listenTo(this.collection, "add", function(collectionView, itemView, index) {                  
//                  this.appendHtml = function(collectionView, itemView, index) {
//                    collectionView.$el.find("#addOne").before(itemView.el);
//                  };
//                });
              },
              events: {
              }
//              ,
//              onCompositeCollectionRendered: function() {
//                this.appendHtml = function(collectionView, itemView, index) {
//                  //collectionView.$el.prepend(itemView.el);
//                  console.log("onCompositeCollectionRendered");
//                  collectionView.$el.find("#addOne").before(itemView.el);
//                };
//              }
            });

          });
          return StudentManager.ActivitiesApp.List.View;
        });
