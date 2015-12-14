define(["app"],function(LessonManager){
  LessonManager.module("HeaderApp",function(HeaderApp,LessonManager,Backbone,Marionette,$,_){
      HeaderAPI = {
        listHeader: function(link){
          require(["apps/header/list/headerList_controller"],function(ListController){            
            ListController.listHeader(link);
          });
        },
        listQuestionHeader:function(){
          require(["apps/header/list/headerList_controller"],function(ListController){
            ListController.listQuestionHeader();
          });          
        }
      };
      
      LessonManager.on("header:list",function(link){
        console.log("header:list");
        HeaderAPI.listHeader(link);
      });
      
      LessonManager.on("header:list:questionHeader",function(){
        console.log("header:list");
        HeaderAPI.listQuestionHeader();
      });
  });
});