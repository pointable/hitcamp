define(["app",
  "text!apps/activities/show/templates/activityShow_template_landscape.html",
  "text!apps/activities/show/templates/activityShow_template_potrait.html",
  "backbone.syphon"
],
    function(StudentManager, activityShowTplLandscape, activityShowTplPotrait) {
      StudentManager.module("ActivitiesApp.Show.View",
          function(View, StudentManager, Backbone, Marionette, $, _) {

            View.Activity = Marionette.LayoutView.extend({
              regions: {
                elementsListPanel: "#elements-side-panel",
                elementPanel: "#element-main-panel"
              },
              getTemplate: function() {
                if ($(window).width() >= 800) {
                  console.log("resize for landscape ");
                  return _.template(activityShowTplLandscape);
                } else if ($(window).width() < 800)
                {
                  console.log("resize for potrait. temporary use landscape for both");
//                  return _.template(activityShowTplPotrait);
                  return _.template(activityShowTplLandscape);
                }
              },
              className: " engage-nav-bar",
              events: {
                'click .btn-trigger-filepicker': 'triggerFilePickerClicked',
                "click .js-new-images": "newImagesClicked"
              }, triggerFilePickerClicked: function(event) {
                window.activateFilePicker();
              },
              deleteQuestionClicked: function(event) {
                event.preventDefault();
                this.trigger("element:question:delete", event.target, this.model);
              },
              newImagesClicked: function(event) {
                event.preventDefault();
                this.trigger("element:question:newImages", event.target, this.model);
              },
              triggers: {
                'click .js-save': 'element:link:save',
                'click .js-question-close': 'element:show:close',
                'click .js-question-delete': 'element:question:delete',
                'click .js-question-new': 'element:question:new',
                'click .js-question-duplicate': 'element:question:duplicate',
                'click .js-new-images': 'element:question:newImages',
                'click .js-rename':'activity:rename'
//                'LocalMessageResourceUpdate .js-new-images': "testCall"
              },
//              testCall: function(event) {
//                debugger;
//              },
              initialize: function(options) {
                this.collection = options.collection;

                var this_view = this;
                
//                debugger;
                $(window).off("LocalMessageResourceUpdate");
                $(window).on("LocalMessageResourceUpdate", function(event, e) {
//                document.addEventListener('LocalMessageResourceUpdate', function(e) {
                  var messageReceived = JSON.parse(e.detail);
//                  debugger;
                  switch (messageReceived.type)
                  {
                    //set all custom message type here
                    case 'ResourceUpdate':
                      var data = {
                        resourceURL: messageReceived.resourceURL,
                        thumbnail: messageReceived.thumbnailLink,
                        title: messageReceived.title,
                        isImage: messageReceived.isImage
                      };
                      this_view.trigger("element:link:update", this_view, data);
                      break;
                  }
                });
//                }, this);

//                $(".js-new-images").trigger('LocalMessageResourceUpdate');
//                $(document).on("LocalMessageResourceUpdate", function(event, param) {
//                  debugger;
//                });

//                $(document).trigger('LocalMessageResourceUpdate', ["test"]);
              },
              onRender: function() {
                console.log("####render activity view ");
              },
              onShow: function() {

              }
            });

          });
      return StudentManager.ActivitiesApp.Show.View;
    });


