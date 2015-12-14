
var isAuto = false;

jq(document).ready(function() {
  var parameters = getUrlVars(document);
  console.log(parameters);
  if (parameters && parameters.auto) {
    isAuto = true;

    setTimeout(function() {
      introStartDemoAutoStartTestStudents();
    }, 1500);
  }

  jq(".btn-intro").click(function(event) {
    event.preventDefault();

    if (isAuto) {
      introStartDemoAutoStartTestStudents();
    } else {
      introStartGuide();
    }
  });
});

function introStartGuide() {
  snapper.close();
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    overlayOpacity: 1,
    skipLabel: 'Exit',
    steps: [
      {
        intro: "<h4>Teacher's View Guide</h4>"
      },
      {
        element: document.querySelector('.path-title'),
        intro: "<div class='center'><strong>Classroom Address</strong><br>Your students may join this classroom on their mobile devices</div>",
        position: "bottom"
      },
      {
        element: document.querySelector('#adventure-view'),
        intro: "<div class='center'><strong>Current Adventure assigned to this classroom</strong><br></div>",
        position: "top"
      },
      {
        element: document.querySelector('.js-show-plugins'),
        intro: "<div class='center'><strong>Campfire Apps</strong><br>Students getting bored? <br> Trigger an interactive app on students' devices</div>",
        position: "left"
      },
      {
        element: document.querySelector('.plugin-types-area .row:nth-child(1)'),
        intro: "<div class='center'>Get students' responses in real-time</div>",
        position: "left"
      },
      {
        element: document.querySelector('.plugin-types-area .row:nth-child(2)'),
        intro: "<div class='center'>Select a student to answer your question</div>",
        position: "left"
      },
      {
        element: document.querySelector('.plugin-types-area .row:nth-child(3)'),
        intro: "<div class='center'>Fun activities with your Word Lists</div>",
        position: "left"
      },
//      {
//        element: document.querySelector('.messenger-actions'),
//        intro: "<strong>Sync Slides</strong><br>When activated, other devices will follow this screen"
//      },
      {
        element: document.querySelector('#manageClass'),
        intro: "<strong>Manage student groupings</strong><br>"
      }
    ]
  });

  intro.onbeforechange(function(targetElement) {
    if (!targetElement) {
      return;
    }

    if (jq(targetElement).is(".plugin-types-area .row:nth-child(1)")) {
      jq(".js-show-plugins").click();
//      snapper.open('left');
    } else if (targetElement.id === "open-apps") {
      snapper.close();
      location.href = "#campfire-apps";
    } else if (targetElement.id === "open-adventure") {
      snapper.close();
      location.href = "#adventures";
    } else if (targetElement.id === "manageClass") {
      snapper.open('right');
//      location.href = "#campfire-apps";
    } else {
      snapper.close();
    }
  });

  intro.oncomplete(function() {
    snapper.close();
  });
  intro.onexit(function() {
    snapper.close();
  });

  intro.start();
}


function introStartDemoAutoStartTestStudents() {
  snapper.close();
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
    overlayOpacity: 0,
    skipLabel: 'Exit',
    steps: [
      {
        intro: "<h3> Teacher's View</h3><br><h4>This is your <b>Adventure Map</h4>"
      },
      {
        intro: "<h3> Teacher's View</h3><br><h4>For this demo, we will <br><b>simulate 2 </b> students</h4>"
      },
      {
        element: document.querySelector('#open-left'),
        intro: "<h3>Menu</h3>"
      },
      {
        element: document.querySelector('.js-nav-teststudents'),
        intro: "<h3> Test Students' View</h3>"
      }
    ]
  });

  intro.onbeforechange(function(targetElement) {

    var delay = 1100;

    console.log(jq(targetElement));
    if (!targetElement) {
//      return;
    } else {
      if (jq(targetElement).hasClass("js-nav-teststudents")) {
        snapper.open('left');
        jq(targetElement).addClass("animated flash");
        delay = 2000;
      } else if (jq(targetElement)[0].id === "open-left") {
        jq(targetElement).addClass("animated flash");
//        snapper.open('left');
        delay = 1500;
      } else {
        snapper.close();
        delay = 3500;
      }
    }

    setTimeout(function() {
      intro.nextStep();
    }, delay);

  });

  intro.oncomplete(function() {
//    snapper.close();
    jq(".js-nav-teststudents").parent().addClass("nav-bar-active");
    window.location.href = window.idPath + '/teststudents/2?auto=true';
  });
  intro.onexit(function() {
    snapper.close();
  });

  intro.start();
}

function introStartDemoCampfireApps() {
  snapper.close();
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
    overlayOpacity: 0,
    skipLabel: 'Exit',
    steps: [
      {
        element: document.querySelector('#open-apps'),
        intro: "<h4>Campfire Apps</h4>"
      }
//      {
//        element: document.querySelector('.toolbar'),
//        intro: "<strong>Open Response App</strong><br> Click to launch"
//      }
    ]
  });

  intro.onbeforechange(function(targetElement) {
    var delay = 1100;

    if (targetElement.id === "open-apps") {
      delay = 2000;
      setTimeout(function() {
        location.href = location.protocol + '//' + location.host + location.pathname + "#campfire-apps";
      }, 1000);
    }

    setTimeout(function() {
      intro.nextStep();
    }, delay);
  });

  intro.oncomplete(function() {
//    setTimeout(function() {
    parent.demoNextStep();
//    }, 1000);
  });
  intro.onexit(function() {
  });
  intro.start();
}

function introStartDemoCampfireAppsOpen(selector) {
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
    overlayOpacity: 0,
    skipLabel: 'Exit',
    steps: [
      {
        element: document.querySelector(selector).parentElement,
        intro: "<h4>Open Campfire App</h4>"
      }
    ]
  });
  intro.onbeforechange(function(targetElement) {
    setTimeout(function() {
      intro.nextStep();
      targetElement.click();
    }, 2000);
  });
  intro.oncomplete(function() {
    parent.demoNextStep();
  });
  intro.onexit(function() {
  });
  intro.start();
}

function introStartDemoAdventureMapIntroduction() {
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
    overlayOpacity: 0,
    skipLabel: 'Exit',
    steps: [
      {
        intro: "<div class='center'><h3>Teacher's Adventure Map</h3></div>"
      }
    ]
  });

  intro.onbeforechange(function(targetElement) {
    console.log("intro");
    var delay = 1500;
    setTimeout(function() {
      intro.nextStep();
    }, delay);
  });

  intro.oncomplete(function() {
    console.log("next step");
    parent.demoNextStep();
  });
  intro.onexit(function() {
  });
  intro.start();
}

function introStartDemoAdventureMapCheckRunningApps() {
  var action = jq(".messenger-phrase").next();
  console.log("action " + action);

  if (jq(action[2]).text() === "End Campfire App") {
    action[2].click();
  }
  parent.demoNextStep();
}

function introStartDemoAdventureMapStart() {
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
    overlayOpacity: 0,
    skipLabel: 'Exit',
    steps: [
      {
        element: document.querySelector('.messenger'),
        intro: "<div class='center'><h2>Activate Sync Slides</h2></div>",
        position: "top"
      },
      {
        element: document.querySelectorAll('.fa-file-image-o')[3],
        intro: "<div class='center'><h3>Adventure Checkpoint</h3></div>"
      }
    ]
  });
  intro.onbeforechange(function(targetElement) {

    var delay = 1100;
    console.log(jq(targetElement));
    if (!targetElement) {
//      return;
    } else {
      if (jq(targetElement).find(".messenger-phrase").length > 0) {
        var targets = jq(targetElement).find(".messenger-phrase");
        _.each(targets, function(target) {
          if (jq(target).next().text() === "Activate") {
            jq(target).next().addClass("animated flash");
            console.log("activate it");
            setTimeout(function() {
              jq(target).next()[0].click();
            }, 1000);
          }
        });
        delay = 1000;
      } else if (jq(targetElement).hasClass("fa-file-image-o")) {
        console.log("media file");
        setTimeout(function() {
          jq(targetElement).closest(".js-move").mousedown();
          jq(targetElement).closest(".js-move").mouseup();
        }, 2000);
        delay = 2000;
      } else {
        snapper.close();
        delay = 1000;
      }
    }

    setTimeout(function() {
      intro.nextStep();
    }, delay);
  });

  intro.oncomplete(function() {
    setTimeout(function() {
      parent.demoNextStep();
    }, 2000);
  });
  intro.onexit(function() {
  });
  intro.start();
}

function introStartDemoAdventureMapDialog() {
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
    overlayOpacity: 0,
    skipLabel: 'Exit',
    steps: [
      {
        element: document.querySelector('.modal-dialog'),
        intro: "<div class='center' ><h3>Choose one element</h3><div>"
      }
    ]
  });
  intro.onbeforechange(function(targetElement) {

    var delay = 1100;

    console.log(jq(targetElement));
    if (!targetElement) {
      return;
    } else {
      if (jq(targetElement).hasClass("modal-dialog")) {
        jq(jq(targetElement).find(".js-show")[0].offsetParent).addClass("animated fadeIn");
        setTimeout(function() {
          jq(targetElement).find(".js-show").click();
        }, 1000);
        delay = 1000;
      } else {
        snapper.close();
        delay = 1000;
      }
    }

    setTimeout(function() {
      intro.nextStep();
    }, delay);
  });

  intro.oncomplete(function() {
    parent.demoNextStep();
  });
  intro.onexit(function() {
  });
  intro.start();
}

function introStartDemoAdventureMapNextElementStart() {
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
    overlayOpacity: 0,
    skipLabel: 'Exit',
    steps: [
      {
        intro: "<div class='center'><h2>Sync Slides </h2><br><h3>Student's view follow yours.</h3><div>"
      }
    ]
  });
  intro.onbeforechange(function(targetElement) {

    var delay = 3000;
    setTimeout(function() {
      intro.nextStep();
    }, delay);
  });

  intro.oncomplete(function() {
    parent.demoNextStep();
  });
  intro.onexit(function() {
  });
  intro.start();
}

function introStartDemoAdventureMapNextElement() {
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
    overlayOpacity: 0,
    skipLabel: 'Exit',
    steps: [
      {
        element: document.querySelector('.btn-next'),
        intro: "<div class='center'><h3>Next</h3></div>",
        position: 'left'
      }
    ]
  });
  intro.onbeforechange(function(targetElement) {

    var delay = 1100;

    console.log(jq(targetElement));
    if (!targetElement) {
      return;
    } else {
      if (jq(targetElement).hasClass("btn-next")) {
        jq(targetElement).addClass("animated flash");
        console.log("next");
        setTimeout(function() {
          jq(targetElement).closest(".js-question-next").click();
        }, 1200);
        delay = 1200;
      } else {
        delay = 3000;
      }
    }

    setTimeout(function() {
      intro.nextStep();
    }, delay);
  });

  intro.oncomplete(function() {
    parent.demoNextStep();
  });
  intro.onexit(function() {
  });
  intro.start();
}

function introStartDemoAdventureMapElementEnd() {
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
    overlayOpacity: 0,
    skipLabel: 'Exit',
    steps: [
      {
        intro: "<div class='center'><h3>Close</h3></div>",
        element: document.querySelector('.btn-close'),
        position: "left"
      }
    ]
  });
  intro.onbeforechange(function(targetElement) {
    var delay = 1100;
    console.log(jq(targetElement));
    if (!targetElement) {
      return;
    } else if (jq(targetElement).hasClass("btn-close")) {
      jq(targetElement).addClass("animated flash");
      console.log("Close element");
      setTimeout(function() {
        jq(".js-question-close").click();
      }, 1000);
      delay = 1000;
    } else {
      delay = 2000;
    }

    setTimeout(function() {
      intro.nextStep();
    }, delay);
  });

  intro.oncomplete(function() {
    parent.demoNextStep();
  });
  intro.onexit(function() {
  });
  intro.start();
}

function introStartDemoAdventureMapDialogEnd() {
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
    overlayOpacity: 0,
    skipLabel: 'Exit',
    steps: [
      {
        element: document.querySelector('.modal-dialog'),
        intro: "<div class='center'><h2>Back to Adventure Map</h2></div>",
        position: "left"
      }
    ]
  });
  intro.onbeforechange(function(targetElement) {

    var delay = 1100;

    console.log(jq(targetElement));
    if (!targetElement) {
      return;
    } else {
      if (jq(targetElement).hasClass("modal-dialog")) {
        console.log("close dialog");
        jq(targetElement).find(".js-close").addClass("animated flash");
        setTimeout(function() {
          jq(targetElement).find(".js-close").click();
        }, 1000);
        delay = 1000;
      } else {
        delay = 2000;
      }
    }

    setTimeout(function() {
      intro.nextStep();
    }, delay);
  });

  intro.oncomplete(function() {
    parent.demoNextStep();
  });
  intro.onexit(function() {
  });
  intro.start();
}



function introStartDemoAdventureMapEnd() {
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
    overlayOpacity: 0,
    skipLabel: 'Exit',
    steps: [
      {
        intro: "<div class='center'><h3>End of Sync Slides.</h3><div>"
      }
    ]
  });
  intro.onbeforechange(function(targetElement) {

    var delay = 2000;
    setTimeout(function() {
      intro.nextStep();
    }, delay);
  });

  intro.oncomplete(function() {
    parent.demoNextStep();
  });
  intro.onexit(function() {
  });
  intro.start();
}

function introStartDemoAdventureMapDeactivate() {
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
    overlayOpacity: 0,
    skipLabel: 'Exit',
    steps: [
      {
        element: document.querySelector('.messenger'),
        intro: "<strong>Deactivate Sync Slides</strong>",
        position: "top"
      },
      {
        intro: "<h1>Campfire Apps</h1>"
      }
    ]
  });
  intro.onbeforechange(function(targetElement) {

    var delay = 1000;

    console.log(jq(targetElement));

    //jq(targetElement).firstChild.find(".messenger-phrase").next().click();
    //jq(targetElement).first().find(".messenger-phrase").next()[0].click();
    if (!targetElement) {
      return;
    } else if (jq(targetElement).hasClass("messenger")) {
      console.log("deactivate  it");
      jq(jq(targetElement).first().find(".messenger-phrase").next()[0]).addClass("animated fadein");
      setTimeout(function() {
        jq(targetElement).first().find(".messenger-phrase").next()[0].click();
      }, 1000);
      delay = 1000;
    } else {
      delay = 2000;
    }

    setTimeout(function() {
      intro.nextStep();
    }, delay);
  });

  intro.oncomplete(function() {
    parent.demoNextStep();
  });
  intro.onexit(function() {
  });
  intro.start();
}


function demoExitCampfireApp() {
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
    overlayOpacity: 0,
    skipLabel: 'Exit',
    steps: [
      {
        intro: "<div class='center'><h3>Close</h3></div>",
        element: document.querySelector('.js-close'),
        position: "left"
      }
    ]
  });
  intro.onbeforechange(function(targetElement) {
    var delay = 1500;
//    console.log(jq(targetElement));
    if (jq(targetElement).hasClass("js-close")) {
//      console.log("close element");
      setTimeout(function() {
        jq(".js-close")[0].click();
      }, 1500);
    }

    setTimeout(function() {
      intro.nextStep();
    }, delay);
  });

  intro.oncomplete(function() {
//    setTimeout(function() {
    parent.demoNextStep();
//    }, 1000);
  });
  intro.onexit(function() {
  });
  intro.start();
}

function demoEndCampfireApp() {
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
    overlayOpacity: 0,
    skipLabel: 'Exit',
    steps: [
      {
        element: document.querySelector('.messenger'),
        intro: "<strong>Exit app</strong> on all students' devices",
        position: "top"
      }
    ]
  });
  intro.onbeforechange(function(targetElement) {

    var delay = 3000;

    console.log(jq(targetElement));

    //jq(targetElement).firstChild.find(".messenger-phrase").next().click();
    //jq(targetElement).first().find(".messenger-phrase").next()[0].click();
    if (!targetElement) {
      return;
    } else if (jq(targetElement).hasClass("messenger")) {
      setTimeout(function() {
        console.log(jq("span[data-action='cancel']"));
        jq("span[data-action='cancel']").find("a")[0].click();
      }, 1500);
    }

    setTimeout(function() {
      intro.nextStep();
    }, delay);
  });

  intro.oncomplete(function() {
//    setTimeout(function() {
    parent.demoNextStep();
//    }, 1000);
  });
  intro.onexit(function() {
  });
  intro.start();
}



