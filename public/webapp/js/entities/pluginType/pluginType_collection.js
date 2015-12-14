define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'entities/pluginType/pluginType_model',
  'entities/plugin/plugin_collection'
], function($, _, Backbone, LessonManager, pluginType, pluginCollecion) {
  PluginTypeCollection = Backbone.Collection.extend({
    model: pluginType,
    url: function() {
      return '/plugins/plugins.json';
    },
    parse: function(results) {
      return results.pluginTypes;
      console.log("results %0", results.pluginTypes);
    },
    initialize: function(models, options) {
      this.idSession = options;
    },
    selected: function() {
      return this.filter(function(pluginModel) {
        return pluginModel.get('selected');
      });
    },
    remaining: function() {
      return this.without.apply(this, this.selected());
    }
  });

  var lessonDataFromHtml = JSON.parse($('#data-classrooms').html());
  var idSession = lessonDataFromHtml.lesson;

  var pluginCollectionFromHtml = function() {
    var pluginTypes = new PluginTypeCollection(lessonDataFromHtml.pluginTypes, idSession);
    addIndexToCollection(pluginTypes);
    return pluginTypes;
  };

  var API = {
    getPluginTypesEntities: function(options) {
      var models = {};
      var pluginTypes = new PluginTypeCollection(models, idSession);

      var defer = $.Deferred();
      pluginTypes.fetch({
        success: function(data) {
          _.each(data.models, function(pluginType) {
            var plugins = pluginType.get("plugins");
            var pluginCollection = new pluginCollecion(plugins);
            pluginType.set("plugins", pluginCollection);
          });
          defer.resolve(data);
          addIndexToCollection(pluginTypes);
        }
      });

      return defer.promise();
    },
    getPluginEntitiesFromHTML: function() {
      var pluginTypes = pluginCollectionFromHtml();
      addIndexToCollection(pluginTypes);
      return pluginTypes;
    },
    getPluginTypesEntitiesInitialized: function() {
      var initializedPlugins = [
        {"_id": "1", "thumbnail": "fa-random", "pluginTitle": "Randomizer", "type": "", "index": "", pluginURL: "/pluginTypes/randomizer/randomizerTeacher.html"},
        {"_id": "2", "thumbnail": "fa-columns", "pluginTitle": "Sort Me", "type": "", "index": "", pluginURL: "/pluginTypes/sortMe/sortMeTeacher.html"},
        {"_id": "3", "thumbnail": "fa-bolt", "pluginTitle": "Word Attack", "type": "", "index": "", pluginURL: "/pluginTypes/wordAttack/wordAttackTeacher.html"},
        {"_id": "4", "thumbnail": "fa-dot-circle-o", "pluginTitle": "Buzzer", "type": "", "index": "", pluginURL: "/pluginTypes/buzzer/buzzerTeacher.html"},
        {"_id": "5", "thumbnail": "fa-circle-o", "pluginTitle": "Word Wheel", "type": "", "index": "", pluginURL: "/pluginTypes/wheelWord/wheelWordTeacher.html"},
        {"_id": "6", "thumbnail": "fa-bar-chart-o", "pluginTitle": "Quick Poll", "type": "", "index": "", pluginURL: "/pluginTypes/quickPoll/quickPollTeacher.html"},
        {"_id": "7", "thumbnail": "fa-pencil", "pluginTitle": "Open Response", "type": "", "index": "", pluginURL: "/pluginTypes/openResponse/openResponseTeacher.html"},
        {"_id": "8", "thumbnail": "fa-pencil", "pluginTitle": "Word Search", "type": "", "index": "", pluginURL: "/pluginTypes/wordSearch/wordSearchTeacher.html"}
      ];
      var pluginTypes = new PluginTypeCollection(initializedPlugins);
      addIndexToCollection(pluginTypes);
      return pluginTypes;
    }
  };

  function addIndexToCollection(pluginTypes) {
    _.each(pluginTypes.models, function(pluginType) {
      var pluginTypeIndex = pluginType.collection.indexOf(pluginType) + 1;
      pluginType.set("index", pluginTypeIndex);
    }, this);
  }

  LessonManager.reqres.setHandler("pluginTypes:entities", function() {
    return API.getPluginTypesEntities();
  });
  LessonManager.reqres.setHandler("pluginTypes:entities:initialized", function() {
    return API.getPluginTypesEntitiesInitialized();
  });
  //later parsing from HTML
//  LessonManager.reqres.setHandler("pluginTypes:entities:initialized", function() {
//    return API.getPluginEntitiesFromHTML();
//  });

  return PluginTypeCollection;
});



