define(["app", "bootbox"], function(TeacherSession) {
  TeacherSession.module("Router.PluginApp",
      function(PluginsAppRouter, TeacherSession, Backbone, Marionette, $, _) {
        PluginsAppRouter.Router = Marionette.AppRouter.extend({
          appRoutes: {
//            "plugin": "backToRoot",
//            "campfire-app": "listPlugins",
//            "campfire-apps": "listPlugins"
          }
        });

        PluginsAPI = {
          showPlugin: function(plugin, options) {
            require(["apps/plugins/show/pluginsShow_controller"], function(ShowController) {
              ShowController.showPlugin(plugin, options);
            });
          },
          showPluginInternal: function(model, options) {
            require(["apps/plugins/show/pluginsShow_controller"], function(ShowController) {
              ShowController.showPluginInternal(model, options);
            });
          },
          showPluginWithUrl: function(model, options) {
            require(["apps/plugins/show/pluginsShow_controller"], function(ShowController) {
              ShowController.showPluginWithUrl(model, options);
            });
          },
          pluginShowUpdate: function(pluginName, active) {
            require(["apps/plugins/Show/pluginsShow_controller"], function(ShowController) {
              ShowController.pluginShowUpdate(pluginName, active);
            });
          },
          backToRoot: function(url, options) {
            TeacherSession.backToRoot();
          },
          listPlugins: function(options) {
            require(["apps/plugins/list/pluginsList_controller"], function(ListController) {
              ListController.listPlugins(options);
            });
          },
          listPluginsInitialized: function(options) {
            require(["apps/plugins/list/pluginsList_controller"], function(ListController) {
              var options = {
                initialized: true
              };
              ListController.listPlugins(options);
            });
          },
          pluginsListShow: function() {
            require(["apps/plugins/list/pluginsList_controller"], function(ListController) {
              ListController.pluginsListShow();
            });
          },
          pluginsListShowToggle: function() {
            require(["apps/plugins/list/pluginsList_controller"], function(ListController) {
              ListController.pluginsListShowToggle();
            });
          }
        };

        TeacherSession.on("plugin:show", function(plugin, options) {
          if (typeof options === 'undefined') {
            var LocalOptions = {
              full: false
            };
            PluginsAPI.showPlugin(plugin, LocalOptions);
          } else {
            options.full = false;
            PluginsAPI.showPlugin(plugin, options);
          }
          //PluginsAPI.showPlugin(url, options);
          //TeacherSession.navigate("plugin");
        });

        TeacherSession.on("plugin:show:internal", function(plugin, options) {
          if (typeof options === 'undefined') {
            var LocalOptions = {
              full: false
            };
            PluginsAPI.showPluginInternal(plugin, LocalOptions);
          } else {
            options.full = false;
            PluginsAPI.showPluginInternal(plugin, options);
          }
          //PluginsAPI.showPlugin(url, options);
          //TeacherSession.navigate("plugin");
        });

        TeacherSession.on("plugin:show:url", function(url, options) {
          var model = new Backbone.Model();
          model.set("url", url);
          if (typeof options === 'undefined') {
            var LocalOptions = {
              full: true
            };
            PluginsAPI.showPluginWithUrl(model, LocalOptions);
          } else {
            options.full = true;
            PluginsAPI.showPluginWithUrl(model, options);
          }
          //TeacherSession.navigate("plugin");
        });

        TeacherSession.on("plugins:list", function() {
//          TeacherSession.navigate("campfire-apps");
          var options = {
            initialized: false,
          };
          console.log("plugins:list");
          PluginsAPI.listPlugins(options);
        });

        TeacherSession.on("plugins:list:back", function() {
//          TeacherSession.navigate("campfire-apps");
          var options = {
            initialized: false,
            back: true
          };
          console.log("plugins:list:back");
          PluginsAPI.listPlugins(options);
        });

        TeacherSession.on("plugins:list:initialized", function() {
//          TeacherSession.navigate("campfire-apps");
          console.log("plugins:list:initialized");
          var options = {
            initialized: true
          };
          PluginsAPI.listPlugins(options);
        });

        TeacherSession.on("plugins:list:show", function() {
          PluginsAPI.pluginsListShow();
        });

        TeacherSession.on("plugins:list:show:toggle", function() {
          PluginsAPI.pluginsListShowToggle();
        });

        TeacherSession.on("plugin:show:update", function(pluginName, active) {
          PluginsAPI.pluginShowUpdate(pluginName, active);
        });

        TeacherSession.addInitializer(function() {
          new PluginsAppRouter.Router({
            controller: PluginsAPI
          });
//          debugger;
          jq(document).off('MiniApp');
          jq(document).on('MiniApp', function(event, param) {

            var messageReceived = param.detail;
            switch (messageReceived.type)
            {
              case 'UrlUpdate':
                var url = messageReceived.resourceURL;
                TeacherSession.trigger("plugin:show", url, messageReceived.options);
                break;
              case 'ShowPlugin':
                var pluginName = messageReceived.pluginName;
                TeacherSession.trigger("plugin:show", pluginName, messageReceived.options);
                break;
              case 'UpdatePluginStatus':
                var pluginName = messageReceived.pluginName;
                var active = messageReceived.active;
                TeacherSession.trigger("plugin:show:update", pluginName, active);
                break;
              case 'Exit':
                TeacherSession.back();
                console.log("back");
                break;
            }
          });
          document.pluginListenerReady = true;
//        document.pluginHandlerCheck();

          //var self = this;
          $(".js-home").off();
          $(".js-home").on("click", function(e) {
            e.preventDefault();
            bootbox.confirm("Back to Classrooms & Adventures?", function(ans) {
              if (ans) {
                TeacherSession.backToHome();
              } else {
                return;
              }
            });

            //self.trigger("plugins:list:show", self, self.model);
          });
        });
      });
});

