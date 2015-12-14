define(["app"], function(LessonManager) {
  LessonManager.module("Router.ElementsApp", function(ElementsAppRouter, LessonManager, Backbone, Marionette, $, _) {
    ElementsAppRouter.Router = Marionette.AppRouter.extend({
      appRoutes: {
//        "adventures/:id": "listElements",
      }
    });

    var ElementsAPI = {
      //Server
      listElements: function(id) {
        require(["apps/elements/list/elementsList_controller"], function(ElementListController) {
          ElementListController.listElements(id);
        });
      },
      //local
      listElementsLocal: function(activityView, activity) {
        require(["apps/elements/list/elementsList_controller"], function(ElementListController) {
          ElementListController.listElementsLocal(activityView, activity);
        });
      },
      //Local
      showElementLocal: function(elementPanel, activity, element) {
        LessonManager.navigate("#activities/" + activity.id + "/elements/" + (element.collection.indexOf(element) + 1));
        require(["apps/elements/show/elementsShow_controller"], function(ElementsShowController) {
          ElementsShowController.showElementLocal(elementPanel, activity, element);
        });
      },
      showElementLocalQuestions: function(questionInputPanel,activity, element) {
        require(["apps/elements/show/elementsShow_controller"], function(ElementsShowController) {
          ElementsShowController.showElementLocalQuestions(questionInputPanel,activity,element);
        });
      },
      showElementLocalAnswers: function(responsePanel,activity, element) {
        require(["apps/elements/show/elementsShow_controller"], function(ElementsShowController) {
          ElementsShowController.showElementLocalAnswers(responsePanel, activity,element);
        });
      },
      //Server
      showElement: function(activityId, elementIndex) {
        require(["apps/elements/show/elementsShow_controller"], function(ElementsShowController) {
          ElementsShowController.showElement(activityId, elementIndex);
        });
      }
    };

//    LessonManager.on("elements:list", function(id) {
//      LessonManager.navigate("adventures/" + id);
//      ElementsAPI.listElements(id);
//    });

    LessonManager.on("elements:list", function(activityView, activity) {
//      LessonManager.navigate("adventures/" + id);
      ElementsAPI.listElementsLocal(activityView, activity);
    });

    LessonManager.on("element:show", function(elementPanel, activity, element) {
      ElementsAPI.showElementLocal(elementPanel, activity, element);
    });

    LessonManager.on("element:question:show", function(questionInputPanel, activity, element) {
      ElementsAPI.showElementLocalQuestions(questionInputPanel, activity, element);
    });

    LessonManager.on("element:answers:show", function(responsePanel, activity, element) {
      ElementsAPI.showElementLocalAnswers(responsePanel, activity, element);
    });

    LessonManager.on("element:show:first", function(activity) {
      var element = activity.get("elements").at(0);
      ElementsAPI.showElementLocal(activity, element);
    });

    LessonManager.addInitializer(function() {
      new ElementsAppRouter.Router({
        controller: ElementsAPI
      });
    });

  });
});