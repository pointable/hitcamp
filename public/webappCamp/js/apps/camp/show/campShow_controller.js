define(["app",
  "apps/camp/show/campShow_view",
  "bootbox",
  "chardinJs",
//  "classroomGuide",
  "bootstrap"
],
    function(CampManager, View, bootbox) {
      CampManager.module("CampApp.ShowCamp",
          function(Show, CampManager, Backbone, Marionette, $, _) {
            var reqres = new Backbone.Wreqr.RequestResponse();
            Show.Controller = {
              showCamp: function(options) {
                //Show the layout and trigger render when needed
//                  require(["entities/activity/activity_collection"], function() {
//                    var fetchingActivities = CampManager.request("activity:entities");
//                    $.when(fetchingActivities).done(function(activities) {
//                      listAdventureView(activities);
//                    });
//                  });             
                _view.showCampView();

              },
            };
            _view = {
              showCampView: function() {
                var campView = new View.Camp();
                campView.on("show", function() {
                  CampManager.trigger("classrooms:list", campView.classroomsRegion);
                  CampManager.trigger("adventures:list", campView.adventuresRegion);
                });

                CampManager.mainRegion.show(campView);


                campView.on("tips:show", function() {
                  //debugger;
//                  e.preventDefault();
//                  e.stopPropagation();

                  $("#classrooms-panel").scrollTop(0);
                  $("#adventures-panel").scrollTop(0);
                  $("#adventures-panel").addClass("guide-mode");
                  $("#classrooms-panel").addClass("guide-mode");
                  $('body').one('chardinJs:stop', function() {
                    $("#adventures-panel").removeClass("guide-mode");
                    $("#classrooms-panel").removeClass("guide-mode");
                  });
                  setTimeout(function() {
                    $('body').chardinJs('start');

                  }, 400);
                });
                campView.on("tips:launchguide", function() {
//                  setTimeout(function() {
                  $('body').chardinJs('stop');
//                  }, 400);           
                  setTimeout(function() {
                    $(".adventure-guide").css("display", "block");
                  }, 600);
                });
              }
            }
            function showCampView(activities) {
              reqres.setHandler("activities", function() {
                return activities;
              });
            }
          });

      return CampManager.CampApp.ShowCamp.Controller;
    });


