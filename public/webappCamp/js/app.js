define(["marionette", "apps/config/marionette/region/dialog"], function(Marionette, Dialog) {
  var CampManager = new Marionette.Application();

  CampManager.addRegions({
    mainRegion:"#main-region",
    dialogRegion: Dialog    
  });

  CampManager.navigate = function(route, options) {
    options || (options = {});
    Backbone.history.navigate(route, options);
  };

  CampManager.getCurrentRoute = function() {
    return Backbone.history.fragment;
  };

  CampManager.on("start", function() {
    if (Backbone.history) {
      require(["apps/camp/camp_app","apps/dialog/dialog_app",
        "apps/header/header_app","apps/classrooms/classrooms_app",
        "apps/adventures/adventures_app"],
          function() {
            Backbone.history.start();
            if (CampManager.getCurrentRoute() === "") {              
              CampManager.trigger("camp:show");
//              CampManager.trigger("header:list");
              require(["libs/fastclick/fastclick"], function() {
                FastClick.attach(document.body);
              });

            }
          });
      console.log("CampManager has started");
    }
  });
  return CampManager;
});
