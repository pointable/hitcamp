define([
  'jquery',
  'underscore',
  'backbone',
  'app'
], function($, _, Backbone, CampManager) {

  Adventure = Backbone.Model.extend({
    idAttribute: '_id',
    url: function() {
      return '/adventures/edit' + (this.isNew() ? '' : '/' + this.id);
    },
    parse: function(response) {
      this.set("_id", response._id);
      return response;
    },
    defaults: {
      _id: undefined,
      data: '',
      lessonName: '',
      isComplete: '',
      backgroundThumbnailURL: 'about:blank',
      isLocked:false,
      isFirst:false
    },
    initialize: function(model) {
      this.set("path",this.url());
      this.on("change:_id",function(){
        this.set("path",this.url());
      });
    },
    clear: function() {
      console.log("destroy");
      this.destroy();
    },
    setSelected: function() {
      this.collection.selectElement(this);
    }
  });

  var API = {
    getAdventureEntity: function(adventureId) {

      var adventure = new Adventure({_id: adventureId});
      var defer = $.Deferred();
      adventure.fetch({
        success: function(data) {
          defer.resolve(data);
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

  CampManager.reqres.setHandler("adventure:entity", function(id) {
    return API.getAdventureEntity(id);
  });

  CampManager.reqres.setHandler("adventure:entity:new", function() {
    return new Adventure();
  });

  return Adventure;
});


