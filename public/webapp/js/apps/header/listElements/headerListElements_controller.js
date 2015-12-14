define(["app", "apps/header/listElements/headerListElements_view", "bootbox"], function(LessonManager, View, bootbox) {
  LessonManager.module("HeaderApp.ListElements", function(ListElements, LessonManager, Backbone, Marionette, $, _) {
    ListElements.Controller = {
      listElementsHeader: function(link) {

        var dataFromHTML = JSON.parse($('#data-results').html());
        lessonID = dataFromHTML._id;
        var headerView = new View.Header();
        LessonManager.headerRegion.show(headerView);

        headerView.on("adventure:back", function() {
//          location.href =  window.location.protocol + '//' + window.location.hostname + window.location.pathname;
          console.log("window.location.pathname"+LessonManager.getCurrentRoute());
          var activityID = LessonManager.getCurrentRoute().split("/")[1];
          ;
          var options;
          options ={
            activityIDToBeAnimated:activityID
          };
          LessonManager.trigger("activities:list",options);
        });

        headerView.on("adventure:preview:4students", function() {
          var pathData = window.location.hash.replace("activities", "adventures");
          var data= btoa(pathData);
          window.open('/classroom/preview/' + lessonID + '/teststudents/4?path=' +data, 'preview');
        });
        headerView.on("adventure:preview:2students", function() {
          var pathData = window.location.hash.replace("activities", "adventures");
          var data= btoa(pathData);
          window.open('/classroom/preview/' + lessonID + '/teststudents/2?path=' +data, 'preview');
        });
        headerView.on("adventure:preview:1_2student", function() {
          var pathData = window.location.hash.replace("activities", "adventures");
          var data= btoa(pathData);
          window.open('/classroom/preview/' + lessonID + '/teststudents/1_2?path=' +data, 'preview');
        });
        headerView.on("adventure:preview:1student", function() {
          var pathData = window.location.hash.replace("activities", "adventures");
          var data= btoa(pathData);
          window.open('/classroom/preview/' + lessonID + '/teststudents/1?path=' +data, 'preview');
        });
        headerView.on("adventure:preview:teacher", function() {
          var pathData = window.location.hash.replace("activities", "adventures");
          var data= btoa(pathData);
          window.open('/classroom/preview/' + lessonID + '/teststudents/0?path=' +data, 'preview');
        });
        headerView.on("wordLists:list", function(args) {
          LessonManager.trigger("wordLists:list");
        });

        headerView.on("activities:list", function(args) {
          LessonManager.trigger("activities:list");
        });

      }
    };
  });
  return LessonManager.HeaderApp.ListElements.Controller;
});