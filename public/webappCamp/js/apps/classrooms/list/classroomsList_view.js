define(["app",
  "text!apps/classrooms/list/templates/classrooms_item.html",
  "text!apps/classrooms/list/templates/classrooms_layout.html",
  "bootstrap"
],
    function(CampManager, classroomsItemTpl, classroomsLayoutTpl) {
      CampManager.module("ClassroomsApp.ListClassrooms.View", function(View, CampManager, Backbone, Marionette, $, _) {

        View.Classroom = Marionette.ItemView.extend({
          className: "classroom-wrapper js-show-adventure",
          template: _.template(classroomsItemTpl),
          events: {
            'click .js-launch': 'launchClassroomClicked',
            'click .js-preview': 'previewClassroomClicked',
            'click .js-reports': 'showReportClicked',
            'click .js-students': 'manageStudentsClicked',
            'click .js-edit': 'editClassroomClicked'
          },
          triggers: {
            'click .js-activate': 'classroom:activate'
          },
          modelEvents: {
            'change:selected': "selectedChanged",
            'change:backgroundThumbnailURL': "imageChanged"
          },
          initialize: function() {
            // this.model.on('change', this.render);
            this.style.select(this);
          },
          selectedChanged: function(args, val) {
            this.style.select(this);
          },
          imageChanged: function(args, val) {
            this.render();
            var mapHolder = $(this.el).find(".classroom-map-holder");
            var lessonName = $(this.el).find(".classroom-map-holder").next();
            mapHolder.addClass('animated swing');
            lessonName.addClass('animated swing');
          },
          onShow: function() {
            $('.dropdown-toggle').dropdown();
          },
          onRender: function() {
            $('.dropdown-toggle').dropdown();
            this.style.select(this);
            // alert("render again");
          },
          style: {
            select: function(view) {
              var selected = view.model.get("selected");
              if (selected) {
//                view.$el.find(".js-activate").text("Deactivate");
//                view.$el.find(".classroom-area").css("opacity", 1.0);
//                view.$el.find(".classroom-area").addClass("classroom-selected");
                view.$el.find(".classroom-title-wrapper").addClass("classroom-selected");
              } else {
//                view.$el.find(".classroom-area").removeClass("classroom-selected");s
                view.$el.find(".classroom-title-wrapper").removeClass("classroom-selected");
//                view.$el.find(".classroom-area").css("opacity", 0.5);
//                view.$el.find(".js-activate").text("Activate");
              }
            }
          },
          launchClassroomClicked: function(e) {
            e.preventDefault();
            this.trigger("classroom:launch", this);
          },
          previewClassroomClicked: function(e) {
            e.preventDefault();
            location.href = $(e.target).attr('href');//this.model.url() + '/teststudents/';
          },
          showReportClicked: function(e) {
//            console.log("report");
            e.preventDefault();
            location.href = this.model.url() + '/reports/';
          },
          manageStudentsClicked: function(e) {
            e.preventDefault();
//            console.log("manage");
            location.href = this.model.url() + '/students/';
          },
          editClassroomClicked: function(e) {
            e.preventDefault();
//            console.log("edit");
            location.href = this.model.url() + '/configure/';
          }

        });
        View.Classrooms = Marionette.CompositeView.extend({
          className: "classroomsLayout-wrapper",
          template: _.template(classroomsLayoutTpl),
          childView: View.Classroom,
          childViewContainer: "#classrooms-container",
          collectionEvents: {
            "add": "classroomAdded"
          },
          classroomAdded: function(classroom) {
            classroom.setSelected();
            this.attachHtml = function(collectionView, childView, index) {
              collectionView.$el.find("#classrooms-container").prepend(childView.el);
            };
          },
          initialize: function() {
            //this.collection.on('change', this.render);
            //          this.listenTo(this.collection, "add", function(collectionView, childView, index) {

          },
          triggers: {
            'click .js-new': 'classroom:new'
          },
          onRender: function() {
            console.log("####Classrooms are rendered");
            //$('.dropdown-toggle').dropdown();
          },
          onShow: function() {
            $('.dropdown-toggle').dropdown();
          }
        });
      });
      return CampManager.ClassroomsApp.ListClassrooms.View;
    });