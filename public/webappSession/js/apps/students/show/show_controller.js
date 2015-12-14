define(["app","apps/students/show/show_view"],function(TeacherSession,View){
  TeacherSession.module("Students.Show",
  function(Show,TeacherSession,Backbone,Marionette,$,_){
    Show.Controller = {
      showStudent: function(){
        var studentView = new View.Student();
        TeacherSession.modalRegion.show(studentView);
      }
    };
  });
  return TeacherSession.Students.Show.Controller;
});
