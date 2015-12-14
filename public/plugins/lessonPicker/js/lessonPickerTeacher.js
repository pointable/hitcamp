var PLUGIN_NAME = 'LESSON_PICKER';

$(document).ready(function() {

  if (parent.isTeacher) {
    $.getJSON("/adventures/edit/", function(data) {
      var lessons = data.data;

      var template = _.template($("#templateLesson").html());
      var fullHTML = "";

//      console.log(parent.window.idLesson );
      _.each(lessons, function(lesson) {
        console.log(lesson._id);
        console.log(parent.window.idLesson);
        fullHTML += template({lesson: lesson, currentLesson: parent.window.idLesson });
      });
      console.log(data);
      $("#lessonList").html(fullHTML);
    });
  }
  $(document).on('click', 'button', function(event) {
    event.preventDefault();
    event.stopPropagation();
//     console.log(event.target.id);
    var idLesson = event.target.value;
//    console.log(idLesson);
    top.location.href = '/adventures/edit/' + idLesson + '';
//    $.ajax({
//      url: '/classrooms/' + parent.idSession + '/',
//      type: 'PUT',
//      data: "idLesson=" + idLesson,
//      success: function(response) {
//        parent.location.href = parent.location.href;//'/classrooms/'+ parent.idPath + '';
//      }
//    });
  });

  $(document).on('click', 'a[class^="list-group-item"]', function(event) {
    event.preventDefault();
//    var parentLi = $(event.target).parents('a');
//     console.log(event.target.id);
    var idLesson = event.target.id;

    $(event.target).parents('.list-group').find('a').removeClass("active");
    $(event.target).addClass("active");

    $.ajax({
      url: '/classrooms/' + parent.idSession + '/',
      type: 'PUT',
      data: "idLesson=" + idLesson,
      success: function(response) {
        parent.location.href = parent.location.href;//'/classrooms/'+ parent.idPath + '';
      }
    });

  });

  $("#lessonNew").click(function(event) {
    parent.location.href = '/adventures/edit/';
  });

});

