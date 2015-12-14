define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'entities/element/element_collection'
], function($, _, Backbone, TeacherSession,Elements) {

  var Activity = Backbone.Model.extend({
//url: 'http://localhost:8888/engage'
    idAttribute: '_id',
    url: function() {
//          console.log(_.result(this.collection, 'url'));
//          return '/adventures/edit/' + this.get('idLesson') + '/activities/' + (this.isNew() ? '' : this.id +'/');
      return _.result(this.collection, 'url') + (this.isNew() ? '' : (this.id + '/'));
    },
    model:{
      elements:Elements
    },
    parse: function(response) {
      this.set("_id", response._id);
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
      "thumbnail": "activityModel.jpg",
      "desc": "Activity Description",
      "activityType": "game",
      "colorTag": "dullPink",
      "selected": false,
      "elements":"",
      "index":"",
      "studentResponses":""
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

  var API = {
    getActivityEntity: function(activityId) {      
      var activity = new Activity({id: activityId});
      var defer = $.Deferred();
      activity.fetch({
        success: function(data) {
          defer.resolve(data);
        },
        error: function(data) {
          defer.resolve(undefined);
        }
      });
      return defer.promise();
    }
  };

  TeacherSession.reqres.setHandler("activity:entity", function(id) {
    return API.getActivityEntity(id);
  });
  
   TeacherSession.reqres.setHandler("activity:entity:new", function(id) {
    return new Activity();
  });

  return Activity;
});


