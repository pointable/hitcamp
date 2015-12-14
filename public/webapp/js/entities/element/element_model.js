define([
  'jquery',
  'underscore',
  'backbone',
  'app'
], function ($, _, Backbone, StudentManager) {
  var Element = Backbone.Model.extend({
    idAttribute: '_id',
    url: function () {
      return _.result(this.collection, 'url') + (this.isNew() ? '' : (this.get("cid") + '/'));
    },
    defaults: {
      _id: "",
      "index": "",
      "answer": "a",
      "textAnswer": "",
      "color": "dullBlue",
      "gotAnswer": "false",
      "questionText": "",
      "resourceUrl": "about:blank",
      isImage: false,
      "answerTextA": "",
      "answerTextB": "",
      "answerTextC": "",
      "answerTextD": "",
      "thumbnail": "about:blank",
      "responseType": "mul"
    },
    setSelected: function () {
      this.collection.selectElement(this);
    }
  });
  var API = {
    getElementEntity: function (elementId) {
      var element = new Element({id: elementId});
      var defer = $.Deferred();
      element.fetch({
        success: function (data) {
          defer.resolve(data);
        },
        error: function (data) {
          defer.resolve(undefined);
        }
      });
      return defer.promise();
    }
  };

  function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
  }
  //TODO getting the element from the activity 
  StudentManager.reqres.setHandler("element:entity", function (id) {
    return API.getElementEntity(id);
  });

  StudentManager.reqres.setHandler("element:entity:new", function (id) {
    var element = new Element;
    element.set('_id',generateUUID());
    return element;
  });

  return Element;
});



