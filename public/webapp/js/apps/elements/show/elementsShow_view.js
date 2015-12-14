define(["app",
  "text!apps/elements/show/templates/elementShow_template.html",
  "backbone.syphon"
],
    function(StudentManager, elementShowTpl) {
      StudentManager.module("ElementsApp.Show.View",
          function(View, StudentManager, Backbone, Marionette, $, _) {

            View.Element = Marionette.LayoutView.extend({
              regions: {
                responsePanel: "#response-panel",
                questionInputPanel: "#question-input-panel"
              },
              className: "element-panel-wrapper",
              template: _.template(elementShowTpl),
              style: {
                hideBtn: function(view) {
                  //Hide the previous/next button according to the index
                  var index = view.model.collection.indexOf(view.model);
                  if (index === 0) {
                    $(view.el).find(".btn-previous").hide();
                  }
                  var nextIndex = index + 1;
                  if (!view.model.collection.at(nextIndex)) {
                    $(view.el).find(".btn-next").hide();
                  }
                },
                selectAnswer: function(view) {
                  var answer = view.model.get("answer");
                  $(view.el).find("#answer-select").val(answer);
                },
                selectAnswerType: function(view) {
                  var response = view.model.get("responseType");
                  $(view.el).find("#response-select option[value='" + response + "']").attr('selected','selected');
                }
              },
              onRender: function() {
                this.style.hideBtn(this);
                this.style.selectAnswer(this);
                this.style.selectAnswerType(this);
              },
              onShow: function() {
              },
              events: {
//                'click .js-question-text': 'questionTextClicked',
                'click .js-next': 'questionNextClicked',
                'click .js-previous': 'questionPreviousClicked',
                'click .btn-trigger-filepicker': 'triggerFilePickerClicked',
                "click .js-answer-save": 'saveButtonClicked',
//                "click .js-question-cancel": 'cancelButtonQuestionClicked',
//                "click .js-question-save": 'saveTextQuestionClicked',
                "change .js-answer-select": "selectAnswer",
                "change .js-response-select": "selectResponse",
                "click .js-crop": "cropImage",
                "click .js-crop-ok": "cropImageOK",
                "click .js-crop-cancel": "cropImageCancel"
              }, triggerFilePickerClicked: function(event) {
                window.activateFilePicker();
              },
              questionNextClicked: function(event) {
                event.preventDefault();
                this.trigger("element:question:next", this.model);
              },
              questionPreviousClicked: function(event) {
                event.preventDefault();
                this.trigger("element:question:previous", this.model);
              },
              cropImage: function(event) {
                event.preventDefault();
                this.trigger("element:crop", this.model);
              },
              cropImageOK: function(event) {
                event.preventDefault();
                this.trigger("element:crop:ok", this.model);
              },
              cropImageCancel: function(event) {
                event.preventDefault();
                this.trigger("element:crop:cancel", this.model);
              },
//              questionTextClicked: function(event) {
//                this.trigger("element:question:text:edit", event.target, this.model);
//              },
//              saveTextQuestionClicked: function(event) {
//                this.trigger("element:question:save", event.target, this.model);
//              },
//              cancelButtonQuestionClicked: function(event) {
//                this.trigger("element:question:cancel", event.target, this.model);
//              },
              selectAnswer: function(event) {
                console.log("select answe");
                this.trigger("element:answer:select", event.target, this.model);
              },
              selectResponse: function(event) {
                console.log("select response");
                this.trigger("element:response:select", event.target, this.model);
              },
              triggers: {
                'click .js-save': 'element:link:save',
                'click .js-question-close': 'element:show:close'
              }, initialize: function() {
                var this_view = this;

              }
            });

          });
      return StudentManager.ElementsApp.Show.View;
    });


