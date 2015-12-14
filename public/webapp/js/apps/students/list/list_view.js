define(["app",
        "text!apps/students/list/templates/students_item.html",
        "text!apps/students/list/templates/students_template.html"
        ],
function(LessonManager, studentsItemTpl, studentsTemplateTpl) {
  LessonManager.module("StudentsApp.List.View",
          function(View, LessonManager, Backbone, Marionette, $, _) {
            View.Student = Marionette.ItemView.extend({
              class: "studentWrapper  col-md2 col-xs-12 col-lg1",
              template: _.template(studentsItemTpl)
            });

            View.Students = Marionette.CompositeView.extend({
              template: _.template(studentsTemplateTpl),
              id: "studentsView",
              childView: View.Student,
              childViewContainer: "#studentsManageView"
            });
          });

  return LessonManager.StudentsApp.List.View;
}
);

