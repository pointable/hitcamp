define(["marionette", "apps/config/marionette/region/dialog"
//      , "introJs"
], function(Marionette, Dialog) {
  var LessonManager = new Marionette.Application();

  LessonManager.addRegions({
    headerRegion: "#header-region",
    mainRegion: "#main-region",
    dialogRegion: Dialog
  });

  LessonManager.navigate = function(route, options) {
    options || (options = {});
    Backbone.history.navigate(route, options);
  };

  LessonManager.getCurrentRoute = function() {
    return Backbone.history.fragment;
  };

  LessonManager.on("start", function() {
    if (Backbone.history) {
      require(["apps/activities/activities_app", "apps/students/students_app",
        "apps/elements/elements_app", "apps/dialog/dialog_app",
        "apps/header/header_app", "apps/wordLists/wordLists_app",
        "apps/plugins/plugins_app"],
          function() {
            Backbone.history.start();
            if (LessonManager.getCurrentRoute() === "") {
              //LessonManager.trigger("activities:list:initialized");
              LessonManager.trigger("activities:listAdventures:initialized");
              LessonManager.trigger("header:list");
              require(["libs/fastclick/fastclick"], function() {
                FastClick.attach(document.body);
              });

            }
          });
      console.log("Lesson Manager has started");

    }

  });
  return LessonManager;
});
