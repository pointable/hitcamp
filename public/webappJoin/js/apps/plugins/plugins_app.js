define(["app"], function(StudentManager) {
  StudentManager.module("Router.PluginsApp",
      function(PluginsAppRouter, StudentManager, Backbone, Marionette, $, _) {
        PluginsAppRouter.Router = Marionette.AppRouter.extend({
          appRoutes: {
            "campfire-app": "backToRoot",
//            "app/:id": "showPluginById"

          }
        });

        PluginsAPI = {
          showPlugin: function(url, options) {
            require(["apps/plugins/show/pluginsShow_controller"], function(ShowController) {
              ShowController.showPlugin(url, options);
            });
          },
          showPluginById: function(id) {
            require(["apps/plugins/show/pluginsShow_controller"], function(ShowController) {
              ShowController.showPluginById(id);
            });
          },
          showPluginByActivity: function(activity) {
            require(["apps/plugins/show/pluginsShow_controller"], function(ShowController) {
              ShowController.showPluginByActivity(activity);
            });
          },
          backToRoot: function(url, options) {
            StudentManager.backToRoot();
          }
        };

        StudentManager.on("plugin:show", function(url, options) {
          //StudentManager.navigate("app",{trigger:false,replace: true});
          var args = {
            mode:"external"
          };
          PluginsAPI.showPlugin(url, args);
        });

//        StudentManager.on("plugin:show:app", function(id) {
////          StudentManager.navigate("app/"+);
//          PluginsAPI.showPlugin(url, options);
//        });

        StudentManager.on("plugin:show:app", function(activity) {
          //StudentManager.navigate("app");
//          StudentManager.navigate("app/"+activity.id);          
          PluginsAPI.showPluginByActivity(activity);
        });

        StudentManager.addInitializer(function() {
          new PluginsAppRouter.Router({
            controller: PluginsAPI
          });

          jq(document).off('MiniApp');
          jq(document).on('MiniApp', function(event, param) {

            var messageReceived = param.detail;
            switch (messageReceived.type)
            {
              case 'UrlUpdate':
                var url = messageReceived.resourceURL;
                StudentManager.trigger("plugin:show", url, messageReceived.options);
                break;
              case 'Exit':
                StudentManager.backToRoot();
                console.log("back");
                break;
            }
          });
          document.pluginListenerReady = true;
          document.pluginHandlerCheck();

        });
      });
});

