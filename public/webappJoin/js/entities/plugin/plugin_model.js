define([
  'jquery',
  'underscore',
  'backbone',
  'app'  
], function($, _, Backbone, StudentManager) {
  var Plugin = Backbone.Model.extend({
    idAttribute: '_id',
    url: function() {
//          console.log(_.result(this.collection, 'url'));
//          return '/adventures/edit/' + this.get('idLesson') + '/activities/' + (this.isNew() ? '' : this.id +'/');
      return _.result(this.collection, 'url') + (this.isNew() ? '' : (this.id + '/'));
    },
    parse: function(response) {
      this.set("_id", response._id);            
      return response;
    },
    defaults: {
      "pluginURL":"",      
      "pluginTeacherURL":"",      
      "pluginTitle": "",      
      "pluginServerPath": "",
      "category":"",
      "thumbnail":"",
      "index":"",
      "minLists":""
    },
    initialize: function(model) {
      
    },
    clear: function() {
      console.log("destroy");
      this.destroy();
    }
  });

  var API = {
    getPluginEntity: function(pluginId) {      
      var plugin = new Plugin({id: pluginId});
      var defer = $.Deferred();
      plugin.fetch({
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

  StudentManager.reqres.setHandler("plugin:entity", function(id) {
    return API.getPluginEntity(id);
  });
  
   StudentManager.reqres.setHandler("plugin:entity:new", function(id) {
    return new Plugin();
  });

  return Plugin;
});


