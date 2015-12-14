define(["app",
  "apps/plugins/configureWord/pluginsConfigureWord_view"
//  "introJs"
],
    function(LessonManager, View, CampView) {
      LessonManager.module("PluginsApp.ConfigureWord", function(ConfigureWord, LessonManager, Backbone, Marionette, $, _) {
        var MAX_LENGTH = 12;
        var selectedPlugin;
        var selectedPluginIcon;
        var ActivityWordLists = [];
        var activity;
        //var pluginsLayout;

        var Controller = Marionette.Controller.extend({
          //Retrive current word list from server to show the list
          configureWordPlugins: function(args) {
            //Initialized the variable

            activity = args.model;

            if (activity.get("pluginApp") !== "") {
              selectedPlugin = activity.get("pluginApp");
            }

            if (activity.get("wordLists").length !== 0) {
              ActivityWordLists = activity.get("wordLists");
            }


            setUpLayout();
            //configureWordView(wordLists);


          }
//          ,
//          listCompatiblePlugins: function() {
//            //Show the plugins which are compatible
//            require(["entities/pluginType/pluginType_collection"], function() {
//              var fetchingPluginTypes = LessonManager.request("pluginTypes:entities");
//              $.when(fetchingPluginTypes).done(function(pluginTypes) {
////                console.log("plugins: %O", pluginTypes);
//                listPluginsConfigureWordView(pluginTypes);
//              });
//            });
//          }
        });

        function setUpLayout() {
          //Set the layout

          //LessonManager.dialogRegion.reset();
          var pluginsLayout = new View.ConfigureWordLayout();

          pluginsLayout.on("show", function() {
//            $("#myModal").modal({
//              //          backdrop: 'static',
//              //          keyboard: false
//            });
          });

          pluginsLayout.on("render", function() {
            LessonManager.reqres.setHandler("plugins:layout", function() {
              return pluginsLayout;
            });
            configureWordView();
            //listPluginsConfigureWordView(pluginsLayout.apps);
          });

          //Save Configuration
          pluginsLayout.on("configure:save", function() {
//            console.log("plugin selected" + selectedPlugin);
//            console.log("wordLists %O", wordLists);
            activity.set({
              "pluginApp": selectedPlugin,
              "pluginAppIcon": selectedPluginIcon,
              "wordLists": ActivityWordLists
            });
            saveActivity(activity);
            LessonManager.dialogRegion.closeDialog();            
          });

          pluginsLayout.on("configure:cancel", function() {
            console.log("cancel");
            //LessonManager.trigger("activities:list");            
//            LessonManager.dialogRegion.empty();  
            LessonManager.dialogRegion.closeDialog();
          });

          pluginsLayout.on("new:wordList", function() {
            LessonManager.trigger("wordLists:list");
          });

          pluginsLayout.on("configureWord:guide", function() {
            //TODO making guide
          });

          LessonManager.dialogRegion.show(pluginsLayout);

        }

        function configureWordView() {
          require(["entities/wordList/wordList_collection"], function() {
            var fetchingWordLists = LessonManager.request("wordList:entities");
            $.when(fetchingWordLists).done(function(wordLists) {
              var ConfigureWordModel = Backbone.Model.extend();
              var configureWordModel = new ConfigureWordModel;
              configureWordModel.set("wordLists", wordLists);

              //Show the wordlists
              var pluginsTypesConfigureWordView = new View.ConfigureWord({
                model: configureWordModel
              });

              pluginsTypesConfigureWordView.on("show", function() {
                //Initialiaze the wordlist view with previously selected wordlist
                //In activity
                if (ActivityWordLists.length !== 0) {
                  if (ActivityWordLists[0]) {
                    $("select#wl1 option[value='" + ActivityWordLists[0] + "']").attr("selected", "selected");
                  }
                  if (ActivityWordLists[1]) {
                    $("select#wl2 option[value='" + ActivityWordLists[1] + "']").attr("selected", "selected");
                  }
                  listPluginsConfigureWordView();
                  // LessonManager.PluginsApp.ConfigureWord.Controller.listCompatiblePlugins();
                }
              });

//          //List the Plugins
              var pluginsLayout = LessonManager.request("plugins:layout");
              pluginsLayout.wordsList.show(pluginsTypesConfigureWordView);

              pluginsTypesConfigureWordView.on("plugins:configureWord:wordlist", function(args, event) {
//            console.log("args %O",args);
//            console.log("args %O",event);
                var target = event.target;
                var selectedIndex = target.selectedIndex;
                var selectedValue = target.options[selectedIndex].value;
                var wordListIndex = target.id.substring(2);
//            console.log("test select %O", target.options[selectedIndex].value);
//            console.log("test select %O", target.options[selectedIndex].text);
//            console.log("test select %O", target.id);
//            console.log("wordListIndex" + wordListIndex);
                var wordList = {
                  listId: selectedValue,
                  index: wordListIndex
                };
                //A temporary setting place for the wordLists Selected            
                ActivityWordLists[wordList.index - 1] = wordList.listId;

                //LessonManager.request("configure:wordlist:save",wordList);
                listPluginsConfigureWordView();                  
              });
            });
          });
        }

        function listPluginsConfigureWordView() {
          require(["entities/pluginType/pluginType_collection"], function() {
            var fetchingPluginTypes = LessonManager.request("pluginTypes:entities");
            $.when(fetchingPluginTypes).done(function(pluginTypes) {
//                console.log("plugins: %O", pluginTypes);              
              //          console.log("pluginTypes %O", pluginTypes);
              var wordPlugins = _.find(pluginTypes.models, function(pluginType) {
                return pluginType.get("category") === "word";
              });

//          console.log("#wl1: " + $("#wl1").find(":selected").val());
//          console.log("#wl2: " + $("#wl2").find(":selected").val());
              var numberOfWordList = 0;
              var wl1_val = $("#wl1").find(":selected").val();
              var wl2_val = $("#wl2").find(":selected").val();
              if (wl1_val !== "0") {
                numberOfWordList += 1;
//            console.log("numberofwordLists: " + numberOfWordList);
              }
              if (wl2_val !== "0") {
                numberOfWordList += 1;
//            console.log("numberofwordLists: " + numberOfWordList);
              }

              //If there are word Plugins then display them
              if (wordPlugins) {

                //Set status accorrding to number of word lists            

//              var wordPluginsFiltered = _.filter(wordPlugins.get("plugins").models, function(wordPlugin) {
//                return wordPlugin.get("minLists") <= numberOfWordList;
//              });
//
//              var NewWordPlugins = Backbone.Collection.extend();
//
//              var newWordPlugins = new NewWordPlugins(wordPluginsFiltered);
//              var wordPlugins = wordPlugins.set("plugins", newWordPlugins);
                //if hit minumum set the plugin to active

                _.each(wordPlugins.get("plugins").models, function(wordPlugin) {
                  if (numberOfWordList >= wordPlugin.get("minLists")) {
                    wordPlugin.set("activated", true);
                  } else {
                    wordPlugin.set("activated", false);
                  }
                });


                //else we might need to prompt the user to create a new word list first before generating the compatible apps
                var pluginsListView = new View.Plugins({
                  model: wordPlugins
                });

                var pluginsLayout = LessonManager.request("plugins:layout");
                pluginsLayout.apps.show(pluginsListView);
                //Initialized the view for the plugins if one of them has been selected previously
                if (selectedPlugin) {
                  var pluginFound = wordPlugins.get("plugins").findWhere({plugin: selectedPlugin});
                  console.log("pluginFound" + pluginFound);
                  if (typeof pluginFound !== "undefined") {
                    pluginFound.set("selected", true);
                  }
                }

                //Checked the selected item that is being used and temperorarily save the config
                pluginsListView.on("plugins:plugin:selected", function(args) {
                  //console.log("childview:plugin:selected %O",args.model); 
                  selectedPlugin = args.model.get("plugin");
                  selectedPluginIcon = args.model.get("icon");
                  //Set it as selected
                  _.each(args.model.collection.models, function(plugin) {
                    plugin.set("selected", false);
                  });
                  args.model.set("selected", true);

                  console.log("pluginSelected: " + selectedPlugin);
                });
              }

            });
          });

        }

        function saveActivity(activity) {
          var tempActivity = activity.clone();
          tempActivity.save({}, {
            success: function(res) {
              console.log("saved");
              tempActivity.trigger('destroy', tempActivity, tempActivity.collection);
            },
            error: function(res) {
            }
          });
        }

        ConfigureWord.Controller = new Controller();
      });
      return LessonManager.PluginsApp.ConfigureWord.Controller;
    });