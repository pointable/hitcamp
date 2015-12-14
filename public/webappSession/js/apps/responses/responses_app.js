define(["app"], function(TeacherSession) {
  TeacherSession.module("Router.ResponsesApp", function(ResponsesAppRouter, TeacherSession, Backbone, Marionette, $, _) {
    ResponsesAppRouter.Router = Marionette.AppRouter.extend({
    });

    ResponsesAPI = {
      //Server
      listResponses: function(responsesData) {
        require(["apps/responses/list/responsesList_controller"], function(ResponseListController) {
          console.log("here");
          ResponseListController.listResponses(responsesData);
        });
      }
    };

    TeacherSession.on("responses:list", function(responsesData) {
//      TeacherSession.navigate("adventures/" + id);      
      ResponsesAPI.listResponses(responsesData);
    });

    TeacherSession.addInitializer(function() {
      new ResponsesAppRouter.Router({
        controller: ResponsesAPI
      });

      jq(document).off('Responses');
      jq(document).on('Responses', function(event, param) {

        var messageReceived = param.detail;
        switch (messageReceived.type)
        {
          case 'listResponses':
            var responsesData = messageReceived.data;
            console.log("listResponses");
            TeacherSession.trigger("responses:list", responsesData);
            break;
        }
      });

    });
  });
});

