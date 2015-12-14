define(["app", "apps/responses/list/responsesList_view"], function(TeacherSession, View) {
  TeacherSession.module("ResponsesApp.List", function(List, TeacherSession, Backbone, Marionette, $, _) {
    var Controller = Marionette.Controller.extend({
      //Server
      listResponses: function(responsesData) {
        responseListView(responsesData);
//        require(["entities/activity/activity_collection"], function() {
//          var fetchActivities = TeacherSession.request("activity:entities");
//          $.when(fetchActivities).done(function(activities) {
//            var options = {
//              activities: activities
//            };
//            // TeacherSession.trigger("activities:listActivities:initialized:noroute");
//            var activity = activities.get(activityID);
//            responseListView(activity);
//
//          });
//        });
      }
    });

    List.Controller = new Controller;
    var self = List.Controller;
    function responseListView(responsesData1) {
      var responsesData = [
        {id: 1, name: "Jane", answer: "TestAnswer"},
        {id: 2, name: "Michael", answer: "TestAnswer2"},
        {id: 3, name: "Tom", answer: "TestAnswer2"},
        {id: 4, name: "Jeremy", answer: "TestAnswer4"},
        {id: 5, name: "Jeremy", answer: "TestAnswer"},
        {id: 6, name: "Clark", answer: "TestAnswer4"}
      ];

      var activity = TeacherSession.request("activity");
//      var responsesData = activity.get("studentResponses");

      var Response = Backbone.Model.extend({
        idAttribute: 'id',
        defaults: {
          name: "",
          answer: "",
          correct: ""
        },
        initialize: function() {
          var color = ['dullPink', 'dullGreen', 'dullBlue', 'dullYellow', 'dullPurple', 'dullOrange'];

          this.set("color", color[Math.floor((Math.random() * 6))]);
        }
      });
      var Responses = Backbone.Collection.extend({
        model: Response
      });

      var responsesInJSON = JSON.parse(JSON.stringify(responsesData));

      var responsesCollection = new Responses(responsesInJSON);

      var responsesView = new View.Responses({
        collection: responsesCollection
      });
      var responsesPanel = TeacherSession.request("responses:panel");

      self.listenTo(responsesView, "show", function() {
        var index = responsesData.length + 1;

//        setInterval(function() {
//          var newName = "Name " + index;
//          var newAnswer = "Answer" + index;
//          var newStudent = {
//            id: index,
//            name: newName,
//            answer: newAnswer,
//            correct: ''
//          };
//          responsesData.push(newStudent);
//          console.log("responsesData" + responsesData);
//          var responsesInJSON = JSON.parse(JSON.stringify(responsesData));
//          var responseModels = [];
//          _.each(responsesInJSON, function(response) {
//            var student = new Response(response);
//            responseModels.push(student);
//          });
//          
//          var newStudentModel = new Response({
//            id:index,
//            name:newName,
//            answer:newAnswer
//          });
//          index=index+1;
//          responsesCollection.add(responseModels);
//        }, 1000);
      });

      responsesPanel.show(responsesView);
//      TeacherSession.dialogRegion.show(responsesView);

      responsesView.on("childview:answer:correct", function(args) {
        var correct = true;
        var student = args.model;
        var studentAnswer = student.get("answer");
        console.log(student.get("name") + " answered " + studentAnswer + " and is correct");
        student.set({
          "correct": true
        });
        _helper.checkForSimiliarAnswerAndMark(student.collection.models, studentAnswer, true);
      });

      responsesView.on("childview:answer:wrong", function(args) {
        var student = args.model;
        var studentAnswer = student.get("answer");
        console.log(student.get("name") + " answered " + studentAnswer + " is wrong");
        student.set("correct", false);
        _helper.checkForSimiliarAnswerAndMark(student.collection.models, studentAnswer, false);
      });
    }
    var _helper = {
      checkForSimiliarAnswerAndMark: function(students, answer, correct) {
        _.each(students, function(student) {
          if (student.get("answer") === answer) {
            student.set("correct", correct);
          }
        });
      }
    };
  });
  return TeacherSession.ResponsesApp.List.Controller;
});





