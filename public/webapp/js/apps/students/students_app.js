define(["app", "apps/students/list/list_view"], function(LessonManager, View){
  LessonManager.module("Router.StudentsApp",
    function(StudentsApp, LessonManager, Backbone, Marionette, $, _) {
      StudentsApp.Router = Marionette.AppRouter.extend({
        appRoutes: {
          "join": "listStudents"
        }
      });
      //API name conflict with activities, need to check the documentation why is that during initialization
      studentAPI = {
        listStudents: function() {

          require(["entities/students/student_collection"], function() {
            LessonManager.request("students")
          });

        }
      };

      LessonManager.on("students:list", function() {
//        require(["entities/students/student_collection"], function() {
//          var fetchingStudents = LessonManager.request("students:entities");
//          $.when(fetchingStudents).done(function(students) {
//            console.log(students);
//            var studentsListView = new View.Students({collection: students});
//            console.log(studentsListView);
//            LessonManager.mainRegion.show(studentsListView);
//          });
//        });
        require(["apps/students/list/list_controller"],function(ListController){
          ListController.listStudents();
        });
      });
      LessonManager.addInitializer(function() {
        new StudentsApp.Router({
          controller: studentAPI
        });
      });
    });
});