require.config({
    paths: {
        jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min',
        underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
        backbone: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
        templates: '../templates',
        text: '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.10/text'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        }

    }
});

require(['views/app'], function(AppView) {
    var app_view = new AppView;

//    document.addEventListener('serverToStudent', function(e) {
////        app_view.receivedMessage(e.detail);
//    }, false);
//    document.addEventListener('serverToTeacher', function(e) {
////        app_view.receivedMessage(e.detail);
//    }, false);

//require(["app"], function(App){
//    App.initialize();
});



