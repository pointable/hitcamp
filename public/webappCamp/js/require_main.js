requirejs.config({
  paths: {
    jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min',
    "jquery-ui": '//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min',
    underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
    backbone: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
    "backbone.syphon": "//cdnjs.cloudflare.com/ajax/libs/backbone.syphon/0.4.1/backbone.syphon.min",
    json2: "//cdnjs.cloudflare.com/ajax/libs/json2/20130526/json2.min",
    marionette: '//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.0.2/backbone.marionette.min',
    text: '../../tools/libs/require/text',
    bootstrap: '//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.1.1/js/bootstrap.min',
    bootbox: '//cdnjs.cloudflare.com/ajax/libs/bootbox.js/4.2.0/bootbox.min',
//    classroomGuide: '../../guides/indexClassroomListGuide',
    chardinJs:'//cdnjs.cloudflare.com/ajax/libs/chardin.js/0.1.2/chardinjs.min'    
  },
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ["underscore", "jquery", "json2"],
      exports: "Backbone"
    },
    marionette: {
      deps: ["backbone"],
      exports: "Marionette"
    },
    "bootstrap": ["jquery"],
    "backbone.syphon": ["backbone"],
    bootbox: {
      deps: ["bootstrap", "jquery"],
      exports: "bootbox"
    },
    "jquery-ui": {
      exports: "$",
      deps: ['jquery']
    },
    chardinJs: {
      deps: ["jquery"],
      exports: "chardinJs"
    }
  }
});

require(["app"], function(CampManager) {
  CampManager.start();
});


