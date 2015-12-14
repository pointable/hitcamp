define(['app', "apps/elements/show/elementsShow_view", 'server/sync', 'mathjax', "backbone.syphon", "grids"],
    function (TeacherSession, View, ServerSync, MathJax) {
      TeacherSession.module("ElementsApp.Show",
          function (Show, TeacherSession, Backbone, Marionette, $, _) {
            var Controller = Marionette.Controller.extend({
              showFirstElement: function (elements, index) {
                require(['entities/element/element_collection', 'entities/activity/activity_collection'],
                    function (ElementCollection) {
                      var elements_internal = elements;
                      //If there are no elements given, we will need to get the elements from the activity collection 
                      if (elements === null && typeof index === "undefined") {
                        var fetchActivityCollection = TeacherSession.request("activity:entities");
                        $.when(fetchActivityCollection).done(function (data) {
                          //Fetch the first activity, then populate the elements in it.
                          var firstActivity = data.at(0);
                          elements_internal = firstActivity.get("elements");
                          var index_internal = 0;
                          var elementCollection = new ElementCollection(elements_internal);
                          var model = elementCollection.at(index_internal);
                          showElementView(model);
                        });
                        //To check callback is from internal helper (Collection)
                        //or external click  (Objects array)
                      } else if (!(elements_internal instanceof Backbone.Collection)) {
                        var elementCollection = new ElementCollection(elements_internal);
                        var model = elementCollection.at(index);
                        showElementView(model);
                      } else {
                        var model = elements_internal.at(index);
//                        console.log(model);
                        showElementView(model);
                      }
                      ;
                      //var fetchInitializeElements = StudentManager.request("element:entities:initialize");                                                       
//            var elementsFromActivitiesModel = activityModel.get("elements");                                      
                    });
              },
              showElementLocal: function (activity, element) {
                showElementView(activity, element);
              },
              //server
              showElement: function (activityID, elementIndex) {
                require(["entities/activity/activity_collection"], function () {
                  var fetchActivity = TeacherSession.request("activity:entities");
                  $.when(fetchActivity).done(function (activities) {
                    var activity = activities.get(activityID);
                    if (typeof activity === 'undefined') {
                      TeacherSession.navigate("");
                      TeacherSession.backToRoot();
                    } else {
                      var element = activity.get("elements").at(elementIndex - 1);
                      showElementView(activity, element);
                    }
//                   console.log("shown");
                  });
                });
              },
              updateElementResponses: function () {
                var a = [];
                var b = [];
                var c = [];
                var d = [];
                var element = TeacherSession.request("element");
                var responses = element.get("responses");
                var total = 0;
                _.each(responses, function (response) {
                  total += 1;
                  switch (response.studentAnswer.answerSubmitted) {
                    case "a":
                      a.push(response);
                      break;
                    case "b":
                      b.push(response);
                      break;
                    case "c":
                      c.push(response);
                      break;
                    case "d":
                      d.push(response);
                      break;
                  }
                });
                var aPrecentage = Math.round(a.length / total * 100);
                var bPrecentage = Math.round(b.length / total * 100);
                var cPrecentage = Math.round(c.length / total * 100);
                var dPrecentage = Math.round(d.length / total * 100);
                $("#answer-text-a").find(".result-overlay").css("width", aPrecentage + '%');
                $("#answer-text-b").find(".result-overlay").css("width", bPrecentage + '%');
                $("#answer-text-c").find(".result-overlay").css("width", cPrecentage + '%');
                $("#answer-text-d").find(".result-overlay").css("width", dPrecentage + '%');
              }

            });
            Show.Controller = new Controller();
            var self = Show.Controller;

            function showElementView(activity, model) {
              if (typeof model === 'undefined') {
                TeacherSession.navigate("");
                TeacherSession.backToRoot();
              }
              TeacherSession.reqres.setHandler("activity", function () {
                return activity;
              });
              TeacherSession.reqres.setHandler("element", function () {
                return model;
              });
              model.set("activityTitle", activity.get("activityTitle"));
              var elementView = new View.Element({model: model});
              var index = model.collection.indexOf(model);
              self.listenTo(elementView, "show", function () {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                //Call to update the Responses for the answers
                window.pluginToServer('ACTIVITY', 'GetAllStudentAnswers', {});

                TeacherSession.reqres.setHandler("responses:panel", function () {
                  return elementView.responsesPanel;
                });
                if (model.get("responseType") === "text") {
                  TeacherSession.trigger("responses:list");
                }

                ////Set up view 

                //Hide the previous/next button according to the index
                if (index === 0) {
                  $(".js-question-previous").hide();
                }
                var nextIndex = index + 1;
                if (!model.collection.at(nextIndex)) {
                  $(".js-question-next").hide();
                }
                //Slide up text if no media
                if (model.get("resourceUrl") === 'about:blank') {
                  $(".question-text").addClass("noMedia");
                  $("#divInsertFrame").hide();
                }
                //Hide the question if not question given
                if (model.get("questionText") === '') {
                  $(".question-text-area").hide();
//                  $(".answer-area").hide();
//                  $(".submit-area").hide();
                }
                //Hide empty answers if question given.
                // if (_helper.checkEmpty(model.get("questionText")) === false) {
                if (model.get("responseType") === "mul") {
                  var aEmpty = _helper.checkEmpty(model.get("answerTextA"));
                  var bEmpty = _helper.checkEmpty(model.get("answerTextB"));
                  var cEmpty = _helper.checkEmpty(model.get("answerTextC"));
                  var dEmpty = _helper.checkEmpty(model.get("answerTextD"));
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
                //  }

                $('.answer-text').responsiveEqualHeightGrid();
                elementView.on("elements:list:local", function (element) {
//            console.log("elements:list %O",element);
                  //var activityId = args.model.collection.activityID;                
                  TeacherSession.trigger("elements:list:local", element.model.collection);
//           TeacherSession.trigger("activities:list:refresh",activity.model.collection);
                });

                elementView.on("element:link:save", function (args) {
                  require(["entities/activity/activity_model"], function (Activity) {
                    var element_model = args.model;
                    var fetchingActivity = TeacherSession.request("activity:entity",
                        args.model.collection.activityID);
                    var data = Backbone.Syphon.serialize(args.view);
                    element_model.set(data);
                    var parsedElements = JSON.parse(JSON.stringify(args.model.collection));
                    //Only need to set the element back to the activity element 
                    $.when(fetchingActivity).done(function (fetchedActivity) {
                      //Activity Fetched returned activity and an array of activities,
                      // which are the real activities being used.                   
                      saveActivity(fetchedActivity, parsedElements);
                      var frameDoc = $('#frameDoc');
                      frameDoc.attr('src', data.resourceUrl);
                    });
                  });
                });

                elementView.on("element:question:previous", function (model) {
                  var index = model.collection.indexOf(model);
                  var previousIndex = index - 1;
                  _helper.showElement(previousIndex, model, activity);
                  var path = "/adventures/" + activity.id + "/elements/" + (previousIndex + 1);
                  TeacherSession.navigate(path);
//                  document.checkWalkthrough(path.replace('/adventures', '#adventures'));
                });
                elementView.on("element:question:next", function (model) {
                  var index = model.collection.indexOf(model);
                  var nextIndex = index + 1;
                  _helper.showElement(nextIndex, model, activity);
                  var path = "/adventures/" + activity.id + "/elements/" + (nextIndex + 1);
                  TeacherSession.navigate(path);
//                  document.checkWalkthrough(path.replace('/adventures', '#adventures'));
                });

                elementView.on("element:show:close", function () {
                  //TeacherSession.trigger("element:show:close", activity);
                  var options = {
                    activities: activity.collection
                  };
                  //TeacherSession.trigger("activities:list", options);
                  TeacherSession.navigate("", {trigger: false});
                  TeacherSession.trigger("activities:listActivities:initialized");
                  TeacherSession.trigger("elements:list:local", activity);
//                  document.checkWalkthrough(false);
                });

                elementView.on("element:answer:a", function () {
//                  console.log("Answer A triggered");
                  ServerSync.MessageToServerStudentAnswer('a');
//                API.MessageToServerStudentAnswer('a');
                });
                elementView.on("element:answer:b", function () {
//                  console.log("Answer B triggered");
                  ServerSync.MessageToServerStudentAnswer('b');
//                API.MessageToServerStudentAnswer('b');
                });
                elementView.on("element:answer:c", function () {
                  ServerSync.MessageToServerStudentAnswer('c');
//                  console.log("Answer C triggered");
//                API.MessageToServerStudentAnswer('c');
                });
                elementView.on("element:answer:d", function () {
                  ServerSync.MessageToServerStudentAnswer('d');
//                  console.log("Answer D triggered");
//                API.MessageToServerStudentAnswer('d');
                });
                elementView.on("element:answers:show", function () {
//                  ServerSync.MessageToServerStudentAnswer('d');
//                  console.log("Answer D triggered");
//                API.MessageToServerStudentAnswer('d');
                });
                elementView.on("element:answers:reset", function (model) {
                  var options = {
                    idActivity: activity.id,
                    idElement: model.cid
                  };
                  ServerSync.MessageToServerStudentAnswersReset(options);
                });
                elementView.on("element:link:update", function (model, data) {
                  var element_model = model;
                  element_model.set({
                    "resourceUrl": data.resourceURL,
                    "thumbnail": data.thumbnail,
                    "resourceTitle": data.title
                  });
                  activity.set({
                    "thumbnail": data.thumbnail
                  });
//                  element_model.set({"thumbnail":data.thumbnail});                              
//                  element_model.set({"resourceTitle":data.title});
                  var parsedElements = JSON.parse(JSON.stringify(model.collection));
                  saveActivity(activity, parsedElements);
                  var frameDoc = $('#frameDoc');
                  frameDoc.attr('src', data.resourceURL);
                });
              });
              TeacherSession.mainRegion.show(elementView);

            }

            _helper = {
              showElement: function (index, model, activity) {
                var modelselected = model.collection.at(index);
                if (modelselected) {
                  showElementView(activity, modelselected);
                }
              },
              checkEmpty: function (a) {
                if (a.trim() === '') {
                  return true;
                }
                return false;
              }
            };
            function saveActivity(activity, elements) {
              activity.set("elements", elements);
              activity.save();
            }

            //Todo can be removed when the server sync API is done
            API = {
              MessageToServerStudentAnswer: function (answer) {
                var message = {type: 'StudentAnswer', value: answer};
//                message = JSON.stringify(message);
////                console.log(message);
//                var event = new CustomEvent('studentToServer', {detail: message});
//                document.dispatchEvent(event);

                jq(document).trigger('studentToServer', {detail: message});
              }
            };

          });
      return TeacherSession.ElementsApp.Show.Controller;
    });

