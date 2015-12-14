define(["app",
        "text!apps/students/list/templates/students_item.html",
        "text!apps/students/list/templates/students_template.html"
        ],
function(TeacherSession, studentsItemTpl, studentsTemplateTpl) {
  TeacherSession.module("StudentsApp.List.View",
          function(View, TeacherSession, Backbone, Marionette, $, _) {
            View.Student = Marionette.ItemView.extend({
              className: "studentWrapper  col-md2 col-xs-12 col-lg1",
              template: _.template(studentsItemTpl)
            });

            View.Students = Marionette.CompositeView.extend({
              template: _.template(studentsTemplateTpl),
              id: "studentsView",
              childView: View.Student,
              childViewContainer: "#studentsManageView",
              triggers:{
                "click .js-toggle":"students:toggle",
                "click .js-modal":"students:modal",
                "click .js-trigger1":"students:trigger1",
                "click .js-trigger2":"students:trigger2",
                "click .js-trigger3":"students:trigger3"
              }              
            });
          });
  return TeacherSession.StudentsApp.List.View;
}
);

