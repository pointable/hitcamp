define(["marionette", "apps/config/marionette/region/dialog"], function(Marionette, ModalRegion) {
  var TeacherSession = new Marionette.Application();

  var routeHits = 0;

  TeacherSession.addRegions({
    headerRegion: "#header-region",
    mainRegion: "#main-region",
    pluginsRegion: "#plugins-region",
    pluginAppRegion: "#pluginApp-region",
    dialogRegion: ModalRegion
  });

  TeacherSession.navigate = function(route, options) {
    options || (options = {});
    routeHits += 1;
    Backbone.history.navigate(route, options);
  };

  TeacherSession.getCurrentRoute = function() {
    return Backbone.history.fragment;
  };

  TeacherSession.back = function() {
    if (routeHits > 1) {
      //more than one route hit -> user did not land to current page directly
      parent.window.history.back();
    } else {
      //otherwise go to the home page. Use replaceState if available so
      //the navigation doesn't create an extra history entry
      this.navigate('activities', {trigger: true, replace: true});
    }
  };

  TeacherSession.backToRoot = function() {
    TeacherSession.trigger("activities:listActivities:initialized");
  };

  TeacherSession.backToHome = function() {
    window.open("/", "_top");
  };

  TeacherSession.on("before:start", function() {
    if (!document.socketID) {
      TeacherSession.trigger("dialog:show:loading");
      console.log("####Initialized before activity");
    } else {
      console.log("####socket ready");
    }
  });

  TeacherSession.on("start", function() {
    if (Backbone.history) {
      require(["apps/elements/elements_app", "apps/activities/activities_app",
        "apps/dialog/dialog_app", "apps/plugins/plugins_app","apps/responses/responses_app"
      ],
          function() {
            Backbone.history.start();
            if (TeacherSession.getCurrentRoute() === "") {
              //TeacherSession.trigger("activities:list:initialized");
              TeacherSession.trigger("activities:listActivities:initialized");
              TeacherSession.trigger("plugins:list");
            }else{
              //Initialize this as long as the app is loaded
              TeacherSession.trigger("plugins:list");
            }
            //Set timeout for loading apps
            var mainRegionTimeout = setTimeout(function() {
              if ($("#main-region").html().length === 0) {
                location.reload();
              }
              console.log("$('#main-region').html().length :" + $("#main-region").html().length);
            }, 5000);

          });
      console.log("Teacher Session has started");
    }
  });
  return TeacherSession;
});
