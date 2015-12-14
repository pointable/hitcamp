define(["app", "apps/students/list/list_view"], function(LessonManager, View) {
  LessonManager.module("StudentsApp.List",
    function(List,LessonManager, Backbone, Marionette, $,_) {
      List.Controller = {
        listStudents: function() {        
          require(["entities/students/student_collection"], function() {
            var fetchingStudents = LessonManager.request("students:entities");
            $.when(fetchingStudents).done(function(students) {
              console.log(students);
              var studentsListView = new View.Students({collection: students});
              console.log(studentsListView);
              LessonManager.mainRegion.show(studentsListView);
            });
          });
        }
      };

      
    }
  );
  return LessonManager.StudentsApp.List.Controller;
});
