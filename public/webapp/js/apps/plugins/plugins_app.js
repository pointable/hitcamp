define(["app"], function(LessonManager) {
  LessonManager.module("Router.PluginApp",
      function(PluginsAppRouter, LessonManager, Backbone, Marionette, $, _) {
        PluginsAppRouter.Router = Marionette.AppRouter.extend({
          appRoutes: {
//            "campfire-app": "listPlugins",
          }
        });

        PluginsAPI = {
          configureWord:function(args){
            require(["apps/plugins/configureWord/pluginsConfigureWord_controller"], function(ConfigureWord_controller) {
              ConfigureWord_controller.configureWordPlugins(args);
            });            
          }
        };

        LessonManager.on("plugins:configureWord", function(args) {
          //LessonManager.navigate("campfire-apps");          
          PluginsAPI.configureWord(args);
        });
        LessonManager.addInitializer(function() {
          new PluginsAppRouter.Router({
            controller: PluginsAPI
          });
        });
      });
});

