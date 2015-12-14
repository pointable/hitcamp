define(["app"], function(StudentManager) {
  StudentManager.module("Router.ResponsesApp", function(ResponsesAppRouter, StudentManager, Backbone, Marionette, $, _) {
    ResponsesAppRouter.Router = Marionette.AppRouter.extend({
    });

    ResponsesAPI = {
      //Server
      showResponses: function(model) {
        require(["apps/responses/show/responsesShow_controller"], function(ResponseShowController) {          
          ResponseShowController.showResponses(model);
        });
      }
    };

    StudentManager.on("responses:show", function(model) {
//      StudentManager.navigate("adventures/" + id);      
      ResponsesAPI.showResponses(model);
    });

    StudentManager.addInitializer(function() {
      new ResponsesAppRouter.Router({
        controller: ResponsesAPI
      });

      jq(document).off('Responses');
      jq(document).on('Responses', function(event, param) {

        var messageReceived = param.detail;
        switch (messageReceived.type)
        {
          case 'studentAnswer':
            var responsesData = messageReceived.data;
           // StudentManager.trigger("responses:list", responsesData);
            break;
        }
      });

    });
  });
});

