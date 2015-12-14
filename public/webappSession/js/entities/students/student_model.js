define([
  'jquery',
  'underscore',
  'backbone',
  'app'
], function($, _, Backbone, TeacherSession) {
  var Student = Backbone.Model.extend({
    idAttribute: '_id',
    url: function() {
      return _.result(this.collection, 'url') + (this.isNew() ? '' : (this.id + '/'));
    },
    parse: function() {
      this.set("_id", response._id);
    },
    defaults: {
      "name": 0,
      "level": 0,
      "statusColour": "white"
    }
  });

  TeacherSession.reqres.setHandler("student:entity:new", function(id) {
    return new Student;
  });
  
  return Student;
});
