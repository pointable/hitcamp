define(["app",
  "text!apps/responses/show/templates/responses_multiple.html",
  "text!apps/responses/show/templates/responses_text.html"
],
    function(TeacherSession, responsesMulTpl, responsesTextTpl) {
      TeacherSession.module("ResponsesApp.List.View",
          function(View, TeacherSession, Backbone, Marionette, $, _) {
            View.Response = Marionette.ItemView.extend({
              className: "response-wrapper",
              getTemplate: function() {
                if (this.model.get("responseType") === "mul") {
                  return _.template(responsesMulTpl);
                } else if (this.model.get("responseType") === "text") {
                  return _.template(responsesTextTpl);
                }
              },
              modelEvents: {
                "change:correct": "markAnswer"
              },
              triggers: {
                'click .js-correct': 'answer:correct',
                'click .js-wrong': 'answer:wrong',
                'click .js-submit-answer': 'element:answer:submit',
                'click .js-submit-next': 'element:question:next'
              },
              events: {
                'click .js-answerA': 'answerAClicked',
                'click .js-answerB': 'answerBClicked',
                'click .js-answerC': 'answerCClicked',
                'click .js-answerD': 'answerDClicked'
              },
              answerAClicked: function(event) {
                this.trigger("element:answer:a", event.target, this.model);
                //$(event.target).css("box-shadow","0 0 25px green");                
                $("[class^=btn-answer]").removeClass("answer-selected");
                $(".btn-answer-a").toggleClass("answer-selected");
              },
              answerBClicked: function(event) {
                this.trigger("element:answer:b", event.target, this.model);
                $("[class^=btn-answer]").removeClass("answer-selected");
                $(".btn-answer-b").toggleClass("answer-selected");
              },
              answerCClicked: function(event) {
                this.trigger("element:answer:c", event.target, this.model);
                $("[class^=btn-answer]").removeClass("answer-selected");
                $(".btn-answer-c").toggleClass("answer-selected");
              },
              answerDClicked: function(event) {
                this.trigger("element:answer:d", event.target, this.model);
                $("[class^=btn-answer]").removeClass("answer-selected");
                $(".btn-answer-d").toggleClass("answer-selected");
              },
              style: {
                mark: function(view) {
                  var correct = view.model.get("correct");
                  if (correct === true) {
                    $(view.$el.find(".response-text")[0]).removeClass("answer-wrong");
                    $(view.$el.find(".response-text")[0]).addClass("answer-correct");
                  } else if (correct === false) {
                    $(view.$el.find(".response-text")[0]).removeClass("answer-correct");
                    $(view.$el.find(".response-text")[0]).addClass("answer-wrong");
                  }
                }
              },
              markAnswer: function() {
                this.style.mark(this);
              },
              intialize: function() {
              }
            });
          });
      return TeacherSession.ResponsesApp.List.View;
    });


