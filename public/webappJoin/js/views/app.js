define([
    'jquery',
    'underscore',
    'backbone',
    'router',
    'views/login/LoginView'
], function($, _, Backbone,Router,LoginView) {
  
    var AppView = Backbone.View.extend({
        el: $("#engageApp"),
        initialize: function() {

            console.log(document.URL);
            this.router = new Router();
            Backbone.history.start({pushState:true, hashChange:false});           
            var loginView = new LoginView();
            loginView.render();
            this.$inputPinSuccess = this.$("#inputPinSuccess");

        },
        events: {
            'click #submitPin': 'submitPin',
            'keypress #inputPinSuccess': 'inputPin'
        },
        render: function() {
            //this.$el.html(lessonTemplate);           
        },
        inputPin: function(event) {           
            var pin = this.$inputPinSuccess.val();
            if (event.keyCode !== 13 || !pin) {
                return;
            }       
            this.submitPin();
            event.preventDefault();
        },
        submitPin: function(event) {
            var pin = this.$inputPinSuccess.val();
            console.log("Submit Pin: " + pin);
            var message = {pin: pin};           
//            var event = new CustomEvent('messageToServer', {detail: JSON.stringify(message)});
//            document.dispatchEvent(event);
             //TODO on checking that the pin is indeed valid, join session 
            
            var jqxhr = $.post( '',
            message,
            function(data) {
              if (data.id){
                console.log("session id : " + data.id );
                setTimeout(function(){
                  location.href = '/join/' + data.id+  '/';
                },100); 
              }else{                
                console.log("session id not found");
              }                
              
            }, "json")
              .done(function() {
              })
              .fail(function() {                
                 console.log('error');
              })
              .always(function() {
            });
            
        },
        receivedMessage: function(e) {
            console.log(e);
        }

    });

    return AppView;
});


