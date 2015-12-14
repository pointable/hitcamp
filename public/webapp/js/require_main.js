requirejs.config({
  paths: {
    jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min',
    "jquery-ui": '//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min',
//    "Jcrop": '../../tools/libs/jcrop/js/jquery.Jcrop.min',
    "Jcrop": '//cdnjs.cloudflare.com/ajax/libs/jquery-jcrop/0.9.12/js/jquery.Jcrop.min',
    underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
    backbone: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
    "backbone.syphon": "//cdnjs.cloudflare.com/ajax/libs/backbone.syphon/0.4.1/backbone.syphon.min",
    json2: "//cdnjs.cloudflare.com/ajax/libs/json2/20130526/json2.min",
    marionette: '//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.0.3/backbone.marionette',
    //marionette: '../../tools/libs/backbone/backbone.marionette.min',
    text: '../../tools/libs/require/text',
    bootstrap: '//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.1.1/js/bootstrap.min',
    bootbox: '//cdnjs.cloudflare.com/ajax/libs/bootbox.js/4.2.0/bootbox.min',
    interact: '../../tools/libs/interact/interact.min',
    tilesprocessor: '../../tools/misc/tilesProcessor',
//    introJs: '//cdn.jsdelivr.net/intro.js/0.9.0/intro.min',
    activitiesGuide: '../../guides/listAdventures_controllerGuide',
    wordListsGuide: '../../guides/wordListsList_controllerGuide',
    'domReady': '//cdnjs.cloudflare.com/ajax/libs/require-domReady/2.0.1/domReady.min',
    chardinJs: '//cdnjs.cloudflare.com/ajax/libs/chardin.js/0.1.2/chardinjs.min',
//    'ckeditor-core': '../..//tools/libs/ckeditor/ckeditor',
//    'ckeditor-j': '../../tools/libs/ckeditor/adapters/jquery',
    'ckeditor-core': 'http://store.hit.camp/libs/ckeditor/ckeditor',
     'ckeditor-j': 'http://store.hit.camp/libs/ckeditor/adapters/jquery',
        'mathjax': "//cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_HTML&amp;delayStartupUntil=configured"
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
    bootstrap: {
      deps: ['jquery']
    },
    "backbone.syphon": ["backbone"],
    bootbox: {
      deps: ["bootstrap", "jquery"],
      exports: "bootbox"
    },
    interact: {
      deps: ["underscore"],
      exports: "interact"
    },
    "tilesprocessor": ["underscore"],
//    introJs: {
//      exports: "introJs"
//    },
    "jquery-ui": {
      exports: "$",
      deps: ['jquery']
    },
    chardinJs: {
      deps: ["jquery"],
      exports: "chardinJs"
    },
    Jcrop: {
      deps: ['jquery']
    },
//    summernote: {
//      deps: ['jquery', 'bootstrap'],
//      exports: "summernote"
//    },
    'ckeditor-j': {
      deps: ['jquery', 'ckeditor-core']
    },
    mathjax: {
      exports: "MathJax"
    }

  }
});

require(["app"], function (LessonManager) {

  LessonManager.start();
});


