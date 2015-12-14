define(['app',
  "apps/elements/show/elementsShow_view",
  "apps/elements/show/elementsShowQuestionInput_view",
  "apps/elements/show/elementsShowResponse_view",
  'server/sync',
//  'summernote',
  "backbone.syphon",
  "bootstrap"
//  'jquery-ui'
],
    function(LessonManager, View, QuestionInputView, ResponseView, ServerSync) {//, summernote) {
      LessonManager.module("ElementsApp.Show",
          function(Show, LessonManager, Backbone, Marionette, $, _) {
            Show.Controller = {
              showFirstElement: function(elements, index) {
                require(['entities/element/element_collection', 'entities/activity/activity_collection'],
                    function(ElementCollection) {
                      var elements_internal = elements;
                      //If there are no elements given, we will need to get the elements from the activity collection 
                      if (elements === null && typeof index === "undefined") {
                        var fetchActivityCollection = LessonManager.request("activity:entities");
                        $.when(fetchActivityCollection).done(function(data) {
                          //Fetch the first activity, then populate the elements in it.
                          var firstActivity = data.at(0);
                          elements_internal = firstActivity.get("elements");
                          var index_internal = 0;
                          var elementCollection = new ElementCollection(elements_internal);
                          var model = elementCollection.at(index_internal);
                          _view.showElementView(model);
                        });
                        //To check callback is from internal helper (Collection)
                        //or external click  (Objects array)
                      } else if (!(elements_internal instanceof Backbone.Collection)) {
                        var elementCollection = new ElementCollection(elements_internal);
                        var model = elementCollection.at(index);
                        _view.showElementView(model);
                      } else {
                        var model = elements_internal.at(index);
                        console.log(model);
                        _view.showElementView(model);
                      }
                      ;
                    });
              },
              //local
              showElementLocal: function(elementPanel, activity, element) {
                _view.showElementView(elementPanel, activity, element);
              },
              //server
              showElement: function(activityID, elementIndex) {
                require(["entities/activity/activity_collection"], function() {
                  var fetchActivity = LessonManager.request("activity:entities");
                  $.when(fetchActivity).done(function(activities) {
                    var activity = activities.get(activityID);
                    var element = activity.get("elements").at(elementIndex - 1);
                    _view.showElementView(activity, element);
//                   console.log("shown");
                  });
                });
              },
              showElementLocalQuestions: function(questionInputPanel, activity, element) {
                _view.showElementQuestionView(questionInputPanel, activity, element);
              },
              showElementLocalAnswers: function(responsePanel, activity, element) {
                _view.showElementAnswerView(responsePanel, activity, element);
              }
            };

//            function initializeQuestionSummerNote(textarea) {
//              $(textarea).summernote({
//                height: 100,
//                focus: true,
//                toolbar: [
//                  ['style', ['style', 'bold', 'italic', 'underline', 'clear']],
//                  ['font', ['strikethrough', 'superscript', 'subscript']],
//                  ['fontsize', ['fontsize']],
//                  ['color', ['color']],
//                  ['para', ['ul', 'ol', 'paragraph']],
//                  ['insert', ['link', 'picture', 'table']]
//                ]
//              });              
//            }
//            function initializeAnswerSummerNote(textarea) {
//              $(textarea).summernote({
//                height: 40,
//                focus: true,
//                toolbar: [
//                  ['style', ['bold', 'italic', 'underline', 'superscript', 'subscript']],
//                  ['para', ['ul', 'ol']]
//                ]
//              });
//            }
            function undefinedModelBackToRoot(model) {
              if (typeof model === "undefined") {
                LessonManager.trigger("activities:list");
                return;
              }
              var index = model.collection.indexOf(model);
              if (typeof index === "undefined") {
                LessonManager.trigger("activities:list");
                return;
              }
            }

            function ajaxSaveActivity(activity) {
              var attributes = JSON.stringify(activity.toJSON());
              $.ajax({
                url: activity.url(),
                type: 'PUT',
                data: attributes,
                async: true,
                contentType: "application/json",
                success: function(response) {
//                  console.log("response" + response);
                }
              });
            }

            var _view = {
              highlightElement: function(element) {
                _.each(element.collection.models, function(model) {
                  model.set({"selected": false}, {silent: true});
                });
                element.set({"selected": true}, {silent: true});
              },
              showElementView: function(elementPanel, activity, model) {
                undefinedModelBackToRoot(model);
                model.setSelected();
                var elementView = new View.Element({model: model});
                Show.listenTo(elementView, "childview:element:show", function(args, element) {
                  LessonManager.trigger("element:show", elementView.elementPanel, activity, element);
                });
//                LessonManager.mainRegion.show(showElementLayout(activity,model));

                Show.listenTo(elementView, "element:link:save", function(args) {
                  require(["entities/activity/activity_model"], function(Activity) {
                    var element_model = args.model;
                    var fetchingActivity = LessonManager.request("activity:entity", args.model.collection.activityID);
                    var data = Backbone.Syphon.serialize(args.view);
                    element_model.set(data);
                    var parsedElements = JSON.parse(JSON.stringify(args.model.collection));
                    //Only need to set the element back to the activity element 
                    $.when(fetchingActivity).done(function(fetchedActivity) {
                      //Activity Fetched returned activity and an array of activities, which are the real activities being used.                   
                      saveActivity(fetchedActivity, parsedElements);
                      var frameDoc = $('#frameDoc');
                      frameDoc.attr('src', data.resourceUrl);
                      window.imgPreloader.push(data.resourceUrl);
                    });
                  });
                });
                Show.listenTo(elementView, "element:question:previous", function(model) {
                  var index = model.collection.indexOf(model);
                  var previousIndex = index - 1;
                  var previousModel = model.collection.at(previousIndex);
                  LessonManager.navigate("#activities/" + activity.id + "/elements/" + (previousIndex + 1));
//                  _view.showElement(previousIndex, model, activity);
                  LessonManager.trigger("element:show", elementPanel, activity, previousModel);
                });
                Show.listenTo(elementView, "element:question:next", function(model) {
                  var index = model.collection.indexOf(model);
                  var nextIndex = index + 1;
                  var nextModel = model.collection.at(nextIndex);
                  LessonManager.navigate("#activities/" + activity.id + "/elements/" + (nextIndex + 1));
//                  _view.showElement(nextIndex, model, activity);
                  LessonManager.trigger("element:show", elementPanel, activity, nextModel);
                });
                Show.listenTo(elementView, "element:show:close", function() {
                  var options = {
                    activities: activity.collection
                  };
                  //LessonManager.trigger("activities:list", options);
                  //TODO list adventures local
                  LessonManager.trigger("activities:list", options);
                  //LessonManager.trigger("elements:list:local", activity);
                });
                Show.listenTo(elementView, "element:link:update", function(model, data) {
                  var element_model = model;
                  element_model.set({
                    resourceUrl: data.resourceURL,
                    isImage: data.isImage,
                    thumbnail: data.thumbnail,
                    resourceTitle: data.title
                  });
                  activity.set({
                    "thumbnail": data.thumbnail
                  });
                  var parsedElements = JSON.parse(JSON.stringify(model.collection));
                  //saveActivity(activity, parsedElements);
                  ajaxSaveActivity(activity);
                  if (data.isImage) {
                    //use image div
                    var frameDoc = $('#frameDoc');
                    frameDoc.attr('src', 'about:blank');
                    frameDoc.css('display', 'none');

                    var imageDoc = $('#imageDoc');
                    imageDoc.attr('src', data.resourceURL);
                    imageDoc.css('display', 'block');

                  } else {
                    var frameDoc = $('#frameDoc');
                    frameDoc.attr('src', data.resourceURL);
                    frameDoc.css('display', 'block');


                    var imageDoc = $('#imageDoc');
                    imageDoc.attr('src', 'about:blank');
                    imageDoc.css('display', 'none');
                  }
                });

                Show.listenTo(elementView, "element:answer:select", function(target, model) {
                  var element_model = model;
                  var answerSelected = $("select#answer-select").val();
                  element_model.set("answer", answerSelected);
                  ajaxSaveActivity(activity);
//                  var parsedElements = JSON.parse(JSON.stringify(element_model.collection));
//                  saveActivity(activity, parsedElements);
                  console.log(answerSelected);
                });
                Show.listenTo(elementView, "element:response:select", function(target, model) {
                  var element_model = model;
                  var answerSelected = $("select#response-select").val();
                  element_model.set("responseType", answerSelected);
                  ajaxSaveActivity(activity);
//                  saveActivity(activity, element_model.collection);
                  console.log(answerSelected);
                });
                Show.listenTo(elementView, "show", function() {
                  LessonManager.trigger("element:question:show", elementView.questionInputPanel, activity, model);
                  LessonManager.trigger("element:answers:show", elementView.responsePanel, activity, model);
                });
                elementPanel.show(elementView);
//                  elementPanel.show(showElementLayout(activity,model));
              },
              showElementQuestionView: function(questionInputPanel, activity, model) {
                var questionInputView = new QuestionInputView.ElementQuestion({model: model});


                Show.listenTo(questionInputView, "element:question:text:edit", function(target, model) {
                  $(".js-question-text").hide();
                  $("#question-text-edit").show();

                });
                Show.listenTo(questionInputView, "element:question:cancel", function(target, model) {
                  $("#question-text").show();
                  $("#question-text-edit").hide();
                });
                Show.listenTo(questionInputView, "element:question:save", function(target, model) {
                  //var questionText = $(".question-text-edit").val();
                  var questionText = $(".question-text-edit").code();
                  console.debug("content:" + questionText);
                  var element_model = model;
                  $("#question-text").html(questionText);
//                  console.log($("textarea#answer-text-d-desc").val());
                  $("#question-text").show();
                  $("#question-text-edit").hide();
                  model.set("questionText", questionText);
                  ajaxSaveActivity(activity);
//                  var parsedElements = JSON.parse(JSON.stringify(element_model.collection));
//                  saveActivity(activity, parsedElements);
//                  activity.save({"questionText":questionText});
                });
                Show.listenTo(questionInputView, "show", function() {
                  initializeQuestionSummerNote(".question-text-edit");
                });
                questionInputPanel.show(questionInputView);

              },
              showElementAnswerView: function(responsePanel, activity, model) {
                var responseView = new ResponseView.ElementResponse({model: model});

                Show.listenTo(responseView, "show", function() {
                  initializeAnswerSummerNote(".answer-text-edit");
                });
                Show.listenTo(responseView, "render", function() {
                  initializeAnswerSummerNote(".answer-text-edit");
                });
                responsePanel.show(responseView);
                Show.listenTo(responseView, "element:answer:a:edit", function(target, model) {
                  $(target).hide();
                  $("#answer-text-edit-a").show();
                  $("#answer-text-edit-a").find(".note-editable").focus();
                });
                Show.listenTo(responseView, "element:answer:b:edit", function(target, model) {
                  $(target).hide();
                  $("#answer-text-edit-b").show();
                  $("#answer-text-edit-b").find(".note-editable").focus();
//                  $(".answer-text-edit").focus();
                });
                Show.listenTo(responseView, "element:answer:c:edit", function(target, model) {
                  $(target).hide();
                  $("#answer-text-edit-c").show();
                  $("#answer-text-edit-c").find(".note-editable").focus();
                });
                Show.listenTo(responseView, "element:answer:d:edit", function(target, model) {
                  $(target).hide();
                  $("#answer-text-edit-d").show();
                  $("#answer-text-edit-d").find(".note-editable").focus();
                });
                Show.listenTo(responseView, "element:answer:cancel:a", function(target, model) {
                  $("#answer-text-a").show();
                  $("#answer-text-edit-a").hide();
                });
                Show.listenTo(responseView, "element:answer:a:save", function(args) {
//                  var textResponse = $(".answer-text-edit").val();
                  var textResponse = $(".answer-text-edit").code();
                  console.debug("content" + textResponse);
                  var element_model = args.model;
//                  var answerADescription = $("textarea#answer-text-a-desc").val();
//                  $("#answer-text-a").text(answerADescription);
                  $("#answer-text-a").html(textResponse);
                  console.log($("textarea#answer-text-a-desc").val());
                  $("#answer-text-a").show();
                  $("#answer-text-edit-a").hide();
                  element_model.set("answerTextA", textResponse);
                  var parsedElements = JSON.parse(JSON.stringify(element_model.collection));
                  ajaxSaveActivity(activity);
                  //saveActivity(activity, parsedElements);
//                API.MessageToServerStudentAnswer('d');
                });
                Show.listenTo(responseView, "element:answer:cancel:b", function(target, model) {
                  $("#answer-text-b").show();
                  $("#answer-text-edit-b").hide();
                });
                Show.listenTo(responseView, "element:answer:b:save", function(target, model) {
//                  console.log("test");
//                  var textResponse = $("textarea#answer-text-b-desc").val();
                  var textResponse = $("textarea#answer-text-b-desc").code();
                  console.debug("content" + textResponse);
                  var element_model = model;
                  $("#answer-text-b").html(textResponse);
                  $("#answer-text-b").show();
                  $("#answer-text-edit-b").hide();
                  element_model.set("answerTextB", textResponse);
                  //var parsedElements = JSON.parse(JSON.stringify(element_model.collection));
                  ajaxSaveActivity(activity);
                  //saveActivity(activity, parsedElements);
                });
                Show.listenTo(responseView, "element:answer:cancel:c", function(target, model) {
                  $("#answer-text-c").show();
                  $("#answer-text-edit-c").hide();
                });
                Show.listenTo(responseView, "element:answer:c:save", function(target, model) {
//                  var textResponse = $("textarea#answer-text-c-desc").val();
                  var textResponse = $("textarea#answer-text-c-desc").code();
                  console.debug("content" + textResponse);
                  var element_model = model;
                  var answerADescription = $("textarea#answer-text-c-desc").val();
                  $("#answer-text-c").html(textResponse);
                  console.log($("textarea#answer-text-c-desc").val());
                  $("#answer-text-c").show();
                  $("#answer-text-edit-c").hide();
                  element_model.set("answerTextC", textResponse);
                  ajaxSaveActivity(activity);
                  //var parsedElements = JSON.parse(JSON.stringify(element_model.collection));
                  //saveActivity(activity, parsedElements);
                });
                Show.listenTo(responseView, "element:answer:cancel:d", function(target, model) {
                  $("#answer-text-d").show();
                  $("#answer-text-edit-d").hide();
                });
                Show.listenTo(responseView, "element:answer:d:save", function(target, model) {
//                  var textResponse = $("textarea#answer-text-d-desc").val();
                  var textResponse = $("textarea#answer-text-d-desc").code();
                  console.debug("content" + textResponse);
                  var element_model = model;
                  $("#answer-text-d").html(textResponse);
                  console.log($("textarea#answer-text-d-desc").val());
                  $("#answer-text-d").show();
                  $("#answer-text-edit-d").hide();
                  element_model.set("answerTextD", textResponse);

//                  var parsedElements = JSON.parse(JSON.stringify(element_model.collection));
//                  saveActivity(activity, parsedElements);
                  ajaxSaveActivity(activity);
                });
                Show.listenTo(responseView, "element:answer:select", function(target, model) {
                  var element_model = model;
                  var answerSelected = $("select#answer-select").val();
                  element_model.set("answer", answerSelected);
                  ajaxSaveActivity(activity);
//                  var parsedElements = JSON.parse(JSON.stringify(element_model.collection));
//                  saveActivity(activity, parsedElements);
                  console.log(answerSelected);
                });
              }
            };

//            function showElementLayout(activity, element) {
//              var elementLayout = new View.Element({model: element});
//              this.listenTo(elementLayout, "render", function() {
//                showResponseView(elementLayout.responsePanel, activity, element);
//              }, this);
//            }
//
//            function showResponseView(responsePanel, activity, element) {
//              var responseView = new ResponseView.ElementResponse({model: element});
//              responsePanel.show(responseView);
//            }

            function saveActivity(activity, elements) {
              activity.set("elements", elements);
              activity.save();
            }

            function createNewElement(activity, element_model) {
              var element = LessonManager.request("element:entity:new");
              var activityIndex = activity.collection.indexOf(activity) + 1;
              var elementIndex = element_model.collection.length + 1;
              element.set("index", activityIndex + '.' + elementIndex);
              element_model.collection.add(element);
              console.log("elements after add");
              console.log(activity.get("elements"));
            }
            //Todo can be removed when the server sync API is done
            var API = {
              MessageToServerStudentAnswer: function(answer) {
                var message = {type: 'StudentAnswer', value: answer};
//                message = JSON.stringify(message);
//                console.log(message);
//                var event = new CustomEvent('studentToServer', {detail: message});                
//                document.dispatchEvent(event);
                jq(document).trigger('studentToServer', {detail: message});
              }
            };

          });
      return LessonManager.ElementsApp.Show.Controller;
    });

