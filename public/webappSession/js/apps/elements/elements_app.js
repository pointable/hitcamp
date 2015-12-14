define(["app"], function (TeacherSession) {
  TeacherSession.module("Router.ElementsApp", function (ElementsAppRouter, TeacherSession, Backbone, Marionette, $, _) {
    ElementsAppRouter.Router = Marionette.AppRouter.extend({
      appRoutes: {
        "element/:id": "showElement",
        "adventures/:id": "listElements",
        "adventures/:id/elements/:id": "showElement"
      }
    });

    ElementsAPI = {
      //Server
      listElements: function (id) {
        require(["apps/elements/list/elementsList_controller"], function (ElementListController) {
          ElementListController.listElements(id);
        });
      },
      //local
      listElementsLocal: function (activity) {
        require(["apps/elements/list/elementsList_controller"], function (ElementListController) {
          ElementListController.listElementsLocal(activity);
        });
      },
      //Server
      showElement: function (activityID, element) {
        require(["apps/elements/show/elementsShow_controller"], function (ElementsShowController) {
          ElementsShowController.showElement(activityID, element);
        });
      },
      //Local
      showElementLocal: function (activity, element) {
        var path = "#adventures/" + activity.id + "/elements/" + (element.collection.indexOf(element) + 1);
        TeacherSession.navigate(path);
//        document.checkWalkthrough (path);

        require(["apps/elements/show/elementsShow_controller"], function (ElementsShowController) {
          ElementsShowController.showElementLocal(activity, element);
        });
      },
      updateElementResponses: function (activity, element) {
        require(["apps/elements/show/elementsShow_controller"], function (ElementsShowController) {
          ElementsShowController.updateElementResponses();
        });
      }
    };

    TeacherSession.on("elements:list", function (id) {
//      TeacherSession.navigate("adventures/" + id);
      ElementsAPI.listElements(id);
    });

    TeacherSession.on("elements:list:local", function (activity) {
//      TeacherSession.navigate("adventures/" + activity.id);
      ElementsAPI.listElementsLocal(activity);
    });

    TeacherSession.on("element:show:close", function (activity) {
      ElementsAPI.listElementsLocal(activity);
    });

    TeacherSession.on("element:show", function (activity, element) {
//      TeacherSession.navigate("adventures/"+arg+"/element/"+args.model.collection.indexOf(args.model));      
      //ElementsAPI.showFirstElement(args.model,0);
      ElementsAPI.showElementLocal(activity, element);
    });

    TeacherSession.on("element:update:responses", function (activity, element) {
//      TeacherSession.navigate("adventures/"+arg+"/element/"+args.model.collection.indexOf(args.model));      
      //ElementsAPI.showFirstElement(args.model,0);
      ElementsAPI.updateElementResponses();
    });

    TeacherSession.addInitializer(function () {
      new ElementsAppRouter.Router({
        controller: ElementsAPI
      });
      //Setting up a socket listener to change the studentAnswered data             
      jq(window.document).off('ServerToPlugin' + 'ACTIVITY');
      jq(window.document).on('ServerToPlugin' + 'ACTIVITY', function (event, param) {
//    debugger;
        var messageReceived = param.detail;
        switch (messageReceived.pluginMessageType)
        {
          //set all custom message type here
          case 'GetAllStudentAnswersResponse':
            var activitiesFromSocket = messageReceived.data.activities;
            var allStudentData = messageReceived.data.activities;

//          console.log(activitiesFromSocket);

            var activitiesData = {};

            _.each(allStudentData, function (studentData) {
              var activities = _.groupBy(studentData.elementsData, 'idActivity');
              console.log("activities");
//            console.log(activities);

              var studentActivities = {};
              _.each(activities, function (activity) {
                _.each(activity, function (element) {
                  var elementData = element.elementData;
                  if (elementData) {
                    if (!activitiesData[element.idActivity]) {
                      activitiesData[element.idActivity] = {};
                    }
                    var activityData = activitiesData[element.idActivity];

                    if (!activityData.elementsForActivity)
                      activityData.elementsForActivity = {};

                    activityData.idActivity = element.idActivity;
                    if (!activityData.elementsForActivity[element.idElement]) {
                      activityData.elementsForActivity[element.idElement] = {};
                    }
                    var elementData = activityData.elementsForActivity[element.idElement];
                    
                    if (!elementData.studentsDataForElement)
                      elementData.studentsDataForElement = {};
                    
                    elementData.idElement = element.idElement;
                    if (!elementData.studentsDataForElement[studentData.idStudent]) {
                      elementData.studentsDataForElement[studentData.idStudent] = {};
                    }
                    var studentElementData = elementData.studentsDataForElement[studentData.idStudent];
                    studentElementData.idStudent = studentData.idStudent;
                    studentElementData.studentAnswer = element.elementData.studentAnswer;
                    studentElementData.correctAnswer = element.elementData.correctAnswer;
                  }
                });
              });
//            console.log(studentActivities);
            });
            console.log(activitiesData);
            //Separate all the responses in the individual element
            var activitiesCollection = TeacherSession.request("activity").collection;
            _.each(activitiesData, function (activityData) {
              var activity = activitiesCollection.get(activityData.idActivity);
              if (activity) {
                _.each(activityData.elementsForActivity, function (elementResponses) {
                  var element = activity.get("elements").get(elementResponses.idElement);
                  if (element) {
                    element.set("responses", elementResponses.studentsDataForElement);
                  }
                });
              }
            });
            TeacherSession.trigger("element:update:responses");
            break;
        }
      });
    });

  });
});