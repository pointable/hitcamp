function getActiveStyle(styleName, object) {
  object = object || canvas.getActiveObject();
  if (!object)
    return '';

  return (object.getSelectionStyles && object.isEditing)
      ? (object.getSelectionStyles()[styleName] || '')
      : (object[styleName] || '');
}

function setActiveStyle(styleName, value, object) {
  object = object || canvas.getActiveObject();
  if (!object)
    return;

  if (object.setSelectionStyles && object.isEditing) {
    var style = {};
    style[styleName] = value;
    object.setSelectionStyles(style);
    object.setCoords();
  }
  else {
    object[styleName] = value;
  }

  object.setCoords();
  canvas.renderAll();
}


function getActiveProp(name) {
  var object = canvas.getActiveObject();
  if (!object)
    return '';

  return object[name] || '';
}

function setActiveProp(name, value) {
  var object = canvas.getActiveObject();
  if (!object)
    return;

  object.set(name, value).setCoords();
  canvas.renderAll();
}

function addAccessors($scope) {

  $scope.getOpacity = function() {
    return getActiveStyle('opacity') * 100;
  };
  $scope.setOpacity = function(value) {
    setActiveStyle('opacity', parseInt(value, 10) / 100);
  };

  $scope.getFill = function() {
    return getActiveStyle('fill');
  };
  $scope.setFill = function(value) {
    setActiveStyle('fill', value);
  };

  $scope.isBold = function() {
    return getActiveStyle('fontWeight') === 'bold';
  };
  $scope.toggleBold = function() {
    setActiveStyle('fontWeight',
        getActiveStyle('fontWeight') === 'bold' ? '' : 'bold');
  };
  $scope.isItalic = function() {
    return getActiveStyle('fontStyle') === 'italic';
  };
  $scope.toggleItalic = function() {
    setActiveStyle('fontStyle',
        getActiveStyle('fontStyle') === 'italic' ? '' : 'italic');
  };

  $scope.isUnderline = function() {
    return getActiveStyle('textDecoration').indexOf('underline') > -1;
  };
  $scope.toggleUnderline = function() {
    var value = $scope.isUnderline()
        ? getActiveStyle('textDecoration').replace('underline', '')
        : (getActiveStyle('textDecoration') + ' underline');

    setActiveStyle('textDecoration', value);
  };

  $scope.isLinethrough = function() {
    return getActiveStyle('textDecoration').indexOf('line-through') > -1;
  };
  $scope.toggleLinethrough = function() {
    var value = $scope.isLinethrough()
        ? getActiveStyle('textDecoration').replace('line-through', '')
        : (getActiveStyle('textDecoration') + ' line-through');

    setActiveStyle('textDecoration', value);
  };
  $scope.isOverline = function() {
    return getActiveStyle('textDecoration').indexOf('overline') > -1;
  };
  $scope.toggleOverline = function() {
    var value = $scope.isOverline()
        ? getActiveStyle('textDecoration').replace('overlin', '')
        : (getActiveStyle('textDecoration') + ' overline');

    setActiveStyle('textDecoration', value);
  };

  $scope.getText = function() {
    return getActiveProp('text');
  };
  $scope.setText = function(value) {
    setActiveProp('text', value);
  };

  $scope.getTextAlign = function() {
    return capitalize(getActiveProp('textAlign'));
  };
  $scope.setTextAlign = function(value) {
    setActiveProp('textAlign', value.toLowerCase());
  };

  $scope.getFontFamilygetStrokeColor = function() {
    return getActiveProp('fontFamily').toLowerCase();
  };
  $scope.setFontFamily = function(value) {
    setActiveProp('fontFamily', value.toLowerCase());
  };
  $scope.getFontFamily = function(value) {
    return getActiveProp('fontFamily');
  };

  $scope.getBgColor = function() {
    return getActiveProp('backgroundColor');
  };
  $scope.setBgColor = function(value) {
    setActiveProp('backgroundColor', value);
  };

  $scope.getTextBgColor = function() {
    return getActiveProp('textBackgroundColor');
  };
  $scope.setTextBgColor = function(value) {
    setActiveProp('textBackgroundColor', value);
  };

  $scope.getStrokeColor = function() {
    return getActiveStyle('stroke');
  };
  $scope.setStrokeColor = function(value) {
    setActiveStyle('stroke', value);
  };

  $scope.getStrokeWidth = function() {
    return getActiveStyle('strokeWidth');
  };
  $scope.setStrokeWidth = function(value) {
    setActiveStyle('strokeWidth', parseInt(value, 10));
  };

  $scope.getFontSize = function() {
    return getActiveStyle('fontSize');
  };
  $scope.setFontSize = function(value) {
    setActiveStyle('fontSize', parseInt(value, 10));
  };
  $scope.getActiveShape = function() {
    var object = canvas.getActiveObject();
    if (!object)
      return '';
    if (object.get('type') === 'circle' || object.get('type') === 'line'
        || object.get('type') === 'triangle' || object.get('type') === 'rect' || object.get('type') === 'text')
      return object;

    return '';
  };
  $scope.getActiveLine = function() {
    var object = canvas.getActiveObject();

    if (!object)
      return '';
    if (object.get('type') === 'line')
      return object;

    return '';
//    return object[name] || '';
  };
  $scope.getLineHeight = function() {
    return getActiveStyle('lineHeight');
  };
  $scope.setLineHeight = function(value) {
    setActiveStyle('lineHeight', parseFloat(value, 10));
  };

  $scope.getBold = function() {
    return getActiveStyle('fontWeight');
  };
  $scope.setBold = function(value) {
    setActiveStyle('fontWeight', value ? 'bold' : '');
  };

  $scope.getCanvasBgColor = function() {
    return canvas.backgroundColor;
  };
  $scope.setCanvasBgColor = function(value) {
    console.log(value);
    canvas.backgroundColor = value;
    canvas.renderAll();
  };
  $scope.canvasTransparent = function() {
    console.log("canvasTransparent");
    canvas.backgroundColor = "rgba(0, 0, 0, 0)";
    canvas.renderAll();
  };

  $scope.addRect = function() {
    var coord = getRandomLeftTop();

    canvas.add(new fabric.Rect({
      left: coord.left,
      top: coord.top,
      fill: '#' + getRandomColor(),
      width: 100,
      height: 100,
      opacity: 0.8,
      perPixelTargetFind: true
    }));

    selectNewObject();
  };

  $scope.addCircle = function() {
    var coord = getRandomLeftTop();

    canvas.add(new fabric.Circle({
      left: coord.left,
      top: coord.top,
      fill: '#' + getRandomColor(),
      radius: 100,
      opacity: 0.8,
      perPixelTargetFind: true
    }));

    selectNewObject();
  };

  $scope.addTriangle = function() {
    var coord = getRandomLeftTop();

    canvas.add(new fabric.Triangle({
      left: coord.left,
      top: coord.top,
      fill: '#' + getRandomColor(),
      width: 100,
      height: 100,
      opacity: 0.8,
      perPixelTargetFind: true
    }));

    selectNewObject();
  };

  $scope.addLine = function() {
    var coord = getRandomLeftTop();

    canvas.add(new fabric.Line([0, 0, 200, 0], {
      left: coord.left,
      top: coord.top,
      stroke: '#' + getRandomColor(),
      strokeWidth: 10,
      lockScalingY: false,
      lockScalingX: false,
      perPixelTargetFind: true
//      lockUniScaling: true
    }).setControlsVisibility({'tl': false, 'tr': false, 'bl': false, 'br': false, 'mb': true, 'mt': true}));

    selectNewObject();
  };

  $scope.addText = function() {
    var iText = new fabric.IText('Click Twice to Edit Text', {
      left: 100,
      top: 150,
      fontFamily: 'comic sans ms',
      fill: '#333',
//      styles: {
//        0: {
////          0: {fill: 'red', fontSize: 20},
////          1: {fill: 'red', fontSize: 30},
////          2: {fill: 'red', fontSize: 40},
////          3: {fill: 'red', fontSize: 50},
////          4: {fill: 'red', fontSize: 60},
//        }
//      }
    });
    canvas.add(iText);

    selectNewObject();
  };

  var addShape = function(shapeName) {

//    console.log('adding shape', shapeName);

    var coord = getRandomLeftTop();

    fabric.loadSVGFromURL('../assets/' + shapeName + '.svg', function(objects, options) {

      var loadedObject = fabric.util.groupSVGElements(objects, options);

      loadedObject.set({
        left: coord.left,
        top: coord.top,
        angle: getRandomInt(-10, 10),
        perPixelTargetFind: true
      })
          .setCoords();

      canvas.add(loadedObject);
    });
  };

  $scope.maybeLoadShape = function(e) {
    var $el = $(e.target).closest('button.shape');
    if (!$el[0])
      return;

    var id = $el.prop('id'), match;
    if (match = /\d+$/.exec(id)) {
      addShape(match[0]);
    }
  };

  function addImageRandom(imageName, minScale, maxScale) {
    var coord = getRandomLeftTop();

    fabric.Image.fromURL('' + imageName, function(image) {

      image.set({
        left: 10, //coord.left,
        top: 10, //coord.top,
        angle: getRandomInt(-10, 10),
        perPixelTargetFind: true
      })
          .scale(getRandomNum(minScale, maxScale))
          .setCoords();

      canvas.add(image);
    });
  }

  function addImage(imageName, scale) {
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

      canvas.add(image);
      selectNewObject();
    });
  }
  function addImageBackground(imageName, scale) {
    var coord = {left: 0, top: 150};

    fabric.Image.fromURL('' + imageName, function(image) {

      image.set({
        left: coord.left,
        top: coord.top,
        angle: 0, //getRandomInt(0, 0),
        perPixelTargetFind: true
      })
          .scale(scale)
          .setCoords();

      canvas.add(image);
      selectNewObject();
    });
  }

  $scope.addImageMap = function(index) {
    addImageBackground('/media/assets/islands/' + index + '.png', 0.2);
  };
  $scope.addImageStreet = function(index) {
    addImage('/media/assets/street/' + index + '.png', 0.2);
  };
  $scope.addImagePlaces = function(index) {
    addImage('/media/assets/places/' + index + '.png', 0.1);
  };
  $scope.addImageTransport = function(index) {
    addImage('/media/assets/transport/' + index + '.png', 0.1);
  };
  $scope.addImageEnvironment = function(index) {
    addImage('/media/assets/environment/' + index + '.png', 0.3);
  };
  $scope.addImageBuilding = function(index) {
    addImage('/media/assets/buildings/' + index + '.png', 0.3);
  };

  $scope.confirmClear = function() {
    if (confirm('Are you sure?')) {
      canvas.clear();
    }
  };

  $scope.rasterize = function() {
    if (!fabric.Canvas.supports('toDataURL')) {
//      alert('This browser doesn\'t provide means to serialize canvas to an image');
    }
    else {
      window.open(canvas.toDataURL('png'));
    }
  };

  rasterize = function() {
    if (!fabric.Canvas.supports('toDataURL')) {
//      alert('This browser doesn\'t provide means to serialize canvas to an image');
    }
    else {
      window.open(canvas.toDataURL('png'));

    }
  };


  $scope.rasterizeSVG = function() {
    window.open(
        'data:image/svg+xml;utf8,' +
        encodeURIComponent(canvas.toSVG()));
  };

  $scope.rasterizeJSON = function() {
//    alert(JSON.stringify(canvas));
  };

  $scope.getSelected = function() {
    return canvas.getActiveObject();
  };

  $scope.removeSelected = function() {
    var activeObject = canvas.getActiveObject(),
        activeGroup = canvas.getActiveGroup();

    if (activeGroup) {
      var objectsInGroup = activeGroup.getObjects();
      canvas.discardActiveGroup();
      objectsInGroup.forEach(function(object) {
        if (canvas.backgroundObject === activeObject) {
          canvas.backgroundObject = null;
        }
        canvas.remove(object);
      });
    }
    else if (activeObject) {
      if (canvas.backgroundObject === activeObject) {
        canvas.backgroundObject = null;
      }
      canvas.remove(activeObject);
    }
  };
  $scope.deselect = function() {
    canvas.deactivateAll().renderAll();
  };

  $scope.cloneSelected = function() {
    var activeObject = canvas.getActiveObject(),
        activeGroup = canvas.getActiveGroup();

    if (activeGroup) {
      var objectsInGroup = activeGroup.getObjects();
//      canvas.discardActiveGroup();
      objectsInGroup.forEach(function(object) {
        object.clone(function(newObject) {
          newObject.left = object.left + 50;
          newObject.top = object.top + 50;
          canvas.add(newObject);
        });
      });
    }
    else if (activeObject) {

//      activeObject.clone(function(newObject) {
      var newObject = fabric.util.object.clone(activeObject);
      newObject.left = activeObject.left + 50;
      newObject.top = activeObject.top;// + 30;
      canvas.add(newObject);
      selectNewObject();
//      });
    }
  };
  $scope.getHorizontalLock = function() {
    return getActiveProp('lockMovementX');
  };
  $scope.setHorizontalLock = function(value) {
    setActiveProp('lockMovementX', value);
  };

  $scope.getVerticalLock = function() {
    return getActiveProp('lockMovementY');
  };
  $scope.setVerticalLock = function(value) {
    setActiveProp('lockMovementY', value);
  };

  $scope.getScaleLockX = function() {
    return getActiveProp('lockScalingX');
  },
      $scope.setScaleLockX = function(value) {
        setActiveProp('lockScalingX', value);
      };

  $scope.getScaleLockY = function() {
    return getActiveProp('lockScalingY');
  };
  $scope.setScaleLockY = function(value) {
    setActiveProp('lockScalingY', value);
  };

  $scope.getRotationLock = function() {
    return getActiveProp('lockRotation');
  };
  $scope.setRotationLock = function(value) {
    setActiveProp('lockRotation', value);
  };

  $scope.getOriginX = function() {
    return getActiveProp('originX');
  };
  $scope.setOriginX = function(value) {
    setActiveProp('originX', value);
  };

  $scope.getOriginY = function() {
    return getActiveProp('originY');
  };
  $scope.setOriginY = function(value) {
    setActiveProp('originY', value);
  };

  $scope.sendBackwards = function() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.sendBackwards(activeObject);
    }
  };

  $scope.sendToBack = function() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.sendToBack(activeObject);

      if (canvas.backgroundObject) {
//        debugger;
        canvas.sendToBack(canvas.backgroundObject);
      }
    }
  };

  $scope.setAsBackground = function() {
    if (canvas.backgroundObject) {
      canvas.backgroundObject.strokeWidth = 1;
    }

    var activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.backgroundObject = activeObject;
      activeObject.strokeWidth = 11;
      canvas.sendToBack(activeObject);
    }
  };

  $scope.bringForward = function() {
    var activeObject = canvas.getActiveObject();
    if (canvas.backgroundObject === activeObject) {
      activeObject.strokeWidth = 1;
      canvas.backgroundObject = null;
    }
    if (activeObject) {
      canvas.bringForward(activeObject);
    }
  };

  $scope.bringToFront = function() {
    var activeObject = canvas.getActiveObject();
    if (canvas.backgroundObject === activeObject) {
      activeObject.strokeWidth = 1;
      canvas.backgroundObject = null;
    }
    if (activeObject) {
      canvas.bringToFront(activeObject);
    }
  };


  $scope.clip = function() {
    var obj = canvas.getActiveObject();
    if (!obj)
      return;

    if (obj.clipTo) {
      obj.clipTo = null;
    }
    else {
      var radius = obj.width < obj.height ? (obj.width / 2) : (obj.height / 2);
      obj.clipTo = function(ctx) {
        ctx.arc(0, 0, radius, 0, Math.PI * 2, true);
      };
    }
    canvas.renderAll();
  };



  $scope.loadSVGWithoutGrouping = function() {
    _loadSVGWithoutGrouping(consoleSVGValue);
  };
  $scope.loadSVG = function() {
    _loadSVG(consoleSVGValue);
  };

  var _loadSVG = function(svg) {
    fabric.loadSVGFromString(svg, function(objects, options) {
      var obj = fabric.util.groupSVGElements(objects, options);
      canvas.add(obj).centerObject(obj).renderAll();
      obj.setCoords();
    });
  };

  var _loadSVGWithoutGrouping = function(svg) {
    fabric.loadSVGFromString(svg, function(objects) {
      canvas.add.apply(canvas, objects);
      canvas.renderAll();
    });
  };

  function initCustomization() {
    if (typeof Cufon !== 'undefined' && Cufon.fonts.delicious) {
      Cufon.fonts.delicious.offsetLeft = 75;
      Cufon.fonts.delicious.offsetTop = 25;
    }

    if (/(iPhone|iPod|iPad)/i.test(navigator.userAgent)) {
      fabric.Object.prototype.cornerSize = 30;
    }

    fabric.Object.prototype.transparentCorners = false;

    if (document.location.search.indexOf('guidelines') > -1) {
      initCenteringGuidelines(canvas);
      initAligningGuidelines(canvas);
    }
  }

  initCustomization();

//  addTexts();

  $scope.getFreeDrawingMode = function() {
    return canvas.isDrawingMode;
  };
  $scope.setFreeDrawingMode = function(value) {
    canvas.isDrawingMode = !!value;
    $scope.$$phase || $scope.$digest();
  };

  $scope.freeDrawingMode = 'Pencil';

  $scope.getDrawingMode = function() {
    return $scope.freeDrawingMode;
  };
  $scope.setDrawingMode = function(type) {
    $scope.freeDrawingMode = type;

    if (type === 'hline') {
      canvas.freeDrawingBrush = $scope.vLinePatternBrush;
    }
    else if (type === 'vline') {
      canvas.freeDrawingBrush = $scope.hLinePatternBrush;
    }
    else if (type === 'square') {
      canvas.freeDrawingBrush = $scope.squarePatternBrush;
    }
    else if (type === 'diamond') {
      canvas.freeDrawingBrush = $scope.diamondPatternBrush;
    }
    else if (type === 'texture') {
      canvas.freeDrawingBrush = $scope.texturePatternBrush;
    }
    else {
      canvas.freeDrawingBrush = new fabric[type + 'Brush'](canvas);
    }

    $scope.$$phase || $scope.$digest();
  };

  $scope.getDrawingLineWidth = function() {
    if (canvas.freeDrawingBrush) {
      return canvas.freeDrawingBrush.width;
    }

  };
  $scope.setDrawingLineWidth = function(value) {
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = parseInt(value, 10) || 5;
    }
  };

  $scope.getDrawingLineColor = function() {
    if (canvas.freeDrawingBrush) {
      return canvas.freeDrawingBrush.color;
    }
  };
  $scope.setDrawingLineColor = function(value) {
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = value;
    }
  };

  $scope.getDrawingLineShadowWidth = function() {
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.shadowBlur;
    }
  };
  $scope.setDrawingLineShadowWidth = function(value) {
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.shadowBlur = parseInt(value, 10) || 1;
    }
  };

//  $scope.actionUndo = function(value) {
//
//    if (index <= 0) {
//      index = 0;
//      return;
//    }
//
//    if (refresh === true) {
//      index--;
//      refresh = false;
//    }
//
//    console.log('undo');
////    debugger;
//
//    index2 = index - 1;
//    current = list[index2];
//    current.setOptions(JSON.parse(state[index2]));
//
//    index--;
//    current.setCoords();
//    canvas.renderAll();
//    action = true;
//  };
//
//  $scope.actionRedo = function(value) {
//
//    action = true;
//    if (index >= state.length - 1) {
//      return;
//    }
//
//    console.log('redo');
//
//    index2 = index + 1;
//    current = list[index2];
//    current.setOptions(JSON.parse(state[index2]));
//
//    index++;
//    current.setCoords();
//    canvas.renderAll();
//  };

  function selectNewObject() {
    if (canvas._objects.length > 1)
      canvas.setActiveObject(canvas.item(canvas._objects.length - 1));
  }
  function initBrushes() {
    if (!fabric.PatternBrush)
      return;

    initVLinePatternBrush();
    initHLinePatternBrush();
    initSquarePatternBrush();
//    initDiamondPatternBrush();
//    initImagePatternBrush();
  }
  initBrushes();

//  function initImagePatternBrush() {
//    var img = new Image();
//    img.src = '../assets/honey_im_subtle.png';
//
//    $scope.texturePatternBrush = new fabric.PatternBrush(canvas);
//    $scope.texturePatternBrush.source = img;
//  }

//  function initDiamondPatternBrush() {
//    $scope.diamondPatternBrush = new fabric.PatternBrush(canvas);
//    $scope.diamondPatternBrush.getPatternSrc = function() {
//
//      var squareWidth = 10, squareDistance = 5;
//      var patternCanvas = fabric.document.createElement('canvas');
//      var rect = new fabric.Rect({
//        width: squareWidth,
//        height: squareWidth,
//        angle: 45,
//        fill: this.color
//      });
//
//      var canvasWidth = rect.getBoundingRectWidth();
//
//      patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
//      rect.set({left: canvasWidth / 2, top: canvasWidth / 2});
//
//      var ctx = patternCanvas.getContext('2d');
//      rect.render(ctx);
//
//      return patternCanvas;
//    };
//  }

  function initSquarePatternBrush() {
    $scope.squarePatternBrush = new fabric.PatternBrush(canvas);
    $scope.squarePatternBrush.getPatternSrc = function() {

      var squareWidth = 10, squareDistance = 2;

      var patternCanvas = fabric.document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
      var ctx = patternCanvas.getContext('2d');

      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, squareWidth, squareWidth);

      return patternCanvas;
    };
  }

  function initVLinePatternBrush() {
    $scope.vLinePatternBrush = new fabric.PatternBrush(canvas);
    $scope.vLinePatternBrush.getPatternSrc = function() {

      var patternCanvas = fabric.document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 10;
      var ctx = patternCanvas.getContext('2d');

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(10, 5);
      ctx.closePath();
      ctx.stroke();

      return patternCanvas;
    };
  }

  function initHLinePatternBrush() {
    $scope.hLinePatternBrush = new fabric.PatternBrush(canvas);
    $scope.hLinePatternBrush.getPatternSrc = function() {

      var patternCanvas = fabric.document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 10;
      var ctx = patternCanvas.getContext('2d');

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(5, 10);
      ctx.closePath();
      ctx.stroke();

      return patternCanvas;
    };
  }


}



var current;
var list = [];
var state = [];
var index = 0;
var index2 = 0;
var action = false;
var refresh = true;

function watchCanvas($scope) {

  function updateScope() {
    $scope.$$phase || $scope.$digest();
    canvas.renderAll();
  }

  canvas
      .on('object:selected', updateScope)
      .on('group:selected', updateScope)
      .on('path:created', updateScope)
      .on('selection:cleared', updateScope);


//  canvas
//      .on('object:modified', function(e) {
//        var object = e.target;
//        console.log('object:modified');
////        console.log(JSON.stringify(canvas.toDatalessJSON()));
////        state[++index] = JSON.stringify(canvas.toDatalessJSON());
////        action = false;
//      });

//  canvas.on("object:added", function(e) {
//    var object = e.target;
//    console.log('object:modified');
//
//    if (action === true) {
//      state = [state[index2]];
//      list = [list[index2]];
//
//      action = false;
//      console.log(state);
//      index = 1;
//    }
//    object.saveState();
//
//    console.log(object.originalState);
//    state[index] = JSON.stringify(object.originalState);
//    list[index] = object;
//    index++;
//    index2 = index - 1;
//
//
//
//    refresh = true;
//  });
//
//  canvas.on("object:modified", function(e) {
//    var object = e.target;
//    console.log('object:modified');
//
//    if (action === true) {
//      state = [state[index2]];
//      list = [list[index2]];
//
//      action = false;
//      console.log(state);
//      index = 1;
//    }
//
//    object.saveState();
//
//    state[index] = JSON.stringify(object.originalState);
//    list[index] = object;
//    index++;
//    index2 = index - 1;
//
////    console.log(state);
//    refresh = true;
//  });


}