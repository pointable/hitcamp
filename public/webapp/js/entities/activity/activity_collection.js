define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'entities/activity/activity_model'
], function ($, _, Backbone, LessonManager, Activity) {
  ActivityCollection = Backbone.Collection.extend({
    model: Activity,
//    localStorage: new localStorage('engage'),   
    url: function () {
      return '/adventures/edit/' + this.idLesson + '/activities/';
    },
    parse: function (results) {
      return results.activities;
    },
    initialize: function (models, options) {
      this.idLesson = options;
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

  var lessonDataFromHtml = JSON.parse($('#data-results').html());
  var idLesson = lessonDataFromHtml._id;

  var activityCollectionFromHtml = function () {

    var activities = new ActivityCollection(lessonDataFromHtml.activities, idLesson);
    addIndexToCollection(activities);
    return activities;
  };

  var API = {
    getActivityEntities: function (options) {
      var models = {};
      var activities = new ActivityCollection(models, idLesson);
      var defer = $.Deferred();
      activities.fetch({
        success: function (activities) {
          if (activities.length !== 0) {
            addIndexToCollection(activities);
          }
          defer.resolve(activities);
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
        var elements = activity.get("elements");
        _.each(elements.models, function (element) {
          //Assign index to each element
          var elementIndex = element.collection.indexOf(element) + 1;
          //element.set("index",activityIndex+'.'+elementIndex);
          element.set("index", elementIndex);
          //Add a unique id to the element if there is none
          if (element.get("_id") === "") {
            var uid = generateUUID();
            element.set("_id", uid);
          }
        });
      }
    }, this);
  }

  function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
  }
  

  LessonManager.reqres.setHandler("activity:entities", function () {
    return API.getActivityEntities();
  });
  LessonManager.reqres.setHandler("activity:entities:initialized", function () {
    return API.getActivityEntitiesFromHTML();
  });


  return ActivityCollection;
});



