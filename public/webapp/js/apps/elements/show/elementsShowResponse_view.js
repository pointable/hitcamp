define(["app",
  "text!apps/elements/show/templates/elementShowResponseMultiple.html",
  "text!apps/elements/show/templates/elementShowResponseText.html",
  "backbone.syphon"
],
    function(StudentManager, elementShowResponseMultiTpl, elementShowResponseTextTpl) {
      StudentManager.module("ElementsApp.Show.View",
          function(View, StudentManager, Backbone, Marionette, $, _) {

            View.ElementResponse = Marionette.ItemView.extend({
              getTemplate: function() {
                if (this.model.get("responseType") === "mul") {
                  return _.template(elementShowResponseMultiTpl);
                } else if (this.model.get("responseType") === "text") {
                  return _.template(elementShowResponseTextTpl);
                } else {
                  return _.template(elementShowResponseMultiTpl);
                }
              },
              style: {
                selectAnswer: function(view) {
                  var answer = view.model.get("answer");
                  $("input[type=radio]").each(function(index, args) {
                    if (args.value === answer) {
                      args.checked = true;
                    }
                  });
                }
              },
              onRender: function(view) {
              },
              onShow: function() {
                this.style.selectAnswer(this);
              },
              events: {
                'click .js-answer': 'answerClicked',
                'click .js-question-text': 'questionTextClicked',
                'click .js-next': 'questionNextClicked',
                'click .js-previous': 'questionPreviousClicked',
                'click .btn-trigger-filepicker': 'triggerFilePickerClicked',
                "click .js-answer-save": 'saveButtonClicked',
                "click .js-answer-cancel": 'cancelButtonClicked',
                "click .js-question-cancel": 'cancelButtonQuestionClicked',
                "click .js-question-save": 'saveTextQuestionClicked',
                "click .js-answer-select-radio": 'answerSelectRadioClicked',
                "keypress .answer-edit-area": "keypress"
              },
              triggerFilePickerClicked: function(event) {
                window.activateFilePicker();
              },
              answerClicked: function(event) {
                this.trigger("element:answer:edit", event.target, this.model);
              },
              questionNextClicked: function(event) {
                event.preventDefault();
                this.trigger("element:question:next", this.model);
              },
              questionPreviousClicked: function(event) {
                event.preventDefault();
                this.trigger("element:question:previous", this.model);
              },
              saveButtonClicked: function(event) {
                event.preventDefault();
                this.trigger("element:answer:save", event.target, this.model);
              },
              cancelButtonClicked: function(event) {
                event.preventDefault();
                this.trigger("element:answer:cancel", event.target, this.model);
              },
              questionTextClicked: function(event) {
                this.trigger("element:question:text:edit", event.target, this.model);
              },
              saveTextQuestionClicked: function(event) {
                this.trigger("element:question:save", event.target, this.model);
              },
              cancelButtonQuestionClicked: function(event) {
                this.trigger("element:question:cancel", event.target, this.model);
              },
              answerSelectRadioClicked: function(event) {
                $('input[type=radio]').each(function(index, args) {
                  args.checked = false;
                });
                $(event.target)[0].checked = true;
                this.trigger("element:answerRadio:select", event.target, this.model);
              },
              triggers: {
              },
              initialize: function() {
                var this_view = this;
                //this.model.on("change", this.render);
              }
            });

          });
      return StudentManager.ElementsApp.Show.View;
    });




