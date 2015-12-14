define(['app', "apps/plugins/show/pluginsShow_view"],
    function (TeacherSession, View) {
      TeacherSession.module("PluginApps.Show",
          function (Show, TeacherSession, Backbone, Marionette, $, _) {

            var Controller = Marionette.Controller.extend({
              showPlugin: function (plugin, options) {
                require(['entities/plugin/plugin_collection'], function () {
//                  var plugin_collection = TeacherSession.request("plugins:entities:initialized");
//                  var pluginModel = new plugin_collection.model({_id:plugin}); 
                  var pluginFound;
                  pluginFound = getPluginModel(plugin);
                  //Set the URL to display for teacher
                  //Show.Controller.pluginShowUpdate(plugin);
                  setURL(pluginFound);
                  setMode(pluginFound, options);
                });
              },
              showPluginInternal: function (model, options) {
                setURL(model);
                setMode(model, options);
              },
              showPluginWithUrl: function (model, options) {
                setMode(model, options);
              },
              pluginShowUpdate: function (pluginName, active) {
                var pluginFound;
                pluginFound = getPluginModel(pluginName);
                updatePluginIcon(pluginFound, active);
              }
            });

            function updatePluginIcon(pluginFound, active) {
              var btnPlugin = $(".js-show-plugins").find(".btn-plugins-icon");
              if (pluginFound) {
                if (active) {
                  var pluginIcon = pluginFound.get("icon");
                  //If the plugins list is open do not add the animation
                  if ($(".plugin-types-area").hasClass("visible") !== false) {
                    $(".js-show-plugins").addClass("plugin-active");
                  }

                  btnPlugin.removeClass().addClass("fa fa-2x btn-plugins-icon").addClass(pluginIcon);
                } else {
                  $(".js-show-plugins").removeClass("plugin-active");
                  btnPlugin.removeClass().addClass("fa fa-2x btn-plugins-icon fa-fire");
                }
              }
            }

            function getPluginModel(pluginName) {
              var pluginFound;
              var pluginTypes = TeacherSession.request("plugins");
              console.log("plugins requested %O", pluginTypes);
              _.each(pluginTypes.models, function (pluginType) {
                var plugins = pluginType.get("plugins");
                var tempPlugin;
                tempPlugin = plugins.findWhere({plugin: pluginName});
                if (typeof tempPlugin !== "undefined") {
                  pluginFound = tempPlugin;
                  console.log("pluginFound -> %O", pluginFound);
                }
              });
              return pluginFound;
            }

            function setURL(pluginFound) {
              if (typeof pluginFound !== "undefined") {
                if (pluginFound.get("pluginTeacherURL")) {
                  if (window.isDevelopment === false || typeof window.isDevelopment === "undefined") {
                    pluginFound.set("url", pluginFound.get("pluginTeacherURLDist"));
                    console.log(pluginFound.get("pluginTeacherURLDist"));
                  } else {
                    pluginFound.set("url", pluginFound.get("pluginTeacherURL"));
                    //TeacherSession.trigger("plugin:show", pluginModel.get("pluginTeacherURL"));
                    console.log(pluginFound.get("pluginTeacherURL"));
                  }
                } else {
                  pluginFound.set("url", "about:blank");
                }
              }
            }

            function setMode(model, options) {
              if (!options.full) {
                showPluginView(model);
              }
              else if (options.full) {
                showPluginFullView(model);
              }
            }

            function showPluginView(model) {
              var self = Show.Controller;
              var pluginView = new View.Element({model: model});

              TeacherSession.pluginsView.show(pluginView);

              self.listenTo(pluginView, "plugin:exit", function (view) {
                TeacherSession.trigger("plugins:list:back");
//                  if (view.model.get("trigger") === "internal") {
//                    TeacherSession.backToRoot();
//                    console.log("backToRoot");
//                  } else if (parent) {
//                    TeacherSession.trigger("plugins:list");
//                    console.log("trigger plugins list");
//                  } else {
//                    TeacherSession.back();
//                    console.log("Back triggered");
//                  }
              });

              self.listenTo(pluginView, "plugin:expand", function (view) {                
                togglePluginView();
              });

              self.listenTo(pluginView, "plugin:backToAdventure", function (url, options) {
                TeacherSession.backToRoot();
              });

              self.listenTo(pluginView, "plugin:show", function (url, options) {
                var message = {
                  type: 'UrlUpdate',
                  options: '',
                  resourceURL: url
                };

                var event = new CustomEvent('Plugin', {detail: message});
                document.dispatchEvent(event);
                //Show.Controller.showPlugin(url, options);
              });
            }
            function showPluginFullView(model) {
              var self = Show.Controller;
              var pluginFullView = new View.ElementFull({model: model});
              TeacherSession.pluginAppRegion.on("show", function (view) {
//                 view.$el.css("z-index", 7);
                $(view.$el).parent().css("display", "block");
              });
              TeacherSession.pluginAppRegion.show(pluginFullView);

              self.listenTo(pluginFullView, "plugin:exit", function (view) {
                TeacherSession.pluginAppRegion.empty();
                $("#pluginApp-region").css("display", "none");
                //TeacherSession.trigger("plugins:list:back");
              });

              self.listenTo(pluginFullView, "plugin:backToAdventure", function (url, options) {
                TeacherSession.backToRoot();
              });

//              self.listenTo(pluginFullView, "plugin:show", function(url, options) {
//                var message = {
//                  type: 'UrlUpdate',
//                  options: '',
//                  resourceURL: url
//                };
//
//                var event = new CustomEvent('Plugin', {detail: message});
//                document.dispatchEvent(event);
//                //Show.Controller.showPlugin(url, options);
//              });
            }

            function togglePluginView() {              
              $("#plugins-view").toggleClass("minimized-plugins-view");
            }

            Show.Controller = new Controller();
          });
      return TeacherSession.PluginApps.Show.Controller;
    });

