define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'entities/adventure/adventure_model'
], function($, _, Backbone, CampManager, Adventure) {
  AdventureCollection = Backbone.Collection.extend({
    model: Adventure,
    url: '/adventures/edit',
    comparator:'lessonName',
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

  var lessonDataFromHtml = JSON.parse($('#data-lessons').html());
  var API = {
    getAdventureEntities: function(options) {
      var models = {};
      var adventures = new AdventureCollection(models);
      var defer = $.Deferred();
      adventures.fetch({
        success: function(adventures) {
          defer.resolve(adventures);
        }
      });
      return defer.promise();
    },    
    getAdventureEntitiesFromHTML: function() {
      var adventures = new AdventureCollection(lessonDataFromHtml); 
      return adventures;
    }
  };

  CampManager.reqres.setHandler("adventure:entities", function() {    
    return API.getAdventureEntities();
  });
  CampManager.reqres.setHandler("adventure:entities:html", function() {    
    return API.getAdventureEntitiesFromHTML();
  });

  return AdventureCollection;
});



