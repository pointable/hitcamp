define([
  'jquery',
  'underscore',
  'backbone',
  'app'   
], function($, _, Backbone, LessonManager) {

  WordList = Backbone.Model.extend({
//url: 'http://localhost:8888/engage'
    idAttribute: '_id',
    url: function() {      
//          return '/adventures/edit/' + this.get('idLesson') + '/activities/' + (this.isNew() ? '' : this.id +'/');
      return '/adventures/edit/'+LessonId()+'/word-lists/'+(this.isNew() ? '' : (this.id + '/'));
      //return _.result(this.collection, 'url') + '/activities/'+(this.isNew() ? '' : (this.id + '/'));
    },
    parse: function(response) {
      //Server
      //this.set("_id", response.record._id);
      this.set("_id", response._id);
      //Parsing element collection from the server and assign it to model
      
      //Nested Models
      //Finding all models nested in model attribute and get their key
      //Assign the class relate to the key
      //Assign the data from the response
      //Create the new inner collection using the data provided
      //return the modified response
            
      
      return response;
    },
    defaults: {
      "title": "",      
      "words": "",
      "selected": false,
      "index":""

    },
    initialize: function(model) {
      //HTML    
    },
    toggleSelected: function() {
      this.set({// if you need to sync to server, save is used instead
        selected: !this.get("selected")
      });
    },
    clear: function() {
      console.log("destroy");
      this.destroy();
    }
  });
  
  function LessonId(){     
    var lessonDataFromHtml = JSON.parse($('#data-results').html());
    var idLesson = lessonDataFromHtml._id;    
    return idLesson;      
  };

  var API = {
    getWordListEntity: function(wordListId) {   
      //console.log(wordListId);
      var wordList = new WordList({_id: wordListId});                 
      var defer = $.Deferred();
      wordList.fetch({
        success: function(data) {
          defer.resolve(data);
          //Might need to redo index adding for getting individual wordList
          console.log("success");
        },
        error: function(data) {        
          defer.resolve(undefined);
          console.log("fail");
        }
      });
      return defer.promise();
    }
  };

  LessonManager.reqres.setHandler("wordList:entity", function(id) {
    return API.getWordListEntity(id);
  });

  LessonManager.reqres.setHandler("wordList:entity:new", function(id) {
    return new WordList();
  });

  return WordList;
});


