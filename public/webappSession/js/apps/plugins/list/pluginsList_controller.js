define(["app", "apps/plugins/list/pluginsList_view"], function(TeacherSession, View) {
  TeacherSession.module("PluginsApp.List", function(List, TeacherSession, Backbone, Marionette, $, _) {
    var MAX_LENGTH = 12;

    var Controller = Marionette.Controller.extend({
      //Server
      listPlugins: function(options) {
        if (options.initialized === false) {
//          require(["entities/plugin/plugin_collection"], function() {
//            var fetchingPlugins = TeacherSession.request("plugins:entities");
//            $.when(fetchingPlugins).done(function(plugins) {
//              listView(plugins);
//            });
//          });
          require(["entities/pluginType/pluginType_collection"], function() {
            var fetchingPluginTypes = TeacherSession.request("pluginTypes:entities");
            $.when(fetchingPluginTypes).done(function(pluginTypes) {
              //console.log("plugins: %O",pluginTypes);
              listView(pluginTypes, options);
            });
          });
          //HTML
        } else if (options.initialized) {
          console.log("options.initialized");
          require(["entities/plugin/plugin_collection"], function() {
            var plugins = TeacherSession.request("plugins:entities:initialized");
            listView(plugins);
          });
        }
      },
      pluginsListShow: function() {
        var pluginName = document.plugin.pluginName;
        togglePluginsListView();
        //Open the app when it is active
        if ($(".plugin-types-area").hasClass("isVisible")) {
          //If there is a active running app        
          if (typeof pluginName !== 'undefined') {
            //Show the correct app
            if ($("#frameMiniApp").data("plugin") !== pluginName) {
              TeacherSession.trigger("plugin:show", pluginName);
            }
          }
        }
      },
      pluginsListShowToggle: function() {
        togglePluginsListView();
      }
    });
    function listView(pluginsTypes, options) {
      console.log(pluginsTypes);

      //preload imagesz
//      _.each(activities.models, function (model) {
//        _.each(model.attributes.elements.models, function (elementModel){
//          var attributes = elementModel.attributes;
//          if (attributes.isImage)
//          {
//            console.log(attributes.resourceUrl);
//            window.imgPreloader.push(attributes.resourceUrl);
//          }
//        });
//      });
      var self = List.Controller;
      var pluginsTypesListViewLayout = new View.PluginsTypesLayout();

//      var pluginsListView = new View.Plugins({
//        collection: plugins
//      });

      self.listenTo(pluginsTypesListViewLayout, "plugins:list:show", function() {
        TeacherSession.trigger("plugins:list:show");
      });

      pluginsTypesListViewLayout.on("show", function() {
        TeacherSession.addRegions({
          pluginsView: "#plugins-view"
        });

        var pluginsTypesListView = new View.PluginsTypes({
          collection: pluginsTypes
        });

        if (options.back) {
          pluginsTypesListView.on("show", function() {
            togglePluginsListView();
          });
        }

        pluginsTypesListView.on("childview:plugins:plugin:show", function(view, plugin) {
          // var pluginModel = plugin.model;
          var options = {
            internal: true
          };

          TeacherSession.trigger("plugin:show:internal", plugin.model, options);
//        TeacherSession.navigate("campfire-app");
//        
//          if (typeof window.isDevelopment === false || typeof window.isDevelopment === "undefined") {
//            TeacherSession.trigger("plugin:show", pluginModel.get("pluginTeacherURLDist"));
//            console.log(pluginModel.get("pluginTeacherURLDist"));
//          } else {
//            TeacherSession.trigger("plugin:show", pluginModel.get("pluginTeacherURL"));
//            console.log(pluginModel.get("pluginTeacherURL"));
//          }

        });

        pluginsTypesListViewLayout.pluginsView.show(pluginsTypesListView);
      });

      TeacherSession.pluginsRegion.show(pluginsTypesListViewLayout);
      // $('#plugins-region').css("z-index", 6);
      //TeacherSession.mainRegion.show(pluginsTypesListView);


//      parent.document.addEventListener('ServerToApp', function(e){
//        console.log('Message Received: %O', e.detail);  
////        var elements = model.get("elements");
//        TeacherSession.trigger("element:show",elements);
//      });
//         

//      pluginsTypesListView.on("plugins:list:show", function() {
//        togglePluginsListView();
//      });

//      pluginsTypesListView.on("childview:plugin:show", function(plugin) {
////        $('.modal-backdrop').remove();
//        var pluginModel = plugin.model;
//        console.log(pluginModel.get("pluginURL"));
//        $('.modal-backdrop').remove();
//        TeacherSession.trigger("dialog:show", pluginModel.get("pluginURL"), pluginModel.get("pluginTitle"));
//      });



//      $(window.document).off('DialogUrl');
//
//      $(window.document).on('DialogUrl', function(e) {
//        var messageReceived = e.originalEvent.detail;
//        switch (messageReceived.type)
//        {
//          //set all custom message type here
//          case 'UrlUpdate':
//            var url = messageReceived.resourceURL;
//
//            //remove backdrop due to bug when called twice
//            $('.modal-backdrop').remove();
//            TeacherSession.trigger("dialog:show", url, messageReceived.title);
//            break;
//        }
//      });

    }

    function togglePluginsListView() {
      if ($("#frameMiniApp").length > 0) {
        //Remove transition for going back to plugins list        
        $(".plugin-types-area").removeClass("has-transition");
      } else {
        $(".plugin-types-area").addClass("has-transition");
      }

      //Toggle the area to be visisble
      $(".plugin-types-area").toggleClass("isVisible");

      if ($(".plugin-types-area").hasClass("isVisible")) {
        //Trigger close if click on the main region
        $("#main-region").off("click");
        $("#main-region").on("click", function() {
          TeacherSession.trigger("plugins:list:show:toggle");
        });
        //Temporary remove the active plugin animation if any
        $(".js-show-plugins").removeClass("plugin-active");
        $("#plugins-view").css("z-index", "0");
        $(".activity-area").css("z-index", "-1");
        $(".btn-plugins").addClass("plugins-list-open");
      } else {
        $("#main-region").off("click");
        $(".btn-plugins").removeClass("plugins-list-open");

        var pluginName = document.plugin.pluginName;
        if (typeof pluginName !== 'undefined') {
          $(".js-show-plugins").addClass("plugin-active");
        }

        setTimeout(function() {
          $(".activity-area").css("z-index", "");
          $("#plugins-view").css("z-index", "-1");
        }, 300);
      }
    }
    List.Controller = new Controller();
  });
  return TeacherSession.PluginsApp.List.Controller;
});


