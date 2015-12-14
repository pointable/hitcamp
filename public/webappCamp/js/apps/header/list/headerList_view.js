define(["app", "text!apps/header/list/templates/header_template.html",
  "text!apps/header/list/templates/questionHeader_template.html"],
    function(LessonManager, headerTpl, questionHeaderTpl) {
      LessonManager.module("HeaderApp.List.View", function(View, LessonManager, Backbone, Marionette, $, _) {
        View.Header = Marionette.ItemView.extend({
          template: _.template(headerTpl),
          className: "navbar navbar-default margin0",
          attributes: {
            role: "navigation"
          },
          id: "engage-header-navbar",
          triggers: {
            'click .js-home': "header:home",
            'click .js-start-lesson': "header:lesson:start",
            'click .js-rename': "header:lessontitle:rename",
            'click .js-nav-list': "wordLists:list",
            'click .js-nav-activities': "activities:list",
            'click .js-guide':'show:guide'
          }, initialize: function() {
          }, events: {
            "click #LessonTitle": "lessonTitleClick",
            "click .js-move": "activitiesMove"
          }, onShow: function() {
            var typingTimer;                //timer identifier
            var doneTypingInterval = 3000;  //time in ms, 5 second for example
            //on keyup, start the countdown
            $('#LessonTitle').keyup(function() {
              clearTimeout(typingTimer);
              if ($('#LessonTitle').val) {
                typingTimer = setTimeout(doneTyping, doneTypingInterval);
              }
            });
            function doneTyping() {
              console.log("donetyping");
              //$('#LessonTitle').css("background-color","#efefef");
            }
          }, lessonTitleClick: function() {
            $('#LessonTitle').css("background-color", "white");
          }, activitiesMove: function(event){              
             $(event.target).parent().toggleClass("active");
             if($(event.target).parent().hasClass("active")){
               this.trigger("activities:move",event.target);
             }else{
               this.trigger("activities:stopmove",event.target);
             }
             
          }
        });

        View.QuestionHeader = Marionette.ItemView.extend({
          template: _.template(questionHeaderTpl),
          className: "navbar navbar-default margin0",
          attributes: {
            role: "navigation"
          },
          id: "QuestionHeader",
          triggers: {
            'click .js-home': "header:home",
            'click .js-delete': "header:element:delete",
            'click .js-new': "header:element:new",
            'click .js-rename': "header:lessontitle:rename",
            "click .js-nav-list": "wordLists:list",
            "click .js-nav-activities": "activities:list"
          }, initialize: function() {
            
          }, events: {
            "click #LessonTitle": "lessonTitleClick"
          }
        });
      });
      return LessonManager.HeaderApp.List.View;
    });