define(["app", "apps/students/list/list_view","server/sync"], function(TeacherSession, View,Sync) {
  TeacherSession.module("StudentsApp.List",
          function(List, TeacherSession, Backbone, Marionette, $, _) {
            List.Controller = {
              listStudents: function() {
                require(["entities/students/student_collection"], function() {
                  var fetchingStudents = TeacherSession.request("students:entities");
                  $.when(fetchingStudents).done(function(students) {
                    console.log(students);
                    var studentsListView = new View.Students({collection: students});
                    console.log(studentsListView);
                    studentsListView.on("students:toggle", function(childView, model) {
                      $("#studentsManageView").slideToggle();
//                      console.log("test");
                    });
                    studentsListView.on("students:trigger1", function(childView, model) {                     
                      console.log("test1");
                      Sync.TriggerPlugin("RANDOMIZER");
                    });
                    studentsListView.on("students:trigger2", function(childView, model) {                      
                      console.log("test2");
                      Sync.StartRandom();
                    });
                    studentsListView.on("students:trigger3", function(childView, model) {                      
                      console.log("test3");
                      Sync.MessageToServerStudentAnswer("3");
                    });
                    studentsListView.on("students:modal", function(childView, model) {
                      console.log("studentView");
                      require(["apps/students/show/show_controller"], function(ShowController) {
                        ShowController.showStudent();
                      });

                    });
                    TeacherSession.floatingRegion.show(studentsListView);
                  });
                });
              }
            };


          }
  );
  return TeacherSession.StudentsApp.List.Controller;
});
