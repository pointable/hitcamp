define(["app",
  "apps/activities/newAdventure/newAdventure_view",
  "bootbox",
  "bootstrap"
],
    function(LessonManager, View, bootbox) {
      LessonManager.module("ActivitiesApp.NewAdventure",
          function(NewAdventure, LessonManager, Backbone, Marionette, $, _) {
            NewAdventure.Controller = {
              newAdventureTypes: function(options) {

                var AdventureType = Backbone.Model.extend({
                  idAttribute: '_id',
                  defaults: {
                    "title": "",
                    "type": "",
                    "desc": "",
                    "icon": ""
                  }

                });
                var AdventureTypeCollection = Backbone.Collection.extend({
                  model: AdventureType
                });

                var initializedAdventureTypes = [
                  {
                    "_id": "1", "title": "Media/Questions", "type": "media",
                    "desc": "Insert media [Powerpoint | Pdf | Youtube Videos] with optional question and answers",
                    "icon": "fa-file-image-o"
                  },
                  {"_id": "2", "title": "Word List", "type": "wordList",
                   "desc": "list of words with in their own categories. Useful for quick assesment ",
                   "icon": "fa-th-list"}
//                  {"_id": "3","title":"Picture List", "desc": "fa-random", "icon": "Randomizer"}
                ];
                var adventure_types = new AdventureTypeCollection(initializedAdventureTypes);
                newAdventureView(adventure_types);
//                //Server                
//                require(["entities/activity/activity_collection"], function() {
//                  var fetchingActivities = LessonManager.request("activity:entities");
//                  $.when(fetchingActivities).done(function(activities) {
//                    listAdventureView(activities);
//                  });
//                });
              }
            };
            function newAdventureView(adventure_types) {

              var adventureTypesView = new View.AdventureTypes({
                //model: activity,
                collection: adventure_types
              });

              LessonManager.dialogRegion.show(adventureTypesView);

              $("#myModal").modal(
                  {
//          backdrop: 'static',
//          keyboard: false
                  });
              adventureTypesView.on("childview:adventureType:select", function(view) {
                console.log("adventureType %O", view);
                LessonManager.trigger("adventureType:select", view);
                this.trigger("dialog:close");
              });

              adventureTypesView.on("adventure:new:close", function(element) {
                this.trigger("dialog:close");
              });
            }
          });

      return LessonManager.ActivitiesApp.NewAdventure.Controller;
    });


