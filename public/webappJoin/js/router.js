define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {

    var AppRouter = Backbone.Router.extend({
        routes: {            
            'join/:id/': 'joinLesson',
            // Default
            '': 'defaultAction'
        },        
        initialize: function() {

            
        },        
        sayHello: function(){
            alert("Hello!");
        },
        joinLesson:function(id){
          console.log("Routed id:"+id);
          //TODO: If the session id is approved then we will route to the session
          //else we will need to prompt the user
                          
        },
        defaultAction: function(){
            console.log("Router default");
        }
    });

    return AppRouter;
});

