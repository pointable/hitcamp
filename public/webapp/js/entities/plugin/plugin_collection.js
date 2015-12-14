define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'entities/plugin/plugin_model'
], function($, _, Backbone, LessonManager, Plugin) {
  PluginCollection = Backbone.Collection.extend({
    model: Plugin,
    url: function() {
     // return '/session/' + this.idSession;
    },
    parse: function(results) {
      return results.plugins;
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
    var plugins = new PluginCollection(lessonDataFromHtml.plugins, idSession);
    addIndexToCollection(plugins);
    return plugins;
  };

  var API = {
    getActivityEntities: function(options) {
      var models = {};
      var plugins = new PluginCollection(models, idSession);
      var defer = $.Deferred();
      plugins.fetch({
        success: function(data) {
          defer.resolve(data);
          addIndexToCollection(plugins);
        }
      });

      return defer.promise();
    },
    getPluginEntitiesFromHTML: function() {
      var plugins = pluginCollectionFromHtml();
      addIndexToCollection(plugins);
      return plugins;
    },
    getPluginEntitiesInitialized: function() {
      var initializedPlugins=[
        {"_id":"1","thumbnail":"fa-random","pluginTitle": "Randomizer","type": "","index":"",pluginURL:"/plugins/randomizer/randomizerTeacher.html"},
        {"_id":"2","thumbnail":"fa-columns","pluginTitle": "Sort Me","type": "","index":"",pluginURL:"/plugins/sortMe/sortMeTeacher.html"},
        {"_id":"3","thumbnail":"fa-bolt","pluginTitle": "Word Attack","type": "","index":"",pluginURL:"/plugins/wordAttack/wordAttackTeacher.html"},
        {"_id":"4","thumbnail":"fa-dot-circle-o","pluginTitle": "Buzzer","type": "","index":"",pluginURL:"/plugins/buzzer/buzzerTeacher.html"},
        {"_id":"5","thumbnail":"fa-circle-o","pluginTitle": "Word Wheel","type": "","index":"",pluginURL:"/plugins/wheelWord/wheelWordTeacher.html"},
        {"_id":"6","thumbnail":"fa-bar-chart-o","pluginTitle": "Quick Poll","type": "","index":"",pluginURL:"/plugins/quickPoll/quickPollTeacher.html"},
        {"_id":"7","thumbnail":"fa-pencil","pluginTitle": "Open Response","type": "","index":"",pluginURL:"/plugins/openResponse/openResponseTeacher.html"},
        {"_id":"8","thumbnail":"fa-search","pluginTitle": "Word Search","type": "","index":"",pluginURL:"/plugins/wordSearch/wordSearchTeacher.html"}
      ];
      var plugins = new PluginCollection(initializedPlugins);
      addIndexToCollection(plugins);
      return plugins;
    }
  };

  function addIndexToCollection(plugins) {
    _.each(plugins.models, function(plugin) {    
      var pluginIndex = plugin.collection.indexOf(plugin) + 1;
      plugin.set("index", pluginIndex);
    }, this);
  }

  LessonManager.reqres.setHandler("plugins:entities", function() {
    return API.getPluginEntities();
  });
  LessonManager.reqres.setHandler("plugins:entities:initialized", function() {
    return API.getPluginEntitiesInitialized();
  });

  return PluginCollection;
});



