define(["app", "apps/responses/show/responsesShow_view", "server/sync", "grids"],
    function (StudentManager, View, ServerSync) {
      StudentManager.module("ResponsesApp.Show",
          function (Show, StudentManager, Backbone, Marionette, $, _) {
            var Controller = Marionette.Controller.extend({
              //Server
              showResponses: function (model) {
                responseShowView(model);
//        require(["entities/activity/activity_collection"], function() {
//          var fetchActivities = StudentManager.request("activity:entities");
//          $.when(fetchActivities).done(function(activities) {
//            var options = {
//              activities: activities
//            };
//            // StudentManager.trigger("activities:listActivities:initialized:noroute");
//            var activity = activities.get(activityID);
//            responseShowView(activity);
//
//          });
//        });
              }
            });
            Show.Controller = new Controller;
            var self = Show.Controller;
            function responseShowView(model) {
              var answer_selected = '';
              var responsesView = new View.Response({
                model: model
              });
              var responseArea = StudentManager.request("element:answerArea");
              var activity = StudentManager.request("activity");

              var _responseHelper = {
                checkAnswer: function (studentAnswer, realAnswer) {
                  if (studentAnswer === realAnswer) {
                    $("[id^=answer-text]").css("background-color", "#e7e7e7");
                    //removing all the js and hover once answer submitted
                    _responseHelper.removeBtnInteraction();
//              $(".question-text").removeClass(function(index,css){
                    //return (css.match(/(^|\s)js-answer\S+/g) || []).join('');
                    //});
                    //$(".btn-answer-"+realAnswer).css("background-color","green");
                    $("#answer-text-" + realAnswer).addClass("answer-correct");
                    $(".btn-submit").hide();
                    var curModel = StudentManager.request("model");
                    var index = curModel.collection.indexOf(curModel);
                    var nextIndex = index + 1;
                    if (curModel.collection.at(nextIndex)) {
                      $(".btn-submit-next").css("display","inline-block");                      
                    }

                    return true;
                  } else {
                    $("[id^=answer-text]").css("background-color", "#e7e7e7");
                    console.log("answer incorrect");
                    _responseHelper.removeBtnInteraction();
                    $("#answer-text-" + realAnswer).addClass("answer-correct");
                    $("#answer-text-" + studentAnswer).addClass("answer-wrong");
                    console.log("answer is: " + realAnswer);
                    $(".btn-submit").hide();
                    return false;
                  }
                },
                removeBtnInteraction: function () {
                  $('button').attr('class', function (i, c) {
                    return c.replace(/\bjs-answer\S+/g, '');
                  });
                  $('button').attr('class', function (i, c) {
                    return c.replace(/\bbtn-answer-\S+/g, '');
                  });
                },
                checkEmpty: function (a) {
                  if (a === '') {
                    return true;
                  }
                  return false;
                }
              };
              self.listenTo(responsesView, "show", function () {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                if (model.get("responseType") === "mul") {
                  var aEmpty = _responseHelper.checkEmpty(model.get("answerTextA"));
                  var bEmpty = _responseHelper.checkEmpty(model.get("answerTextB"));
                  var cEmpty = _responseHelper.checkEmpty(model.get("answerTextC"));
                  var dEmpty = _responseHelper.checkEmpty(model.get("answerTextD"));
                  if (aEmpty) {
                    $("#answer-text-a").hide();
                  }
                  if (bEmpty) {
                    $("#answer-text-b").hide();
                  }
                  if (cEmpty) {
                    $("#answer-text-c").hide();
                  }
                  if (dEmpty) {
                    $("#answer-text-d").hide();
                  }
                  if (aEmpty && bEmpty && cEmpty && dEmpty) {
                    $(".answer-area").hide();
                  }
                } else if (model.get("responseType") === "") {
                  //Hide all if no response
                  $(".answer-area").hide();
                }
                // }
                $('.answer-text').responsiveEqualHeightGrid();
                var studentAnswered = model.get("studentAnswered");
                if (studentAnswered)
                  _responseHelper.checkAnswer(studentAnswered, model.get("answer"));
              });
              responseArea.show(responsesView);
              self.listenTo(responsesView, "element:answer:a",
                  function (target, model) {
                    answer_selected = 'a';
                    console.log("Answer A triggered");
                    var modelQuestion = model;
                    console.log(model.get("answer"));
//                    ServerSync.MessageToServerStudentAnswer('a');
                  });
              self.listenTo(responsesView, "element:answer:b", function () {
                console.log("Answer B triggered");
                answer_selected = 'b';
//                ServerSync.MessageToServerStudentAnswer('b');
              });
              self.listenTo(responsesView, "element:answer:c", function () {
//                ServerSync.MessageToServerStudentAnswer('c');
                console.log("Answer C triggered");
                answer_selected = 'c';
              });
              self.listenTo(responsesView, "element:answer:d", function () {
//                ServerSync.MessageToServerStudentAnswer('d');
                console.log("Answer D triggered");
                answer_selected = 'd';
              });
              self.listenTo(responsesView, "element:answer:submit",
                  function (args) {
                    //For Text Response Answer
                    //Disable Text Input
                    var floatingRegion = $("#floating-region");
                    $('.js-student-text-response').addClass("disabled");
                    $('.js-student-text-response').attr('readonly', 'readonly');
                    floatingRegion.addClass("black-overlay");
                    floatingRegion.after("<div class='loader'>Submitting <i class='fa fa-spin fa-spinner'></i></div>");
                    //Return state after submitted
                    setTimeout(function () {
                      floatingRegion.removeClass("black-overlay");
                      $(".loader").remove();
                      $('.js-student-text-response').removeClass("disabled");
                      $('.js-student-text-response').removeAttr('readonly');
                    }, 1000);
                    if (args.view.$el.find(".js-student-text-response").length !== 0) {
                      console.log("submit rextResposnse");
                      var textarea = args.view.$el;
                      var text = textarea.find(".js-student-text-response");
                      if (text.length > 0) {
                        var textAnswerSubmitted = $(text[0]).val();
                        textAnswerSubmitted = textAnswerSubmitted.trim();
                        if (typeof textAnswerSubmitted !== 'undefined') {
                          var dataToSend = {
                            activityID: activity.id,
                            elementID: args.model.id,
//                          correctAnswer: args.model.get("answer"),
//                    imageURL: args.model.get("resourceUrl"),
                            answer: {
                              answerSubmitted: textAnswerSubmitted
                            },
                            meta: {
//                      points: 10
                            }
                          };
                          window.pluginToServer('ACTIVITY', 'StudentTextAnswer', dataToSend);
                        }
                        console.log(textAnswerSubmitted);
                      }
                    } else {
                      var isCorrect = _responseHelper.checkAnswer(answer_selected, args.model.get("answer"));
                      console.log("Answer submmit: " + answer_selected);
                      var dataToSend = {
                        activityID: activity.id,
                        elementID: args.model.id,
                        correctAnswer: args.model.get("answer"),
//                    imageURL: args.model.get("resourceUrl"),
                        answer: {
                          answerSubmitted: answer_selected,
                          isCorrect: isCorrect,
                          points: 10
                        },
                        meta: {
//                      points: 10
                        }
                      };
                      window.pluginToServer('ACTIVITY', 'StudentAnswer', dataToSend);
//                  window.pluginToServer('ACTIVITY', 'GetStudentAnswers', {});
//
//                 $(window.document).on('ServerToPlugin' + 'ACTIVITY', function(e) {
//                    var messageReceived = e.detail;
//                    switch (messageReceived.pluginMessageType)
//                    {
//                      //set all custom message type here
//                      case 'GetStudentAnswersResponse':
//                        message.data.activities
//                        break;
//                    }
//                  });
                    }
                  });
              self.listenTo(responsesView,"element:question:next",function(){
                StudentManager.execute("next");
              });
            }
          });

      return StudentManager.ResponsesApp.Show.Controller;
    });