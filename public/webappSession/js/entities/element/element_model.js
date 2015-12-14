define([
  'jquery',
  'underscore',
  'backbone',
  'app'
], function($, _, Backbone, StudentManager) {
  var Element = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      _id:"",
      answer: "a",
      textAnswer: "",
      gotAnswer: false,
      questionText: "",
      resourceUrl: "about:blank",
      thumbnail: "about:blank",
      isImage: false,
      answerTextA: "Test Answer A",
      answerTextB: "Test Answer B",
      answerTextC: "Test Answer C",
      answerTextD: "Test Answer D",
      responseType: "mul",
      responses:""
    }
  });
  var API = {
    getElementEntity: function(activityId) {
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
  //TODO getting the element from the activity 
  StudentManager.reqres.setHandler("element:entity", function(id) {
    return API.getElementEntity(id);
  });

  StudentManager.reqres.setHandler("element:entity:new", function(id) {
    return new Element();
  });

  return Element;
});



