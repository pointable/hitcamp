
/* global app:true */

(function() {
  'use strict';

  jq(document).ready(function() {
//    window.idLesson = $('#idLesson').html();

    if (window.isLoggedIn) {
      jq(".js-import").click(function(event) {
        event.preventDefault();
        jq.ajax({
          url: '/adventures/edit/' + window.idLesson + '/clone',
          type: 'POST',
          data: "import=true",
          success: function(response) {
            if (response.success) {
              bootbox.confirm("Import Successful!<br> Open Adventure Editor?", function(result) {
                if (result) {
                  location.href = '/adventures/edit/' + response.idLesson + '/';
                }
              });
//              alert("Import Successful!");
            } else {
              bootbox.confirm("Error! Import unsuccessful", function() {

              });
//              alert("Error! Import unsuccessful");
            }
//            parent.location.href = parent.location.href;//'/classrooms/'+ parent.idPath + '';
          }
        });
      });
    } else {
      jq(".js-import").click(function(event) {
        event.preventDefault();
        var message = $("#div-getstarted").html();
        bootbox.dialog({
          message: message,
          title: "Import Adventure",
          buttons: {
          }
        });
      });
    }

//    console.log(window.classroomPath);


  });
}());

function getPath() {
//  console.log(window.classroomPath);
  return window.classroomPath;
}