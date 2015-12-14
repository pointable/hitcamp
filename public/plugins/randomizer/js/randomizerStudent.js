var PLUGIN_NAME = 'RANDOMIZER';
var bomb = '.js-bomb';
var bombArea = '#SURFACE';
//var snd = new Audio("sound/Bomb_Exploding-Sound_Explorer-68256487.mp3");
$(document).ready(function() {

  //notify server plugin loaded
  parent.pluginToServer(PLUGIN_NAME, 'StudentJoin', {});

  //listener to receive custom plugin server messages 
  $(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
    if (!parent) {
      return;
    }
//  parent.$(document).on('ServerToPlugin' + PLUGIN_NAME, function(e) {
    var messageReceived = param.detail;
//    if (messageReceived.pluginName != PLUGIN_NAME) return;

    switch (messageReceived.pluginMessageType)
    {
      //set all custom message type here
      case 'StudentBlink':
        studentBlink();
        break;
      case 'StudentChosen':
        studentChosen(messageReceived.data);
        break;
      case 'Reset':
        processReset(messageReceived.data);
        break;
      case 'Results':
        studentChosen(messageReceived.data);
        break;
      case 'MarkedAnswer':
        studentMarkedAnswer(messageReceived.data);
        break;
    }
  });


  if (parent.isTeacher) {
    $(bombArea).click(function() {
      //    console.log("test");
      parent.pluginToServer(PLUGIN_NAME, 'StartRandom', {});
    });
  }
  // buffers automatically when created

  surfaceColor("color-noBomb");
});


function processReset() {
  $("#SURFACE").removeClass();
  $("#SURFACE").addClass("color-noBomb");
}

//handlers for each command from server
function studentBlink() {
  var effect = 'wobble';
  animateBomb(effect);
  surfaceColor("color-bombing");
  setTimeout(function() {
    surfaceColor("color-noBomb");
  }, 200);
}

function studentChosen(data) {
//  console.log("Student Chosen");
  var effect = 'bounceOut';
  animateBomb(effect);
  surfaceColor("color-bombing");
  setTimeout(function() {
    surfaceColor("color-bombed");
//    snd.play();
  }, 200);
  biggerBomb();
//  parent.Messenger().post({
//    message: 'You have been selected!',
//    id: 'Randomizer',
//    type: 'error',
//    hideAfter: 10,
//    showCloseButton: true
//  });
}

function studentMarkedAnswer(data) {
  if (data.isCorrect) {

    $("#SURFACE").removeClass("answer-wrong");
    $("#SURFACE").addClass("answer-correct");
  } else {
    $("#SURFACE").removeClass("answer-correct");
    $("#SURFACE").addClass("answer-wrong");
  }
}

function biggerBomb() {
  $(bomb).addClass("bigger-bomb");
}

function surfaceColor(color) {
  $(bombArea).attr("class", color);
}

function animateBomb(effect) {
  $(bomb).addClass('animated');
  $(bomb).addClass(effect);
  $(bomb).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
    $(bomb).removeClass('animated');
    $(bomb).removeClass(effect);
  });
}
