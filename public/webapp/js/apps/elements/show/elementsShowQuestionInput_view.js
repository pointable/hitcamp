define(["app",
  "text!apps/elements/show/templates/elementShowQuestionInput.html",  
  "backbone.syphon"
],
    function(StudentManager,elementShowQuestionInput) {
      StudentManager.module("ElementsApp.Show.View",
          function(View, StudentManager, Backbone, Marionette, $, _) {

            View.ElementQuestion = Marionette.ItemView.extend({
              template:_.template(elementShowQuestionInput),              
              style: {
              },
              events: {
                'click .js-question-text': 'questionTextClicked',                                
                "click .js-question-cancel": 'cancelButtonQuestionClicked',
                "click .js-question-save": 'saveTextQuestionClicked'
              },
              questionTextClicked: function(event) {
                
                var element = $(event.target).parent(".js-question-text");
                this.trigger("element:question:text:edit", element, this.model);
              },
              saveTextQuestionClicked: function(event) {
                this.trigger("element:question:save", event.target, this.model);
              },
              cancelButtonQuestionClicked: function(event) {
                this.trigger("element:question:cancel", event.target, this.model);
              },
              triggers: {
              }, initialize: function() {
                var this_view = this;
//                this.model.on("change", this.render);
              }
            });
          });
      return StudentManager.ElementsApp.Show.View;
    });





