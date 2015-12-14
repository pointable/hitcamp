define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'entities/classroom/classroom_collection'
], function($, _, Backbone, LessonManager, Elements) {

  Classroom = Backbone.Model.extend({
    idAttribute: '_id',
    url: function() {
      return '/classrooms' + (this.isNew() ? '' : '/' + this.get('path')); //.id
    },
    fullPath: function() {
      return location.protocol + '//' + location.host + '/' + this.get('path');
    },
    parse: function(response) {
      //Server      
      this.set("_id", response._id);
      return response;
    },
    defaults: {
      _id: undefined,
      data: '',
      name: '',
      path: '',
      PIN: '',
      isComplete: '',
      lesson:'',
      isLocked: false,
      isFirst: false,
      backgroundThumbnailURL:'about:blank',
      lessonName:''
    },
    initialize: function(model) {
      //HTML
    },
    clear: function() {
      console.log("destroy");
      this.destroy();
    },
    setSelected: function() {
      this.collection.selectElement(this);
    }
  });

  function LessonId() {
    var lessonDataFromHtml = JSON.parse($('#data-results').html());
    var idLesson = lessonDataFromHtml._id;
    return idLesson;
  }

  var API = {
    getClassroomEntity: function(classroomId) {
      //console.log(classroomId);
      var classroom = new Classroom({_id: classroomId});
      var defer = $.Deferred();
      classroom.fetch({
        success: function(data) {
          defer.resolve(data);
          //Might need to redo index adding for getting individual classroom
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

  LessonManager.reqres.setHandler("classroom:entity", function(id) {
    return API.getClassroomEntity(id);
  });

  LessonManager.reqres.setHandler("classroom:entity:new", function() {
    return new Classroom();
  });

  return Classroom;
});


