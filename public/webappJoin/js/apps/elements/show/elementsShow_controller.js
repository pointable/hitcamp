define(['app', "apps/elements/show/elementsShow_view", "server/sync", "bootbox", 'mathjax', "grids"],
    function (StudentManager, View, ServerSync, bootbox, MathJax) {
      StudentManager.module("ElementsApp.Show",
          function (Show, StudentManager, Backbone, Marionette, $, _) {
            var Controller = Marionette.Controller.extend({
//          showFirstElement: function(elements,index) {            
//            require(['entities/element/element_collection','entities/activity/activity_collection','server/sync'],
//              function(ElementCollection,ServerSync) {
//              var elements_internal=elements;
//              //If there are no elements given, we will need to get the elements from the activity collection 
//              if(elements === null && typeof index === "undefined" ){                
//                var fetchActivityCollection = StudentManager.request("activity:entities");
//                  $.when(fetchActivityCollection).done(function(data){
//                    //Fetch the first activity, then populate the elements in it.
//                    var firstActivity = data.at(0);
//                    elements_internal = firstActivity.get("elements");                    
//                    var index_internal=0;
//                    var elementCollection = new ElementCollection(elements_internal);
//                    var model = elementCollection.at(index_internal);
//                    _helper.showElementView(model);
//                  });
//             //To check callback is from internal helper (Collection)
//            //or external click  (Objects array)
//              }else if(!(elements_internal instanceof Backbone.Collection)){                   
//                    var elementCollection = new ElementCollection(elements_internal);
//                    var model = elementCollection.at(index);
//                    _helper.showElementView(model);
//              }else{
//                    var model = elements_internal.at(index);
//                    console.log(model);
//                    _helper.showElementView(model);
//              };  
//              //var fetchInitializeElements = StudentManager.request("element:entities:initialize");                                                       
////            var elementsFromActivitiesModel = activityModel.get("elements");                                      
//            });
//          },
              showElement: function (activityID, elementIndex) {
                require(["entities/activity/activity_collection"], function () {
                  var fetchActivity = StudentManager.request("activity:entities:initialized");
                  $.when(fetchActivity).done(function (activities) {
                    var activity = activities.get(activityID);
                    if (typeof activity === 'undefined') {
                      StudentManager.navigate("", {trigger: true});
                    } else {
                      var element = activity.get("elements").at(elementIndex - 1);
                      _helper.showElementView(activity, element);
                    }
//                   console.log("shown");
                  });
                });
              },
              showFirstElement: function (activity) {
                var index = 0;
                var elements = activity.get("elements");
                //Do not show anything if activity does not have any elements
                if (elements.length === 0) {
                  alert("There is no elements to be shown");
                  return;
                } else {
                  var firstElementModel = elements.at(index);
                  _helper.showElementView(activity, firstElementModel);
                }
              }
            });

            Show.Controller = new Controller;
            var self = Show.Controller;
            function nextElement() {
              var curModel = StudentManager.request("model");
              var activity = StudentManager.request("activity");
              var index = curModel.collection.indexOf(curModel);
              var nextIndex = index + 1;
              if (!curModel.collection.at(nextIndex)) {
                return;
              }
              StudentManager.navigate("/adventures/" + activity.id + "/elements/" + (nextIndex + 1));
              _helper.showElementView(activity, curModel.collection.at(nextIndex));
            }

            function prevElement() {
              var curModel = StudentManager.request("model");
              var activity = StudentManager.request("activity");
              var index = curModel.collection.indexOf(curModel);
              var previousIndex = index - 1;
              if (previousIndex < 0) {
                return;
              }
              StudentManager.navigate("/adventures/" + activity.id + "/elements/" + (previousIndex + 1));
              _helper.showElementView(activity, curModel.collection.at(previousIndex));
            }
            var _helper = {
//              showElement: function(model, index) {
//                if (model.collection.at(index)) {
//                  StudentManager.ElementsApp.Show.Controller.showElement(model.collection, index);
//                }
//              },
              showElementView: function (activity, elementModel) {

                StudentManager.reqres.setHandler("activity", function () {
                  return activity;
                });

                StudentManager.reqres.setHandler("model", function () {
                  return elementModel;
                });

                StudentManager.commands.setHandler("next", function () {
                  nextElement();
                });

                StudentManager.commands.setHandler("prev", function () {
                  prevElement();
                });

                if (typeof elementModel === 'undefined') {
                  StudentManager.navigate("", {trigger: true});
                }
                var answer_selected = '';
                elementModel.set("activityTitle", activity.get("activityTitle"));
                var elementView = new View.Element({model: elementModel});
                var index = elementModel.collection.indexOf(elementModel);

                self.listenTo(elementView, "show", function () {
                  ////Set up view 
                  //Hide the previous/next button according to the index
                  $("#main-region").scrollTop(0);
//                  debugger
                  StudentManager.reqres.setHandler("element:answerArea", function () {
                    return elementView.answerArea;
                  });

                  StudentManager.reqres.setHandler("activity", function () {
                    return activity;
                  });
                  if (elementModel.get("responseType") !== '') {
                    StudentManager.trigger("responses:show", elementModel);
                  }

                  if (index === 0) {
                    $(".btn-previous").hide();
                  }
                  var nextIndex = index + 1;
                  if (!elementModel.collection.at(nextIndex)) {
                    $(".btn-next").hide();
                  }
                  //Slide up text if no media
                  if (elementModel.get("resourceUrl") === 'about:blank') {
                    $(".question-text").addClass("noMedia");
                    $("#divInsertFrame").hide();
                  }
                  //Hide the question and answer if no question given
                  if (elementModel.get("questionText") === '') {
                    $(".question-text-area").hide();
                  }
                });

                //Event listeners                
                self.listenTo(elementView, "element:question:previous", function (target, model) {
                  prevElement();
//                  var index = model.collection.indexOf(model);
//                  var previousIndex = index - 1;
//                  if (previousIndex < 0) {
//                    return;
//                  }
//                  StudentManager.navigate("/adventures/" + activity.id + "/elements/" + (previousIndex + 1));
//                  _helper.showElementView(activity, model.collection.at(previousIndex));
                });
                self.listenTo(elementView, "element:question:next", function (target, model) {
                  nextElement();
//                  var index = model.collection.indexOf(model);
//                  var nextIndex = index + 1;
//                  if (!model.collection.at(nextIndex)) {
//                    return;
//                  }
//                  StudentManager.navigate("/adventures/" + activity.id + "/elements/" + (nextIndex + 1));
//                  _helper.showElementView(activity, model.collection.at(nextIndex));
                });
                self.listenTo(elementView, "element:question:close", function (model) {
                  //StudentManager.trigger("activities:list:initialize");
                  var activityID = StudentManager.getCurrentRoute().split("/")[1];
                  var options;
                  options = {
                    activityIDToBeAnimated: activityID
                  };
                  StudentManager.trigger("activities:listActivities:initialized", options);
                  StudentManager.navigate("");
                });
                StudentManager.mainRegion.show(elementView);                

                //Checking whether the question has been answered by this student
//                var dataToSend = {
//                  activityID: activity.id,
//                  elementID: model.cid,
//                  correctAnswer: model.get("answer"),
////                    imageURL: model.get("resourceUrl"),
//                  answer: {
//                    answerSubmitted: answer_selected,
//                    isCorrect: isCorrect,
//                    points: 10
//                  }
//                };


//                window.pluginToServer('ACTIVITY', 'GetStudentAnswers', {});
//                $(window.document).off('ServerToPlugin' + 'ACTIVITY');
//                $(window.document).on('ServerToPlugin' + 'ACTIVITY', function(e) {
//                  var messageReceived = e.originalEvent.detail;
//                  switch (messageReceived.pluginMessageType)
//                  {
//                    //set all custom message type here
//                    case 'GetStudentAnswersResponse':
//                      //message.data.activities
//                      var activities = messageReceived.data.activities;
//                      if (activities[activity.id] && activities[activity.id][elementModel.cid]){
//                        var studentAnswer = activities[activity.id][elementModel.cid].studentAnswer;
//                        console.log(studentAnswer);
//                         elementModel.set("studentAnswered", studentAnswer.answerSubmitted);
//                      }
//                        
//                      break;
//                  }
//                });
              }
            };
            //Todo can be removed when the server sync API is done
            API = {
              MessageToServerStudentAnswer: function (answer) {
                var message = {type: 'StudentAnswer', value: answer};
//                message = JSON.stringify(message);
//                console.log(message);
//                var event = new CustomEvent('studentToServer', {detail: message});
//                document.dispatchEvent(event);                
                jq(document).trigger('studentToServer', {detail: message});
              }
            };
          });
      return StudentManager.ElementsApp.Show.Controller;
    });