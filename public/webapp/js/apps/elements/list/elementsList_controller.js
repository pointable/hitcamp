define(["app", "apps/elements/list/elementsList_view", "bootstrap"], function(LessonManager, View) {
  LessonManager.module("ElementsApp.List", function(List, LessonManager, Backbone, Marionette, $, _) {
    var Controller = Marionette.Controller.extend({
      //Server
      listElements: function(activityID) {
        require(["entities/activity/activity_collection"], function() {
          var fetchActivities = LessonManager.request("activity:entities");
          $.when(fetchActivities).done(function(activities) {
            var options = {
              activities: activities
            };
            LessonManager.trigger("activities:list:initialized:noroute");
            var activity = activities.get(activityID);
            elementListView(activity);
          });
        });
      },
      //local
      listElementsLocal: function(activityView, activity) {
        elementListView(activityView, activity);
      }
    });
    List.Controller = new Controller();
    var view = {
    };
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

    function elementListView(activityView, activity) {
      var self = List.Controller;
      var elements = activity.get("elements");
      var elementsPanelView = new View.ElementsPanel({
//        model: activity,
        collection: elements
      });
      activityView.elementsListPanel.show(elementsPanelView
//          new View.ElementsPanel({
////        model: activity,
//        collection: elements,
//        elementPanel:activityView.elementPanel,
//        activity:activity
//      })
          );

      self.listenTo(elementsPanelView, "childview:element:show", function(args, element) {
        LessonManager.trigger("element:show", activityView.elementPanel, activity, element);
      });

      LessonManager.on("element:setIndex", function(ui, args) {
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
          _.each(collection.models, function(model) {
            //Change the index for models from the previous position to current position
            if (model.get("index") > curObjectIndex && model.get("index") <= newIndex) {
              elementsInBetween.push(model);
              model.set({"index": model.get("index") - 1},{silent:true});
            }
          });
          curModel.set({"index":newIndex},{silent:true});
          setIndex = true;
          elementsPanelView.render();
        }

        function addandSetIndex() {
          //find the elements in between the next object index and including the new object index and  lessen their index by 1
          var elementsInBetween = [];
          _.each(collection.models, function(model) {
            //Check for elements from including the new index unit the current object index
            if (model.get("index") < curObjectIndex && model.get("index") >= newIndex) {
              elementsInBetween.push(model);
              //increment the index
              model.set({"index": model.get("index") + 1},{silent:true});
            }
          });
          curModel.set({"index": newIndex},{silent:true});
//                    element.collection.sort();
          setIndex = true;
          elementsPanelView.render();
        }

        $(".elements-panel-wrapper").sortable("refresh");
        
        ajaxSaveActivity(activity);
//        var tempActivity = activity.clone();
//        tempActivity.save({}, {
//          success: function(res) {
//            tempActivity.trigger('destroy', tempActivity, tempActivity.collection);
//          },
//          error: function(res) {
//          }
//        });
      });
      // console.log("elements view %O",elementsView);
      // LessonManager.dialogRegion.show(elementsView);
//      $("#myModal").modal(
//          {
////          backdrop: 'static',
////          keyboard: false
//          });
//      elementsView.on("element:new", function(model) {
//        require(["entities/element/element_model"], function() {
//          var element = LessonManager.request("element:entity:new");
//          var activityIndex = activity.collection.indexOf(activity) + 1;
//          var elementIndex = elements.length + 1;
//          element.set("index", activityIndex + '.' + elementIndex);
//          elements.add(element);
//          console.log("elements after add");
//          console.log(activity.get("elements"));
//          var tempActivity = activity.clone();
//          tempActivity.save({}, {
//            success: function(res) {
////              console.log("elements after save");
////              console.log("success");             
////              console.log(activity.get("elements"));
////              console.log("activityID after save");              
////              console.log(activity.id); 
////              console.log("activity after save");
////              console.log(activity);
//              tempActivity.trigger('destroy', tempActivity, tempActivity.collection);
//            },
//            error: function(res) {
////              console.log("elements after save");
////              console.log("error");
////              console.log(activity.get("elements"));
//            }
//          });
//
//          //var activityModelTemp = activity.clone();
////          console.log(activityModelTemp);
////          var parsedElements = JSON.parse(JSON.stringify(elements));
////          activity.set("elements",parsedElements);
//
//          //activity = activityModelTemp;
//
//        });
//      });
//      elementsView.on("childview:element:delete", function(args) {
//        console.log(args.model.collection);
////            console.log("Before model destroy");
////            console.log(activity.get("elements"));       
////            console.log(args.model.collection);
////            console.log(args.model.collection.get(args.model.cid));
////            console.log(args.model);
//        args.model.collection.remove(args.model);
//        console.log(args.model.collection);
////            console.log("after remove");
////            console.log(args.model.collection);
////          console.log("elements after delete");
////          console.log(activity.get("elements"));
////          console.log("activityID before save");
////          console.log(activity.id); 
//        var tempActivity = activity.clone();
//        tempActivity.save({}, {
//          success: function(res) {
////              console.log("elements after save");
////              console.log("success");             
////              console.log(activity.get("elements"));
////              console.log("activityID after save");              
////              console.log(activity.id); 
////              console.log("activity after save");
////              console.log(activity);
//            tempActivity.trigger('destroy', tempActivity, tempActivity.collection);
//          },
//          error: function(res) {
////              console.log("elements after save");
////              console.log("error");
////              console.log(activity.get("elements"));
//          }
//        });
////          activity.save();
////          var activityModelTemp = activity.clone();
////          activity.save();                   
////          activity = activityModelTemp;
////          console.log(activity.get("elements"));         
//      });
//
//      elementsView.on("childview:element:show", function(element) {
//        console.log("test");
//        this.trigger("dialog:close");
//        //Preload Images
////        _.each(activity.get("elements").models, function(model) {              
////          if (model.get("isImage"))
////          {
////            console.log(model.get("resourceUrl"));
////            window.imgPreloader.push(model.get("resourceUrl"));
////          }
////          ;
////        });
//        LessonManager.trigger("element:show", activity, element.model);
//        LessonManager.trigger("header:list");
//      });
//
//      elementsView.on("element:list:close", function(element) {
//        LessonManager.trigger("element:list:close");
//        this.trigger("dialog:close");
//      });
//
//      elementsView.on("activity:title:edit", function(target, model) {
//        $('#activity-title-text').hide();
//        $('#activity-title-edit-area').show();
//      });
//
//      elementsView.on("activity:title:save", function(target, model) {
//        var element_model = model;
//        var titleDescription = $("textarea#activity-title-desc").val();
//        $("#activity-title-text").text(titleDescription);
//        console.log($("textarea#answer-text-a-desc").val());
//        $('#activity-title-text').show();
//        $('#activity-title-edit-area').hide();
//        element_model.set("activityTitle", titleDescription);
//        var parsedElements = JSON.parse(JSON.stringify(element_model.collection));
//        saveActivity(activity, parsedElements);
//      });
//
//      elementsView.on("activity:title:cancel", function(target, model) {
//        $('#activity-title-text').show();
//        $('#activity-title-edit-area').hide();
//      });
//      
//      //TODO: Load multiple Images
//      elementsView.on("element:question:newImages", function(args) {
////                var images=['http://static.ddmcdn.com/gif/earliest-dogs-660x433-130306-chow-chow-660x433.jpg',
////                            'http://www.narpsuk.co.uk/userfiles/profile-gallery/1383045969.jpg?99373',
////                            'http://upload.wikimedia.org/wikipedia/commons/c/c1/American-Eskimo-dog.jpg',
////                            'http://www.imagesbuddy.com/images/121/2013/12/adorable-grey-dog-graphic.jpg'];
//        var imageDataArray = document.imageDataArray;
////                console.log(imageDataArray);
//        require(["entities/element/element_model"], function() {
//          var element_model = args.model;
//          var activityIndex = activity.collection.indexOf(activity) + 1;
//          var elementIndex = element_model.collection.length + 1;
//          var increment = 0;
//          _.each(imageDataArray, function(imageData) {
////                    console.log(imageData);
//            increment += 1;
//            var element = LessonManager.request("element:entity:new");
//            element.set({
//              "index": elementIndex,
//              "resourceUrl": imageData.resourceURL,
//              "thumbnail": imageData.thumbnail,
//              "resourceTitle": imageData.resourceTitle,
//              "isImage": true
//            });
//            element_model.collection.add(element, {at: element_model.collection.indexOf(element_model) + increment});
//            activityIndex = activity.collection.indexOf(activity) + 1;
//            elementIndex = element_model.collection.length + 1;
//          });
//          element_model.collection.resetIndex();
//          console.log("elements after add");
//          console.log(activity.get("elements"));          
//          saveActivity(activity);          
//        });
//      });

//      return elementsView;
    }

    function saveActivity(activity) {
      var activityModelTemp = activity.clone();
      activity.save();
      activity = activityModelTemp;
    }


    function getActivitiesDataFromHTML() {
      var defer = $.Deferred();
      require(["entities/activity/activity_collection"], function() {
        var fetchData = LessonManager.request("activity:entities:initialized");
        defer.resolve(fetchData);
      });
      return defer.promise();
    }
    ;

  });
  return LessonManager.ElementsApp.List.Controller;
});


