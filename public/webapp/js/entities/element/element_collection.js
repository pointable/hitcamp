define(['jquery',
  'underscore',
  'backbone',
  'app',
  'entities/element/element_model'
],
    function($, _, Backbone, LessonManager, Element) {
      var Elements = Backbone.Collection.extend({
        model: Element,
        initialize: function(elements) {
          this.comparator = "index";
        },
        resetIndex: function() {
          _.each(this.models, function(model) {
            model.set("index", (this.indexOf(model) + 1));
          }, this);
        },
        selectElement: function(element) {
          _.each(this.models, function(model) {
            model.set("selected", false);
          }, this);
          element.set("selected",true);
        }
      });

      var elementCollectionFromHtml = function(id) {
        $.when(getActivitiesData()).done(function(activities) {
          var activity = activities.get(id);
          var elements = activity.get("elements");
          return  new Elements(elements);
        });
      };
      function getActivitiesData() {
        var defer = $.Deferred();
        require(["entities/activity/activity_collection"], function() {
          var fetchActivities = LessonManager.request("activity:entities:initialized");
          defer.resolve(fetchActivities);
        });
        return defer.promise();
      }


      var initializeElementCollection = function() {

        var initializeElements = [
          {"resourceUrl": "https://docs.google.com/document/d/1HeNsERfR37ulbmshKaxvhWzkZFvoMIv5vB02YikswuQ/preview",
            "gotAnswer": "true",
            "questionText": "Test Question 1",
            "answer": "a",
            "color": "dullBlue",
            "answerTextA": "Question 1 Text for Answer A",
            "answerTextB": "Question 1 Text for Answer B",
            "answerTextC": "Question 1 Text for Answer C",
            "answerTextD": "Question 1 Text for Answer D"
          },
          {"resourceUrl": "https://docs.google.com/document/d/1HeNsERfR37ulbmshKaxvhWzkZFvoMIv5vB02YikswuQ/preview",
            "gotAnswer": "true", "questionText": "Test Question 2", "answer": "b",
            "color": "dullBlue",
            "answerTextA": "Question 2 Text for Answer A",
            "answerTextB": "Question 2 Text for Answer B",
            "answerTextC": "Question 2 Text for Answer C",
            "answerTextD": "Question 2 Text for Answer D"
          },
          {"resourceUrl": "https://docs.google.com/document/d/1HeNsERfR37ulbmshKaxvhWzkZFvoMIv5vB02YikswuQ/preview",
            "gotAnswer": "true", "questionText": "Test Question 3", "answer": "c",
            "color": "dullBlue",
            "answerTextA": "Question 3 Text for Answer A",
            "answerTextB": "Question 3 Text for Answer B",
            "answerTextC": "Question 3 Text for Answer C",
            "answerTextD": "Question 3 Text for Answer D"
          },
          {"resourceUrl": "https://docs.google.com/document/d/1HeNsERfR37ulbmshKaxvhWzkZFvoMIv5vB02YikswuQ/preview",
            "gotAnswer": "true", "questionText": "Test Question 4", "answer": "d",
            "color": "dullBlue",
            "answerTextA": "Question 4 Text for Answer A",
            "answerTextB": "Question 4 Text for Answer B",
            "answerTextC": "Question 4 Text for Answer C",
            "answerTextD": "Question 4 Text for Answer D"
          },
          {"resourceUrl": "https://docs.google.com/document/d/1HeNsERfR37ulbmshKaxvhWzkZFvoMIv5vB02YikswuQ/preview",
            "gotAnswer": "false", "questionText": "Test Question 5", "answer": "",
            "color": "dullBlue"
          }
        ];

        var elementsInJSON = JSON.parse(JSON.stringify(initializeElements));
        return new Elements(elementsInJSON);
      };

      var initializeTestElementCollection = function() {

        var element1 = new Element({gotAnswer: "false", questionText: "Test Question 1"});
        var element2 = new Element({gotAnswer: "false", questionText: "Test Question 2"});
        var element3 = new Element({gotAnswer: "false", questionText: "Test Question 3"});

        return new Elements([element1, element2, element3]);
      };


      API = {
        getElementEntities: function(id) {
          //Get it from the activities collection

        },
        getElementEntititesFromHTML: function(id) {
          //Initialized the first time can get it from the HTML
//        var defer = $.Deferred();
//        var data = elementCollectionFromHtml(id);
//        data.on("done",function(data){
//          
//        });
//        defer.resolve(elementCollectionFromHtml(id));                  
//        return defer.promise();
          return elementCollectionFromHtml(id);
          // return initializeElementCollection();
        }
      };



      LessonManager.reqres.setHandler("element:entities", function() {

        return API.getElementEntities();
      });
      LessonManager.reqres.setHandler("element:entities:initialize", function(id) {

        return API.getElementEntititesFromHTML(id);
      });

      LessonManager.reqres.setHandler("element:entities:new", function(elements, activityID) {
        return new Elements(elements, activityID);
      });

      return Elements;
    }
);



