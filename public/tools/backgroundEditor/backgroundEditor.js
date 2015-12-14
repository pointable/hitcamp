function initCanvas() {
  kitchensink = angular.module('kitchensink', []);


  kitchensink.config(function($interpolateProvider) {
//    $interpolateProvider
//        .startSymbol('{[')
//        .endSymbol(']}');
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

  kitchensink.controller('CanvasControls', ['$scope', function($scope) {

      console.log("CanvasControls: %O", $scope);
      $scope.canvas = canvas;
      $scope.getActiveStyle = getActiveStyle;

      $scope.elementsMap = [
        '01', '05', '09', '10'
//         '03', 
      ];
      $scope.elementsNature = [
        'sun_1', 'cloud_4', 'cloud_5', 'cloud_2',
        'mountain_1', 'mountain_2', 'mountain_3', 'mountain_4_1',
        'tree_1_1', 'tree_2_1', 'tree_3_1', 'tree_4_2',
        'tree_5_1', 'tree_5_2', 'tree_7_1', 'tree_8_2',
      ];
      $scope.elementsBuilding = [
        'bridge_1', 'bridge_3', 'bridge_5', 'building_1',
        'building_2', 'building_3', 'building_6', 'building_8_1',
        'highrise_1', 'highrise_4', 'highrise_7', 'highrise_8',
        'house_1', 'house_3', 'house_7_1', 'house_9_1',
      ];

      addAccessors($scope);
      watchCanvas($scope);
    }]);


  var element = document.getElementById('adventure-wrapper');
  angular.bootstrap(angular.element(element), ['kitchensink']);
}

var kitchensink = {};
var canvas;

var backgroundEditorMode = false;
var imgJSON;
var backgroundThumbnailURL;
var backgroundImageURL;

$(document).ready(function() {
  //delay to open filepicker
  setTimeout(function() {
    $("#filepicker").attr("src", "/tools/drive/filePickerGoogle.html");
  }, 3500);

  $(document).on('click', '.js-edit-background', function(event) {
    event.preventDefault();
    backgroundEditorMode = !backgroundEditorMode;

    if (backgroundEditorMode) {
      $(".tile-collection").addClass("background-editor-mode");
      $(".activity-wrapper").addClass("background-editor-mode");
      $(".btn-add-activity").addClass("background-editor-mode");
      $(".lesson-name").addClass("background-editor-mode");
      $("#bd-wrapper").css("display", "block");
      $(".btn-edit-background").html("Save and Exit Background Editor");
      $("#background-saved").css("display", "none");
      $("#background-saving").css("display", "none");
      $(".wordList-editor-area").css("visibility", "hidden");
      var loaded;
      if ($(".canvas-container").length) {
        $(".canvas-container").css("display", "block");
        loaded = true;
      } else {
        canvas = new fabric.Canvas('canvas');


        $('.page').on('scroll', canvas.calcOffset.bind(canvas));

        initCanvas();
      }
//      
//      if (loaded) {
//        var element = document.getElementById('adventure-wrapper');
////        angular.bootstrap(angular.element(element), ['kitchensink']);
//      }
      if (!imgJSON) {
        var lessonHTML = $("#data-results").html();
        lessonHTML = replaceAll(lessonHTML, "http://sf.hit.camp", "");
        lessonHTML = replaceAll(lessonHTML, "http://hit.camp", "");

        var lessonData = JSON.parse(lessonHTML);
        imgJSON = lessonData.backgroundImageJSON;
        backgroundThumbnailURL = lessonData.backgroundThumbnailURL;
        backgroundImageURL = lessonData.backgroundImageURL;
      }

      if (imgJSON) {
        canvas.loadFromJSON(imgJSON, function() {
          $("#adventure-view").css("background-image", "");
          _.each(canvas._objects, function(object) {
            if (object.get('type') !== 'Path' && object.get('type') !== 'i-text') {
              object.perPixelTargetFind = true;
            }
            if (object.get('strokeWidth') === 99 || object.get('strokeWidth') === 11) {
              canvas.backgroundObject = object;
            }
            if (object.get('type') === 'line') {
              object.setControlsVisibility({'tl': false, 'tr': false, 'bl': false, 'br': false, 'mb': true, 'mt': true});
            }
          });
          canvas.renderAll();
        });
      } else
      {
        $("#adventure-view").css("background-image", "");
      }

      if (!$("#filepicker")[0].contentWindow.oauthToken) {
        var frame = $("#dialog-filepicker");
        frame.css('display', 'block');
        $("#filepicker")[0].contentWindow.hideAfterAuthorization = true;
      }
    } else {

      canvas.deactivateAll().renderAll();
      var img = canvas.toDataURL("image/png");
      $("#adventure-view").css("background", "url('" + img + "')");
      $(".tile-collection").removeClass("background-editor-mode");
      $(".activity-wrapper").removeClass("background-editor-mode");
      $(".btn-add-activity").removeClass("background-editor-mode");
      $(".lesson-name").removeClass("background-editor-mode");
      $(".canvas-container").css("display", "none");
      $("#bd-wrapper").css("display", "none");
      $(".wordList-editor-area").css("visibility", "visible");
      $(".btn-edit-background").html("Edit Background");

//      var imageData = canvas.toJSON();
//      if (canvas.backgroundObject){
//        imageData.backgroundObject = canvas.backgroundObject;
//      }
      var newImgJSON = JSON.stringify(canvas);

      if (newImgJSON != imgJSON) {
        //background changed
        canvasNeedToSave = true;
        imgJSON = newImgJSON;

//        var fileDataBeforeUpload = {
//          type: 'ResourceUpdate',
//          backgroundImageURL: backgroundImageURL,
//          backgroundThumbnailURL: backgroundThumbnailURL,
//          backgroundImageJSON: imgJSON
//        }
//        $(document).trigger('BackgroundImageUpdate', {detail: fileDataBeforeUpload});

        $("#background-saving").css("display", "inline-block");
        $("#background-saved").css("display", "none");
        processForeground(function(thumbnailData) {
          $("#filepicker")[0].contentWindow.uploadBackground(img, function(imageURL) {
            $("#filepicker")[0].contentWindow.uploadBackground(thumbnailData, function(thumbnailURL) {
              var fileData = {
                type: 'ResourceUpdate',
                backgroundImageURL: imageURL,
                backgroundThumbnailURL: thumbnailURL,
                backgroundImageJSON: imgJSON
              }
//              document.backgroundThumbnailURL = thumbnailURL;
              document.backgroundImageURL = imageURL;
//              backgroundThumbnailURL = thumbnailURL;
//              backgroundImageURL = imageURL;
//        fileData.backgroundImageURL = imageURL;
//        fileData.backgroundImageJSON = imgJSON;
//              fileData = JSON.stringify(fileData);
              $(document).trigger('BackgroundImageUpdate', {detail: fileData});

              $("#background-saved").css("display", "inline-block");
              $("#background-saving").css("display", "none");

              canvasNeedToSave = false;
              setTimeout(function() {
                $("#background-saved").css("display", "none");
              }, 3000);
//        $(document).trigger('BackgroundImageUpdate', ["fileData"]);
            });
          });
        });
      }
    }

    loaded = true;
  });

});

var canvasNeedToSave = false;

$(window).bind('beforeunload', function() {
  if (!canvasNeedToSave) {
    var newImgJSON = JSON.stringify(canvas);
    if (newImgJSON != imgJSON) {
      canvasNeedToSave = true;
    }
  }

  if (canvasNeedToSave)
    return 'Background has not been saved yet.';
  else
    return;
});

$(document).keyup(function(event) {
  if (event.keyCode === 46)
  {
    if (!canvas) {
      return;
    }
    var activeObject = canvas.getActiveObject(),
        activeGroup = canvas.getActiveGroup();

    if (activeGroup) {
      var objectsInGroup = activeGroup.getObjects();
      canvas.discardActiveGroup();
      objectsInGroup.forEach(function(object) {
        canvas.remove(object);
      });
    }
    else if (activeObject) {
      if (activeObject.get('type') !== 'i-text')
        canvas.remove(activeObject);
    }
  }
});

function pickedImages(imageDataArray) {
  _.each(imageDataArray, function(imageData) {
    addImageFromUpload(imageData.resourceURL, 0.3);
  });
}

function addImageFromUpload(imageName, scale) {
  var coord = getRandomLeftTop();

  fabric.Image.fromURL('' + imageName, function(image) {

    image.set({
      left: coord.left,
      top: coord.top,
      angle: 0,
      perPixelTargetFind: true

    })
        .scale(scale)
        .setCoords();

    if (image) {
      canvas.add(image);
      selectNewObject();
    }
  }, {crossOrigin: 'anonymous'});
}

function addPlacemarker(imageName, left, top) {
//  var coord = getRandomLeftTop();

  fabric.Image.fromURL('' + imageName, function(image) {

    image.set({
      left: left,
      top: top,
      angle: 0,
      perPixelTargetFind: true

    })
        .scale(0.15)
        .setCoords();

    if (image) {
      canvas.add(image);
//      selectNewObject();
    }
  }, {crossOrigin: 'anonymous'});
}

function selectNewObject() {
  if (canvas._objects.length > 1)
    canvas.setActiveObject(canvas.item(canvas._objects.length - 1));
}
function activateFilePickerBackgroundEditor() {
  activateFilePicker();
}

var zoomFactor = 4;
function processForeground(callback) {

  var img = document.createElement('IMG');
  var imgBlue = document.createElement('IMG');

  img.crossOrigin = 'Anonymous';
  imgBlue.crossOrigin = 'Anonymous';
  img.onload = function() {
    imgBlue.onload = function() {
      var canvasTemp = document.createElement('canvas');
      var ctx = canvasTemp.getContext('2d');
      canvasTemp.height = canvas.height / zoomFactor;
      canvasTemp.width = canvas.width / zoomFactor;

      ctx.drawImage(document.getElementById("canvas"), 0, 0, canvasTemp.width, canvasTemp.height);


      var horizontalTiles = $("#adventure-view").find(".horizontal-line.tile-active");
      _.each(horizontalTiles, function(element) {
        var element = $(element).parents(".activity-wrapper-tiles")[0];
        var left = (element.offsetLeft + 55 - 145 / 2) / zoomFactor;
        var top = (element.offsetTop + 30) / zoomFactor;
        ctx.strokeStyle = '#d54207';
        ctx.setLineDash([10 / zoomFactor]);
        ctx.lineWidth = 10 / zoomFactor;
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(left + (145 / zoomFactor), top);
        ctx.stroke();
      });

      var verticalTiles = $("#adventure-view").find(".vertical-line.tile-active");
      _.each(verticalTiles, function(element) {
        var element = $(element).parents(".activity-wrapper-tiles")[0];
        var left = (element.offsetLeft + 55) / zoomFactor;
        var top = (element.offsetTop + 30 - 120 / 2) / zoomFactor;
        ctx.strokeStyle = '#d54207';
        ctx.setLineDash([10 / zoomFactor]);
        ctx.lineWidth = 10 / zoomFactor;
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(left, top + (120 / zoomFactor));
        ctx.stroke();
      });

      var activityElements = $("#adventure-view").find(".drag-drop");
      _.each(activityElements, function(element) {
        var left = (element.offsetLeft + 37) / zoomFactor;
        var top = element.offsetTop / zoomFactor;

//        console.log($(element).find(".checkpoint-media"));
        if ($(element).find(".markerBlue").length > 0) {
          ctx.drawImage(imgBlue, left, top, img.width * 0.15 / zoomFactor, img.height * 0.15 / zoomFactor);
        } else {
          ctx.drawImage(img, left, top, img.width * 0.15 / zoomFactor, img.height * 0.15 / zoomFactor);
        }
      });

      var dataURL = canvasTemp.toDataURL('image/png');
      callback.call(this, dataURL);
// Clean up
      canvasTemp = null;
      img = null;
    };
    imgBlue.src = '/media/assets/map_markers/127.png';
  };
  img.src = '/media/assets/map_markers/116.png';
}

function escapeRegExp(string) {
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
function replaceAll(string, find, replace) {
  return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}