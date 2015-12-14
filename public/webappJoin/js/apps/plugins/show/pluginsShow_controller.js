define(['app', "apps/plugins/show/pluginsShow_view"],
    function(StudentManager, View) {
      StudentManager.module("PluginsApps.Show",
          function(Show, StudentManager, Backbone, Marionette, $, _) {
            Show.Controller = {
              showPlugin: function(url, options) {
                if (options.mode === "internal") {
                  var model = new Backbone.Model({
                    mode: "internal"
                  });
                } else if (options.mode === "external") {
                  var model = new Backbone.Model({
                    mode: "external",
                    title: options.title
                  });
                }
                if (url) {
                  model.set("url", url);
                } else {
                  model.set("url", "about:blank");
                }

                showPluginView(model);
              },
              showPluginByActivity: function(activity) {
                var pluginTypes;
                var pluginApp;
                var pluginFound;
                pluginTypes = StudentManager.request("plugins");
                pluginApp = activity.get("pluginApp");
                console.log("plugins requested %O", pluginTypes);
                console.log("app", activity.get("pluginApp"));
                _.each(pluginTypes.models, function(pluginType) {
                  var plugins = pluginType.get("plugins");
                  pluginFound = plugins.findWhere({plugin: pluginApp});
                  console.log("pluginFound -> %O", pluginFound);
                });

                if (pluginFound !== "undefined") {
                  var options = {
                    mode: "internal",
                    title: pluginFound.get("pluginTitle"),
                    activity: activity
                  };
                  var wordLists = activity.get("wordLists");
                  var parameters = "?isSingle=true&listID1=" + wordLists[0] + "&listID2=" + wordLists[1];
//                  var pluginURL = pluginFound.get("pluginURL") + parameters;
                  var model = new Backbone.Model({
                    mode: "internal",
                    title: options.title
                  });

                  if (window.isDevelopment) {
                    model.set("url", pluginFound.get("pluginURL") + parameters);
                  } else {
                    model.set("url", pluginFound.get("pluginURLDist") + parameters);
                  }
                  
                  showPluginView(model);
                } else {
                  console.log("app not found ->" + pluginApp);
                }
              }

            };

            function showPluginView(model) {

              var pluginView = new View.Element({model: model});
              StudentManager.mainRegion.show(pluginView);

              pluginView.on("plugin:exit", function(view) {
                console.log("plugin:exit");
                if(view.model.get("mode")==="internal"){
                  StudentManager.backToRoot();
                }else if (parent) {
                  StudentManager.trigger("plugins:list");
                } else {
                  console.log("plugin:back");
                  StudentManager.back();
                }
              });

              pluginView.on("plugin:show", function( ) {
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
          });
      return StudentManager.PluginsApps.Show.Controller;
    });

