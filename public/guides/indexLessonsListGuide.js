var introJSRunning = false;
var intro;
$(document).ready(function() {
  $(".btn-intro").click(function(event) {
    event.preventDefault();
    introStart();
  });
});
function introStart(isRefresh) {
  intro = introJs();
  var steps = [
    {
      intro: '<div style="width:280px"><strong>Adventures</strong><br>Plan Adventures for your students by creating or importing lesson materials\n\
<br><br><i>Tips: </i>Prepare a new Adventure before each lesson</div>'
    },
    {
      element: document.querySelector('.intro-create-adventure'),
      intro: '<strong>Create an Adventure</strong><br> Enter a new Adventure title for an upcoming lesson\n\
<br><br>Example, <i>"Fun with Prime Numbers"</i>'
    }
  ];

  var steps2 = [    
    {
      element: document.querySelector('.td-adventure-name'),
      intro: '<strong>Adventure Title</strong><br>'
    },
    {
      element: document.querySelector('.td-adventure-configuration'),
      intro: '<strong>Configuration</strong><br>- Adventure Planner (Editor)<br>- Clone<br>- Delete\n\
<br><br>'
    }
  ];

  if (isRefresh) {
    steps = steps2;
  }
  else {
    if ($(".td-classroom-address").length) {
      steps.push.apply(steps, steps2);
    }
  }

  intro.setOptions({
//    tooltipPosition: 'left',
    keyboardNavigation: false,
    showStepNumbers: false,
    showBullets: false,
//    overlayOpacity: 0,
    skipLabel: 'Exit',
    steps: steps
  });
  intro.onbeforechange(function(targetElement) {
    if (!targetElement) {
      return;
    }

    if ($(targetElement).hasClass("js-nav-teststudents")) {
    } else if (targetElement.id === "open-apps") {
    }
  });

  intro.onexit(function() {
    introJSRunning = false;
  });
  intro.oncomplete(function() {
    introJSRunning = false;
  });

  intro.start();
  introJSRunning = true;
}

document.introStart = introStart;


