define(['jquery',
  'underscore',
  'backbone',
  'app',
  'entities/element/element_model'
],
        function($, _, Backbone, StudentManager, Element) {
          var Elements = Backbone.Collection.extend({
            model: Element
          });

          var elementCollectionFromHtml = function() {
            var lessonDataFromHtml = JSON.parse($('#data-results').html());
            var idLesson = lessonDataFromHtml._id;
            var activities = new ActivityCollection(lessonDataFromHtml.activities, idLesson);
            return activities;
          };

          var initializeElementCollection = function() {
            
            var initializeElements = [
              { "resourceUrl": "../../plugins/randomizer/randomizer.html",
                "gotAnswer": "true",
                "questionText": "Test Question 1",
                "answer": "a",
                "answerTextA":"Question 1 Text for Answer A",
                "answerTextB":"Question 1 Text for Answer B",
                "answerTextC":"Question 1 Text for Answer C",
                "answerTextD":"Question 1 Text for Answer D"
              },
              {"resourceUrl": "../../plugins/airweb/index_b.html",
                "gotAnswer": "true", "questionText": "Test Question 2", "answer": "b",
                "answerTextA":"Question 2 Text for Answer A",
                "answerTextB":"Question 2 Text for Answer B",
                "answerTextC":"Question 2 Text for Answer C",
                "answerTextD":"Question 2 Text for Answer D"
              },
              {"resourceUrl": "https://docs.google.com/document/d/1HeNsERfR37ulbmshKaxvhWzkZFvoMIv5vB02YikswuQ/preview",
                "gotAnswer": "true", "questionText": "Test Question 3", "answer": "c",
                "answerTextA":"Question 3 Text for Answer A",
                "answerTextB":"Question 3 Text for Answer B",
                "answerTextC":"Question 3 Text for Answer C",
                "answerTextD":"Question 3 Text for Answer D"
              },
              {"resourceUrl": "https://docs.google.com/document/d/1HeNsERfR37ulbmshKaxvhWzkZFvoMIv5vB02YikswuQ/preview",
                "gotAnswer": "true", "questionText": "Test Question 4", "answer": "d",
                "answerTextA":"Question 4 Text for Answer A",
                "answerTextB":"Question 4 Text for Answer B",
                "answerTextC":"Question 4 Text for Answer C",
                "answerTextD":"Question 4 Text for Answer D"
              },                           
              {"resourceUrl": "https://docs.google.com/document/d/1HeNsERfR37ulbmshKaxvhWzkZFvoMIv5vB02YikswuQ/preview", "gotAnswer": "false", "questionText": "Test Question 5", "answer": ""}
            ];
            
            var elementsInJSON = JSON.parse(JSON.stringify(initializeElements));
            return new Elements(elementsInJSON);
          };
          
          var initializeTestElementCollection = function() {
            
            var element1 = new Element({gotAnswer:"false",questionText: "Test Question 1"});
            var element2 = new Element({gotAnswer:"false",questionText: "Test Question 2"});
            var element3 = new Element({gotAnswer:"false",questionText: "Test Question 3"});
            
            return new Elements([element1,element2,element3]);
          };


          API = {
            getElementEntities: function() {
              //Get it from the activities collection

            },
            getElementEntititesFromHTML: function() {
              //Initialized the first time can get it from the HTML              
              return initializeElementCollection();
            }
          };

          StudentManager.reqres.setHandler("element:entities", function() {
            return API.getElementEntities();
          });
          StudentManager.reqres.setHandler("element:entities:initialize", function() {
            return API.getElementEntititesFromHTML();
          });
          
          return Elements;
        }
);



