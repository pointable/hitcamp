define(["app",
  "text!apps/activities/list/templates/activities_item.html",
  "text!apps/activities/list/templates/activities_template.html",
  "bootstrap"],
        function(TeacherSession, activitiesItemTpl, activitiesTpl) {
          TeacherSession.module("ActivitiesApp.List.View", function(View, TeacherSession, Backbone, Marionette, $, _) {
            View.Activity = Marionette.ItemView.extend({
              className: "activityWrapper btnActivityNoGap col-md4 col-xs-12 col-lg-1",
              template: _.template(activitiesItemTpl),
              events: {
                'click .js-show': 'showElementsClicked',
                'click .js-delete': 'deleteActivityClicked',
                'click .js-dialog':'dialogClicked'
              },
              showElementsClicked: function(event) {
                event.preventDefault();                
                this.trigger("elements:list:local", this.model);                               
              },
              showAdventurePicker:function(event){
                event.preventDefault();
                alert("test");
                this.trigger("plugin:show:adventurePicker",this.model);
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
              className: "container-fluid padding-0px",
              template: _.template(activitiesTpl),
              childView: View.Activity,
              childViewContainer: "#lessonView",
              triggers: {
                'click .js-select': 'plugin:show:adventurePicker',
                'click .js-edit': 'adventure:show:editor',
                'click .js-new-adventure': 'adventure:new'
              },
              initialize: function() {              
//                this.attachHtml = function(collectionView, childView, index) {
//                  collectionView.$el.find("#addOne").before(childView.el);                  
//                };
//                this.listenTo(this.collection, "add", function(collectionView, childView, index) {                  
//                  this.attachHtml = function(collectionView, childView, index) {
//                    collectionView.$el.find("#addOne").before(childView.el);
//                  };
//                });
              },
              events: {
              }
//              ,
//              onCompositeCollectionRendered: function() {
//                this.attachHtml = function(collectionView, childView, index) {
//                  //collectionView.$el.prepend(childView.el);
//                  console.log("onCompositeCollectionRendered");
//                  collectionView.$el.find("#addOne").before(childView.el);
//                };
//              }
            });

          });
          return TeacherSession.ActivitiesApp.List.View;
        });
