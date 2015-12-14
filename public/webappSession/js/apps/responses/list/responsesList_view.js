define(["app",
  "text!apps/responses/list/templates/responses_item.html",
  "text!apps/responses/list/templates/responses_template.html"
],
    function(TeacherSession, responsesItemTpl, responsesTpl) {
      TeacherSession.module("ResponsesApp.List.View", function(View, TeacherSession, Backbone, Marionette, $, _) {
        View.Response = Marionette.ItemView.extend({
          className: "response-wrapper",
          template: _.template(responsesItemTpl),
          modelEvents: {
            "change:correct": "markAnswer"
          },
          triggers: {
            'click .js-correct': 'answer:correct',
            'click .js-wrong': 'answer:wrong'
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
          intialize:function(){
            
          }
        });

        View.Responses = Marionette.CollectionView.extend({
          className: "responses",
          template: _.template(responsesTpl),
          childView: View.Response,
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
        });

      });
      return TeacherSession.ResponsesApp.List.View;
    });


