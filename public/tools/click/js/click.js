
$(document).ready(function() {
  $(window).on('hashchange', function() {

    try {
      if (clicky) {
        clicky.log(window.location.href, document.title);
      }
    } catch (err) {
    }
  });

  $(".navbar-toggle").click(function(event) {
//    console.log(event);
    var elementNavBar = $(".navbar-collapse.my-navbar-collapse");
    if (elementNavBar.hasClass('in') || elementNavBar.hasClass('collapsing')) {
      event.stopPropagation();
      event.preventDefault();

      elementNavBar.removeClass("in");
      elementNavBar.removeClass("collapsing");
      elementNavBar.addClass("collapse");
    }
  });

  //for onboarding process
  if ($('#data-hideGuide').html() !== "true")
  {
    $(".adventure-guide").css("display", "block");
  }

  $(".adventure-guide").click(function(event) {
    if ($(event.target).hasClass("adventure-guide")) {
      guideClose(event);
    }
  });
  $(".js-guide-close").click(function(event) {
    guideClose(event);
  });

  $(".btn-start-guide").click(function(event) {
    event.preventDefault();
    $(".adventure-introduction-area").removeClass("small");
//    $(".js-guide-close")[0].click();
    $(".guide-intro").css("display", "none");
    $(".guide-view").css("display", "block");
    var guideView = $("#data-guide-view").html();
    $(".guide-view").html(guideView);
  });

  $("body").keydown(function(e) {
    switch (e.keyCode) {
//      case 37: //left
      case 33: //pageup        
        var buttonElement = $(".js-previous")[0];
        if (buttonElement) {
          if ($(buttonElement).is(':visible') && $(".js-previous .btn-previous").is(':visible')) {
            e.preventDefault();
            buttonElement.click();
          }
        }
        break;
//      case 39: //right
      case 34: //pagedown
        var buttonElement = $(".js-next")[0];
        if (buttonElement)
          if ($(buttonElement).is(':visible') && $(".js-next .btn-next").is(':visible')) {
            e.preventDefault();
            buttonElement.click();
          }
        break;
    }
  });
});


//function delayedClickImport() {
//  setTimeout(function() {
////    console.log("CLICKED");
//    $(".js-new-images").click();
//  }, 300);
//}

function activateFilePickerOld() {

  var frame = $("#frameDoc");
  frame.attr('src', "/tools/drive/filePickerGoogle.html");
  frame.css('display', 'block');

  var image = $("#imageDoc");
  image.css('display', 'none');
}
function activateFilePicker() {

  $("#filepicker")[0].contentWindow.checkPicker();
  var frame = $("#dialog-filepicker");
  frame.css('display', 'block');
}

function hideFilePicker() {
  var frame = $("#dialog-filepicker");
  frame.css('display', 'none');

}

function guideClose(event) {

  event.preventDefault();
  $(".adventure-guide").hide();

  $(".adventure-introduction-area").addClass("small");
//    $(".js-guide-close")[0].click();
  $(".guide-intro").css("display", "block");
  $(".guide-view").css("display", "none");
  $(".guide-view").html("");


  var hideGuide = $("#checkboxHide").is(":checked");
  if (hideGuide) {

    $.ajax({
      url: '/account/settings/guide',
      type: 'PUT',
      data: "hideGuide=" + hideGuide,
      success: function(response) {
//            parent.location.href = parent.location.href;//'/classrooms/'+ parent.idPath + '';
      }
    });
  }

  $(".js-tips")[0].click();
}