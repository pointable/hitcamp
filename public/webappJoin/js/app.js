define(["marionette", "apps/config/marionette/region/dialog"], function(Marionette, Dialog) {
  var StudentManager = new Marionette.Application();

  var routeHits = 0;

  StudentManager.addRegions({
    headerRegion: "#header-region",
    mainRegion: "#main-region",
    dialogRegion: Dialog
  });

  StudentManager.navigate = function(route, options) {
    options || (options = {});
    routeHits += 1;
    console.log(routeHits);
    Backbone.history.navigate(route, options);
  };

  StudentManager.getCurrentRoute = function() {
    return Backbone.history.fragment;
  };

  StudentManager.back = function() {
    if (routeHits > 1) {
      //more than one route hit -> user did not land to current page directly
      window.history.back();
      console.log("#########going back ");
    } else {
      //otherwise go to the home page. Use replaceState if available so
      //the navigation doesn't create an extra history entry
      //this.navigate('adventures', {trigger: false, replace: true});
      StudentManager.trigger("activities:listAdventures:initialized");
      console.log("#########list Adventures ########");
    }
  };

  StudentManager.backToRoot = function() {
    StudentManager.trigger("activities:listActivities:initialized");
  };

  StudentManager.on("initialize:before", function() {
    if (!document.socketID) {
      StudentManager.trigger("dialog:show:loading");
      console.log("####Initialized before activity");
    } else {
      console.log("####socket ready");
    }
  });

  StudentManager.on("initialize:after", function() {
    if (Backbone.history) {
      require(["apps/elements/elements_app", "apps/activities/activities_app",
        "apps/plugins/plugins_app","apps/dialog/dialog_app","apps/responses/responses_app"],
          function() {
            Backbone.history.start();

            //notify pluginHandler this is ready

//          var event = new CustomEvent('AppReady', {detail: {}});
//          document.dispatchEvent(event);
//            StudentManager.routesHit = 0;
//            //keep count of number of routes handled by your application
//            StudentManager.on('navigate', function() {
//              StudentManager.routesHit++;
//              console.log(StudentManager.routesHit);
//            }, this);


            if (StudentManager.getCurrentRoute() === "") {

              $(document).off('initializeApps');
              $(document).on('initializeApps', function(e) {

                var messageReceived = e.originalEvent.detail;
                switch (messageReceived.type)
                {
                  //set all custom message type here
                  case 'ListActivities':
                    console.log("###list activities since no mini app");
                    StudentManager.trigger("activities:listAdventures:initialized");
                    //StudentManager.trigger("activities:list:initialize");                  
                    break;
                }
              });

              //   StudentManager.trigger("students:list");
            }
            var mainRegionTimeout = setTimeout(function() {

              if ($("#main-region").html().length === 0) {
//                location.reload();
              }
              console.log("$('#main-region').html().length :" + $("#main-region").html().length);
            }, 5000);
          });
      console.log("Student Manager has started");
    }

  });
  return StudentManager;
});
