define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'entities/classroom/classroom_model'
], function($, _, Backbone, CampManager, Classroom) {
  ClassroomCollection = Backbone.Collection.extend({
    model: Classroom,
    url: '/classrooms',
    comparator:'name',
    parse: function(results) {
      return results.data;
    },
    initialize: function(models, options) {
    },
    selectElement: function(element) {
      _.each(this.models, function(model) {
        model.set("selected", false);
      }, this);
      element.set("selected", true);
    },
    remaining: function() {
      return this.without.apply(this, this.selected());
    }
  });

  var lessonDataFromHtml = JSON.parse($('#data-results').html());
  var API = {
    getClassroomEntities: function(options) {
      var models = {};
      var classrooms = new ClassroomCollection(models);
      var defer = $.Deferred();
      classrooms.fetch({
        success: function(classrooms) {
          defer.resolve(classrooms);
        }
      });
      return defer.promise();
    },
    getClassroomEntitiesFromHTML: function() {
      var classrooms = new ClassroomCollection(lessonDataFromHtml.data);
      return classrooms;
    }
  };

  CampManager.reqres.setHandler("classroom:entities", function() {
    return API.getClassroomEntities();
  });
  CampManager.reqres.setHandler("classroom:entities:html", function() {
    return API.getClassroomEntitiesFromHTML();
  });

  return ClassroomCollection;
});



