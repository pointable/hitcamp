define(["app", "apps/students/list/list_view"], function(TeacherSession, View){
  TeacherSession.module("Router.StudentsApp",
    function(StudentsApp, TeacherSession, Backbone, Marionette, $, _) {
      StudentsApp.Router = Marionette.AppRouter.extend({
        appRoutes: {
          "students": "listStudents"
        }
      });

      StudentsAPI = {
        listStudents: function() {
          console.log("list students")
        require(["apps/students/list/list_controller"],function(ListController){
          ListController.listStudents();
        });
        }
      };
      TeacherSession.on("students:list", function() {
//        require(["entities/students/student_collection"], function() {
//          var fetchingStudents = TeacherSession.request("students:entities");
//          $.when(fetchingStudents).done(function(students) {
//            console.log(students);
//            var studentsListView = new View.Students({collection: students});
//            console.log(studentsListView);
//            TeacherSession.mainRegion.show(studentsListView);
//          });
//        });

//      require(["apps/students/show/show_controller"],function(ShowController){
//        ShowController.showStudent();
//      });
        
        StudentsAPI.listStudents();
      });
      TeacherSession.addInitializer(function() {
        new StudentsApp.Router({
          controller: StudentsAPI
        });
      });
    });
});