define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'entities/wordList/wordList_model' 
], function($, _, Backbone, LessonManager, WordList) {
  WordListCollection = Backbone.Collection.extend({
    model: WordList,
//    localStorage: new localStorage('engage'),   
    url: function() {
      return '/adventures/edit/' + this.idLesson + '/word-lists/';
    },
    parse: function(results) {      
      return results.wordLists;
    },
    initialize: function(models, options) {      
      this.idLesson = options;
    },
    selected: function() {
      return this.filter(function(wordListModel) {
        return wordListModel.get('selected');
      });
    },
    remaining: function() {
      return this.without.apply(this, this.selected());
    }
  });

    var lessonDataFromHtml = JSON.parse($('#data-results').html());
    var idLesson = lessonDataFromHtml._id;
  
  var wordListCollectionFromHtml = function() {

    var wordLists = new WordListCollection(lessonDataFromHtml.wordLists,idLesson);
    addIndexToCollection(wordLists); 
    return wordLists;
  };

  var API = {
    getWordListEntities: function(options) {      
      var models={};
      var wordLists = new WordListCollection(models,idLesson);             
      var defer = $.Deferred();
      wordLists.fetch({
        success: function(wordLists){
          if(wordLists.length !== 0){
           addIndexToCollection(wordLists);
          }
          defer.resolve(wordLists);
        }
      });
      
      return defer.promise();
    },
    getWordListEntitiesFromHTML: function() {
      var wordLists = wordListCollectionFromHtml();
      addIndexToCollection(wordLists);
      return wordLists;
    }
  };
  
  function addIndexToCollection(wordLists) {
    _.each(wordLists.models, function(wordList) {
      //Create new Element Collection from array      
      var wordListIndex = wordList.collection.indexOf(wordList) + 1;
      wordList.set("index", wordListIndex);                                  
    }, this);
  }
  
  LessonManager.reqres.setHandler("wordList:entities", function() {
    return API.getWordListEntities();
  });
  LessonManager.reqres.setHandler("wordList:entities:initialized", function() {
    return API.getWordListEntitiesFromHTML();
  });


  return WordListCollection;
});



