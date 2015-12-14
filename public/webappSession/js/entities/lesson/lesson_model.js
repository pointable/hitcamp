define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'entities/tile/tile_collection'
], function($, _, Backbone, TeacherSession, Tiles) {

  Lesson = Backbone.Model.extend({
//url: 'http://localhost:8888/engage'
    idAttribute: '_id',
    url: function() {
//          return '/adventures/edit/' + this.get('idLesson') + '/activities/' + (this.isNew() ? '' : this.id +'/');
      return '/adventures/edit/' + idLesson;
      //return _.result(this.collection, 'url') + '/activities/'+(this.isNew() ? '' : (this.id + '/'));
    },
    model: {
      tiles: Tiles
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

      for (var key in this.model) {
        var innerElementClass = this.model[key];
        var innerElementData = response[key];
        //response[key] = new innerElementClass(innerElementData,{parse:true});
        response[key] = new innerElementClass(innerElementData);
      }

      return response;
    },
    defaults: {
      "lessonName": "",
      "tiles": "",
      "isLocked": false,
      "backgroundImageURL":""
//      "backgroundImageJSON":""
    },
    initialize: function(model) {
      //HTML
      if (model) {
        //Ignore initialized element collection again after parse from server        
        if (!(model.tiles instanceof Backbone.Collection)) {
          var innerElementClass = this.model["tiles"];
          var innerElementData = model["tiles"];
          model["tiles"] = new innerElementClass(innerElementData);
          this.set("tiles", model.tiles);      
        }
      }

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


  var lessonDataFromHtml = JSON.parse($('#data-session').html());  
  var idSession = lessonDataFromHtml.idSession;
  var idLesson = lessonDataFromHtml.idLesson;  
  var lessonName = lessonDataFromHtml.lessonName;
  var isLocked = lessonDataFromHtml.isLocked;
  
  var tileCollectionFromHtml = function() {
    var tiles = TeacherSession.request("tile:entities:initialized");
    return tiles;
  };

  var API = {
    getLessonEntity: function(lessonId) {
      //console.log(lessonId);
      var lesson = new Lesson({_id: lessonId});
      var defer = $.Deferred();
      lesson.fetch({
        success: function(data) {
          defer.resolve(data);

          console.log("success");
        },
        error: function(data) {
          defer.resolve(undefined);
          console.log("fail");
        }
      });
      return defer.promise();
    },
    getLessonEntityInitialized: function() {
      //console.log(lessonId);
      var lesson = new Lesson({
        _id: idSession,
        lessonName: lessonName,
        lessonEditorId: idLesson,
        isLocked: isLocked
      });
      //lesson.set("lessonName", lessonDataFromHtml.lessonName);

//      lesson.set("backgroundImageJSON",lessonDataFromHtml.backgroundImageJSON); 
      lesson.set("backgroundImageURL",lessonDataFromHtml.backgroundImageURL);   
      lesson.set("tiles", tileCollectionFromHtml());
      return lesson;
    }
  };

  TeacherSession.reqres.setHandler("lesson:entity", function(id) {
    return API.getLessonEntity(id);
  });

  TeacherSession.reqres.setHandler("lesson:entity:initialized", function() {
    return API.getLessonEntityInitialized();
  });

  TeacherSession.reqres.setHandler("lesson:entity:new", function(id) {
    return new Lesson();
  });

  return Lesson;
});





