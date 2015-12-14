define(["app",
  "text!apps/students/show/templates/studentShow_template.html"],
  function(TeacherSession,studentsShowTpl){
    TeacherSession.module("StudentsApp.Show.View",
      function(View,TeacherSession,Backbone,Marionette,$,_){
        View.Student = Backbone.Marionette.ItemView.extend({          
          template:_.template(studentsShowTpl),
          className:'modal fade',
          id:"myModal"
        });
      });
   return TeacherSession.StudentsApp.Show.View;
});

