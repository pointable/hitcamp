define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'entities/activity/activity_model'
], function ($, _, Backbone, TeacherSession, Activity) {
  ActivityCollection = Backbone.Collection.extend({
    model: Activity,
    //All datas should be local and read from HTML
    //If not will retrieve by session path (GET)
    //PUT does not work with session path

    url: function () {
      return '/' + this.pathSession;
      //return '/session/' + this.idSession;
    },
    parse: function (results) {
      return results.activities;
    },
    initialize: function (models, options, lesson) {
      //this.idSession = options;
      this.lessonName = lesson.name;
      this.pathSession = options;
      this.lessonEditorId = lesson.id;
      this.isLocked = lesson.isLocked;
    },
    selected: function () {
      return this.filter(function (activityModel) {
        return activityModel.get('selected');
      });
    },
    remaining: function () {
      return this.without.apply(this, this.selected());
    }
  });

  var lessonDataFromHtml = JSON.parse($('#data-session').html());
  var idSession = lessonDataFromHtml.idSession;
  var pathSession = lessonDataFromHtml.path;
  var lessonName = lessonDataFromHtml.lessonName;
  var lessonDataResultFromHtml = JSON.parse($('#data-results').html());
  var lessonId = lessonDataResultFromHtml.lesson;
  var isLocked = lessonDataFromHtml.isLocked;
//  console.log(isLocked);
  if (typeof lessonName === null || typeof lessonName === 'undefined') {
    console.log("lessonName not defined" + lessonName);
  }
  var lesson = {
    name: lessonName,
    id: lessonId,
    isLocked: isLocked
  };
//  console.log(lesson);
  var activityCollectionFromHtml = function () {
    //var activities = new ActivityCollection(lessonDataFromHtml.activities, idSession);
    var activities = new ActivityCollection(lessonDataFromHtml.activities, pathSession, lesson);
    addIndexToCollection(activities);
    return activities;
  };

  var API = {
    getActivityEntities: function (options) {
      var models = {};
      //var activities = new ActivityCollection(models, idSession);
      var activities = new ActivityCollection(models, pathSession, lesson);
      var defer = $.Deferred();
      activities.fetch({
        success: function (data) {
          defer.resolve(data);
          addIndexToCollection(activities);
        }
      });

      return defer.promise();
    },
    getActivityEntitiesFromHTML: function () {
      var activities = activityCollectionFromHtml();
      addIndexToCollection(activities);
      
      return activities;
    }
  };

  function addIndexToCollection(activities) {
    _.each(activities.models, function (activity) {
      //Create new Element Collection from array      
      var activityIndex = activity.collection.indexOf(activity) + 1;
      activity.set("index", activityIndex);
      var activityElementData = activity.get("elements");
      if (activityElementData.length !== 0) {
//        var tempElements = new Elements(activityElementData);
        activity.set("elements", activityElementData, {parse: true});
        var elements = activity.get("elements");
        _.each(elements.models, function (element) {
          //Assign index to each element
          var elementIndex = element.collection.indexOf(element) + 1;
          element.set("index", activityIndex + '.' + elementIndex);
          //Use the index as id if no id is found
          if (element.get("_id") === "") {
            element.set("_id", elementIndex);
          }
        });
      }
    }, this);
  }

  TeacherSession.reqres.setHandler("activity:entities", function () {
    return API.getActivityEntities();
  });
  TeacherSession.reqres.setHandler("activity:entities:initialized", function () {
    return API.getActivityEntitiesFromHTML();
  });
  return ActivityCollection;
});



