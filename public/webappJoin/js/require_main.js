requirejs.config({
  paths: {
    jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min',
    underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
    backbone: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
    json2: "//cdnjs.cloudflare.com/ajax/libs/json2/20130526/json2.min",
    marionette: '//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/1.8.0/backbone.marionette.min',
    text: '../../tools/libs/require/text',
    bootstrap: '//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.1.1/js/bootstrap.min',
    bootbox: '../../tools/libs/bootbox/bootbox.min',
    grids: '../../tools/libs/grids/grid_amd',
    interact: '../../tools/libs/interact/interact.min',
    tilesprocessor: '../../tools/misc/tilesProcessor',
    'mathjax': "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_HTML&amp;delayStartupUntil=configured"

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
    bootbox: {
      deps: ["bootstrap", "jquery"],
      exports: "bootbox"
    },
    "grids": ["jquery"]
    ,
    interact: {
      deps: ["underscore"],
      exports: "interact"
    },
    "tilesprocessor": ["underscore"]
    ,mathjax: {
      exports: "MathJax"
    }
  }
});

require(["app"], function(StudentManager) {
  StudentManager.start();
});


