define(["app",
  "text!apps/elements/show/templates/elementShow_template.html"
],
    function(StudentManager, elementShowTpl) {
      StudentManager.module("ElementsApp.Show.View",
          function(View, StudentManager, Backbone, Marionette, $, _) {
            View.Element = Marionette.Layout.extend({
              template: _.template(elementShowTpl),
              regions:{
                answerArea:".answer-area"
              },
              className: "container-fluid padding-0px grey",              
              events: {
                'click .js-question-next': 'questionNextClicked',
                'click .js-question-previous': 'questionPreviousClicked',
                'click .js-question-close': 'questionCloseClicked',
//                'click .js-submit-answer': 'submitAnswerClicked'
              },
              questionNextClicked: function(event) {
                event.preventDefault();
                this.trigger("element:question:next", event.target, this.model);
              },
              questionPreviousClicked: function(event) {
                event.preventDefault();
                this.trigger("element:question:previous", event.target, this.model);
              },
              questionCloseClicked: function(event) {
                event.preventDefault();
                this.trigger("element:question:close", this.model);
              },
              initialize: function() {
              }
            });
          });
      return StudentManager.ElementsApp.Show.View;
    });


