var PLUGIN_NAME = 'WHEEL_WORD';
var currentWord = "";

var answered = true;
var isSingle = false;

var countCorrect = 0;
var countWrong = 0;

//server simulation
var currentWordIndex = 0;
var wordStatus = {};
var currentWordStartTime;
var studentAnswers = [];
var wordList1 = {};
var wordList2 = {};

$(document).ready(function() {
  $(function() {
    FastClick.attach(document.body);
  });

  var parameters = parent.getUrlVars(document);
  if (parameters.isSingle) {
    isSingle = true;
    PLUGIN_NAME = 'SINGLE';
  }

//  console.log(parameters);
  if (isSingle) {
    singleInitializeWordLists(parameters.listID1, parameters.listID2);

    $(document).on('click', 'button[id^="buttonNextWord"]', function(event) {
//      parent.pluginToServer(PLUGIN_NAME, 'NextWord', { });
      if (answered)
        singleNextWord();
    });

    $("#buttonNextWord").css("visibility", "visible");
  } else {
    if (parent.isTeacher) {

    } else {//student
      $(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
//    parent.$(document).on('ServerToPlugin' + PLUGIN_NAME, function(e) {
        if (!parent) {
          return;
        }
        var messageReceived = param.detail;

        switch (messageReceived.pluginMessageType)
        {
          case 'NextWord':
            processNextWord(messageReceived.data);
            break;
          case 'ActivityComplete':
            processActivityComplete(messageReceived.data);
            break;
          case 'LetterTaken':
            processLetterTaken(messageReceived.data);
            break;
        }
      });




//    parent.pluginToServer(PLUGIN_NAME, 'GetStudentWall', {studentID: selectedStudentID});
    }
    parent.pluginToServer(PLUGIN_NAME, 'StudentOpen', {});

//  initWord();
  }
  $("#buttonTriggerSpin").on('click', function(event) {
    angularVelocity = 300;
  });

  $(document).on('click', 'button', function(event) {
    if (event.target.parentElement.className === "keyboard") {
      var alphabet = event.target.innerHTML;
//      console.log(alphabet);
      $(this).addClass("disabled");
      processAlphabet(alphabet);
    }
  });
  init();
});


//constants
var MAX_ANGULAR_VELOCITY = 360 * 1; //5
var NUM_WEDGES = 25;
var WHEEL_RADIUS = 310;
var ANGULAR_FRICTION = 0.01; //0.2

// globals
var angularVelocity = 0; //360
var lastRotation = 0;
var controlled = false;
var target, activeWedge, stage, layer, wheel,
    pointer, pointerTween, startRotation, startX, startY;


function purifyColor(color) {
  var randIndex = Math.round(Math.random() * 3);
  color[randIndex] = 0;
  return color;
}
function getRandomColor() {
  var r = 100 + Math.round(Math.random() * 55);
  var g = 100 + Math.round(Math.random() * 55);
  var b = 100 + Math.round(Math.random() * 55);
  var color = [r, g, b];
  color = purifyColor(color);
  color = purifyColor(color);

  return color;
}
function bind() {
  wheel.on('touchstart', function(evt) {

    var mousePos = stage.getPointerPosition();
    angularVelocity = 0;
    controlled = true;
    target = evt.targetNode;
    startRotation = this.rotation();
    startX = mousePos.x;
    startY = mousePos.y;
  });
  // add listeners to container
  document.body.addEventListener('touchend', function() {
    if (!controlled) {
      return;
    }
    controlled = false;

    if (angularVelocity > MAX_ANGULAR_VELOCITY) {
      angularVelocity = MAX_ANGULAR_VELOCITY;
    } else if (angularVelocity < -1 * MAX_ANGULAR_VELOCITY) {
      angularVelocity = -1 * MAX_ANGULAR_VELOCITY;
    } else if (angularVelocity >= 0 && angularVelocity < 100) {
      angularVelocity = MAX_ANGULAR_VELOCITY;
    } else if (angularVelocity < 0 && angularVelocity > -1 * 100) {
      angularVelocity = -1 * MAX_ANGULAR_VELOCITY;
    }

    angularVelocities = [];
  }, false);

  document.body.addEventListener('touchmove', function(evt) {
    if (!controlled) {
      return;
    }
    var mousePos = stage.getPointerPosition();
    if (controlled && mousePos && target) {
      var x1 = mousePos.x - wheel.x();
      var y1 = mousePos.y - wheel.y();
      var x2 = startX - wheel.x();
      var y2 = startY - wheel.y();
      var angle1 = Math.atan(y1 / x1) * 180 / Math.PI;
      var angle2 = Math.atan(y2 / x2) * 180 / Math.PI;
      var angleDiff = angle2 - angle1;

      if ((x1 < 0 && x2 >= 0) || (x2 < 0 && x1 >= 0)) {
        angleDiff += 180;
      }

      wheel.setRotation(startRotation - angleDiff);
    }
  }, false);
}
function getRandomReward() {
  var mainDigit = 5 * Math.round(Math.random() * 16);
  return mainDigit;
}
function convertToString(mainDigit) {
  var separateDigits = mainDigit.toString().split("");
  mainDigit = separateDigits[0];
  if (separateDigits[1]) {
    mainDigit += '\n' + separateDigits[1];
  }
  return mainDigit;// + '\n0';
}
function addWedge(n) {
  var s = getRandomColor();
  var rewardValue = getRandomReward();
  var reward = convertToString(rewardValue);
  var r = s[0];
  var g = s[1];
  var b = s[2];
  var angle = 360 / NUM_WEDGES;

  var endColor = 'rgb(' + r + ',' + g + ',' + b + ')';
  r += 100;
  g += 100;
  b += 100;

  var startColor = 'rgb(' + r + ',' + g + ',' + b + ')';

  var wedge = new Kinetic.Group({
    rotation: n * 360 / NUM_WEDGES,
  });

  var wedgeBackground = new Kinetic.Wedge({
    radius: WHEEL_RADIUS,
    angle: angle,
    fillRadialGradientStartRadius: 0,
    fillRadialGradientEndRadius: WHEEL_RADIUS,
    fillRadialGradientColorStops: [0, startColor, 1, endColor],
    fill: '#64e9f8',
    fillPriority: 'radial-gradient',
    stroke: '#ccc',
    strokeWidth: 2,
    rotation: (90 + angle / 2) * -1,
    rewardValue: rewardValue
  });

  wedge.add(wedgeBackground);

  var text = new Kinetic.Text({
    text: reward,
    fontFamily: 'Calibri',
    fontSize: 50,
    fill: 'white',
    align: 'center',
    stroke: 'yellow',
    strokeWidth: 1,
    listening: false

  });

  text.offsetX(text.width() / 2);
  text.offsetY(WHEEL_RADIUS - 15);

  wedge.add(text);

  wheel.add(wedge);
}

var activeWedge;
var currentRewardValue = 0;

function animate(frame) {
  if (Math.abs(angularVelocity) < 2) {
    angularVelocity = 0;
  } else if (Math.abs(angularVelocity) < 10) {
    if (angularVelocity < 0) {
      angularVelocity++;
    } else {
      angularVelocity--;
    }
  }
  // wheel
  if (angularVelocity != 0) {
    var angularVelocityChange = angularVelocity * frame.timeDiff * (1 - ANGULAR_FRICTION) / 1000;
    angularVelocity -= angularVelocityChange;
  }

//  console.log(angularVelocity);

  if (controlled) {
    angularVelocity = ((wheel.getRotation() - lastRotation) * 1000 / frame.timeDiff);
  }
  else {
    wheel.rotate(frame.timeDiff * angularVelocity / 1000);
  }
  lastRotation = wheel.getRotation();

  // pointer
  var intersectedWedge = layer.getIntersection({x: stage.width() / 2, y: 50});
  if (intersectedWedge && (!activeWedge || activeWedge._id !== intersectedWedge._id)) {

//    console.log(intersectedWedge.attrs.rewardValue);
    currentRewardValue = intersectedWedge.attrs.rewardValue;

    pointerTween.reset();
    pointerTween.play();
    activeWedge = intersectedWedge;
  }
}
function init() {
  stage = new Kinetic.Stage({
    container: 'container',
    width: 560,
    height: 200
  });
  layer = new Kinetic.Layer();
  wheel = new Kinetic.Group({
    x: stage.getWidth() / 2,
    y: WHEEL_RADIUS + 20
  });

  for (var n = 0; n < NUM_WEDGES; n++) {
    addWedge(n);
  }
  pointer = new Kinetic.Wedge({
    fillRadialGradientStartPoint: 0,
    fillRadialGradientStartRadius: 0,
    fillRadialGradientEndPoint: 0,
    fillRadialGradientEndRadius: 30,
    fillRadialGradientColorStops: [0, 'white', 1, 'red'],
    stroke: 'white',
    strokeWidth: 2,
    lineJoin: 'round',
    angle: 30,
    radius: 30,
    x: stage.getWidth() / 2,
    y: 20,
    rotation: -105,
    shadowColor: 'black',
    shadowOffset: {x: 3, y: 3},
    shadowBlur: 2,
    shadowOpacity: 0.5
  });

  // add components to the stage
  layer.add(wheel);
  layer.add(pointer);
  stage.add(layer);

  pointerTween = new Kinetic.Tween({
    node: pointer,
    duration: 0.1,
    easing: Kinetic.Easings.EaseInOut,
    y: 30
  });

  pointerTween.finish();

  var radiusPlus2 = WHEEL_RADIUS + 2;

  wheel.cache({
    x: -1 * radiusPlus2,
    y: -1 * radiusPlus2,
    width: radiusPlus2 * 2,
    height: radiusPlus2 * 2
  }).offset({
    x: radiusPlus2,
    y: radiusPlus2
  });

  layer.draw();

  // bind events
  bind();

  anim = new Kinetic.Animation(animate, layer);

//  document.getElementById('debug').appendChild(layer.hitCanvas._canvas);

  // wait one second and then spin the wheel
  setTimeout(function() {
    anim.start();
  }, 1000);
}
var anim;

function initWord() {
  currentWord = currentWord.toUpperCase();
  charactersFound = 0;

  var templateStart = '<button class="btn btn-disabled btn-lg col-centered boardfont" id="letter';
  var templateEnd = '</button>';

  var html = "";

  var chars = currentWord.split('');

  _.each(chars, function(c, i) {
    html += templateStart + i + '">' + '?' + templateEnd;
  })

  $("#board").html(html);
}

var charactersFound = 0;

function processAlphabet(alpha) {
  var chars = currentWord.split('');
  var isCorrect = false;

  _.each(chars, function(c, i) {
    if (c === alpha) {
      charactersFound++;
      $("#letter" + i).html(alpha);
      sendLetter(alpha);
//      $("#button" + alpha).removeClass("disabled");
      $("#button" + alpha).addClass("correct");

      isCorrect = true;
    }
  });
  if (isCorrect) {
    countCorrect++;
  } else {
    countWrong++;
  }
  if (charactersFound === currentWord.length) {
    parent.Messenger().post({
      message: 'Solved!',
      id: PLUGIN_NAME,
      type: 'success',
      hideAfter: 5,
      showCloseButton: true
    });

    setTimeout(function() {
      $("#buttonNextWord").removeClass("disabled");
//      processRevealAnswer(dataResults);
    }, 500);
  }
}

function sendLetter(letter) {

  var dataToSend = {
    letter: letter
  }

  if (isSingle) {
    dataToSend.meta = {points: Math.round(currentRewardValue / 10)};
  } else {
    dataToSend.meta = {points: currentRewardValue};
  }

  parent.pluginToServer(PLUGIN_NAME, 'StudentAnswer', dataToSend);

}

function processNextWord(data) {
  currentWord = data.currentWord.word;

  var millisTillStart;
  if (isSingle) {
    millisTillStart = 500;
  } else {
    var timeToStart = data.timeToStart;
    var serverTimeNow = (new Date()).valueOf() + parent.document.timeDifference;
    millisTillStart = timeToStart - serverTimeNow;
//    console.log(millisTillStart);
  }

  setTimeout(function() {
    initWord();
//      $("#currentWord").html(currentWord.word);
  }, millisTillStart);


  $("#currentCategory").html(data.currentWord.category);

  $(".keyboard").children().each(function() {
    $(this).removeClass("disabled");
    $(this).removeClass("taken");
    $(this).removeClass("correct");
  });
}

function processLetterTaken(data) {
  var alpha = data.letter;
  var chars = currentWord.split('');

  $("#button" + alpha).addClass("disabled");
  $("#button" + alpha).addClass("taken");

  _.each(chars, function(c, i) {
    if (c === alpha) {
      charactersFound++;
      $("#letter" + i).html(alpha);
    }
  });
}


function singleInitializeWordLists(listID1, listID2) {
  var session = JSON.parse(parent.$("#data-session").html());
  var wordLists = session.wordLists;

  wordList1 = _.findWhere(wordLists, {_id: listID1});
  wordList2 = _.findWhere(wordLists, {_id: listID2});

  if (!wordList1 || !wordList2) {
    return;
  }

  wordStatus = [];
  studentAnswers = [];

  var wordID = 0;

  _.each(wordList1.words, function(word) {
    var wordData = {};
    wordData.word = word;
    wordData.isAnswered = false;
    wordData.studentID = null;
    wordData.category = wordList1.title;
    wordData.wordID = wordID++;
    if (/^[a-zA-Z]*$/.test(wordData.word))
    {
      wordStatus.push(wordData);
    }
  });
  _.each(wordList2.words, function(word) {
    var wordData = {};
    wordData.word = word;
    wordData.isAnswered = false;
    wordData.studentID = null;
    wordData.category = wordList2.title;
    wordData.wordID = wordID++;
    if (/^[a-zA-Z]*$/.test(wordData.word))
    {
      wordStatus.push(wordData);
    }
  });

  //randomize
  wordStatus = _.sample(wordStatus, _.size(wordStatus));

  var dataToSend = {
    currentWord: wordStatus[currentWordIndex],
//    category1: wordList1.title,
//    category2: wordList2.title,
    timeToStart: currentWordStartTime
  };

  processNextWord(dataToSend);

}

function singleNextWord() {
  currentWordIndex++;
  if (!wordStatus[currentWordIndex]) {
    $("#buttonNextWord").html("Completed");
    $("#buttonNextWord").addClass("disabled");
    processActivityComplete();
    return;
  }

  studentAnswers = [];

//  currentWordLetters = wordStatus[currentWordIndex].word.toUpperCase().split('');
  currentWordStartTime = (new Date()).valueOf() + 1000;

  var dataToSend = {
    currentWord: wordStatus[currentWordIndex],
//    category1: wordList1.title,
//    category2: wordList2.title,
    timeToStart: currentWordStartTime
  };
  processNextWord(dataToSend);
  $("#buttonNextWord").addClass("disabled");
}

function processActivityComplete(data) {
  var template = $("#templateResults").html();
  var html = _.template(template, {
    title: "Results",
    countCorrect: countCorrect,
    countWrong: countWrong
  });
  parent.bootbox.alert(html);
}