define(["app",
  "text!apps/camp/show/templates/camp_layout.html",
  "bootstrap"
],
    function(CampManager, campLayout) {
      CampManager.module("CampApp.ShowCamp.View", function(View, CampManager, Backbone, Marionette, $, _) {
        View.Camp = Marionette.LayoutView.extend({
          className: "camp-wrapper row",
          regions: {
            adventuresRegion: "#adventures-panel",
            classroomsRegion: "#classrooms-panel"
          },
          template: _.template(campLayout),
          initialize: function() {
//            this.model.on('change', this.render);
          },
          triggers: {
            'click .js-new': 'activity:new',
            'click .js-tips': 'tips:show',
            'click .js-launch-guide': 'tips:launchguide'
          },
          onRender: function() {
//            console.log("####Camp is rendered");            
          },
          onShow: function() {
          }
        });
      });
      return CampManager.CampApp.ShowCamp.View;
    });