(function() {
  "use strict";

  var Control = {};
  document.Control = Control;
  Control.settings = Control.settings || {};

  Control.settings.iosIPHONESleepPreventIntervalTime = 50000; //50000
  Control.settings.iosIPADSleepPreventIntervalTime = 100000; //110000
  Control.settings.iosSleepPreventIntervalTime = Control.settings.iosIPHONESleepPreventIntervalTime;

  Control.settings.iosSleepPreventUrl = '/tools/misc/check.html';
  Control.settings.androidSleepPreventUrl = '/tools/misc/ps1.mp4';
  Control.PreventSleep = (function() {
    var init,
        activate,
        deactivate,
        enabled,
        iosTimer,
        iosSleepPreventInterval = null,
        preventSleepAndroid,
        androidPreventSleepStarted = false;

    var isIOS = false;
    var isIPAD = false;

    init = function() {
      if (enabled()) {
        activate();
      }
    };
    alert("1");

    var iosTimerRestart = function() {
      console.log("iosTimerRestart");
      if (iosTimer) {
        clearTimeout(iosTimer);
      }

      iosTimer = window.setTimeout(iosTimerReached, Control.settings.iosSleepPreventIntervalTime);
    };

    var iosTimerReached = function() {
      if (!socket.io.engine.transport.ws) {
        return;
      }
      console.log("iosTimerReached");
      window.location.href = Control.settings.iosSleepPreventUrl;
      window.setTimeout(function() {
        window.stop();
        console.log("timed out");
      }, 0);
      iosTimerRestart();
    };

    var iosTimerProcessor = function() {
      iosTimerRestart();

      window.addEventListener("touchstart", function() {
        iosTimerRestart();
      });
    };

    activate = function() {
//      alert();
      deactivate();

      if (navigator.userAgent.match(/(iPhone|iPod|iPad|Mac|Chrome)/g) ? true : false) { //iPhone|iPod|iPad
        isIOS = true;
        if (navigator.userAgent.match(/(iPad)/g) ? true : false) {
          isIPAD = true;
          Control.settings.iosSleepPreventIntervalTime = Control.settings.iosIPADSleepPreventIntervalTime;
        }
//        iosTimerProcessor();
        iosSleepPreventInterval = setInterval(function() {
//          var currentURL = window.location.href;
          window.location.href = Control.settings.iosSleepPreventUrl;
          window.setTimeout(function() {
            console.log("stop");
            window.stop();
          }, 0);
        }, Control.settings.iosSleepPreventIntervalTime);
      } else if (navigator.userAgent.match(/android/ig)) {
//        alert("android");
        window.addEventListener("touchstart", function() {
          preventSleepAndroid();
        });
      }
    };

    preventSleepAndroid = function() {

      var audioVideoLoop, videoUrl;
      if (androidPreventSleepStarted) {
        return;
      }

//      alert("preventsleep");

      androidPreventSleepStarted = true;
      jq("#ps").remove();

      videoUrl = Control.settings.androidSleepPreventUrl;
//            if (Control.settings.core.useStaticServer === true) {
//                videoUrl = videoUrl.replace(/\/public\//, Control.settings.core.staticServerUrl + "/");
//            }

      audioVideoLoop = document.createElement("video");
      audioVideoLoop.setAttribute("id", "ps");
      audioVideoLoop.setAttribute("loop", false);
      audioVideoLoop.src = videoUrl;
      audioVideoLoop.addEventListener("ended", function() {
        androidPreventSleepStarted = false;
        audioVideoLoop.removeEventListener("ended", window, false);
//        if (audioVideoLoop.currentTime === 0) {
//          audioVideoLoop.removeEventListener("progress", window, false);
//        }
      });
      audioVideoLoop.play();
      document.body.appendChild(audioVideoLoop);
    };

    deactivate = function() {
      clearInterval(iosSleepPreventInterval);
      jq("#ps").remove();
      androidPreventSleepStarted = false;
    };

    enabled = function() {
      return true;
    };

    return {
      init: init,
      activate: activate,
      deactivate: deactivate
    };
  }());
}());

document.Control.PreventSleep.init();
//document.Control.PreventSleep.activate();