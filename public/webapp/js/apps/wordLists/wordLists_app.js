define(["app"], function(LessonManager) {

  LessonManager.module("WordListsApp", function(WordListsApp, LessonManager, Backbone, Marionette, $, _) {
    WordListsApp.onStart = function() {
      console.log("Starting WordListsApp");
    };

    WordListsApp.onStop = function() {
      console.log("Stopping WordListsApp");
    };
  });

  LessonManager.module("Router.WordListsApp", function(WordListsAppRouter, LessonManager, Backbone, Marionette, $, _) {
    WordListsAppRouter.Router = Marionette.AppRouter.extend({
      appRoutes: {
        "word-lists": "listWordLists"
      }
    });

    WordListsAPI = {   
      listWordLists: function(wordListsRegion) {       
        require(["apps/wordLists/list/wordListsList_controller","apps/header/list/headerList_controller"]
          ,function(ListController,HeaderListController) {          
          ListController.listWordLists(wordListsRegion); 
          HeaderListController.listHeader("list");
        });
      }
    };
    
    //Server //option 1 - server //option 2 - initialized //option 3 - list without route
    LessonManager.on("wordLists:list", function(wordListsRegion) {            
      //List without route
//      if( typeof options === 'undefined'){      
//       LessonManager.navigate("word-lists");
//      }
      WordListsAPI.listWordLists(wordListsRegion);
    });           
    
    //HTML
    LessonManager.on("wordLists:list:initialized", function() {
      LessonManager.navigate("word-lists");
      console.log("wordLists:list:initialized");
      var options ={
        initialized:true
      };
      WordListsAPI.listWordLists(options);
    });
    
    //Initialize the router for WordListsApp
    LessonManager.addInitializer(function() {
      new WordListsAppRouter.Router({
        controller: WordListsAPI
      });
    });
  });



});



