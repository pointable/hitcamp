define([
  'jquery',
  'underscore',
  'backbone',
  'app' 
], function($, _, Backbone, TeacherSession) {
  Tile = Backbone.Model.extend({
    idAttribute: '_id',   
    parse: function(response) {
      //Server 
      this.set("_id", response._id);                          
      return response;
    },
    defaults: {
      x: '',
      y: '',      
      a: false
    },    
    clear: function() {
      console.log("destroy");
      this.destroy();
    }
  });
  
  TeacherSession.reqres.setHandler("tile:entity:new", function(id) {
    return new Tile();
  });

  return Tile;
});



