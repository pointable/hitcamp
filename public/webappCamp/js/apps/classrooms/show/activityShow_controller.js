define(['app',
  "apps/activities/show/activityShow_view",
  "apps/elements/list/elementsList_view",
  "apps/elements/show/elementsShow_view",
  "apps/elements/show/elementsShowResponse_view",
  "apps/elements/show/elementsShowQuestionInput_view",
  'server/sync',
  'bootstrap'
//  'jquery-ui'
],
    function(LessonManager, View, ListView, ShowView, ResponseView, QuestionInputView, ServerSync
        ) {
      LessonManager.module("ActivitiesApp.Show",
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
                          _helper.showElementView(model);
                        });
                        //To check callback is from internal helper (Collection)
                        //or external click  (Objects array)
                      } else if (!(elements_internal instanceof Backbone.Collection)) {
                        var elementCollection = new ElementCollection(elements_internal);
                        var model = elementCollection.at(index);
                        _helper.showElementView(model);
                      } else {
                        var model = elements_internal.at(index);
                        console.log(model);
                        _helper.showElementView(model);
                      }

                    });
              },
              //local
              showElementLocal: function(activity, element) {
                _helper.showElementView(activity, element);
              },
              //server
              showElement: function(activityID, elementIndex) {
                require(["entities/activity/activity_collection"], function() {
                  var fetchActivity = LessonManager.request("activity:entities");
                  $.when(fetchActivity).done(function(activities) {
                    var activity = activities.get(activityID);
                    var element = activity.get("elements").at(elementIndex - 1);
                    _helper.showElementView(activity, element);
                  });
                });
              },
              showActivity: function(activity, element) {
                if (typeof element === "undefined") {
                  LessonManager.trigger("activities:listAdventures");
                  return;
                }
                var index = element.collection.indexOf(element);
                if (typeof index === "undefined") {
                  LessonManager.trigger("activities:listAdventures");
                  return;
                }
                LessonManager.trigger("header:list");
//                var init_width = $(window).width();
//                $(window).off('resize');
//                $(window).on('resize', _.debounce(function() {
//                  resize(init_width);
//                }, 300));
//
//                function resize(init) {
//                  var current_width = $(window).width();
//                  console.log("current panel  width: " + current_width);
//                  if (current_width > 800 && init_width < 800) {
//                    //this_view.template = _.template(elementShowTplLandscape);
//                    LessonManager.trigger("element:show", activity, model);
//                    console.log("current panel more than 800:" + $(window).width());
//                  } else if (current_width < 800 && init_width > 800) {
//                    //this_view.template = _.template(elementShowTplPotrait);
//                    //                    this_view.render();
//                    LessonManager.trigger("element:show", activity, model);
//                    console.log("current panel less than 800: " + $(window).width());
//                  }
//                  init_width = current_width;
//                }

//                var activityView = _view.showActivityLayout(activity, element);
                LessonManager.mainRegion.show(_view.showActivity(activity, element));
                //debugger;
                LessonManager.mainRegion.on("show", function(view) {
                  console.log("main show");
                });
              }
            };

            function saveActivity(activity, elements) {
              activity.set("elements", elements);
              //Needed to use a clone as it seemed like there is no return value or validation from server
              //Hence, there is always a wait for sync
              var tempActivity = activity.clone();
              tempActivity.save({}, {
                success: function(res) {
                  tempActivity.trigger('destroy', tempActivity, tempActivity.collection);
                },
                error: function(res) {
                }
              });
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

            function _selected(elements) {
              var selectedElement = elements.findWhere({selected: true});
              return selectedElement;
            }

            function checkAndInitializewysihtml5() {
              rangy.init();
              var editor = $("#response-panel").find(".wysihtml5-sandbox");
              if (editor.length === 0) {
                console.log(" no answer editor");
//                $(".answer-text-edit").wysihtml5({
//                  locale: 'en-US'
//                });
              }
              var questionEditor = $(".question-text-input").find(".wysihtml5-sandbox");
              if (questionEditor.length === 0) {
                console.log(" no question editor");
//                $(".question-text-edit").wysihtml5({
//                  locale: 'en-US'
//                });
              }
            }
            _view = {
              highlightElement: function(element) {
                _.each(element.collection.models, function(model) {
                  model.set("selected", false);
                });
                element.set("selected", true);
              },
              resetElementsIndex: function(element) {
                var collection = element.collection;
                _.each(element.collection.models, function(element) {
                  var curIndex = element.collection.indexOf(element);
                  element.set("index", curIndex + 1);
                });
              },
              showActivity: function(activity, element) {
                //var curElement = element;
                var activityView = new View.Activity({model: activity});
                Show.listenTo(activityView, "render", function() {
                  _view.showElementsListAndElement(activityView, activity, element);
                }, Show);

                activityView.on("element:question:new", function(args) {
                  require(["entities/element/element_model"], function() {
                    var activity = args.model;
                    var elements = activity.get("elements");
                    var selectedElement = _selected(elements);
                    var selectedElementIndex = elements.indexOf(selectedElement);
                    var newElement = LessonManager.request("element:entity:new");
                    //Check for currently selected element;
                    var newElementIndex = selectedElementIndex + 1;
                    newElement.set("index", newElementIndex);
                    //if there is element after that, increment the index of other elements
                    elements.add(newElement);
                    elements.resetIndex();
                    saveActivity(activity, elements);
                    //show the new elements
                    _view.showElement(activityView.elementPanel, activity, newElement);
                  });
                });

                activityView.on("element:question:delete", function(args) {
                  //Get the selected element, remove that element from the collection
                  var activity = args.model;
                  var elements = activity.get("elements");
                  var selectedElement = _selected(elements);
                  var selectedElementIndex = elements.indexOf(selectedElement);
                  //remove model                  
                  elements.remove(selectedElement);
                  //Reset the index
                  elements.resetIndex();
                  //Select the next available element  
                  var nextElement = elements.at(selectedElementIndex);
                  var prevElement = elements.at(selectedElementIndex - 1);
                  if (nextElement) {
                    saveActivity(activity, elements);
                    _view.showElement(activityView.elementPanel, activity, nextElement);
                    // if there is no more elements, create a new one at the spot
                  } else if (elements.length === 0) {
                    require(["entities/element/element_model"], function() {
                      var newElement = LessonManager.request("element:entity:new");
                      newElement.set("index", 1);
                      elements.add(newElement);
                      nextElement = newElement;
                      //Save the new activity with deleted model 
                      saveActivity(activity, elements);
                      _view.showElement(activityView.elementPanel, activity, nextElement);
                    });
                    //If last element use the previous element
                  } else if (typeof nextElement === 'undefined' && prevElement) {
                    saveActivity(activity, elements);
                    _view.showElement(activityView.elementPanel, activity, prevElement);
                  }
                  //Show the next available element
                });

                activityView.on("element:question:newImages", function(args) {
                  var activity = args.model;
                  var elements = activity.get("elements");
                  var selectedElement = _selected(elements);
                  var selectedElementIndex = elements.indexOf(selectedElement);
                  var imageDataArray = document.imageDataArray;
//                console.log(imageDataArray);
                  var numberOfImages = imageDataArray.length;

                  var startingIndex = selectedElement.get("index") + 1;

                  //Check for all elements after insert and add their index ignore is there is no elements

                  if (selectedElement.get("index") !== elements.length) {
                    var slidesAfterActive = [];
                    _.each(elements.models, function(model) {
                      if (model.get("index") >= startingIndex) {
                        model.set("index", model.get("index") + numberOfImages);
                      }
                    });
                  }

                  console.log("active Slide : %O", selectedElement);
                  require(["entities/element/element_model"], function() {
                    var elementIndex = startingIndex;
                    var increment = 0;
                    //first element replace the link for the active slide
//                       selectedElement.set("resourceUrl",imageDataArray[0]);
                    setElementAttributes(selectedElement, imageDataArray[0]);

                    imageDataArray.shift();
                    _.each(imageDataArray, function(imageData) {
//                    console.log(imageData);                        
                      var element = LessonManager.request("element:entity:new");
                      element.set("index", elementIndex + increment);
                      setElementAttributes(element, imageData);
                      elements.add(element);
                      activityIndex = activity.collection.indexOf(activity) + 1;
                      increment += 1;
                    });

                    function setElementAttributes(element, imageData) {
                      element.set("resourceUrl", imageData.resourceURL);
                      element.set("thumbnail", imageData.thumbnail);
                      element.set("resourceTitle", imageData.resourceTitle);
                      element.set("isImage", true);
                    }

//                    elements.sort();
                    console.log("elements after add");
                    console.log(activity.get("elements"));
                    saveActivity(activity, elements);
                    _view.showElement(activityView.elementPanel, activity, selectedElement);
                    //LessonManager.trigger("element:show", activity, selectedElement);
                    //showing the next element                     
                  });
                });

                activityView.on("element:link:update", function(args, data) {
                  console.log("element link update");
                  var activity = args.model;
                  var elements = activity.get("elements");
                  var selectedElement = _selected(elements);
                  var selectedElementIndex = elements.indexOf(selectedElement);

                  selectedElement.set({
                    resourceUrl: data.resourceURL,
                    isImage: data.isImage,
                    thumbnail: data.thumbnail,
                    resourceTitle: data.title
                  });
                  activity.set({
                    "thumbnail": data.thumbnail
                  });

                  saveActivity(activity, selectedElement.collection);

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

                return activityView;
              },
              showElementsListAndElement: function(activityView, activity, element) {
                var elementListView = _view.addElementListView(activityView.elementsListPanel, activity, element);
                //LessonManager.trigger("element:show",activityView.elementPanel,activity,element);
                _view.showElement(activityView.elementPanel, activity, element);
                _view.highlightElement(element);
                elementListView.on("childview:element:show", function(args, element) {
                  _view.showElement(activityView.elementPanel, activity, element);
                });

                LessonManager.on("element:setIndex", function(ui, args) {
                  var curObjectIndex = $(ui.item).find(".element-index").text();
                  var curModel = args.model;
//                  var curModel = element.collection.at(curObjectIndex - 1);
                  //var curModelWhere = element.collection.where({index: curObjectIndex});
                  var nextObj = $(ui.item).next();
                  var prevObj = $(ui.item).prev();
                  var nextObjIndex = nextObj.find(".element-index").text();

                  var newIndex;
                  var setIndex = false;

                  var collection = element.collection;

                  //if my object index less than the new index of next object
                  //Insert just before the next slide, and assign the new index as this

                  //if there is no next object, check if there is previous object, if yes then this is the last element. Use the length of the collection as the new index
                  //if there is no next object, and no previous object, a single element, then don't do anything.

                  // if the object index is more than the index of next object
                  //find the elements between my object index and the the next object, add 1 to all the elements in between then assign new index as the next object index                                                                                                  
                  if (element.collection.length === 1) {
                    //single element nothing to be done.
                    return;
                  } else if (nextObj.length !== 0 && curObjectIndex < nextObjIndex) {
                    //Got next slide
                    //Insert just before the next slide, and assign the new index as this
                    newIndex = nextObjIndex - 1;
                    reducedandSetIndex();
                    //if there is no next object, check if there is previous object
                  } else if (!setIndex && nextObj.length === 0 && prevObj.length !== 0) {
                    // if yes then this is the last element. Use the  collection length as  new index
                    newIndex = element.collection.length;
                    reducedandSetIndex();
                  } else if (!setIndex && curObjectIndex > nextObjIndex) {
                    //insert just before the next slide, and assign the new index as the next slide
                    newIndex = nextObjIndex;
                    //find the elements in between the index, including the next element
                    addandSetIndex();
                  }

                  function reducedandSetIndex() {
                    //find the elements in between the next object index and including the new object index and  lessen their index by 1
                    var elementsInBetween = [];
                    _.each(collection.models, function(model) {
                      //Change the index for models from the previous position to current position
                      if (model.get("index") > curObjectIndex && model.get("index") <= newIndex) {
                        elementsInBetween.push(model);
                        model.set("index", model.get("index") - 1);
                      }
                    });
                    curModel.set("index", newIndex);
//                    element.collection.sort();
                    setIndex = true;
                  }

                  function addandSetIndex() {
                    //find the elements in between the next object index and including the new object index and  lessen their index by 1
                    var elementsInBetween = [];
                    _.each(collection.models, function(model) {
                      //Check for elements from including the new index unit the current object index
                      if (model.get("index") < curObjectIndex && model.get("index") >= newIndex) {
                        elementsInBetween.push(model);
                        //increment the index
                        model.set("index", model.get("index") + 1);
                      }
                    });
                    curModel.set("index", newIndex);
//                    element.collection.sort();
                    setIndex = true;
                  }

                  $(".elements-panel-wrapper").sortable("refresh");

                  var tempActivity = activity.clone();
                  tempActivity.save({}, {
                    success: function(res) {
                      tempActivity.trigger('destroy', tempActivity, tempActivity.collection);
                    },
                    error: function(res) {
                    }
                  });
                });

              },
              addElementListView: function(elementsListPanel, activity, element) {
                var elements = activity.get("elements");
                var elementsListView = new ListView.ElementsPanel({
                  model: activity,
                  collection: elements
                });
                elementsListPanel.show(elementsListView);
                return elementsListView;
              },
              showElement: function(elementPanel, activity, element) {
                //always set it to true when being showed
                element.setSelected();
                var index = element.collection.indexOf(element);
                LessonManager.navigate("#adventures/" + activity.id + "/elements/" + (index + 1));
                //Send to the element controller to handle the generation of the view

                elementPanel.show(_view.elementLayout(elementPanel, activity, element));
                //Todo can be removed when the server sync API is done
                API = {
                  MessageToServerStudentAnswer: function(answer) {
                    var message = {type: 'StudentAnswer', value: answer};
//                    message = JSON.stringify(message);
//                    console.log(message);
//                    var event = new CustomEvent('studentToServer', {detail: message});
//                    document.dispatchEvent(event);
                    jq(document).trigger('studentToServer', {detail: message});
                  }
                }
              },
              elementLayout: function(elementPanel, activity, element) {
                var elementView = new ShowView.Element({model: element});
                Show.listenTo(elementView, "render", function() {
                  _view.showResponses(elementView.responsePanel, activity, element);
                  _view.showQuestion(elementView.questionInputPanel, activity, element);
                  rangy.init();
//                  $(".question-text-edit").wysihtml5({
//                    locale: 'en-US'
//                  });
                }, Show);

                elementView.on("element:link:save", function(args) {
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
                elementView.on("element:question:previous", function(model) {
                  var index = model.collection.indexOf(model);
                  var previousIndex = index - 1;
                  var prevElement = model.collection.at(previousIndex);
                  LessonManager.navigate("#adventures/" + activity.id + "/elements/" + (previousIndex + 1));
                  _view.showElement(elementPanel, activity, prevElement);
                });
                elementView.on("element:question:next", function(model) {
                  var index = model.collection.indexOf(model);
                  var nextIndex = index + 1;
                  var nextElement = model.collection.at(nextIndex);
                  LessonManager.navigate("#adventures/" + activity.id + "/elements/" + (nextIndex + 1));
                  _view.showElement(elementPanel, activity, nextElement);
                });
                elementView.on("element:show:close", function() {
                  var options = {
                    activities: activity.collection
                  };
                  LessonManager.trigger("activities:listAdventures");
                });
                elementView.on("element:response:select", function(target, model) {
                  var element_model = model;
                  var answerSelected = $("select#response-select").val();
                  element_model.set("responseType", answerSelected);
                  saveActivity(activity, element_model.collection);
                  console.log(answerSelected);
                });
//                elementView.on("element:question:text:edit", function(target, model) {
//                  checkAndInitializewysihtml5();
//                  $(target).hide();
//                  $("#question-text-edit").show();
//                  $(".question-text-edit").focus();
//                  console.log("question text triggered");
//                });
//                elementView.on("element:question:cancel", function(target, model) {
//                  $("#question-text").show();
//                  $("#question-text-edit").hide();
//                });
//                elementView.on("element:question:save", function(target, model) {
//                  var questionText = $(".question-text-edit").val();
//                  console.debug("content:" + questionText);
//                  var element_model = model;
//                  var questionDescription = $("textarea#question-text-desc").val();
//                  $("#question-text").text(questionText);
//                  console.log($("textarea#answer-text-d-desc").val());
//                  $("#question-text").show();
//                  $("#question-text-edit").hide();
//                  element_model.set("questionText", questionText);
//                  var parsedElements = JSON.parse(JSON.stringify(element_model.collection));
//                  saveActivity(activity, parsedElements);
//                });

                return elementView;
              },
              showResponses: function(responsePanel, activity, element) {
                var responseView = new ResponseView.ElementResponse({model: element});
                responsePanel.show(responseView);
                responseView.on("render", function(view) {
                  console.log("on Render 2");

                });
                responseView.on("show", function(view) {
                  console.log("Show 2");
                });

                responseView.on("element:answer:a:edit", function(target, model) {
                  checkAndInitializewysihtml5();
                  $(target).hide();
                  $("#answer-text-edit-a").show();
                  $(".answer-text-edit").focus();
                });
                responseView.on("element:answer:b:edit", function(target, model) {
                  checkAndInitializewysihtml5();
                  console.log("Answer B triggered");
                  $(target).hide();
                  $("#answer-text-edit-b").show();
                  $(".answer-text-edit").focus();
                });
                responseView.on("element:answer:c:edit", function(target, model) {
                  checkAndInitializewysihtml5();
                  $(target).hide();
                  $("#answer-text-edit-c").show();
                  $(".answer-text-edit").focus();
                  console.log("Answer C triggered");
                });
                responseView.on("element:answer:d:edit", function(target, model) {
                  checkAndInitializewysihtml5();
                  $(target).hide();
                  $("#answer-text-edit-d").show();
                  $(".answer-text-edit").focus();
                  console.log("Answer D triggered");
                });
                responseView.on("element:question:text:edit", function(target, model) {
                  checkAndInitializewysihtml5();
                  $(target).hide();
                  $("#question-text-edit").show();
                  $(".question-text-edit").focus();
                  console.log("question text triggered");
                });
                responseView.on("element:answer:cancel:a", function(target, model) {
                  $("#answer-text-a").show();
                  $("#answer-text-edit-a").hide();
                });
                responseView.on("element:answer:a:save", function(args) {
//                  var textResponse = $(args.view.el).find("#answer-text-a-desc_ifr").contents().find("#tinymce").contents()[0].outerHTML;

                  var textResponse = $(".answer-text-edit").val();
                  console.debug("content" + textResponse);
                  var element_model = args.model;
                  var answerADescription = $("textarea#answer-text-a-desc").val();
//                  $("#answer-text-a").text(answerADescription);
                  $("#answer-text-a").text(textResponse);
                  console.log($("textarea#answer-text-a-desc").val());
                  $("#answer-text-a").show();
                  $("#answer-text-edit-a").hide();
                  element_model.set("answerTextA", textResponse);
                  var parsedElements = JSON.parse(JSON.stringify(element_model.collection));
                  saveActivity(activity, parsedElements);
//                API.MessageToServerStudentAnswer('d');
                });
                responseView.on("element:answer:cancel:b", function(target, model) {
                  $("#answer-text-b").show();
                  $("#answer-text-edit-b").hide();
                });
                responseView.on("element:answer:b:save", function(target, model) {
//                  console.log("test");
                  var textResponse = $("textarea#answer-text-b-desc").val();
                  console.debug("content" + textResponse);
                  var element_model = model;
                  $("#answer-text-b").text(textResponse);
                  console.log($("textarea#answer-text-b-desc").val());
                  $("#answer-text-b").show();
                  $("#answer-text-edit-b").hide();
                  element_model.set("answerTextB", textResponse);
                  var parsedElements = JSON.parse(JSON.stringify(element_model.collection));
                  saveActivity(activity, parsedElements);
                });
                responseView.on("element:answer:cancel:c", function(target, model) {
                  $("#answer-text-c").show();
                  $("#answer-text-edit-c").hide();
                });
                responseView.on("element:answer:c:save", function(target, model) {
                  var textResponse = $("textarea#answer-text-c-desc").val();
                  console.debug("content" + textResponse);
                  var element_model = model;
                  var answerADescription = $("textarea#answer-text-c-desc").val();
                  $("#answer-text-c").text(textResponse);
                  console.log($("textarea#answer-text-c-desc").val());
                  $("#answer-text-c").show();
                  $("#answer-text-edit-c").hide();
                  element_model.set("answerTextC", textResponse);
                  var parsedElements = JSON.parse(JSON.stringify(element_model.collection));
                  saveActivity(activity, parsedElements);
                });
                responseView.on("element:answer:cancel:d", function(target, model) {
                  $("#answer-text-d").show();
                  $("#answer-text-edit-d").hide();
                });
                responseView.on("element:answer:d:save", function(target, model) {
//                  console.log("test");
                  var textResponse = $("textarea#answer-text-d-desc").val();
                  console.debug("content" + textResponse);
                  var element_model = model;
                  var answerADescription = $("textarea#answer-text-d-desc").val();
                  $("#answer-text-d").text(textResponse);
                  console.log($("textarea#answer-text-d-desc").val());
                  $("#answer-text-d").show();
                  $("#answer-text-edit-d").hide();
                  element_model.set("answerTextD", textResponse);
                  var parsedElements = JSON.parse(JSON.stringify(element_model.collection));
                  saveActivity(activity, parsedElements);
                });
                responseView.on("element:answer:select", function(target, model) {
                  var element_model = model;
                  var answerSelected = $("select#answer-select").val();
                  element_model.set("answer", answerSelected);
                  var parsedElements = JSON.parse(JSON.stringify(element_model.collection));
                  saveActivity(activity, parsedElements);
                  console.log(answerSelected);
                });
              },
              showQuestion: function(questionInputPanel, activity, element) {
                var questionInputView = new QuestionInputView.ElementQuestion({model: element});
                questionInputPanel.show(questionInputView);
                questionInputView.on("element:question:text:edit", function(target, model) {
                  checkAndInitializewysihtml5();
                  $(".js-question-text").hide();
                  $("#question-text-edit").show();
                  $(".question-text-edit").focus();
                  console.log("question text triggered");
                });
                questionInputView.on("element:question:cancel", function(target, model) {
                  $("#question-text").show();
                  $("#question-text-edit").hide();
                });
                questionInputView.on("element:question:save", function(target, model) {
                  var questionText = $(".question-text-edit").val();
                  console.debug("content:" + questionText);
                  var element_model = model;
                  $("#question-text").text(questionText);
                  console.log($("textarea#answer-text-d-desc").val());
                  $("#question-text").show();
                  $("#question-text-edit").hide();
                  element_model.set("questionText", questionText);
                  var parsedElements = JSON.parse(JSON.stringify(element_model.collection));
                  saveActivity(activity, parsedElements);
                });
              }

            };


          });
      return LessonManager.ActivitiesApp.Show.Controller;
    });

