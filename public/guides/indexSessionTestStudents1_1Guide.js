
$(document).ready(function() {

  $('.bxslider').bxSlider({
    infiniteLoop: false,
    hideControlOnEnd: true,
    mode: 'fade',
    captions: true
  });

  $('.bx-viewport').css("overflow-y", "visible");
//  $('.bx-viewport').css("left", "0px");
  
  $('.js-end-demo').on("click", function (){
    parent.$(".js-guide-close")[0].click();
  });
});
    