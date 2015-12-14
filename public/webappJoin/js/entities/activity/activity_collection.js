define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'entities/activity/activity_model'
], function($, _, Backbone, StudentManager, Activity ) {
  ActivityCollection = Backbone.Collection.extend({
    model: Activity,
    //All datas should be local and read from HTML
    //If not will retrieve by session path (GET)
    //PUT does not work with session path
    url: function() {
      return '/' + this.pathSession;
      //return '/join/' + this.idSession;
    },
    parse: function(results) {
      return results.activities;
      console.log(results);
    },
    initialize: function(models, options) {
      //this.idSession = options;
      this.pathSession = options;
    },
    selected: function() {
      return this.filter(function(activityModel) {
        return activityModel.get('selected');
      });
    },
    remaining: function() {
      return this.without.apply(this, this.selected());
    }
  });

  var lessonDataFromHtml = JSON.parse($('#data-session').html());
  var idSession = lessonDataFromHtml.idSession;
  var pathSession = lessonDataFromHtml.path;
  
  var activityCollectionFromHtml = function() {

    //var activities = new ActivityCollection(lessonDataFromHtml.activities, idSession);
    var activities = new ActivityCollection(lessonDataFromHtml.activities, pathSession);
    addIndexToCollection(activities);
    return activities;
  };

  var API = {
    getActivityEntities: function(options) {
      var models = {};
      //var activities = new ActivityCollection(models, idSession);
      var activities = new ActivityCollection(models, pathSession);
      var defer = $.Deferred();
      activities.fetch({
        success: function(activities) {
          addIndexToCollection(activities);
          defer.resolve(activities);
        },
        error: function(data) {
          defer.resolve(data);
        }
      });

      return defer.promise();
    },
    getActivityEntitiesFromHTML: function() {
      var activities = activityCollectionFromHtml();
      addIndexToCollection(activities);
      addStudentsAnswerToCollection(activities);
      return activities;
    }
  };

  function addIndexToCollection(activities) {
    _.each(activities.models, function(activity) {
      //Create new Element Collection from array      
      var activityIndex = activity.collection.indexOf(activity) + 1;
      activity.set("index", activityIndex);
      var activityElementData = activity.get("elements");
      if (activityElementData.length !== 0) {
        var elements = activity.get("elements");
        _.each(elements.models, function(element) {
          //Assign index to each element
          var elementIndex = element.collection.indexOf(element) + 1;
          element.set("index", activityIndex + '.' + elementIndex);
          //Use the index as id if no id is found
          if(element.get("_id")===""){
            element.set("_id",elementIndex);
          }
        });
      }
    }, this);
  }

//Setting up a socket listener to change the studentAnswered data
  function addStudentsAnswerToCollection(activitiesCollection) {
    jq(window.document).off('ServerToPlugin' + 'ACTIVITY');
    jq(window.document).on('ServerToPlugin' + 'ACTIVITY', function(event, param) {
//    debugger;
      var messageReceived = param.detail;
      switch (messageReceived.pluginMessageType)
      {
        //set all custom message type here
        case 'GetStudentAnswersResponse':
          var activitiesFromSocket = messageReceived.data.activities;
          _.each(activitiesCollection.models, function(activity) {
            //matching activity with activity from socket, if the same check for the element exist
            if (activitiesFromSocket[activity.id]) {
              var elements = activity.get("elements");
              _.each(elements.models, function(element) {
                //if the elementid matches,then set the student answer
                if (activitiesFromSocket[activity.id][element.cid]) {
                  var studentAnswer = activitiesFromSocket[activity.id][element.cid].studentAnswer;
                  element.set("studentAnswered", studentAnswer.answerSubmitted);
                }
              });
            }
          });
          break;
      }
    });
    
    window.pluginToServer('ACTIVITY', 'GetStudentAnswers', {});
  }

  StudentManager.reqres.setHandler("activity:entities", function() {
    return API.getActivityEntities();
  });
  StudentManager.reqres.setHandler("activity:entities:initialized", function() {
    return API.getActivityEntitiesFromHTML();

  });
  
  return ActivityCollection;
});





