var PLUGIN_NAME = 'POSTER_MAKER';
var submitted = false;
var canvas;


var kitchensink = angular.module('kitchensink', []);

kitchensink.config(function($interpolateProvider) {
  $interpolateProvider
      .startSymbol('{[')
      .endSymbol(']}');
});

kitchensink.directive('bindValueTo', function() {
  return {
    restrict: 'A',
    link: function($scope, $element, $attrs) {

      var prop = capitalize($attrs.bindValueTo),
          getter = 'get' + prop,
          setter = 'set' + prop;

      $element.on('change keyup select', function() {
        $scope[setter] && $scope[setter](this.value);
      });

      $scope.$watch($scope[getter], function(newVal) {
        if ($element[0].type === 'radio') {
          var radioGroup = document.getElementsByName($element[0].name);
          for (var i = 0, len = radioGroup.length; i < len; i++) {
            radioGroup[i].checked = radioGroup[i].value === newVal;
          }
        }
        else {
          $element.val(newVal);
        }
      });
    }
  };
});

kitchensink.directive('objectButtonsEnabled', function() {
  return {
    restrict: 'A',
    link: function($scope, $element, $attrs) {
      $scope.$watch($attrs.objectButtonsEnabled, function(newVal) {

        $($element).find('.btn-object-action')
            .prop('disabled', !newVal);
      });
    }
  };
});

$(document).ready(function() {
  $(function() {
    FastClick.attach(document.body);
  });

  if (parent.isTeacher) {
  } else {//student

//    $('#colorselector').colorselector();
    $(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
      if (!parent) {
        return;
      }

      var messageReceived = param.detail;

      switch (messageReceived.pluginMessageType)
      {
        case 'ResetActivity':
          processResetActivity(messageReceived.data);
          break;
        case 'SetActivityResult':
          processSetActivityResult(messageReceived.data);
          break;
        case 'MarkedAnswer':
          processMarkedAnswer(messageReceived.data);
          break;
        case 'SetStudentAnswer':
          processSetStudentAnswer(messageReceived.data);
          break;
      }
    });

    //initChoices();
    $(document).on('click', 'button[id^="buttonReset"]', function(event) {
      event.preventDefault();
      if (!submitted) {
        canvas.clear();
      }
    });

    $("#buttonSubmit").on('click', function(event) {
      console.log("clicked");
      event.preventDefault();

      if (!submitted && drawn) {
        submitted = true;
        //alert($(event.target).text());
        //Change the text label to green
        canvas.isDrawingMode = false;

        var drawingData;//
        // = drawing1;//canvas.toSVG();//JSON.stringify(canvas);
        if (isDemo) {
          drawingData = demoDrawing;
        } else {
          drawingData = canvas.toSVG();
        }

        var dataToSend = {
          drawingData: drawingData,
          meta: {
            points: 10
          }
        };
        parent.pluginToServer(PLUGIN_NAME, 'AnswerSubmitted', dataToSend);

        $(event.target).html("Submitted");
        $(event.target).addClass("btn-disabled");
        $(event.target).removeClass("btn-success");
        $("#buttonReset").addClass("btn-disabled");
        $("#buttonReset").removeClass("btn-default");
        $("#c").addClass("answer-submitted");

      } else {
        return;
      }

      //    window.open(
      //      'data:image/svg+xml;utf8,' +
      //      encodeURIComponent(canvas.toSVG()));

//      console.log(canvas.toSVG());
//      console.log(JSON.stringify(canvas.toJSON()));
    });
//    initCanvas();
  }

  //Send when the app is ready, next server will initialize the app
  parent.pluginToServer(PLUGIN_NAME, 'StudentOpen', {});
//  initCanvas();
});

function processResetActivity(data) {

  var timeToStart = data.timeToStart;
//  console.log("time to start:" + data.timeToStart);
  var millisTillStart = millisToStart(timeToStart);

//  setTimeout(function() {
//    ResetActivity(data);
//  }, millisTillStart);
  ResetActivity(data);
}

function ResetActivity(data) {
  submitted = false;
  drawn = false;
  canvas.clear();
  canvas.isDrawingMode = true;
//  $("#choices-area").empty();
//  processSetActivityResult(data);

  $("#buttonSubmit").html("Submit");
  $("#buttonSubmit").addClass("btn-success");
  $("#buttonSubmit").removeClass("btn-disabled");

  $("#buttonReset").addClass("btn-default");
  $("#buttonReset").removeClass("btn-disabled");

  $("#c").removeClass("answer-submitted");
  $("#c").removeClass("answer-wrong");
  $("#c").removeClass("answer-correct");

}

function nextChar(c) {
  return String.fromCharCode(c.charCodeAt(0) + 1);
}

function processSetActivityResult(data) {

//  initCanvas();
//  initializeChoices(data);
}

function processMarkedAnswer(data) {
  if (data.isCorrect) {
    $("#c").addClass("answer-correct");
    $("#c").removeClass("answer-wrong");
    $("#c").removeClass("answer-submitted");
    parent.Messenger().post({
      message: 'Your submission is correct!',
      type: 'success',
      id: PLUGIN_NAME,
      hideAfter: 10,
      showCloseButton: true
    });
  } else {
    $("#c").addClass("answer-wrong");
    $("#c").removeClass("answer-correct");
    $("#c").removeClass("answer-submitted");

    parent.Messenger().post({
      message: 'Your submission is not correct!',
      type: 'error',
      id: PLUGIN_NAME,
      hideAfter: 10,
      showCloseButton: true
    });
  }
}

function processSetStudentAnswer(data) {
  console.log(data);
  submitted = true;
  canvas.isDrawingMode = false;
  var drawingData = data.drawingData;

  $("#buttonSubmit").html("Submitted");
  $("#buttonSubmit").addClass("btn-disabled");
  $("#buttonSubmit").removeClass("btn-success");

  $("#buttonReset").addClass("btn-disabled");
  $("#buttonReset").removeClass("btn-default");

  $("#c").removeClass();

  if (data.marked) {
    if (data.marked.isCorrect) {
      $("#c").addClass("answer-correct");
    } else {
      $("#c").addClass("answer-wrong");
    }
  } else {
    $("#c").addClass("answer-submitted");
  }
//  console.log (drawingData);
  fabric.loadSVGFromString(drawingData, function(objects, options) {
    var obj = fabric.util.groupSVGElements(objects, options);
    obj.selectable = false;
    canvas.add(obj).centerObject(obj).renderAll();
    obj.setCoords();
  });
}


function millisToStart(timeToStart) {
  var timeToRun = timeToStart;
//  console.log("timeDifference :ms" + timeToRun);
//  console.log("timeDifference :ms" + parent.document.timeDifference);
  var serverTimeNow = (new Date()).valueOf() + parent.document.timeDifference;
  var millisTillStart = timeToRun - serverTimeNow;
//  console.log(millisTillStart);
  return millisTillStart;
}

function initializeChoices(data) {
  $("#buttonSubmit").removeClass("btn-disabled");

//  var studentButtonsData = {choices: []};

  switch (data.pollType) {
    case "FreeDrawing":
      break;
    case "Number":
      break;
    case "ShortText":
      break;
    case "LongText":
      break;
  }

}

var drawn = false;

function initCanvas() {

//  var canvas = this.__canvas = new fabric.Canvas('c', {
  canvas = new fabric.Canvas('c', {
    isDrawingMode: true,
  });
  canvas.selection = false;
  document.canvas = canvas;
  canvas.on('path:created', function(e) {
    drawn = true;
    var lastItemIndex = _.size(canvas._objects) - 1;
    canvas.item(lastItemIndex).selectable = false;
  });


  fabric.Object.prototype.transparentCorners = false;

  if (canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.color = "black";
    canvas.freeDrawingBrush.width = 2;
    canvas.freeDrawingBrush.shadowBlur = 1;
  }
  $('#divInsertFrame').on('scroll', canvas.calcOffset.bind(canvas));

  canvas.calcOffset();
  canvas.renderAll();
}

var demoDrawing;
var isDemo = false;
//demo
function demoOpenResponseSubmitStudentMiddle() {
  isDemo = true;
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
//    overlayOpacity: 100,
    skipLabel: 'Exit',
    steps: [
      {
        element: document.querySelector('.lower-canvas '),
        intro: "<h4>Student draw answer</h4>"
      },
      {
        element: document.querySelector('.btn-success'),
        intro: "<h4>Student submit answer</h4>"
      }
    ]
  });

  intro.onbeforechange(function(targetElement) {
    var delay = 2000;

    if ($(targetElement).hasClass("upper-canvas")) {

    } else if ($(targetElement).hasClass("lower-canvas")) {
      drawn = true;
      demoDrawing = drawing1;

      fabric.loadSVGFromString(demoDrawing, function(objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.selectable = false;
        canvas.add(obj).centerObject(obj).renderAll();
        obj.setCoords();
      });
    } else if ($(targetElement).hasClass("btn-success")) {
//      console.log(targetElement);
      setTimeout(function() {
        console.log($("#buttonSubmit")[0]);
        $("#buttonSubmit")[0].click();
      }, 1000);
    }

    setTimeout(function() {
      intro.nextStep();
    }, delay);
  });
  intro.oncomplete(function() {
    setTimeout(function() {
//      demoOpenResponseTrigger();
      parent.parent.demoNextStep();
    }, 1000);
  });
  intro.onexit(function() {
  });
  intro.start();
}

function demoOpenResponseSubmitStudentRight() {
  isDemo = true;
  var intro = introJs();
  intro.setOptions({
//    tooltipPosition: 'left',
    showStepNumbers: false,
    showBullets: false,
    showButtons: false,
//    overlayOpacity: 100,
    skipLabel: 'Exit',
    steps: [
      {
        element: document.querySelector('.btn-success'),
        intro: "<h4>Student submit answer</h4>"
      }
    ]
  });

  intro.onbeforechange(function(targetElement) {
    var delay = 3000;

    if ($(targetElement).hasClass("upper-canvas")) {

    } else if ($(targetElement).hasClass("lower-canvas")) {

    } else if ($(targetElement).hasClass("btn-success")) {

      drawn = true;
      demoDrawing = drawing2;
      fabric.loadSVGFromString(demoDrawing, function(objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.selectable = false;
        canvas.add(obj).centerObject(obj).renderAll();
        obj.setCoords();
      });

      setTimeout(function() {
        console.log($("#buttonSubmit")[0]);
        $("#buttonSubmit")[0].click();
      }, 1000);
    }

    setTimeout(function() {
      intro.nextStep();
    }, delay);
  });
  intro.oncomplete(function() {
    setTimeout(function() {
//      demoOpenResponseTrigger();
      parent.parent.demoNextStep();
    }, 1000);
  });
  intro.onexit(function() {
  });
  intro.start();
}
var drawing1 = '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\" ?><!DOCTYPE svg PUBLIC \"-\/\/W3C\/\/DTD SVG 1.1\/\/EN\" \"http:\/\/www.w3.org\/Graphics\/SVG\/1.1\/DTD\/svg11.dtd\">\r\n<svg xmlns=\"http:\/\/www.w3.org\/2000\/svg\" xmlns:xlink=\"http:\/\/www.w3.org\/1999\/xlink\" version=\"1.1\" width=\"550\" height=\"550\" xml:space=\"preserve\"><desc>Created with Fabric.js 1.4.0<\/desc><defs><\/defs><g transform=\"translate(81.63 164.5)\"><path d=\"M 10.5 0 Q 10.5 0 11 0 Q 11.5 0 11.25 0 Q 11 0 11 0.5 Q 11 1 11 1.5 Q 11 2 11 3 Q 11 4 11 5 Q 11 6 11 7 Q 11 8 11 9 Q 11 10 11 11.5 Q 11 13 10.5 13.5 Q 10 14 10 15 Q 10 16 10 17 Q 10 18 10 18.5 Q 10 19 10 19.5 Q 10 20 10 21 Q 10 22 9.5 22.5 Q 9 23 9 24 Q 9 25 9 26 Q 9 27 9 28 Q 9 29 9 30.5 Q 9 32 8.5 34 Q 8 36 8 38.5 Q 8 41 8 42.5 Q 8 44 8 45.5 Q 8 47 7.5 48.5 Q 7 50 7 51 Q 7 52 6.5 53 Q 6 54 5.5 55 Q 5 56 5 57 Q 5 58 5 59.5 Q 5 61 5 62.5 Q 5 64 5 66 Q 5 68 4.5 69 Q 4 70 4 71.5 Q 4 73 3.5 74 Q 3 75 3 76.5 Q 3 78 2.5 79 Q 2 80 2 81.5 Q 2 83 2 84 Q 2 85 2 86 Q 2 87 2 88 Q 2 89 2 89.5 Q 2 90 2 90 Q 2 90 1.5 91 Q 1 92 1 93 Q 1 94 1 95.5 Q 1 97 1 97.5 Q 1 98 1 98.5 Q 1 99 0.5 100 Q 0 101 0 101.5 Q 0 102 0 102.5 Q 0 103 0 103.5 Q 0 104 0 104.5 Q 0 105 0 106 L 0 107\" style=\"stroke: black; stroke-width: 2; stroke-dasharray: ; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 10; fill: none; opacity: 1;\" transform=\"translate(-5.5 -53.5)\" stroke-linecap=\"round\" \/><\/g><g transform=\"translate(150.25 163.5)\"><path d=\"M 0 1 Q 0 1 0.5 1 Q 1 1 0.75 1 Q 0.5 1 4 1 Q 7.5 1 13 1 Q 18.5 1 23.5 1 Q 28.5 1 33 1 Q 37.5 1 41 1 Q 44.5 1 44.5 1 Q 44.5 1 48 1 Q 51.5 1 53.5 1 Q 55.5 1 56.5 0.5 Q 57.5 0 58 0 Q 58.5 0 59 0 Q 59.5 0 60 0 Q 60.5 0 61 0 Q 61.5 0 62.5 0 Q 63.5 0 64.5 0 Q 65.5 0 66.5 0 Q 67.5 0 68 0 Q 68.5 0 69 0 L 69.5 0\" style=\"stroke: black; stroke-width: 2; stroke-dasharray: ; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 10; fill: none; opacity: 1;\" transform=\"translate(-34.5 -0.5)\" stroke-linecap=\"round\" \/><\/g><g transform=\"translate(162.88 166)\"><path d=\"M 0 0 Q 0 0 0.5 0 Q 1 0 0.75 0 Q 0.5 0 0.5 0.5 Q 0.5 1 0.5 2.5 Q 0.5 4 0.5 6.5 Q 0.5 9 0.5 12.5 Q 0.5 16 0.5 20 Q 0.5 24 0.5 28 Q 0.5 32 0.5 36 Q 0.5 40 0.5 43.5 Q 0.5 47 0.5 49 Q 0.5 51 0.5 53 Q 0.5 55 0.5 56 Q 0.5 57 0.5 58 Q 0.5 59 0.5 59.5 Q 0.5 60 0.5 60.5 Q 0.5 61 0.5 61.5 Q 0.5 62 0.5 62 L 0.5 62\" style=\"stroke: black; stroke-width: 2; stroke-dasharray: ; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 10; fill: none; opacity: 1;\" transform=\"translate(0 -31)\" stroke-linecap=\"round\" \/><\/g><g transform=\"translate(258.25 169.5)\"><path d=\"M 0 0 Q 0 0 0.5 0 Q 1 0 0.75 0 Q 0.5 0 1 0 Q 1.5 0 6 0 Q 10.5 0 15.5 1 Q 20.5 2 26.5 3 Q 32.5 4 37 5 Q 41.5 6 45 6.5 Q 48.5 7 51.5 7 Q 54.5 7 57 7.5 Q 59.5 8 61 8.5 Q 62.5 9 63 9 Q 63.5 9 64 9 Q 64.5 9 65 10 Q 65.5 11 65.5 11.5 Q 65.5 12 65.5 13 Q 65.5 14 65.5 14 Q 65.5 14 65.5 14.5 Q 65.5 15 65.5 15.5 Q 65.5 16 65.5 17 Q 65.5 18 65.5 19 Q 65.5 20 65.5 21 Q 65.5 22 65.5 23.5 Q 65.5 25 65.5 26 Q 65.5 27 65.5 27.5 Q 65.5 28 64.5 29.5 Q 63.5 31 62.5 32.5 Q 61.5 34 60.5 35 Q 59.5 36 57.5 38 Q 55.5 40 53 42 Q 50.5 44 49 45.5 Q 47.5 47 45 49 Q 42.5 51 40.5 53 Q 38.5 55 36 57.5 Q 33.5 60 31 62 Q 28.5 64 28 66.5 Q 27.5 69 26.5 70.5 Q 25.5 72 25 73 Q 24.5 74 24 74 Q 23.5 74 23.5 74.5 Q 23.5 75 23 75 Q 22.5 75 22 75 Q 21.5 75 21 75 Q 20.5 75 20 75 Q 19.5 75 18.5 75.5 Q 17.5 76 17 76.5 Q 16.5 77 17.5 77 Q 18.5 77 19.5 77 Q 20.5 77 21.5 77.5 Q 22.5 78 24.5 78 Q 26.5 78 28 78 Q 29.5 78 31.5 78.5 Q 33.5 79 34.5 79 Q 35.5 79 37 79.5 Q 38.5 80 40 80 Q 41.5 80 43 80 Q 44.5 80 46.5 80 Q 48.5 80 50 80.5 Q 51.5 81 54 81 Q 56.5 81 59 81 Q 61.5 81 63 81 Q 64.5 81 66 81 Q 67.5 81 68.5 81 Q 69.5 81 70 81 Q 70.5 81 71 81 Q 71.5 81 72 81 Q 72.5 81 73 81 Q 73.5 81 74.5 81 Q 75.5 81 76.5 81 L 77.5 81\" style=\"stroke: black; stroke-width: 2; stroke-dasharray: ; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 10; fill: none; opacity: 1;\" transform=\"translate(-38.5 -40.5)\" stroke-linecap=\"round\" \/><\/g><g transform=\"translate(80.75 301.5)\"><path d=\"M 0 1 Q 0 1 0.5 1 Q 1 1 0.75 1 Q 0.5 1 1.5 1 Q 2.5 1 6 1 Q 9.5 1 14.5 1 Q 19.5 1 23.5 1 Q 27.5 1 30 0.5 Q 32.5 0 35.5 0 Q 38.5 0 40.5 0 Q 42.5 0 44.5 0 Q 46.5 0 47.5 0 Q 48.5 0 49 0 Q 49.5 0 50 0 Q 50.5 0 51 0 Q 51.5 0 52 0 Q 52.5 0 52.5 0 L 52.5 0\" style=\"stroke: black; stroke-width: 2; stroke-dasharray: ; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 10; fill: none; opacity: 1;\" transform=\"translate(-26 -0.5)\" stroke-linecap=\"round\" \/><\/g><g transform=\"translate(77.75 343)\"><path d=\"M 0 2 Q 0 2 0.5 2 Q 1 2 0.75 2 Q 0.5 2 1 1.5 Q 1.5 1 2 1 Q 2.5 1 4 1 Q 5.5 1 6.5 1 Q 7.5 1 8 1 Q 8.5 1 9.5 0.5 Q 10.5 0 11.5 0 Q 12.5 0 14 0 Q 15.5 0 17 0 Q 18.5 0 21 0 Q 23.5 0 26 0 Q 28.5 0 30 0.5 Q 31.5 1 33.5 1 Q 35.5 1 36.5 1 Q 37.5 1 38.5 1 Q 39.5 1 40 1 Q 40.5 1 42 1.5 Q 43.5 2 44.5 2 Q 45.5 2 45.5 2 Q 45.5 2 46 2 Q 46.5 2 47 2 Q 47.5 2 48 2 Q 48.5 2 49.5 2 L 50.5 2\" style=\"stroke: black; stroke-width: 2; stroke-dasharray: ; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 10; fill: none; opacity: 1;\" transform=\"translate(-25 -1)\" stroke-linecap=\"round\" \/><\/g><g transform=\"translate(162.5 322.5)\"><path d=\"M 25.5 9 Q 25.5 9 26 9 Q 26.5 9 26.25 9 Q 26 9 26.5 8.5 Q 27 8 28.5 8 Q 30 8 33.5 7.5 Q 37 7 39.5 6 Q 42 5 45.5 4.5 Q 49 4 51.5 3 Q 54 2 56.5 1.5 Q 59 1 60.5 0.5 Q 62 0 63.5 0 Q 65 0 66 0 Q 67 0 68 0 Q 69 0 70 0 Q 71 0 72 0 Q 73 0 74.5 0 Q 76 0 77.5 0 Q 79 0 80.5 0 Q 82 0 82.5 1 Q 83 2 83.5 2.5 Q 84 3 84 3 Q 84 3 84.5 3.5 Q 85 4 85 5.5 Q 85 7 85.5 8.5 Q 86 10 86.5 11 Q 87 12 87 13 Q 87 14 87 15.5 Q 87 17 87 18 Q 87 19 87 20 Q 87 21 87 22 Q 87 23 87 24.5 Q 87 26 87 27 Q 87 28 87 29 Q 87 30 87 31 Q 87 32 87 33 Q 87 34 87 35 Q 87 36 87 37.5 Q 87 39 86 40.5 Q 85 42 85 43 Q 85 44 84 44.5 Q 83 45 82 46 Q 81 47 80.5 47.5 Q 80 48 79 48.5 Q 78 49 77 49.5 Q 76 50 75 50 Q 74 50 73 51 Q 72 52 69.5 53 Q 67 54 65 54.5 Q 63 55 60 56.5 Q 57 58 53.5 59 Q 50 60 47 60.5 Q 44 61 41.5 62 Q 39 63 36.5 63.5 Q 34 64 31.5 64.5 Q 29 65 27.5 65.5 Q 26 66 25.5 66 Q 25 66 24.5 66 Q 24 66 24.5 66 Q 25 66 25.5 66 Q 26 66 26.5 66 Q 27 66 28.5 65.5 Q 30 65 31.5 65 Q 33 65 34.5 65 Q 36 65 38 65 Q 40 65 42.5 64.5 Q 45 64 48 64 Q 51 64 53.5 64 Q 56 64 58.5 63.5 Q 61 63 63 63 Q 65 63 67 62.5 Q 69 62 70 62 Q 71 62 72.5 62 Q 74 62 75.5 62 Q 77 62 78 62 Q 79 62 80 62 Q 81 62 82 62.5 Q 83 63 84 63.5 Q 85 64 85.5 64 Q 86 64 86 64.5 Q 86 65 86.5 65.5 Q 87 66 87 67 Q 87 68 87.5 68.5 Q 88 69 88 69.5 Q 88 70 88.5 70.5 Q 89 71 89 71.5 Q 89 72 89 72.5 Q 89 73 89 73.5 Q 89 74 89 75 Q 89 76 89 77 Q 89 78 89 79 Q 89 80 89 81 Q 89 82 89 83 Q 89 84 89 84.5 Q 89 85 89 86.5 Q 89 88 89 88.5 Q 89 89 88.5 89.5 Q 88 90 87.5 91 Q 87 92 86 93 Q 85 94 84.5 94.5 Q 84 95 83.5 96 Q 83 97 82.5 97.5 Q 82 98 81 99 Q 80 100 79.5 101 Q 79 102 78 103 Q 77 104 76 105 Q 75 106 74.5 107.5 Q 74 109 73 110 Q 72 111 71 111.5 Q 70 112 69 113 Q 68 114 66.5 114.5 Q 65 115 64.5 115.5 Q 64 116 63.5 116.5 Q 63 117 62.5 117 Q 62 117 61.5 117 Q 61 117 60.5 117 Q 60 117 59.5 117 Q 59 117 57.5 117 Q 56 117 54 117 Q 52 117 49.5 117 Q 47 117 44.5 116.5 Q 42 116 39.5 116 Q 37 116 34.5 116 Q 32 116 28.5 116 Q 25 116 23 116 Q 21 116 18 116 Q 15 116 12 116 Q 9 116 6.5 116 Q 4 116 3.5 116 Q 3 116 2.5 116 Q 2 116 1.5 116 Q 1 116 0.5 116 L 0 116\" style=\"stroke: black; stroke-width: 2; stroke-dasharray: ; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 10; fill: none; opacity: 1;\" transform=\"translate(-44.5 -58.5)\" stroke-linecap=\"round\" \/><\/g><\/svg>\r\n\r\n\r\n'
var drawing2 = '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\" ?><!DOCTYPE svg PUBLIC \"-\/\/W3C\/\/DTD SVG 1.1\/\/EN\" \"http:\/\/www.w3.org\/Graphics\/SVG\/1.1\/DTD\/svg11.dtd\">\r\n<svg xmlns=\"http:\/\/www.w3.org\/2000\/svg\" xmlns:xlink=\"http:\/\/www.w3.org\/1999\/xlink\" version=\"1.1\" width=\"550\" height=\"550\" xml:space=\"preserve\"><desc>Created with Fabric.js 1.4.0<\/desc><defs><\/defs><g transform=\"translate(236.63 109.5)\"><path d=\"M 2.5 0 Q 2.5 0 3 0 Q 3.5 0 3.25 0 Q 3 0 3 0.5 Q 3 1 3 2 Q 3 3 3 4.5 Q 3 6 3 7.5 Q 3 9 3 11 Q 3 13 3 15.5 Q 3 18 3 21.5 Q 3 25 2.5 28.5 Q 2 32 2 35.5 Q 2 39 2 41.5 Q 2 44 1.5 47 Q 1 50 1 51.5 Q 1 53 1 53.5 Q 1 54 1 54.5 Q 1 55 1 56 Q 1 57 1 57.5 Q 1 58 1 58.5 Q 1 59 1 59.5 Q 1 60 0.5 60 Q 0 60 0 60.5 L 0 61\" style=\"stroke: black; stroke-width: 2; stroke-dasharray: ; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 10; fill: none; opacity: 1;\" transform=\"translate(-1.5 -30.5)\" stroke-linecap=\"round\" \/><\/g><g transform=\"translate(135.75 168)\"><path d=\"M 0 0 Q 0 0 0.5 0 Q 1 0 0.75 0 Q 0.5 0 4 0 Q 7.5 0 13.5 0 Q 19.5 0 24 0 Q 28.5 0 32.5 0 Q 36.5 0 40.5 0 Q 44.5 0 46.5 0 Q 48.5 0 50 0 Q 51.5 0 52 0 L 52.5 0\" style=\"stroke: black; stroke-width: 2; stroke-dasharray: ; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 10; fill: none; opacity: 1;\" transform=\"translate(-26 0)\" stroke-linecap=\"round\" \/><\/g><g transform=\"translate(134.75 169)\"><path d=\"M 0 0 Q 0 0 0.5 0 Q 1 0 0.75 1.5 Q 0.5 3 0.5 5.5 Q 0.5 8 0.5 11 Q 0.5 14 0.5 18 Q 0.5 22 0.5 24.5 Q 0.5 27 0.5 30 Q 0.5 33 0.5 35.5 Q 0.5 38 0.5 41 Q 0.5 44 0.5 46 Q 0.5 48 0.5 49.5 Q 0.5 51 0.5 52.5 Q 0.5 54 0.5 54.5 Q 0.5 55 0.5 56 Q 0.5 57 1 57 Q 1.5 57 1.5 57 Q 1.5 57 1.5 57.5 Q 1.5 58 2 58 L 2.5 58\" style=\"stroke: black; stroke-width: 2; stroke-dasharray: ; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 10; fill: none; opacity: 1;\" transform=\"translate(-1 -29)\" stroke-linecap=\"round\" \/><\/g><g transform=\"translate(247.75 181)\"><path d=\"M 12 1 Q 12 1 12.5 1 Q 13 1 12.75 1 Q 12.5 1 13 0.5 Q 13.5 0 14 0 Q 14.5 0 15 0 Q 15.5 0 16 0 Q 16.5 0 17 0 Q 17.5 0 19 0 Q 20.5 0 22.5 0 Q 24.5 0 27 0 Q 29.5 0 32 0 Q 34.5 0 36 0 Q 37.5 0 38.5 0 Q 39.5 0 40 0 Q 40.5 0 41 0 Q 41.5 0 41.5 0.5 Q 41.5 1 42 1.5 Q 42.5 2 42.5 2.5 Q 42.5 3 42.5 4 Q 42.5 5 42.5 6 Q 42.5 7 42.5 8 Q 42.5 9 42 10 Q 41.5 11 41.5 12 Q 41.5 13 41 14 Q 40.5 15 40 16.5 Q 39.5 18 38.5 20 Q 37.5 22 37 23.5 Q 36.5 25 35.5 26.5 Q 34.5 28 34.5 28 Q 34.5 28 34 30 Q 33.5 32 32 33 Q 30.5 34 29.5 35.5 Q 28.5 37 27.5 38.5 Q 26.5 40 25.5 40.5 Q 24.5 41 23.5 42 Q 22.5 43 21 43.5 Q 19.5 44 19 44.5 Q 18.5 45 18 45 Q 17.5 45 16.5 45.5 Q 15.5 46 15.5 46.5 Q 15.5 47 14.5 47 Q 13.5 47 12.5 47.5 Q 11.5 48 11 48 Q 10.5 48 9 48.5 Q 7.5 49 6.5 49 Q 5.5 49 4.5 49 Q 3.5 49 3 49 Q 2.5 49 1.5 49.5 Q 0.5 50 0 50 Q -0.5 50 0.5 50 Q 1.5 50 2 50 Q 2.5 50 5 50 Q 7.5 50 10 50.5 Q 12.5 51 16 51.5 Q 19.5 52 24 52.5 Q 28.5 53 31.5 53 Q 34.5 53 37.5 53.5 Q 40.5 54 43 54 Q 45.5 54 47 54 Q 48.5 54 49.5 54 Q 50.5 54 51 54 Q 51.5 54 52 54 Q 52.5 54 53 54 Q 53.5 54 54 54 L 54.5 54\" style=\"stroke: black; stroke-width: 2; stroke-dasharray: ; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 10; fill: none; opacity: 1;\" transform=\"translate(-27 -27)\" stroke-linecap=\"round\" \/><\/g><g transform=\"translate(207.25 232.5)\"><path d=\"M 0 0 Q 0 0 0.5 0 Q 1 0 0.75 0 Q 0.5 0 1 0 Q 1.5 0 4.5 0.5 Q 7.5 1 13.5 1.5 Q 19.5 2 26.5 2.5 Q 33.5 3 41 3.5 Q 48.5 4 56.5 4 Q 64.5 4 74.5 4.5 Q 84.5 5 91 5 Q 97.5 5 103.5 5 Q 109.5 5 114.5 5 Q 119.5 5 121.5 5 Q 123.5 5 125 5 Q 126.5 5 127.5 5 Q 128.5 5 129 5 Q 129.5 5 130 5 Q 130.5 5 131.5 5 Q 132.5 5 133.5 5 Q 134.5 5 135 5 Q 135.5 5 136 5 Q 136.5 5 137.5 5 Q 138.5 5 139.5 5 Q 140.5 5 142 5 Q 143.5 5 145 5 Q 146.5 5 148.5 5 Q 150.5 5 152.5 5 Q 154.5 5 156.5 5 Q 158.5 5 161 5 Q 163.5 5 166 5 Q 168.5 5 170 5 Q 171.5 5 173 5 Q 174.5 5 175.5 5 Q 176.5 5 178.5 5 Q 180.5 5 181 5 Q 181.5 5 182.5 5 Q 183.5 5 184 5 Q 184.5 5 185 5 Q 185.5 5 185.5 4.5 Q 185.5 4 185 4 L 184.5 4\" style=\"stroke: black; stroke-width: 2; stroke-dasharray: ; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 10; fill: none; opacity: 1;\" transform=\"translate(-92.5 -2.5)\" stroke-linecap=\"round\" \/><\/g><g transform=\"translate(239.5 283.5)\"><path d=\"M 30.5 0 Q 30.5 0 31 0 Q 31.5 0 31.25 0 Q 31 0 31 0 Q 31 0 31 1 Q 31 2 30.5 3 Q 30 4 29 5.5 Q 28 7 27 8.5 Q 26 10 24.5 13 Q 23 16 22 18.5 Q 21 21 20 22.5 Q 19 24 18 26 Q 17 28 17 29 Q 17 30 16.5 31 Q 16 32 15.5 32.5 Q 15 33 14.5 34 Q 14 35 13.5 35.5 Q 13 36 12.5 37 Q 12 38 11.5 39.5 Q 11 41 10 41.5 Q 9 42 8.5 43.5 Q 8 45 7 46 Q 6 47 5.5 48.5 Q 5 50 4 51 Q 3 52 2.5 53 Q 2 54 1 55 Q 0 56 0 56.5 Q 0 57 1.5 57.5 Q 3 58 6.5 58.5 Q 10 59 13.5 59 Q 17 59 21.5 59 Q 26 59 30 59 Q 34 59 39.5 59 Q 45 59 48 59 Q 51 59 54.5 59 Q 58 59 59.5 59 Q 61 59 61.5 59 Q 62 59 63 59 Q 64 59 64.5 59 Q 65 59 66 59 Q 67 59 67.5 59 Q 68 59 69 59 Q 70 59 70.5 59 Q 71 59 71.5 59 Q 72 59 72.5 59 Q 73 59 73 58.5 Q 73 58 72 58 L 71 58\" style=\"stroke: black; stroke-width: 2; stroke-dasharray: ; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 10; fill: none; opacity: 1;\" transform=\"translate(-36.5 -29.5)\" stroke-linecap=\"round\" \/><\/g><g transform=\"translate(247.63 325.5)\"><path d=\"M 2.5 0 Q 2.5 0 3 0 Q 3.5 0 3.25 0 Q 3 0 2.5 0 Q 2 0 2 1.5 Q 2 3 2 4.5 Q 2 6 2 8 Q 2 10 2 11.5 Q 2 13 2 15 Q 2 17 2 20 Q 2 23 2 24.5 Q 2 26 2 28 Q 2 30 2 32 Q 2 34 2 36 Q 2 38 2 39.5 Q 2 41 2 42 Q 2 43 2 43.5 Q 2 44 1.5 44.5 Q 1 45 1 45.5 Q 1 46 1 46 Q 1 46 0.5 46.5 Q 0 47 0 48.5 Q 0 50 0 51.5 Q 0 53 0 54 Q 0 55 0 56.5 Q 0 58 0 59 Q 0 60 0 61 Q 0 62 0 62.5 L 0 63\" style=\"stroke: black; stroke-width: 2; stroke-dasharray: ; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 10; fill: none; opacity: 1;\" transform=\"translate(-1.5 -31.5)\" stroke-linecap=\"round\" \/><\/g><\/svg>'



//(function() {
//  fabric.util.addListener(fabric.window, 'load', function() {
//    var canvas = this.__canvas || this.canvas,
//        canvases = this.__canvases || this.canvases;
//
//    canvas && canvas.calcOffset && canvas.calcOffset();
//
//    if (canvases && canvases.length) {
//      for (var i = 0, len = canvases.length; i < len; i++) {
//        canvases[i].calcOffset();
//      }
//    }
//  });
//})();