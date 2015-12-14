define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'entities/students/student_model'
], function($, _, Backbone, LessonManager, Student) {

  var Students = Backbone.Collection.extend({
    url: function() {
      return '/join/' + this.idJoin;
    },
    model: Student,
    initialize: function(models, option) {
      this.idJoin = option;
    }
  });

  var initializedStudents = function() {
    var students = new Students([
      {_id: 1, name: "Cheng Yong"},
      {_id: 2, name: "Boon Jin", statusColour: 'statusGreen'},
      {_id: 3, name: "JM"}
    ]);
    return students.models;
  };

  var API = {
    getStudentsEntities: function() {
      var defer = $.Deferred();
      var students = new Students();
      students.fetch({
        success: function(data) {
          defer.resolve(data);
        },
        error: function(data) {
          defer.resolve(data);
        }
      });

      var promise = defer.promise();
      $.when(promise).done(function(students) {
        if (students.length === 0) {
          var models = initializedStudents();
          students.reset(models);
        }
      });
      return promise;
    }
  };

  LessonManager.reqres.setHandler("students:entities", function() {
    return API.getStudentsEntities();
  });

  return Students;
});