define(["app",
  "text!apps/header/list/templates/header_template.html"
],
    function(LessonManager, headerTpl) {
      LessonManager.module("HeaderApp.List.View", function(View, LessonManager, Backbone, Marionette, $, _) {
        View.Header = Marionette.ItemView.extend({
          template: _.template(headerTpl),
//          className: "navbar navbar-default margin0",
          className: "activity-nav-bar",
//          attributes: {
//            role: "navigation"
//          },          
          triggers: {
            'click .js-back': "adventure:back",                        
            'click .js-preview-2students': "adventure:preview:2students",
            'click .js-preview-4students': "adventure:preview:4students",
            'click .js-preview-1student': "adventure:preview:1student",
            'click .js-preview-1_2student': "adventure:preview:1_2student",
            'click .js-preview-teacher': "adventure:preview:teacher", 
            'click .js-guide': 'show:guide'
//            'click .js-nav-list': "wordLists:list",
//            'click .js-nav-activities': "activities:list",
          }, initialize: function() {
          }, onShow: function() {
//            var typingTimer;                //timer identifier
//            var doneTypingInterval = 3000;  //time in ms, 5 second for example
//            //on keyup, start the countdown
//            $('#LessonTitle').keyup(function() {
//              clearTimeout(typingTimer);
//              if ($('#LessonTitle').val) {
//                typingTimer = setTimeout(doneTyping, doneTypingInterval);
//              }
//            });
//            function doneTyping() {
//              console.log("donetyping");
//              //$('#LessonTitle').css("background-color","#efefef");
//            }
          }
        });
                
      });
      return LessonManager.HeaderApp.List.View;
    });