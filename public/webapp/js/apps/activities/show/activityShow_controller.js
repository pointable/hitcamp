define(['app',
  "apps/activities/show/activityShow_view",
  "apps/elements/list/elementsList_view",
  "apps/elements/show/elementsShow_view",
  "apps/elements/show/elementsShowQuestionInput_view",
  "apps/elements/show/elementsShowResponse_view",
  'server/sync',
  "domReady",
  'bootbox',
  'Jcrop',
  'mathjax',
//  'ckeditor-core',
  'ckeditor-j',
  'bootstrap'
],
    function (LessonManager, View, ListView, ShowView, QuestionInputView, ResponseView, ServerSync,
        domReady, bootbox, Jcrop, MathJax) {
      LessonManager.module("ActivitiesApp.Show",
          function (Show, LessonManager, Backbone, Marionette, $, _) {
            var Controller = Marionette.Controller.extend({
              showFirstElement: function (elements, index) {
                require(['entities/element/element_collection', 'entities/activity/activity_collection'],
                    function (ElementCollection) {
                      var elements_internal = elements;
                      //If there are no elements given, we will need to get the elements from the activity collection 
                      if (elements === null && typeof index === "undefined") {
                        var fetchActivityCollection = LessonManager.request("activity:entities");
                        $.when(fetchActivityCollection).done(function (data) {
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
              showElementLocal: function (activity, element) {
                _helper.showElementView(activity, element);
              },
              //server
              showElement: function (activityID, elementIndex) {
                require(["entities/activity/activity_collection"], function () {
                  var fetchActivity = LessonManager.request("activity:entities");
                  $.when(fetchActivity).done(function (activities) {
                    var activity = activities.get(activityID);
                    var element = activity.get("elements").at(elementIndex - 1);
                    _helper.showElementView(activity, element);
                  });
                });
              },
              showActivity: function (activity1, element) {
                var activity = activity1.clone();
                if (typeof element === "undefined") {
                  LessonManager.trigger("activities:list");
                  return;
                }
                var index = element.collection.indexOf(element);
                if (typeof index === "undefined") {
                  LessonManager.trigger("activities:list");
                  return;
                }

                LessonManager.trigger("header:list:elements");
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
                var self = Show.Controller;
                //var activityView = _view.showActivityLayout(activity, element);
                element.setSelected();
                var elementsListView = new ListView.ElementsPanel({collection: activity.get("elements")});
                //var elementView = new ShowView.Element({model: element});

                var activityView = new View.Activity({model: activity});
                self.listenTo(activityView, "activity:rename", function (args) {
                  bootbox.prompt({
                    title: "Rename Activity Title",
                    value: args.model.get("activityTitle"),
                    callback: function (res) {
                      var res = $.trim(res);
                      if (res === null || res.length === 0) {
                        return;
                      } else {
                        activity.set("activityTitle", res);
                        ajaxSaveActivity(activity);
                        args.view.$el.find(".js-rename").html(res);
                      }
                    }
                  });
                });

                function addSlide() {
                  var elements = activity.get("elements");
                  var selectedElement = _selected(elements);
                  var selectedElementIndex = elements.indexOf(selectedElement) + 1;
                  var newElement = LessonManager.request("element:entity:new");
                  //Check for currently selected element;
                  // var newElementIndex = selectedElementIndex+1;
                  //Increment the index of next elements if there is any
                  //Add in new element, and push others 
                  if (typeof elements.at(selectedElementIndex) !== undefined) {
                    _.each(elements.models, function (element) {
                      if (elements.indexOf(element) + 1 >= selectedElementIndex + 1) {
                        element.set("index", elements.indexOf(element) + 2);
                      }
                    });
                  }
                }

                self.listenTo(activityView, "element:question:new", function (args) {
                  require(["entities/element/element_model"], function () {
                    //var activity = args.model;
                    var elements = activity.get("elements");
                    var selectedElement = _selected(elements);
                    var selectedElementIndex = elements.indexOf(selectedElement) + 1;
                    var newElement = LessonManager.request("element:entity:new");
                    //Check for currently selected element;
                    // var newElementIndex = selectedElementIndex+1;
                    //Increment the index of next elements if there is any
                    //Add in new element, and push others 
                    if (typeof elements.at(selectedElementIndex) !== undefined) {
                      _.each(elements.models, function (element) {
                        if (elements.indexOf(element) + 1 >= selectedElementIndex + 1) {
                          element.set("index", elements.indexOf(element) + 2);
                        }
                      });
                    }
                    newElement.set("index", selectedElementIndex + 1);
                    elements.add(newElement);
                    //newElement.setSelected();
                    saveActivity(activity, elements);
                    //show the new elements
                    //activityView.elementPanel.show(elementView);
                    showElementView(newElement);
                    newElement.setSelected();
                    showElementListView(activity.get("elements"));
                    //LessonManager.trigger("element:show", activityView.elementPanel, activity, newElement);
                  });
                });

                self.listenTo(activityView, "element:question:duplicate", function (args) {
                  var elements = activity.get("elements");
                  var selectedElement = _selected(elements);
                  var selectedElementIndex = elements.indexOf(selectedElement) + 1;
                  var newElement = selectedElement.clone();
                  //Check for currently selected element;
                  // var newElementIndex = selectedElementIndex+1;
                  //Increment the index of next elements if there is any
                  //Add in new element, and push others 
                  if (typeof elements.at(selectedElementIndex) !== undefined) {
                    _.each(elements.models, function (element) {
                      if (elements.indexOf(element) + 1 >= selectedElementIndex + 1) {
                        element.set("index", elements.indexOf(element) + 2);
                      }
                    });
                  }

                  newElement.set("index", selectedElementIndex + 1);
                  elements.add(newElement);
                  //newElement.setSelected();
                  saveActivity(activity, elements);
                  //show the new elements

                  showElementView(newElement);
                  newElement.setSelected();
                  showElementListView(activity.get("elements"));

                });

                self.listenTo(activityView, "element:question:delete", function (args) {
                  //Get the selected element, remove that element from the collection
                  //var activity = args.model;
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
                    nextElement.setSelected();
                    showElementListView(activity.get("elements"));
                    showElementView(nextElement);
                    //LessonManager.trigger("element:show", activityView.elementPanel, activity, nextElement);
                    // if there is no more elements, create a new one at the spot
                  } else if (elements.length === 0) {
                    require(["entities/element/element_model"], function () {
                      var newElement = LessonManager.request("element:entity:new");
                      newElement.set("index", 1);
                      elements.add(newElement);
                      nextElement = newElement;
                      //Save the new activity with deleted model 
                      saveActivity(activity, elements);
                      showElementView(nextElement);
                      //LessonManager.trigger("element:show", activityView.elementPanel, activity, nextElement);
                    });
                    //If last element use the previous element
                  } else if (typeof nextElement === 'undefined' && prevElement) {
                    saveActivity(activity, elements);
                    showElementView(prevElement);
                    prevElement.setSelected();
                    showElementListView(activity.get("elements"));
                    //LessonManager.trigger("element:show", activityView.elementPanel, activity, prevElement);
                  }
                  //self the next available element
                });

                self.listenTo(activityView, "element:question:newImages", function (args) {
                  //var activity = args.model;
                  var elements = activity.get("elements");
                  var selectedElement = _selected(elements);
                  var selectedElementIndex = elements.indexOf(selectedElement);
                  var imageDataArray = document.imageDataArray;
//                console.log(imageDataArray);
                  var numberOfImages = imageDataArray.length;

                  var startingIndex = selectedElement.get("index") + 1;

                  //Check for all elements after insert and add their index ignore is there is no elements

                  //if (selectedElement.get("index") !== elements.length) {
                  //  var slidesAfterActive = [];
                  _.each(elements.models, function (model) {
                    if (model.get("index") >= startingIndex) {
                      model.set("index", model.get("index") + numberOfImages - 1);
                    }
                  });
                  //  }

                  console.log("active Slide : %O", selectedElement);
                  require(["entities/element/element_model"], function () {
                    var elementIndex = startingIndex;
                    var increment = 0;
                    //first element replace the link for the active slide
//                       selectedElement.set("resourceUrl",imageDataArray[0]);
                    setElementAttributes(selectedElement, imageDataArray[0]);

                    imageDataArray.shift();
                    _.each(imageDataArray, function (imageData) {
//                    console.log(imageData);                        
                      var element = LessonManager.request("element:entity:new");
                      element.set("index", elementIndex + increment);
                      setElementAttributes(element, imageData);
                      elements.add(element);
//                      activityIndex = activity.collection.indexOf(activity) + 1;
                      increment += 1;
                    });

                    function setElementAttributes(element, imageData) {
                      element.set("resourceUrl", imageData.resourceURL);
                      element.set("thumbnail", imageData.thumbnail);
                      element.set("resourceTitle", imageData.resourceTitle);
                      element.set("isImage", true);
                    }

                    console.log("elements after add");
                    console.log(activity.get("elements"));
                    ajaxSaveActivity(activity);
                    //saveActivity(activity, elements);                    
                    showElementView(selectedElement);
                    showElementListView(elements);
                    //LessonManager.trigger("element:show", activityView.elementPanel, activity, selectedElement);

                  });
                });

                self.listenTo(activityView, "element:link:update", function (args, data) {

                  //var activity = args.model;
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


//                  ajaxSaveActivity(activity);
                  //saveActivity(activity, selectedElement.collection);

                  //Setting the image directly
                  if (data.isImage) {
                    //use image div
                    var frameDoc = $('#frameDoc');
                    frameDoc.attr('src', 'about:blank');
                    frameDoc.css('display', 'none');

                    var imageDocHolder = $('#imageDocHolder');
                    var imageDoc = $('#imageDoc');
                    imageDoc.attr('src', data.resourceURL);
                    imageDocHolder.css('display', '');

                  } else {
                    var frameDoc = $('#frameDoc');
                    frameDoc.attr('src', data.resourceURL);
                    frameDoc.css('display', '');


                    var imageDocHolder = $('#imageDocHolder');
                    var imageDoc = $('#imageDoc');
                    imageDoc.attr('src', 'about:blank');
                    imageDocHolder.css('display', 'none');
                  }
                  ajaxSaveActivity(activity);
                  showElementListView(elements);

                });

                self.listenTo(activityView, "show", function () {
                  $("html").css("cursor", '');
                  //                  activityView.elementPanel.show(elementView);
                  showElementView(element);
                  showElementListView(element.collection);
                  //activityView.elementsListPanel.show(elementsListView);
                  //                  LessonManager.trigger("elements:list", activityView, activity);
                  //                  LessonManager.trigger("element:show", activityView.elementPanel, activity, element);

                });

                function showElementView(model) {
                  LessonManager.reqres.setHandler("current:model", function () {
                    return model;
                  });
                  LessonManager.navigate("#activities/" + activity.id + "/elements/" + (model.collection.indexOf(model) + 1));
                  var elementView = new ShowView.Element({model: model});

                  self.listenTo(elementView, "element:link:save", function (args) {
                    require(["entities/activity/activity_model"], function (Activity) {
                      var element_model = args.model;
                      var fetchingActivity = LessonManager.request("activity:entity", args.model.collection.activityID);
                      var data = Backbone.Syphon.serialize(args.view);
                      element_model.set(data);
                      var parsedElements = JSON.parse(JSON.stringify(args.model.collection));
                      //Only need to set the element back to the activity element 
                      $.when(fetchingActivity).done(function (fetchedActivity) {
                        //Activity Fetched returned activity and an array of activities, which are the real activities being used.                   
                        saveActivity(fetchedActivity, parsedElements);
                        var frameDoc = $('#frameDoc');
                        frameDoc.attr('src', data.resourceUrl);
                        window.imgPreloader.push(data.resourceUrl);
                      });
                    });
                  });
                  self.listenTo(elementView, "element:question:previous", function (model) {
                    var index = model.collection.indexOf(model);
                    var previousIndex = index - 1;
                    var previousModel = model.collection.at(previousIndex);
                    LessonManager.navigate("#activities/" + activity.id + "/elements/" + (previousIndex + 1));
//                  _view.showElement(previousIndex, model, activity);
                    showElementView(previousModel);
                    previousModel.setSelected();
                    showElementListView(model.collection);
                    //LessonManager.trigger("element:show", elementPanel, activity, previousModel);
                  });
                  self.listenTo(elementView, "element:question:next", function (model) {
                    var index = model.collection.indexOf(model);
                    var nextIndex = index + 1;
                    var nextModel = model.collection.at(nextIndex);
                    LessonManager.navigate("#activities/" + activity.id + "/elements/" + (nextIndex + 1));
//                  _view.showElement(nextIndex, model, activity);
                    //LessonManager.trigger("element:show", elementPanel, activity, nextModel);
                    showElementView(nextModel);
                    nextModel.setSelected();
                    showElementListView(model.collection);
                  });
                  self.listenTo(elementView, "element:show:close", function () {
                    var options = {
                      activities: activity.collection
                    };
                    //LessonManager.trigger("activities:list", options);
                    //TODO list adventures local
                    LessonManager.trigger("activities:list", options);
                    //LessonManager.trigger("elements:list:local", activity);
                  });
                  self.listenTo(elementView, "element:link:update", function (model, data) {
                    var element_model = model;
                    element_model.set({
                      resourceUrl: data.resourceURL,
                      isImage: data.isImage,
                      thumbnail: data.thumbnail,
                      resourceTitle: data.title
                    });
//                    activity.set({
//                      "thumbnail": data.thumbnail
//                    });
                    var parsedElements = JSON.parse(JSON.stringify(model.collection));
                    //saveActivity(activity, parsedElements);
                    ajaxSaveActivity(activity);
                    if (data.isImage) {
                      //use image div
                      var frameDoc = $('#frameDoc');
                      frameDoc.attr('src', 'about:blank');
                      frameDoc.css('display', 'none');

                      var imageDocHolder = $('#imageDocHolder');
                      var imageDoc = $('#imageDoc');
                      imageDoc.attr('src', data.resourceURL);
                      imageDocHolder.css('display', '');

                    } else {
                      var frameDoc = $('#frameDoc');
                      frameDoc.attr('src', data.resourceURL);
                      frameDoc.css('display', '');

                      var imageDocHolder = $('#imageDocHolder');
                      var imageDoc = $('#imageDoc');
                      imageDoc.attr('src', 'about:blank');
                      imageDocHolder.css('display', 'none');
                    }
                  });
                  self.listenTo(elementView, "element:response:select", function (target, model) {
                    var element_model = model;
                    var answerSelected = $("select#response-select").val();
                    element_model.set("responseType", answerSelected);
                    ajaxSaveActivity(activity);
//                  saveActivity(activity, element_model.collection);
                    console.log(answerSelected);

                    LessonManager.execute("reset:response:view");


                  });

                  var jcrop_api;
                  var jcropInitialized = false;
                  var jcropSelection = {};

                  function storeCoordinates(c) {
                    $(".js-crop-ok").css('display', '');
                    jcropSelection = c;
                  }

                  Show.listenTo(elementView, "element:crop", function (args, element) {
                    if (jcropInitialized) {
                      jcropInitialized = false;
                      jcrop_api.destroy();
                      $(".crop-ok-cancel").css("display", "none");
                      $(".js-crop-ok").css('display', 'none');
                      $('#imageDoc').removeAttr('style');
                    } else {
                      $('#imageDoc').Jcrop({
                        bgColor: 'gray',
                        bgOpacity: 0.8,
                        onSelect: storeCoordinates
                      }, function () {
                        jcrop_api = this;
                      });
                      $(".crop-ok-cancel").css("display", "block");
                      jcropInitialized = true;
                    }
                  });
                  Show.listenTo(elementView, "element:crop:ok", function (args, element) {
                    $(".crop-ok-cancel").css("display", "none");
                    $(".js-crop-ok").css('display', 'none');
                    $("#crop-saving").css('display', '');
                    $("#imageDoc").css("width", "");
                    $("#imageDoc").css("height", "");
//                    $('#imageDoc').removeAttr('style');

                    if (!jcropSelection) {
                      return;
                    }

//                    var img = document.createElement('IMG');

//                    img.crossOrigin = 'Anonymous';
//                    img.onload = function() {
//                      debugger;
                    var canvas = document.createElement('CANVAS');
                    var context = canvas.getContext("2d");
                    var img = document.getElementById("imageDoc");
                    var $img = $(img);
                    var imgW = img.width;
                    var imgH = img.height;

                    var ratioY = imgH / $img.height();
                    var ratioX = imgW / $img.width();

//                      var ratioY = imgH / img.naturalHeight;
//                      var ratioX = imgW / img.naturalWidth;

                    var getX = jcropSelection.x * ratioX,
                        getY = jcropSelection.y * ratioY,
                        getWidth = jcropSelection.w * ratioX,
                        getHeight = jcropSelection.h * ratioY;

                    canvas.height = getHeight; //jcropSelection.h;
                    canvas.width = getWidth; //jcropSelection.w;

                    context.drawImage(img, getX, getY, getWidth, getHeight, 0, 0, canvas.width, canvas.height);
                    var imageData = canvas.toDataURL("image/png");
                    console.log(imageData);
                    $("#filepicker")[0].contentWindow.uploadBackground(imageData, function (imageURL) {
                      console.log(imageURL);
                      var thumbnailHeight = 120;
                      var thumbnailWidth = 120 / getHeight * getWidth;

                      var canvasThumbnail = document.createElement('CANVAS');
                      canvasThumbnail.height = thumbnailHeight;
                      canvasThumbnail.width = thumbnailWidth;
                      var contextThumbnail = canvasThumbnail.getContext("2d");
                      contextThumbnail.drawImage(canvas, 0, 0, jcropSelection.w, jcropSelection.h, 0, 0, thumbnailWidth, thumbnailHeight);

                      var thumbnailData = canvasThumbnail.toDataURL("image/png");
                      $("#filepicker")[0].contentWindow.uploadBackground(thumbnailData, function (thumbnailURL) {
                        jcropInitialized = false;
                        jcrop_api.destroy();
                        $('#imageDoc').removeAttr('style');

                        $("#crop-saving").css('display', 'none');
                        $("#crop-saved").css('display', '');
                        $("#filepicker")[0].contentWindow.sendCallBackImageUpdate(imageURL, thumbnailURL);
                        setTimeout(function () {
                          $("#crop-saved").css('display', 'none');
                        }, 3000);
                        canvasThumbnail = null;
                        canvas = null;
                      });
                    });

//                    };
//                    img.src = $("#imageDoc").attr("src");
                  });
                  Show.listenTo(elementView, "element:crop:cancel", function (args, element) {
                    jcropInitialized = false;
                    jcrop_api.destroy();
                    $(".crop-ok-cancel").css("display", "none");
                    $('#imageDoc').removeAttr('style');
                  });

                  function editorGoToLastPosition(editor) {

                    editor.focus();

//                    var s = editor.getSelection(); // getting selection
//                    var selected_ranges = s.getRanges(); // getting ranges
//                    var node = selected_ranges[0].startContainer; // selecting the starting node
//                    var parents = node.getParents(true);
//
//                    node = parents[parents.length - 2].getFirst();
//
//                    while (true) {
//                      var x = node.getNext();
//                      if (x == null) {
//                        break;
//                      }
//                      node = x;
//                    }
//
//                    s.selectElement(node);
//                    selected_ranges = s.getRanges();
//                    selected_ranges[0].collapse(false);  //  false collapses the range to the end of the selected node, true before the node.
//                    s.selectRanges(selected_ranges);  // putting the current selection there

//                    editor.focus();
//                    var range = editor.createRange();
//                    range.moveToPosition(range.root, CKEDITOR.POSITION_BEFORE_END);
//                    editor.getSelection().selectRanges([range]);
                  }

                  self.listenTo(elementView, "show", function () {
//                    require(["http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_HTML"]);
                    var questionInputView = new QuestionInputView.ElementQuestion({model: model});
                    self.listenTo(questionInputView, "element:question:text:edit", function (target, model) {

                      $(".js-question-text").hide();
                      $("#question-text-edit").show();
                      var editor = CKEDITOR.instances["question-text-desc"];
                      editorGoToLastPosition(CKEDITOR.instances["question-text-desc"]);
                      //To fix that the iframe width is 0 sometimes
                      $("#question-text-desc").next().find(".cke_wysiwyg_frame").css("width","100%");
//                      editor.destroy();
//                      _element.initializeQuestionCKeditor(".question-text-edit");                      
//                      CKEDITOR.instances['question-text-desc'].on('instanceReady', function (event) {
//                        editorGoToLastPosition(CKEDITOR.instances["question-text-desc"]);
//                      });                      
//                      $("#question-text-edit .note-editable").focus();
                    });
                    self.listenTo(questionInputView, "element:question:cancel", function (target, model) {
                      $("#question-text").show();
                      $("#question-text-edit").hide();
                    });
                    self.listenTo(questionInputView, "element:question:save", function (target, model) {
                      saveQuestionText();
                    });
                    self.listenTo(questionInputView, "show", function () {
                      console.log("show editor");
                      _element.initializeQuestionCKeditor(".question-text-edit");
                      MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    });
                    elementView.questionInputPanel.show(questionInputView);

                    showResponseView();
                    LessonManager.commands.setHandler("reset:response:view", function () {
                      showResponseView();
                    });
                    function showResponseView() {
                      var responseView = new ResponseView.ElementResponse({model: model});

                      self.listenTo(responseView, "show", function () {

                        _element.initializeAnswerCKeditor(".answer-text-edit");
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                      });

                      self.listenTo(responseView, "element:answer:edit", function (target, model) {
                        $(target).hide();
                        var answerEditArea = $(target).next(".answer-edit-area");
                        answerEditArea.show();
                        answerEditArea.find(".cke_wysiwyg_frame").css("width","100%");
                        var editorid = answerEditArea.find(".answer-text-edit").attr('id');
                        var editor = CKEDITOR.instances[editorid];
                        editorGoToLastPosition(editor);
//                        answerEditArea.find(".note-editable").focus();
//                        //Removed the <p><br><p> tag when clicked on the editor
//                        var text = answerEditArea.find(".note-editable").html();
//                        if (text == "<p><br></p>") {
//                          answerEditArea.find(".note-editable").html('');
//                        }
                      });

                      self.listenTo(responseView, "element:answer:cancel", function (target, model) {
                        var curAnswerCol = $(target).closest("div[class*='col-answer']");
                        curAnswerCol.find(".answer-text").show();
                        curAnswerCol.find(".answer-edit-area").hide();
                      });


                      self.listenTo(responseView, "element:answer:save", function (target, model) {
                        var curAnswerCol = $(target).closest("div[class*='col-answer']");
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                        saveAnswer(curAnswerCol);
//                      var textResponse = curAnswerCol.find(".answer-text-edit").code();
//                      console.debug("content" + textResponse);
//                      var element_model = model;
//                      curAnswerCol.find(".answer-text").html(textResponse);
//                      curAnswerCol.find(".answer-text").show();
//                      curAnswerCol.find(".answer-edit-area").hide();
//                      var curAnswerLabel = curAnswerCol.find(".answer-text-label-font").text();
//                      switch (curAnswerLabel) {
//                        case ('A'):
//                          element_model.set("answerTextA", textResponse);
//                          break;
//                        case ('B'):
//                          console.log("B");
//                          element_model.set("answerTextB", textResponse);
//                          break;
//                        case ('C'):
//                          element_model.set("answerTextC", textResponse);
//                          break;
//                        case ('D'):
//                          element_model.set("answerTextD", textResponse);
//                          break;
//                      }
//                      ajaxSaveActivity(activity);
                      });

                      self.listenTo(responseView, "element:answerRadio:select", function (target, model) {
                        var element_model = model;
//                      var answerSelected = $(target).closest(".answer-text-label-wrapper").find(".answer-text-label-font").text();
                        var answerSelected = $(target).val();
                        element_model.set("answer", answerSelected);
                        ajaxSaveActivity(activity);
                        // console.log(answerSelected);
                      });
                      elementView.responsePanel.show(responseView);
                    }


                  });

                  activityView.elementPanel.show(elementView);
                }

                function saveQuestionText() {
                  var questionText = CKEDITOR.instances["question-text-desc"].getData();
                  //var questionText = $(".question-text-edit").code();
                  console.debug("content:" + questionText);
                  var model = LessonManager.request("current:model");
                  $("#question-text").html(questionText);
                  MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                  $("#question-text").show();
                  $("#question-text-edit").hide();
                  model.set("questionText", questionText);
                  ajaxSaveActivity(activity);
                  showElementListView(model.collection);
                }

                function saveAnswer(curAnswerCol) {
                  var textResponse;
                  //var textResponse = curAnswerCol.find(".answer-text-edit").code();
//                  console.debug("content" + textResponse);
                  var element_model = LessonManager.request("current:model");

                  curAnswerCol.find(".answer-text").show();
                  curAnswerCol.find(".answer-edit-area").hide();
                  var curAnswerLabel = curAnswerCol.find(".answer-text-label-font").text();
                  switch (curAnswerLabel) {
                    case ('A'):
                      textResponse = CKEDITOR.instances["answer-text-a-desc"].getData();
                      curAnswerCol.find(".answer-text").html(textResponse);
                      element_model.set("answerTextA", textResponse);
                      break;
                    case ('B'):
                      console.log("B");
                      textResponse = CKEDITOR.instances["answer-text-b-desc"].getData();
                      curAnswerCol.find(".answer-text").html(textResponse);
                      element_model.set("answerTextB", textResponse);
                      break;
                    case ('C'):
                      textResponse = CKEDITOR.instances["answer-text-c-desc"].getData();
                      curAnswerCol.find(".answer-text").html(textResponse);
                      element_model.set("answerTextC", textResponse);
                      break;
                    case ('D'):
                      textResponse = CKEDITOR.instances["answer-text-d-desc"].getData();
                      curAnswerCol.find(".answer-text").html(textResponse);
                      element_model.set("answerTextD", textResponse);
                      break;
                  }
                  MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                  ajaxSaveActivity(activity);
                }
                var _element = {
                  initializeQuestionCKeditor: function (textarea) {

                    $(textarea).ckeditor(
                        {
                          toolbarGroups: [
                            {name: 'clipboard', groups: ['undo']},
                            {name: 'basicstyles'},
                            {name: 'styles'},
                            {name: 'colors'},
                            {name: 'paragraph', groups: ['indent', 'align']},
                            {name: 'insert'},
                            {name: 'links'}

                          ],
                          specialChars: ['&quot;', '&rsquo;', '#', '$', '%', '&amp;',
                            ['&theta;', 'theta'], ['&Pi;', 'Pi'], ['&radic;', 'square root'],
                            '{', '|', '}', '~', "&euro;", "&lsquo;", "&rsquo;",
                            "&ldquo;", "&rdquo;", "&ndash;", "&mdash;", "&iexcl;",
                            "&cent;", "&pound;", "&curren;", "&yen;", "&brvbar;",
                            "&sect;", "&uml;", "&copy;", "&ordf;", "&laquo;", "&not;",
                            "&reg;", "&macr;", "&deg;", "&sup2;", "&sup3;", "&acute;",
                            "&micro;", "&para;", "&middot;", "&cedil;", "&sup1;", "&ordm;",
                            "&raquo;", "&frac14;", "&frac12;", "&frac34;", "&iquest;",
                            "&Agrave;", "&Aacute;", "&Acirc;", "&Atilde;", "&Auml;", "&Aring;",
                            "&AElig;", "&Ccedil;", "&Egrave;", "&Eacute;", "&Ecirc;", "&Euml;",
                            "&Igrave;", "&Iacute;", "&Icirc;", "&Iuml;", "&ETH;", "&Ntilde;",
                            "&Ograve;", "&Oacute;", "&Ocirc;", "&Otilde;", "&Ouml;", "&times;",
                            "&Oslash;", "&Ugrave;", "&Uacute;", "&Ucirc;", "&Uuml;", "&Yacute;",
                            "&THORN;", "&szlig;", "&agrave;", "&aacute;", "&acirc;", "&atilde;",
                            "&auml;", "&aring;", "&aelig;", "&ccedil;", "&egrave;", "&eacute;",
                            "&ecirc;", "&euml;", "&igrave;", "&iacute;", "&icirc;", "&iuml;",
                            "&eth;", "&ntilde;", "&ograve;", "&oacute;", "&ocirc;", "&otilde;",
                            "&ouml;", "&divide;", "&oslash;", "&ugrave;", "&uacute;", "&ucirc;",
                            "&uuml;", "&yacute;", "&thorn;", "&yuml;", "&OElig;", "&oelig;",
                            "&#372;", "&#374", "&#373", "&#375;", "&sbquo;", "&#8219;", "&bdquo;",
                            "&hellip;", "&trade;", "&#9658;", "&bull;", "&rarr;", "&rArr;", "&hArr;",
                            "&diams;", "&asymp;"],
                          removeButtons: 'Flash,Iframe,Smiley,PageBreak,Image,Table,Anchor,spellchecker,Cut,Paste,Copy,Styles'
                        }
                    );
                    CKEDITOR.instances['question-text-desc'].on('key', function (event) {
                      if (event.data.keyCode === 9) {
                        event.cancel();
                        saveQuestionText();
                        $(".answer-text")[0].click();
                      }
                      //alert("key :"+ e.data.keyCode);
                    });

//                    $(textarea).summernote({
//                      height: 100,
//                      focus: true, toolbar: [
//                        ['style', ['style', 'bold', 'italic', 'underline', 'clear']],
//                        ['font', ['strikethrough', 'superscript', 'subscript']],
//                        ['fontsize', ['fontsize']],
//                        ['color', ['color']],
//                        ['para', ['ul', 'ol', 'paragraph']],
//                        ['insert', ['link', 'picture', 'table']]
//                      ],
//                      oninit: function() {
//                        $("a[href='#']").on("click", function(e) {
//                          e.preventDefault();
//                        });
//                        if ($("#question-text").html() === "") {
//                          $("#question-text-edit .note-editable").html('<h2 style="text-align: left; "><br></h2>');
//                        }                       
//                        $('.dropdown-toggle').dropdown();
//                      },
//                      onkeydown: function(e) {
////                        console.log('Key is pressed:', e.keyCode);
//                        var iKey = e.keycode || e.which || 0;
//                        //Intercept tab and go to next answer
//                        if (iKey === 9) {
//                          console.log("target", e.target);
//                          //Removed the tab added
//                          var curQCol = $(e.target).closest(".question-text-input");
//                          var curQtext = curQCol.find(".question-text-edit").code();
//                          var lastIndex = curQtext.lastIndexOf("&nbsp;");
//                          var text = curQtext.substring(0, lastIndex - 18);
//                          var textLeft = curQtext.substring(lastIndex + 6, curQtext.length);
//                          var newText = text.concat(textLeft);
//                          $(e.target).html(newText);
//                          //hide this
//                          curQCol.find(".question-text-edit-area").hide();
//                          curQCol.find(".js-question-text").show();
//                          //Show the next answer edit area
//                          var nextAnswerCol = $("div[class*='col-answer']")[0];
//                          nextAnswerCol.find(".js-answer").hide();
//                        }
//
//                        switch (iKey) {
//                          case (9):
//                            e.preventDefault();
//                            console.log("tab");
//                            break;
//                        }
//                      }
//
//                    });
                  }, initializeAnswerCKeditor: function (textarea) {

                    $(textarea).ckeditor(
                        {
                          toolbarGroups: [
                            {name: 'clipboard', groups: ['undo']},
                            {name: 'basicstyles'},
                            {name: 'styles'},
                            {name: 'colors'},
                            {name: 'paragraph', groups: ['indent', 'align']},
                            {name: 'insert'},
                            {name: 'insert'}

                          ],
                          specialChars: ['&quot;', '&rsquo;', '#', '$', '%', '&amp;',
                            ['&theta;', 'theta'], ['&Pi;', 'Pi'], ['&radic;', 'square root'],
                            '{', '|', '}', '~', "&euro;", "&lsquo;", "&rsquo;",
                            "&ldquo;", "&rdquo;", "&ndash;", "&mdash;", "&iexcl;",
                            "&cent;", "&pound;", "&curren;", "&yen;", "&brvbar;",
                            "&sect;", "&uml;", "&copy;", "&ordf;", "&laquo;", "&not;",
                            "&reg;", "&macr;", "&deg;", "&sup2;", "&sup3;", "&acute;",
                            "&micro;", "&para;", "&middot;", "&cedil;", "&sup1;", "&ordm;",
                            "&raquo;", "&frac14;", "&frac12;", "&frac34;", "&iquest;",
                            "&Agrave;", "&Aacute;", "&Acirc;", "&Atilde;", "&Auml;", "&Aring;",
                            "&AElig;", "&Ccedil;", "&Egrave;", "&Eacute;", "&Ecirc;", "&Euml;",
                            "&Igrave;", "&Iacute;", "&Icirc;", "&Iuml;", "&ETH;", "&Ntilde;",
                            "&Ograve;", "&Oacute;", "&Ocirc;", "&Otilde;", "&Ouml;", "&times;",
                            "&Oslash;", "&Ugrave;", "&Uacute;", "&Ucirc;", "&Uuml;", "&Yacute;",
                            "&THORN;", "&szlig;", "&agrave;", "&aacute;", "&acirc;", "&atilde;",
                            "&auml;", "&aring;", "&aelig;", "&ccedil;", "&egrave;", "&eacute;",
                            "&ecirc;", "&euml;", "&igrave;", "&iacute;", "&icirc;", "&iuml;",
                            "&eth;", "&ntilde;", "&ograve;", "&oacute;", "&ocirc;", "&otilde;",
                            "&ouml;", "&divide;", "&oslash;", "&ugrave;", "&uacute;", "&ucirc;",
                            "&uuml;", "&yacute;", "&thorn;", "&yuml;", "&OElig;", "&oelig;",
                            "&#372;", "&#374", "&#373", "&#375;", "&sbquo;", "&#8219;", "&bdquo;",
                            "&hellip;", "&trade;", "&#9658;", "&bull;", "&rarr;", "&rArr;", "&hArr;",
                            "&diams;", "&asymp;"],
                          removeButtons: 'Flash,Iframe,Smiley,PageBreak,Image,Table,Anchor,spellchecker,Cut,Paste,Copy,Styles'
                        }
                    );

                    for (var i = 0; i < 4; i++) {

                      var code = 'a'.charCodeAt(0);
                      var string = "answer-text-" + String.fromCharCode(code + i) + "-desc";
                      CKEDITOR.instances[string].on('key', function (event) {
                        //alert("e " + event.data.keyCode);
                        if (event.data.keyCode === 9) {
                          event.cancel();
                          var editorId = '#' + event.editor.name;
                          var editor = $(editorId);
                          var curAnswerCol = editor.closest("div[class*='col-answer']");
                          MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                          saveAnswer(curAnswerCol);
                          var pos = event.editor.name.substring(12, 13);
                          var nextElementId = "#answer-text-" + String.fromCharCode(pos.charCodeAt(0) + 1);
                          $(nextElementId).click();
                          //editor.parent().siblings(".answer-text")
                        }
                      });
                    }

//                    $(textarea).ckeditorGet().on('key', function (event) {
//                      //alert("e " + event.data.keyCode);
//                      if (event.data.keyCode === 9) {
//                        event.cancel();
//                        var editorId = '#' + event.editor.name;
//                        var editor = $(editorId);
//                        var curAnswerCol = editor.closest("div[class*='col-answer']");
//                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
//                        saveAnswer(curAnswerCol);
//                        var pos = event.editor.name.substring(12, 13);
//                        var nextElementId = "#answer-text-" + String.fromCharCode(pos.charCodeAt(0) + 1);
//                        $(nextElementId).click();
//                        //editor.parent().siblings(".answer-text")
//                      }
//                    });

//                    for (var i in CKEDITOR.instances) {
//                      CKEDITOR.instances[i].on('key', function () {
//                        if (event.data.keyCode === 9) {
//                          event.cancel();
//                          saveQuestionText();
//                          $(".answer-text")[0].click();
//                        }
//                      });
//                    }


//                    $(textarea).summernote({
//                      height: 40,
//                      focus: true,
//                      toolbar: [
//                        ['style', ['bold', 'italic', 'underline', 'superscript', 'subscript']],
//                        ['para', ['ul', 'ol']]
//                      ],
//                      oninit: function() {
//                        $("a[href='#']").on("click", function(e) {
//                          e.preventDefault();
//                        });
//
//                      },
//                      onkeydown: function(e) {
////                        console.log('Key is pressed:', e.keyCode);
//                        var iKey = e.keycode || e.which || 0;
//                        //Intercept tab and go to next answer
//                        if (iKey === 9) {
//                          console.log("target", e.target);
//                          //Removed the tab added
//                          var curAnswerCol = $(e.target).closest("div[class*='col-answer']");
//                          var textResponse = curAnswerCol.find(".answer-text-edit").code();
//                          var lastIndex = textResponse.lastIndexOf("&nbsp;");
//                          var text = textResponse.substring(0, lastIndex - 18);
//                          var textLeft = textResponse.substring(lastIndex + 6, textResponse.length);
//                          var newText = text.concat(textLeft);
//                          $(e.target).html(newText);
//                          var answerCols = $("[class*='col-answer'");
//                          var nextIndex;
//                          //Check for which one is visible 
//                          answerCols.each(function(index, el) {
//                            if ($(el).find(".answer-edit-area").is(":Visible")) {
//                              nextIndex = ((index + 1));
//                            }
//                          });
//                          //Show the next text-edit-area
//                          if (nextIndex === answerCols.length) {
//                            //Edit question instead of answer                            
//                            var curQCol = $(".question-text-input");
//                            curQCol.find(".js-question-text").hide();
//                            curQCol.find(".question-text-edit-area").show();
//                            curQCol.find(".note-editable").focus();
//                          }
//
//                          var nextColAnswer = $(answerCols[nextIndex]);
//                          nextColAnswer.find(".answer-edit-area").show();
//                          nextColAnswer.find(".answer-edit-area").show();
//                          //Hide the text description
//                          nextColAnswer.find(".answer-text").hide();
//                          var answerEditArea = nextColAnswer.find(".answer-edit-area");
//                          answerEditArea.show();
//                          answerEditArea.find(".note-editable").focus();
//                          //Hide and save the current answer and go to next answer
//                          curAnswerCol.find(".answer-text-edit").find(".answer-edit-area").hide();
//                          saveAnswer(curAnswerCol);
//
//                        }
//
//                        switch (iKey) {
//                          case (9):
//                            e.preventDefault();
//                            console.log("tab");
//                            break;
//                        }
//                      }
//                    });
                  }
                };

                function showElementListView(elements) {
                  var elementsListView = new ListView.ElementsPanel({collection: elements});

                  self.listenTo(elementsListView, "childview:element:show", function (childView) {
                    childView.model.setSelected();
                    showElementView(childView.model);
                  });


                  self.listenTo(elementsListView, "element:setIndex", function (ui, args) {

                    var curObjectIndex = parseInt($(ui.item).find(".element-index").text());
                    var curModel = args.model;
                    //var curModelWhere = element.collection.where({index: curObjectIndex});
                    var nextObj = $(ui.item).next();
                    var prevObj = $(ui.item).prev();
                    var nextObjIndex = parseInt(nextObj.find(".element-index").text());

                    var newIndex;
                    var setIndex = false;

                    var collection = elements;

                    //if my object index less than the new index of next object
                    //Insert just before the next slide, and assign the new index as this

                    //if there is no next object, check if there is previous object, if yes then this is the last element. Use the length of the collection as the new index
                    //if there is no next object, and no previous object, a single element, then don't do anything.

                    // if the object index is more than the index of next object
                    //find the elements between my object index and the the next object, add 1 to all the elements in between then assign new index as the next object index                                                                                                  
                    if (elements.length === 1) {
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
                      newIndex = elements.length;
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
                      _.each(collection.models, function (model) {
                        //Change the index for models from the previous position to current position
                        if (model.get("index") > curObjectIndex && model.get("index") <= newIndex) {
                          elementsInBetween.push(model);
                          model.set({"index": model.get("index") - 1}, {silent: true});
                        }
                      });
                      curModel.set({"index": newIndex}, {silent: true});
                      setIndex = true;
                      collection.sort();
                      showElementListView(collection);
                    }

                    function addandSetIndex() {
                      //find the elements in between the next object index and including the new object index and  add their index by 1
                      var elementsInBetween = [];
                      _.each(collection.models, function (model) {
                        //Check for elements from including the new index unit the current object index
                        if (model.get("index") < curObjectIndex && model.get("index") >= newIndex) {
                          elementsInBetween.push(model);
                          //increment the index
                          model.set({"index": model.get("index") + 1}, {silent: true});
                        }
                      });
                      curModel.set({"index": newIndex}, {silent: true});
                      setIndex = true;
                      collection.sort();
                      showElementListView(collection);
                    }

                    $(".elements-panel-wrapper").sortable("refresh");

                    ajaxSaveActivity(activity);
                  });

                  activityView.elementsListPanel.show(elementsListView);
                }

//                self.listenTo(elementsListView, "childview:element:show", function(childView) {
//                  childView.model.setSelected();
//                  showElementView(childView.model);
//                });
                LessonManager.mainRegion.show(activityView);
              }

            });

            function ajaxSaveActivity(activity) {
              var attributes = JSON.stringify(activity.toJSON());
              $.ajax({
                url: activity.url(),
                type: 'PUT',
                data: attributes,
                async: true,
                contentType: "application/json",
                success: function (response) {
//                  console.log("response" + response);
                }
              });
            }

            function saveActivity(activity, elements) {
              activity.set("elements", elements);
              //Needed to use a clone as it seemed like there is no return value or validation from server
              //Hence, there is always a wait for sync
              var tempActivity = activity.clone();
              tempActivity.save({}, {
                success: function (res) {
                  tempActivity.trigger('destroy', tempActivity, tempActivity.collection);
                },
                error: function (res) {
                }
              });
            }

            function _selected(elements) {
              var selectedElement = elements.findWhere({selected: true});
              return selectedElement;
            }

            Show.Controller = new Controller();
          });
      return LessonManager.ActivitiesApp.Show.Controller;
    });