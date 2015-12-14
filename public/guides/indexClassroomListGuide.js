var introJSRunning = false;
var intro;

$(document).ready(function() {
  $(".btn-intro").click(function(event) {
    event.preventDefault();
    introStart();
  });

  $(".btn-start-guide").click(function() {
    event.preventDefault();
    introStartDemo();
  });

  //$('body').chardinJs();

});

function introStart(isRefresh) {
  intro = introJs();
  var steps = [
    {
      intro: '<div style="width:280px"><strong>Classroom</strong>\n\
<br>A Classroom is a central location your students from a classroom may join'
    },
    {
      element: document.querySelector('.intro-create-classroom'),
      intro: '<strong>Create a Classroom</strong><br> Enter a Classroom name such as <i>"Amy\'s Maths Class"</i>\n\
<br><br>A Classroom address will be generated'
    }
  ];

  var steps2 = [
    {
      element: document.querySelector('.td-classroom-address'),
      intro: '<strong>Classroom Address</strong><br>Permanent address for your Classroom to be shared to your students\n\
<br><br>This address can be changed in <i>Configure Classroom</i>'
//    }, {
//      element: document.querySelector('.td-classroom-PIN'),
//      intro: '<strong>Classroom PIN</strong><br>\n\
//<br><br>'
    }, {
      element: document.querySelector('.td-classroom-adventure'),
      intro: '<strong>Assigned Adventure</strong><br>Students in this Classroom will have access to this Adventure<br><br>Select from existing Adventures or<br>Create a new Adventure\n\
<br><br>'
    }, {
      element: document.querySelector('.td-classroom-configuration'),
      intro: '<strong>Classroom Configuration</strong><br>- Launch Classroom in new tab<br>- View Reports<br>- Manage Students\n\
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


var introStartDemo = function() {
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
//    overlayOpacity: 0,
    skipLabel: 'Exit',
    steps: [
      {
        intro: "<h3>In this demo, <br>we will show you how to run your <br><strong>Classroom</strong></h3>"
      },
      {
        element: document.querySelector('.isLocked').parentElement,
        intro: "<h3>Classroom</h3>"
      },
      {
        element: document.querySelector('.isLocked').parentElement.querySelector('.dropdown-toggle'),
        intro: ""
      },
      {
        element: document.querySelector('.isLocked').parentElement.querySelector('.lessonLocked'),
        intro: "<h4>Select Adventure</h4>"
      },
      {
        element: document.querySelector('.isLocked').parentElement.querySelector('.td-classroom-address'),
        intro: "<h4>Launch Classroom</h4>"
      }
    ]
  });

  intro.onbeforechange(function(targetElement) {
    var delay = 1500;

    if ($(targetElement).hasClass("dropdown-toggle")) {
      delay = 1000;
      setTimeout(function() {
        $(targetElement).click();
      }, delay);
    } else if ($(targetElement).hasClass("lessonLocked") && !$(targetElement).hasClass("active")) {
//      $(targetElement).addClass("animated bounce");
      setTimeout(function() {
        $(targetElement).find("a")[0].click();
      }, delay);
    } else if ($(targetElement).hasClass("td-classroom-address")) {
      $(targetElement).addClass("animated flash");

      delay = 2000;
      var url = $(targetElement).find("a").attr('href') + "?auto=true";

      setTimeout(function() {
        location.href = url;
      }, delay);
    } else if ($(targetElement).is("tr")) {

    }
    else {
      delay = 3000;
    }

    setTimeout(function() {
      intro.nextStep();
    }, delay);
  });

  intro.oncomplete(function() {
//    demoNextStep();
  });
  intro.onexit(function() {
//    snapper.close();
  });

  intro.start();
};

