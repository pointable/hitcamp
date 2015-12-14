define(["app"], function(LessonManager) {
  LessonManager.module("HeaderApp", function(HeaderApp, LessonManager, Backbone, Marionette, $, _) {
    HeaderAPI = {
      listHeader: function(link) {
        require(["apps/header/list/headerList_controller"], function(ListController) {
          ListController.listHeader(link);
        });
      },
      listElementsHeader: function() {
        require(["apps/header/listElements/headerListElements_controller"], function(ListController) {
          ListController.listElementsHeader();
        });
      }
    };

    LessonManager.on("header:list", function(link) {
      console.log("###header:list");
      HeaderAPI.listHeader(link);
    });

    LessonManager.on("header:list:elements", function() {
      console.log("####header:list:elements");
      HeaderAPI.listElementsHeader();
    });
  });
});