define(["app",
  "text!apps/elements/show/templates/elementShow_template.html",
  "backbone.syphon"
],
  function(StudentManager, elementShowTpl) {
    StudentManager.module("ElementsApp.Show.View",
            function(View, StudentManager, Backbone, Marionette, $, _) {
              View.Element = Marionette.LayoutView.extend({
                template: _.template(elementShowTpl),
                regions:{
                  responsesPanel:"#response-panel"                      
                },
                className: "container-fluid padding-0px grey",                
                events: {
//                  'click .js-answerA': 'answerAClicked',
//                  'click .js-answerB': 'answerBClicked',
//                  'click .js-answerC': 'answerCClicked',
//                  'click .js-answerD': 'answerDClicked',
                  'click .js-question-next':'questionNextClicked',
                  'click .js-question-previous':'questionPreviousClicked',
                  'click .js-answers-show':'answersShow',
                  'click .js-answers-reset':'answersReset',
                 
                }, answerAClicked: function() {                  
                  this.trigger("element:answer:a", this.model);
                }, answerBClicked: function() {                 
                  this.trigger("element:answer:b", this.model);
                }, answerCClicked: function() {                  
                  this.trigger("element:answer:c", this.model);
                }, answerDClicked: function() {                 
                  this.trigger("element:answer:d", this.model);
                },questionNextClicked: function(event){
                  event.preventDefault();                  
                  this.trigger("element:question:next",this.model);                
                },questionPreviousClicked: function(event){
                  event.preventDefault();
                  this.trigger("element:question:previous",this.model);
                },answersShow: function(event){
                  event.preventDefault();
                  console.log("Show");
                  this.trigger("element:answers:show", this.model);
                },answersReset: function(event){
                  event.preventDefault();
                  console.log("reset");
                  this.trigger("element:answers:reset", this.model);
                  
                },triggers:{
                  'click .js-save':'element:link:save',                  
                  'click .js-question-close':'element:show:close'
                },initialize:function(){
                  var this_view = this;
//                  console.log("test");
                  document.addEventListener('LocalMessage', function(e) {
                    var messageReceived = JSON.parse(e.detail);                                
                    switch (messageReceived.type)
                    {
                      //set all custom message type here
                      case 'ResourceUpdate':
//                        var url = messageReceived.resourceURL;
                        var data = {
                          resourceURL: messageReceived.resourceURL,
                          thumbnail: messageReceived.thumbnailLink,
                          title: messageReceived.title
                        };
                        
                        console.log(this_view);
                        this_view.trigger("element:link:update",this_view.model, data);
                        break;  
                    }
                  }, this); 
//                  setTimeout(function (){
//                    document.initCanvas();                    
//                  },500);
                }               
              });
              
         
            });
    return StudentManager.ElementsApp.Show.View;
  });


