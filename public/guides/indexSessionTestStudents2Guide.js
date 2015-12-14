
var isAuto = false;
var panelTeacher;
$(document).ready(function() {
  panelTeacher = $("#panel1")[0].contentWindow;
  var parameters = getUrlVars(document);
  console.log(parameters);
  if (parameters && parameters.auto) {
    isAuto = true;
    setTimeout(function() {
      demoStart();
    }, 1500);
  }

  $(".btn-intro").click(function(event) {
    event.preventDefault();
    if (isAuto) {
      demoStart();
    } else {
      introStartGuide();
    }
  });
});
function getUrlVars(documentTarget) {

  var vars = {};
  var frameURL = decodeURIComponent(document.location.href);
  if (documentTarget) {
    frameURL = decodeURIComponent(documentTarget.location.href);
  }


  if (frameURL.indexOf('?') < 0) {
    return vars;
  }
  var parts = frameURL.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value;
  });
  return vars;
}


var demoFunctionStart = function() {
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
        intro: "<div class='center'><h1>Teacher </h1> <br> <h2>with</h2> <br><h1 > Test Students' Views</h1></div>"
      },
      {
        element: document.querySelector('.panel1'),
        intro: "<div class='center'><h2>Teacher's View </h2></div>",
        position: 'right'
      },
      {
        element: document.querySelector('.panelStudent1'),
        intro: "<div class='center'><h2>Test Student's View  1</h2></div>",
        position: 'right'
      },
      {
        element: document.querySelector('.panelStudent2'),
        intro: "<div class='center'><h2>Test Student's View  2</h2></div>",
        position: 'left'
      },
      {
        intro: "<div class='center'><h2>Let's start the</h2><h1>Adventure</h1></div>"
      }

    ]
  });
  intro.onbeforechange(function(targetElement) {
    var delay = 1500;
    if ($(targetElement).hasClass(".panel1")) {
    }
    if ($(targetElement)[0].id === "open-right") {
      delay = 1000;
    } else {
      delay = 2500;
    }

    setTimeout(function() {
      intro.nextStep();
    }, delay);
  });
  intro.oncomplete(function() {
    demoNextStep();
  });
  intro.onexit(function() {
//    snapper.close();
  });
  intro.start();
};

var demoFunctionFinish = function() {
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
//    showButtons: false,
//    overlayOpacity: 0,
    skipLabel: 'Exit',
    steps: [
      {
        intro: "<div class='center'><h1>End of Demo</h1> <br> \n\
You may now explore Hit.Camp and try connecting mobile devices to this Classroom: <a href='" + 'http://hit.camp' +
            $("#panel1").attr("src") + "'>" + 'http://hit.camp' + $("#panel1").attr("src") + "</a> \n\
</div>"
      }
    ]
  });
  intro.onbeforechange(function(targetElement) {
//    var delay = 1500;
//
//    setTimeout(function() {
//      intro.nextStep();
//    }, delay);
  });
  intro.oncomplete(function() {
//    demoNextStep();
    location.href = location.protocol + '//' + location.host + location.pathname;
  });
  intro.onexit(function() {
    location.href = location.protocol + '//' + location.host + location.pathname;
//    snapper.close();
  });
  intro.start();
};

function waitForElementReady(context, element, callback) {
  console.log(element);
  var elementToBeReady;
  var count = 0;
  var delay = 500;
//  debugger;

//  elementToBeReady = context.$(element);
  var checkElement = setInterval(function() {
    count += 1;
//    console.log("waiting for element to be ready");
    if (context.$) {
      elementToBeReady = context.$(element);
    }
//    console.log("elementToBeReady %O: ", elementToBeReady.length);
    if (elementToBeReady.length > 0) {
      clearInterval(checkElement);
      callback();
    } else if (count === 10) {
      clearInterval(checkElement);
      return;
//      alert("Oh no! It seemed like the guide is stucked, you might want to refresh the page");
      clearInterval(checkElement);
    }
  }, delay);
}

var demoCurrentStep = 0;
var demoStepsArray = [
  demoFunctionStart, //Introduction
  function() { //Teacher - Open Adventure Map Introduction 
    waitForElementReady(panelTeacher, ".adventure-area", function() {
      panelTeacher.introStartDemoAdventureMapIntroduction();
    });
  },  
  function() { //Teacher - Adventure Map Check Running Apps
    waitForElementReady(panelTeacher, ".adventure-area", function() {
      panelTeacher.introStartDemoAdventureMapCheckRunningApps();
    });    
  },
  function() { //Teacher - Start Adventure Map
    waitForElementReady(panelTeacher, ".messenger", function() {
      panelTeacher.introStartDemoAdventureMapStart();
    });
  },
  function() { //Teacher - Open Element
    waitForElementReady(panelTeacher, ".modal-dialog", function() {
      panelTeacher.introStartDemoAdventureMapDialog();
    });
  },
  function() { //Teacher - Next Element Start
    waitForElementReady(panelTeacher, ".question-display", function() {
      panelTeacher.introStartDemoAdventureMapNextElementStart();
    });
  },
  function() { //Teacher - Next Element 
    waitForElementReady(panelTeacher, ".btn-next", function() {
      panelTeacher.introStartDemoAdventureMapNextElement();
    });
  },
  function() { //Teacher - Next Element 
    waitForElementReady(panelTeacher, ".btn-next", function() {
      panelTeacher.introStartDemoAdventureMapNextElement();
    });
  },
  function() { //Teacher - End Element 
    waitForElementReady(panelTeacher, ".btn-close", function() {
      panelTeacher.introStartDemoAdventureMapElementEnd();
    });
  },
  function() { //Teacher - End Dialog 
    waitForElementReady(panelTeacher, ".js-close", function() {
      panelTeacher.introStartDemoAdventureMapDialogEnd();
    });
  },
  function() { //Teacher - End Adventure Map
    waitForElementReady(panelTeacher, ".adventure-area", function() {
      panelTeacher.introStartDemoAdventureMapEnd();
    });
  },
  function() { //Teacher - Deactivate Walkthrough
    waitForElementReady(panelTeacher, ".messenger", function() {
      panelTeacher.introStartDemoAdventureMapDeactivate();
    });
  },
  function() { //Teacher - Open Campfire App list
    setTimeout(function() {
      panelTeacher.introStartDemoCampfireApps();
    }, 500);
  },
  function() { //Teacher - Launch Open Response App
    waitForElementReady($("#panel1")[0].contentWindow, ".fa-pencil", function() {
      panelTeacher.introStartDemoCampfireAppsOpen(".fa-pencil");
    });
  },
  function() { //Wait
    waitForElementReady(panelTeacher, "#frameMiniApp[src$='openResponseTeacher.html']", function() {
      parent.demoNextStep();
    });
  },
  function() { //Teacher - Trigger App
    waitForElementReady($("#panel1").contents().find("#frameMiniApp")[0].contentWindow, "#buttonLaunch", function() {
      $("#panel1").contents().find("#frameMiniApp")[0].contentWindow.demoTrigger();
    });
  },
  function() { //Wait Student
    waitForElementReady($("#panelStudent1")[0].contentWindow, "#frameMiniApp[src$='openResponseStudent.html']", function() {
      parent.demoNextStep();
    });
  },
  function() { //Student - Explain and Submit
    $("#panelStudent1").contents().find("#frameMiniApp")[0].contentWindow.demoOpenResponseSubmitStudentMiddle();
  },
  function() { //Student - Explain and Submit
    $("#panelStudent2").contents().find("#frameMiniApp")[0].contentWindow.demoOpenResponseSubmitStudentRight();
  },
  function() { //Teacher - Grade Students
    $("#panel1").contents().find("#frameMiniApp")[0].contentWindow.demoOpenResponseGrade();
  },
  function() { //Teacher - Open Campfire App list
    panelTeacher.introStartDemoCampfireApps();
  },
  function() { //Teacher - Launch Randomizer App
    waitForElementReady(panelTeacher, ".fa-random", function() {
      panelTeacher.introStartDemoCampfireAppsOpen(".fa-random");
    });
  },
  function() { //Wait
    waitForElementReady(panelTeacher, "#frameMiniApp[src$='randomizerTeacher.html']", function() {
      parent.demoNextStep();
    });
  },
  function() { //Teacher - Trigger App
    waitForElementReady($("#panel1").contents().find("#frameMiniApp")[0].contentWindow, "#buttonLaunch", function() {
      $("#panel1").contents().find("#frameMiniApp")[0].contentWindow.demoTrigger();
    });
  },
  function() { //Teacher - Exit Campfire App 
    panelTeacher.demoExitCampfireApp();
  },
  function() { //Teacher - Launch Word Attack App
    waitForElementReady(panelTeacher, ".fa-bolt", function() {
      panelTeacher.introStartDemoCampfireAppsOpen(".fa-bolt");
    });
  },
  function() { //Wait Teacher Word Attack
    waitForElementReady(panelTeacher, "#frameMiniApp[src$='wordAttackTeacher.html']", function() {
      parent.demoNextStep();
    });
  },
  function() { //Teacher - Trigger App Word Attack
    waitForElementReady($("#panel1").contents().find("#frameMiniApp")[0].contentWindow, "#buttonLaunch", function() {

      $("#panel1").contents().find("#frameMiniApp")[0].contentWindow.demoTrigger();
    });
  },
  function() { //Wait Student Word Attack
    waitForElementReady($("#panelStudent1")[0].contentWindow, "#frameMiniApp[src$='wordAttackStudent.html']", function() {
      parent.demoNextStep();
    });
  },
  function() { //Student - Explain and Submit
    waitForElementReady($("#panelStudent1").contents().find("#frameMiniApp")[0].contentWindow, ".tab-content", function() {
      $("#panelStudent1").contents().find("#frameMiniApp")[0].contentWindow.demoSubmit(1);
    });
  },
  function() { //Student - Explain and Submit
    waitForElementReady($("#panelStudent2").contents().find("#frameMiniApp")[0].contentWindow, ".tab-content", function() {
      $("#panelStudent2").contents().find("#frameMiniApp")[0].contentWindow.demoSubmit(2);
    });
  },
  function() { //Teacher - Reveal answer and Exit
    $("#panel1").contents().find("#frameMiniApp")[0].contentWindow.demoRevealAnswerAndExit();
  },
  function() { //Teacher - Exit Campfire App 
    panelTeacher.demoExitCampfireApp();
  },
  function() { //Teacher - End Element 
    panelTeacher.demoEndCampfireApp();
  },
  demoFunctionFinish
];
function demoStart() {
  demoCurrentStep = 0;
  demoStepsArray[demoCurrentStep]();
}
function demoNextStep() {
  demoCurrentStep++;
  if (demoCurrentStep < demoStepsArray.length) {
    demoStepsArray[demoCurrentStep]();
  }
}
