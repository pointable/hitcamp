define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'entities/element/element_collection'  
], function($, _, Backbone, LessonManager,Elements) {

  Activity = Backbone.Model.extend({
//url: 'http://localhost:8888/engage'
    idAttribute: '_id',
    url: function() {      
//          return '/adventures/edit/' + this.get('idLesson') + '/activities/' + (this.isNew() ? '' : this.id +'/');
      return '/adventures/edit/'+LessonId()+'/activities/'+(this.isNew() ? '' : (this.id + '/'));
      //return _.result(this.collection, 'url') + '/activities/'+(this.isNew() ? '' : (this.id + '/'));
    },
    model:{
      elements:Elements
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
            
      for(var key in this.model){        
        var innerElementClass = this.model[key];
        var innerElementData = response[key];
        //response[key] = new innerElementClass(innerElementData,{parse:true});
        response[key] = new innerElementClass(innerElementData); 
      }
      
      return response;
    },
    defaults: {
      "thumbnail": "about:blank",
      "activityTitle": "Edit Title",      
      "activityType": "",
      "colorTag": "dullPink",
      "selected": false,
      "index":"",
      "elements": "",
      "tileType":"checkpoint",
      "x":"0",
      "y":"0",
      "active":true,
      "first":false,
      "icon":"fa-university",
      "wordLists":[],
      "pluginApp":"",
      "pluginAppIcon":"",
      "checkPointIcon":""
    },
    initialize: function(model) {
      //HTML
      if(model){
        //Ignore initialized element collection again after parse from server        
        if(! (model.elements instanceof Backbone.Collection)){
          var innerElementClass = this.model["elements"];
          var innerElementData = model["elements"];
          model["elements"] = new innerElementClass(innerElementData);          
          this.set("elements", model.elements);
          this.set("activityName","test");
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
  
  function LessonId(){     
    var lessonDataFromHtml = JSON.parse($('#data-results').html());
    var idLesson = lessonDataFromHtml._id;    
    return idLesson;      
  };

  var API = {
    getActivityEntity: function(activityId) {   
      //console.log(activityId);
      var activity = new Activity({_id: activityId});                 
      var defer = $.Deferred();
      activity.fetch({
        success: function(data) {
          defer.resolve(data);
          //Might need to redo index adding for getting individual activity
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

  LessonManager.reqres.setHandler("activity:entity", function(id) {
    return API.getActivityEntity(id);
  });

  LessonManager.reqres.setHandler("activity:entity:new", function(id) {
    return new Activity();
  });

  return Activity;
});


