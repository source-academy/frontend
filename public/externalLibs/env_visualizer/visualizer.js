(function(exports) {
  /**
   * Setup Stage
   */
  var stage;
  var container = document.createElement('div');
  container.id = 'env-visualizer-container';
  container.hidden = true;
  document.body.appendChild(container);
  // create viewport
  var viewport = new Concrete.Viewport({
    width: 1000,
    height: 1000,
    container: container
  });
  const frameFontSetting = '14px Roboto Mono, Courier New';
  const FNOBJECT_RADIUS = 12; // radius of function object circle
  const DATA_OBJECT_SIDE = 24; // length of data object triangle
  const DRAWING_LEFT_PADDING = 20; // left padding for entire drawing
  const FRAME_HEIGHT_LINE = 30; // height in px of each line of text in a frame;
  const FRAME_HEIGHT_PADDING = 20; // height in px to pad each frame with
  const FRAME_WIDTH_CHAR = 8; // width in px of each text character in a frame;
  const FRAME_WIDTH_PADDING = 50; // width in px to pad each frame with;
  const FRAME_SPACING = 100; // spacing between horizontally adjacent frames
  const LEVEL_SPACING = 60; // spacing between vertical frame levels
  const OBJECT_FRAME_RIGHT_SPACING = 50; // space to right frame border
  const OBJECT_FRAME_TOP_SPACING = 25; // perpendicular distance to top border
  
  /**
   * Keys (unique IDs) for data objects, user-defined function objects,
   * and built-in function objects must all be differentiated.
   * dataObject and builtinFnObject keys need to be manually assigned.
   * Since ConcreteJS hit detection uses [0, 2^24) as its range of keys
   * (and -1 for not found), take 2^24 - 1 as the key for
   * the first dataObject and decrement from there.
   * Take 2^23 - 1 as the key for the first builtinFnObject and
   * decrement from there.
   */
  let dataObjectKey = Math.pow(2, 24) - 1;
  let fnObjectKey = Math.pow(2, 22) - 1;
  
  // Initialise list of built-in functions to ignore (i.e. not draw)
  var builtins = [];
  
  /**
   * Helper functions for drawing different types of elements on the canvas.
   */
  function drawSceneFnObjects() {
    fnObjectLayer.scene.clear();
    for (let i = 0; i < fnObjects.length; i++) {
      drawSceneFnObject(i);
    }
    viewport.render();
  }

  function drawHitFnObjects() {
    for (let i = 0; i < fnObjects.length; i++) {
      drawHitFnObject(i);
    }
  }

  function drawSceneDataObjects() {
    dataObjectLayer.scene.clear();
    dataObjects.forEach(function(dataObject) {
      drawSceneDataObject(dataObject);
    });
    viewport.render();
  }

  function drawHitDataObjects() {
    dataObjects.forEach(function(dataObject) {
      drawHitDataObject(dataObject);
    });
  }

  function drawSceneFrames() {
    frames.forEach(function(frame) {
      if (!isEmptyFrame(frame)) {
        drawSceneFrame(frame);
      }
    });
    viewport.render();
  }

  // For both function objects and data objects
  function drawSceneFrameObjectArrows() {
    frames.forEach(function(frame) {
      let elements = frame.elements;
      for (e in elements) {
        if (typeof elements[e] == 'function') {
          drawSceneFrameFnArrow(frame, e, elements[e]);
        } else if (typeof elements[e] == 'object') {
          drawSceneFrameDataArrow(frame, e, elements[e]);
        }
      }
    });
    viewport.render();
  }

  function drawSceneFnFrameArrows() {
    fnObjects.forEach(function(fnObject) {
      drawSceneFnFrameArrow(fnObject);
    });
    viewport.render();
  }

  function drawSceneFrameArrows() {
    frames.forEach(function(frame) {
      if (!isEmptyFrame(frame)) {
        drawSceneFrameArrow(frame);
      }
    });
    viewport.render();
  }

  /**
   * The actual drawing functions.
   * "Scene" objects are the actual visible drawings.
   * "Hit" objects are the hitboxes (for mouseovers/clicks) for each scene.
   */
  function drawSceneFnObject(pos) {
    var config = fnObjects[pos];
    var scene = config.layer.scene,
      context = scene.context;
    const x = config.x;
    const y = config.y;
    context.beginPath();
    context.arc(x - FNOBJECT_RADIUS, y, FNOBJECT_RADIUS, 0, Math.PI * 2, false);

    if (!config.hovered && !config.selected) {
      context.strokeStyle = '#999999';
      context.lineWidth = 2;
      context.stroke();
    } else {
      context.strokeStyle = 'green';
      context.lineWidth = 2;
      context.stroke();
    }

    context.beginPath();
    if (config.selected) {
      context.font = '14px Roboto Mono Light, Courier New';
      context.fillStyle = 'white';
      let fnString;
      try {
        fnString = config.fun.toString();
      } catch (e) {
        fnString = config.toString();
      }
      const params = fnString.substring(fnString.indexOf('(') + 1, fnString.indexOf(')'));
      let body = fnString.substring(fnString.indexOf(')') + 1);
      body = body.split('\n');
      context.fillText(`params: ${params == '' ? '()' : params}`, x + 50, y);
      context.fillText(`body:`, x + 50, y + 20);
      let i = 0;
      while (i < 5 && i < body.length) {
        context.fillText(body[i], x + 100, y + 20 * (i + 1));
        i++;
      }
      if (i < body.length) {
        context.fillText('...', x + 120, y + 120);
      }
    }
    context.arc(x + FNOBJECT_RADIUS, y, FNOBJECT_RADIUS, 0, Math.PI * 2, false);
    context.stroke();
  }

  function drawHitFnObject(pos) {
    var config = fnObjects[pos];
    var hit = config.layer.hit,
      context = hit.context;
    const x = config.x;
    const y = config.y;
    config.x = x;
    config.y = y;
    context.save();
    context.beginPath();
    context.arc(x - FNOBJECT_RADIUS, y, FNOBJECT_RADIUS, 0, Math.PI * 2, false);
    context.fillStyle = hit.getColorFromIndex(config.key);
    context.fill();
    context.restore();

    context.beginPath();
    context.arc(x + FNOBJECT_RADIUS, y, FNOBJECT_RADIUS, 0, Math.PI * 2, false);
    context.fillStyle = hit.getColorFromIndex(config.key);
    context.fill();
    context.restore();
  }

  /**
   * Identities for data objects are not currently implemented in the
   * visualiser, so a separate icon (a triangle) is drawn for each variable
   * that points to data.
   */
  function drawSceneDataObject(dataObject) {
    const wrapper = dataObjectWrappers[dataObjects.indexOf(dataObject)];
    var config = dataObject;
    var scene = dataObjectLayer.scene,
      context = scene.context;
    var parent = wrapper.parent;
    // define points for drawing data object triangle
    const x0 = wrapper.x,
      y0 = wrapper.y - DATA_OBJECT_SIDE / 2;
    const x1 = x0 - DATA_OBJECT_SIDE / 2,
      y1 = y0 + DATA_OBJECT_SIDE;
    const x2 = x1 + DATA_OBJECT_SIDE,
      y2 = y1;
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x0, y0);
    context.fillStyle = '#999999';
    context.font = '14px Roboto Mono Light, Courier New';
    context.fillText('!', x0 - 4, y0 + 20);

    if (!wrapper.hovered && !wrapper.selected) {
      context.strokeStyle = '#999999';
      context.lineWidth = 2;
      context.stroke();
    } else {
      context.strokeStyle = 'green';
      context.lineWidth = 2;
      context.stroke();
    }
    
    if (wrapper.selected) {
      context.strokeStyle = 'green';
      context.lineWidth = 2;
      if (wrapper.hovered) {
        context.font = '14px Roboto Mono Light, Courier New';
        context.fillStyle = 'white';
        context.fillText('Data Object', x0 + 20, y0 + 15);
      }
      context.stroke();
    }
  }

  function drawHitDataObject(dataObject) {
    const wrapper = dataObjectWrappers[dataObjects.indexOf(dataObject)];
    var config = dataObject;
    var hit = dataObjectLayer.hit,
      context = hit.context;
    var parent = wrapper.parent;
    const x0 = wrapper.x,
      y0 = wrapper.y;
    const x1 = x0 - 12,
      y1 = y0 + 24;
    const x2 = x1 + 24,
      y2 = y1;
    context.save();
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x0, y0);
    context.fillStyle = hit.getColorFromIndex(wrapper.key);
    context.fill();
    context.restore();
  }

  function drawSceneFrame(frame) {
    var config = frame;
    var scene = config.layer.scene,
      context = scene.context;
    context.save();
    context.font = frameFontSetting;
    context.fillStyle = 'white';
    var x, y;
    x = config.x;
    y = config.y;
    context.beginPath();

    // render frame name; rename as needed for aesthetic reasons
    let frameName;
    switch (config.name) {
      case 'forLoopEnvironment':
        frameName = 'Body of for-loop';
        break;
      case 'forBlockEnvironment':
        frameName = 'Control variable of for-loop';
        break;
      case 'blockEnvironment':
        frameName = 'Block';
        break;
      case 'global':
        frameName = "Global";
        break;
      default:
        frameName = config.name;
    }
    
    if (frameName.length * 9 < config.width / 2 || frameName == 'global') {
      context.fillText(frameName, x, y - 10);
    } else {
      context.fillText(frameName, x - (frameName.length * 9 - config.width / 2), y - 10);
    }

    // render text in frame
    let elements = config.elements;
    let i = 0;
    for (let k in elements) {
      switch (typeof elements[k]) {
        case 'number':
        case 'boolean':
          context.fillText(`${'' + k}: ${'' + elements[k]}`, x + 10, y + 30 + i * 30);
          break;
        case 'string':
          if (k == '(other predclr. names)') {
            context.fillText(`${'' + k}`, x + 10, y + 30 + i * 30);
          } else {
            context.fillText(`${'' + k}: "${'' + elements[k]}"`, x + 10, y + 30 + i * 30);
          }
          break;
        default:
          context.fillText(`${'' + k}:`, x + 10, y + 30 + i * 30);
      }
      i++;
    }

    context.rect(x, y, config.width, config.height);
    context.lineWidth = 2;
    context.strokeStyle = 'white';
    context.stroke();

    if (config.selected) {
      context.strokeStyle = 'white';
      context.lineWidth = 6;
      context.stroke();
    }

    if (config.hovered) {
      context.strokeStyle = 'green';
      context.lineWidth = 2;
      context.stroke();
    }
  }

  function drawHitFrame(config) {
    if (config.variables.length == 0) {
      return;
    }
    var hit = config.layer.hit,
      context = hit.context;

    var x, y;
    if (config.tail != null) {
      x = frames[config.tail].x;
      y = frames[config.tail].y + 200;
      config.x = x;
      config.y = y;
    } else {
      x = config.x;
      y = config.y;
    }

    context.beginPath();
    context.rect(x, y, 150, 100);
    context.fillStyle = hit.getColorFromIndex(config.key);
    context.save();
    context.fill();
    context.restore();
  }

  /**
   * Trivial - the arrow just points straight to a fixed position relative to
   * the frame.
   */
  function drawSceneFrameDataArrow(frame, name, dataObject) {
    const wrapper = dataObjectWrappers[dataObjects.indexOf(dataObject)];
    var scene = arrowLayer.scene,
      context = scene.context;
    const yf = wrapper.y;
    context.save();
    context.strokeStyle = '#999999';
    context.beginPath();

    if (wrapper.parent == frame) {
      // dataObject belongs to current frame
      // simply draw straight arrow from frame to function
      const x0 = frame.x + name.length * FRAME_WIDTH_CHAR + 25;
      const y0 = frame.y + findElementNamePosition(name, frame) * FRAME_HEIGHT_LINE + 25,
        xf = wrapper.x - FNOBJECT_RADIUS * 2 - 3; // left circle
      context.moveTo(x0, y0);
      context.lineTo(xf, yf);

      // draw arrow head
      drawArrowHead(context, x0, y0, xf, yf);
      context.stroke();
    } else {
      /**
       * dataObject belongs to different frame.
       * Two "offset" factors are used: frameOffset, the index position of
       * the source variable in the starting frame, and fnOffset, the position
       * of the target dataObject in the destination frame. Offsetting the line
       * by these factors prevents overlaps between arrows that are pointing to
       * different objects.
       */
      const frameOffset = findElementPosition(dataObject, frame);
      const fnOffset = findElementPosition(dataObject, wrapper.parent);
      const x0 = frame.x + name.length * 8 + 22,
        y0 = frame.y + findElementNamePosition(name, frame) * FRAME_HEIGHT_LINE + 25;
      const xf = wrapper.x + FNOBJECT_RADIUS * 2 + 3,
        x1 = frame.x + frame.width + 10 + frameOffset * 20,
        y1 = y0;
      const x2 = x1,
        y2 = frame.y - 20 + frameOffset * 5;
      let x3 = xf + 10 + fnOffset * 7,
        y3 = y2;
      /**
       * From this position, the arrow needs to move upward to reach the
       * target dataObject. Make sure it does not intersect any other object
       * when doing so, or adjust its position if it does.
       * This currently only works for the frame level directly above the origin
       * frame, which suffices in most cases.
       * TO-DO: Improve implementation to handle any number of frame levels.
       */

      levels[frame.level - 1].frames.forEach(function(frame) {
        const leftBound = frame.x;
        let rightBound = frame.x + frame.width;
        // if (frame.fnObjects.length != 0) {
          // rightBound += 84;
        // }
        if (x3 > leftBound && x3 < rightBound) {
          // overlap
          x3 = rightBound + 10 + fnOffset * 7;
        }
      });
      const x4 = x3,
        y4 = yf;
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.lineTo(x2, y2);
      context.lineTo(x3, y3);
      context.lineTo(x4, y4);
      context.lineTo(xf, yf);
      // draw arrow headClone
      drawArrowHead(context, x4, y4, xf, yf);
      context.stroke();
    }
  }

  /**
   * For each function variable, either the function is defined in the scope
   * the same frame, in which case drawing the arrow is simple, or it is in
   * a different frame. If so, more care is needed to route the arrow back up
   * to its destination.
   */
  function drawSceneFrameFnArrow(frame, name, fnObject) {
    var scene = arrowLayer.scene,
      context = scene.context;
    const yf = fnObject.y;
    context.save();
    context.strokeStyle = '#999999';
    context.beginPath();

    if (fnObject.parent == frame) {
      // fnObject belongs to current frame
      // simply draw straight arrow from frame to function
      const x0 = frame.x + name.length * FRAME_WIDTH_CHAR + 25;
      const y0 = frame.y + findElementNamePosition(name, frame) * FRAME_HEIGHT_LINE + 25,
        xf = fnObject.x - FNOBJECT_RADIUS * 2 - 3; // left circle
      context.moveTo(x0, y0);
      context.lineTo(xf, yf);

      // draw arrow head
      drawArrowHead(context, x0, y0, xf, yf);
      context.stroke();
    } else {
      /**
       * fnObject belongs to different frame.
       * Three "offset" factors are used: startOffset, the index position of
       * the source variable in the starting frame; fnOffset, the position
       * of the target fnObject in the destination frame; and frameOffset, the
       * position of the frame within its level. Offsetting the line
       * by these factors prevents overlaps between arrows that are pointing to
       * different objects.
       */
      const startOffset = findElementPosition(fnObject, frame);
      const fnOffset = findElementPosition(fnObject, fnObject.parent);
      const frameOffset = findFrameIndexInLevel(frame);
      const x0 = frame.x + name.length * 8 + 22,
        y0 = frame.y + findElementNamePosition(name, frame) * FRAME_HEIGHT_LINE + 25;
      const xf = fnObject.x + FNOBJECT_RADIUS * 2 + 3,
        x1 = frame.x + frame.width + 10 + frameOffset * 20,
        y1 = y0;
      const x2 = x1,
        y2 = frame.y - 20 + frameOffset * 5;
      let x3 = xf + 12 + fnOffset * 7,
        y3 = y2;
      /**
       * From this position, the arrow needs to move upward to reach the
       * target fnObject. Make sure it does not intersect any other object
       * when doing so, or adjust its position if it does.
       * This currently only works for the frame level directly above the origin
       * frame, which suffices in most cases.
       * TO-DO: Improve implementation to handle any number of frame levels.
       */

      levels[frame.level - 1].frames.forEach(function(frame) {
        const leftBound = frame.x;
        let rightBound = frame.x + frame.width;
        // if (frame.fnObjects.length != 0) {
          // rightBound += 84;
        // }
        if (x3 > leftBound && x3 < rightBound) {
          // overlap
          x3 = rightBound + 10 + fnOffset * 7;
        }
      });
      const x4 = x3,
        y4 = yf;
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.lineTo(x2, y2);
      context.lineTo(x3, y3);
      context.lineTo(x4, y4);
      context.lineTo(xf, yf);
      // draw arrow headClone
      drawArrowHead(context, x4, y4, xf, yf);
      context.stroke();
    }
  }

  function drawSceneFnFrameArrow(fnObject) {
    var scene = arrowLayer.scene,
      context = scene.context;
    //const offset = frames[pair[0]].fnIndex.indexOf(pair[1]);

    var startCoord = [fnObject.x + 15, fnObject.y];

    //scene.clear();
    context.save();
    context.strokeStyle = '#999999';
    context.beginPath();
    
    if (fnObject.source == null || fnObject.source == fnObject.parent) {
      // Object is right next to the frame to be pointed to. Trivial case.
      const x0 = startCoord[0],
        y0 = startCoord[1],
        x1 = x0,
        y1 = y0 - 15,
        x2 = fnObject.parent.x + fnObject.parent.width + 3,
        y2 = y1;
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.lineTo(x2, y2);
      // draw arrow headClone
      drawArrowHead(context, x1, y1, x2, y2);
      context.stroke();
    } else {
      /**
       * startOffset: index of fnObject in its parent (starting) frame
       * destOffset: index of fnObject in source (destination) frame
       * frameOffset: index of source frame within its level
       */
      const startOffset = findElementPosition(fnObject, fnObject.parent);
      const destOffset = findElementPosition(fnObject, fnObject.source);
      const frameOffset = findFrameIndexInLevel(fnObject.source);
      const x0 = startCoord[0],
        y0 = startCoord[1],
        x1 = x0 + FNOBJECT_RADIUS + (startOffset + 1) * 5;
        y1 = y0,
        x2 = x1,
        y2 = fnObject.source.y - 40 + frameOffset * 2,
        x3 = fnObject.source.x + fnObject.source.width / 2 + 10,
        y3 = y2
        x4 = x3,
        y4 = fnObject.source.y - 3;
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.lineTo(x2, y2);
      context.lineTo(x3, y3);
      context.lineTo(x4, y4);
      drawArrowHead(context, x3, y3, x4, y4);
      context.stroke();
    }
  }

  /**
   * Arrows between child and parent frames.
   * Uses an offset factor to prevent lines overlapping, similar to with
   * frame-function arrows.
   */
  function drawSceneFrameArrow(frame) {
    var config = frame;
    var scene = arrowLayer.scene,
      context = scene.context;
    context.save();
    context.strokeStyle = 'white';
    
    if (config.parent == null) return null;
    const parent = config.parent;
    const offset = levels[parent.level].frames.indexOf(frame.parent);
    const x0 = config.x + config.width / 2,
      y0 = config.y,
      x1 = x0,
      y1 = (parent.y + parent.height + y0) / 2 + offset * 4,
      x2 = parent.x + parent.width / 2;
    (y2 = y1), (x3 = x2), (y3 = parent.y + parent.height + 3); // offset by 3 for aesthetic reasons
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x3, y3);
    drawArrowHead(context, x2, y2, x3, y3);
    context.stroke();
  }

  /**
   * Create a different layer for each type of element. May be more useful
   * in future for manipulating groups of elements.
   */
  var fnObjectLayer = new Concrete.Layer();
  var dataObjectLayer = new Concrete.Layer();
  var frameLayer = new Concrete.Layer();
  var arrowLayer = new Concrete.Layer();

  fnObjects = [];
  /**
   * Unlike function objects, data objects are represented internally not as
   * objects, but as arrays. As such, we cannot assign properties like x- and
   * y-coordinates directly to them. These properties are stored instead in
   * another array of objects called dataObjectWrappers, which maps 1-to-1 to
   * the objects they represent in dataObjects.
   */
  dataObjects = [];
  dataObjectWrappers = [];
  levels = {};
  builtinsToDraw = [];
  envKeyCounter = 0;

  var frames = [];
  
  /**
   * Assigns an x- and a y-coordinate to every frame and object.
   */
  function positionItems(frames) {
    /**
     * Find and store the height of each level
     * (i.e. the height of the tallest environment)
     */
    for (let l in levels) {
      const level = levels[l];
      let maxHeight = 0;
      level.frames.forEach(function(frame) {
        if (frame.height > maxHeight) {
          maxHeight = frame.height;
        }
      });
      level.height = maxHeight;
    }

    /**
     * Calculate x- and y-coordinates for each frame
     */ 
    const drawingWidth = getDrawingWidth(levels);
    frames.forEach(function(frame) {
      let currLevel = frame.level;

      /**
       * y-coordinate
       * Simply the total height of all levels above the frame, plus a
       * fixed spacing factor (60) per level.
       */
      let y = 30;
      for (let i = 0; i < currLevel; i++) {
        y += levels[i].height + 60;
      }
      frame.y = y;
      
      /**
       * x-coordinate
       * For each level, split the viewport width into n partitions where
       * n = number of frames in that level. Place each frame in the centre
       * of each partition.
       *
       * Potential improvement: Assign space recursively to each frame and its
       * "tree" of child frame.
       */
      const partitionCount = levels[currLevel].count;
      const partitionWidth = drawingWidth / partitionCount;
      frame.x =
        (levels[currLevel].frames.indexOf(frame) + 1) * partitionWidth
        - partitionWidth / 2
        - frame.width / 2
        + DRAWING_LEFT_PADDING;
    });
    
    /**
     * Calculate coordinates for each fnObject and dataObject.
     */
    fnObjects.forEach(function(fnObject) {
      const parent = fnObject.parent;
      fnObject.x = parent.x 
                   + parent.width 
                   + OBJECT_FRAME_RIGHT_SPACING;
      fnObject.y = parent.y +
                   findElementPosition(fnObject, parent) * FRAME_HEIGHT_LINE
                   + OBJECT_FRAME_TOP_SPACING;
    });
    
    for (d in dataObjects) {
      const wrapper = dataObjectWrappers[d];
      const parent = wrapper.parent;
      wrapper.x = parent.x 
                  + parent.width 
                  + OBJECT_FRAME_RIGHT_SPACING;
      wrapper.y = parent.y +
                  findElementPosition(dataObjects[d], parent) * FRAME_HEIGHT_LINE
                  + OBJECT_FRAME_TOP_SPACING;
    }
  }

  function drawArrowHead(context, xi, yi, xf, yf) {
    const gradient = (yf - yi) / (xf - xi);
    const angle = Math.atan(gradient);
    if (xf - xi >= 0) {
      // left to right arrow
      const xR = xf - 10 * Math.cos(angle - Math.PI / 6);
      const yR = yf - 10 * Math.sin(angle - Math.PI / 6);
      context.lineTo(xR, yR);
      context.moveTo(xf, yf);
      const xL = xf - 10 * Math.cos(angle + Math.PI / 6);
      const yL = yf - 10 * Math.sin(angle + Math.PI / 6);
      context.lineTo(xL, yL);
    } else {
      // right to left arrow
      const xR = xf + 10 * Math.cos(angle - Math.PI / 6);
      const yR = yf + 10 * Math.sin(angle - Math.PI / 6);
      context.lineTo(xR, yR);
      context.moveTo(xf, yf);
      const xL = xf + 10 * Math.cos(angle + Math.PI / 6);
      const yL = yf + 10 * Math.sin(angle + Math.PI / 6);
      context.lineTo(xL, yL);
    }
  }

  // main function to be exported
  function draw_env(context) {

    // add built-in functions to list of builtins
    let originalEnvs = context.context.context.runtime.environments;
    let allEnvs = [];
    originalEnvs.forEach(function(e) {
      allEnvs.push(e);
    });
    builtins = builtins.concat(Object.keys(allEnvs[allEnvs.length - 1].head));
    builtins = builtins.concat(Object.keys(allEnvs[allEnvs.length - 2].head));

    // add library-specific built-in functions to list of builtins
    const externalSymbols = context.context.context.externalSymbols;
    for (let i in externalSymbols) {
      builtins.push(externalSymbols[i]);
    }

    // Hides the default text
    (document.getElementById('env-visualizer-default-text')).hidden = true;

    // Blink icon
    const icon = document.getElementById('env_visualiser-icon');
    icon.classList.add('side-content-tab-alert');

    // reset current drawing
    fnObjectLayer.scene.clear();
    dataObjectLayer.scene.clear();
    frameLayer.scene.clear();
    arrowLayer.scene.clear();
    fnObjects = [];
    dataObjects = [];
    dataObjectWrappers = [];
    levels = {};
    builtinsToDraw = [];
    
    // parse input from interpreter
    function parseInput(allFrames, envs) {
      let environments = envs;
      let frames = [];
      /**
       * environments is the array of environments in the interpreter.
       * frames is the current frames being created
       * allFrames is all frames created so far (including from previous
       * recursive calls of parseInput).
       */

      /**
       * For some reason, some environments are not present in the top level 
       * array of environments in the input context. Here, we extract those
       * missing environments.
       */
      let i = environments.length - 4; // skip global and program environments
      while (i >= 0) {
        const currEnv = allEnvs[i];
        if (!allEnvs.includes(currEnv.tail)) {
          if(environments === allEnvs) {
            allEnvs.splice(i + 1, 0, currEnv.tail);
          } else {
            allEnvs.splice(i + 1, 0, currEnv.tail);
            environments.splice(i + 1, 0, currEnv.tail);
          }
          i += 2;
        }
        i--;
      }

      // add layers
      viewport
        .add(frameLayer)
        .add(fnObjectLayer)
        .add(dataObjectLayer)
        .add(arrowLayer);

      /**
       * Refactor start
       */
      
      // Assign the same id to each environment and its corresponding frame
      environments.forEach(function(e) {
        e.envKeyCounter = envKeyCounter;
        envKeyCounter++;
      });

      /**
       * Create a frame for each environment
       * Each frame represents one frame to be drawn
       */
      // Process backwards such that global frame comes first
      for (let i = environments.length - 1; i >= 0; i--) {
        let environment = environments[i];      
        let frame;
              
        /**
         * There are two environments named programEnvironment. We only want one
         * corresponding "Program" frame.
         */
        if (environment.name == "programEnvironment") {
          let isProgEnvPresent = false;
          frames.forEach(function (f) {
            if (f.name == "Program") {
              frame = f;
              isProgEnvPresent = true;
            }
          });
          if (!isProgEnvPresent) {
            frame = createEmptyFrame("Program");
            frame.key = environment.envKeyCounter;
            frames.push(frame);
            allFrames.push(frame);
          }
        } else {
          frame = createEmptyFrame(environment.name);
          frame.key = environment.envKeyCounter;
          frames.push(frame);
          allFrames.push(frame);
        }
        
        // extract elements from environment into frame
        frame.elements = {};
        if (frame.name == "global") {
          frame.elements['(other predclr. names)'] = '';
          // don't copy over built-in functions
        } else if (environment.name == "programEnvironment"
                    && environment.tail.name == "global") {
          // do nothing (this environment contains library functions)
        } else {
          // copy everything (possibly including redeclared built-ins) over
          const envElements = environment.head;
          for (e in envElements) {
            frame.elements[e] = envElements[e];
            if (typeof envElements[e] == "function"
                && builtins.indexOf('' + getFnName(envElements[e])) > 0
                && getFnName(envElements[e])) {
              // this is a built-in function referenced to in a later frame,
              // e.g. "const a = pair". In this case, add it to the global frame
              // to be drawn and subsequently referenced.
              frames[0].elements[getFnName(envElements[e])] = envElements[e];
            }
          }
        } 
      }

      /**
       * - Assign parent frame of each frame (except global frame)
       * - Assign level of each frame. Frames are organised into distinct 
       *   vertical bands. Global frame is at the top (level 0). Every
       *   other frame is 1 level below its parent.
       */
      frames.forEach(function(frame) {
        
        if (frame.name == "global") {
          frame.parent = null;
          frame.level = 0;
        } else {
          if (frame.name == "Program") {
            frame.parent = getFrameByName(allFrames, "global");
          } else {
            env = getEnvByKeyCounter(environments, frame.key);
            if (env.tail.name == "programEnvironment") {
              env = env.tail;
            }
            frame.parent = getFrameByKey(allFrames, env.tail.envKeyCounter);
          }
          frame.parent.children.push(frame.key);
          frame.level = frame.parent.level + 1;
        }
        
        // update total number of frames in the current level
        if (levels[frame.level]) {
          levels[frame.level].count++;
          levels[frame.level].frames.push(frame);
        } else {
          levels[frame.level] = { count: 1 };
          levels[frame.level].frames = [frame];
        }
      });

      /** 
       * - Find width and height of each frame
       */
      frames.forEach(function(frame) {
        frame.height = getFrameHeight(frame);
        frame.width = getFrameWidth(frame);
      });
      
      /**
       * Extract function and data objects from frames. Each distinct object is
       * drawn next to the first frame where it is referenced; subsequent
       * references point back to the object.
       */      
      frames.forEach(function(frame) {
        const elements = frame.elements;
        for (e in elements) {
          if (typeof elements[e] == "function"
            && !fnObjects.includes(elements[e])) {
            initialiseFnObject(elements[e], frame);
            fnObjects.push(elements[e]);
          } else if (typeof elements[e] == "object"
            && !dataObjects.includes(elements[e])) {
            dataObjects.push(elements[e]);
            dataObjectWrappers.push(
              initialiseDataObjectWrapper(e, elements[e], frame)
            );
          }
        }
      });

      /**
       * Some functions may have been generated via anonymous functions, whose
       * environments would not have been present in initial array from the
       * interpreter.
       * Find these environments, and recursively process them.
       */
      const missing = []; // think of a better name
      fnObjects.forEach(function (fnObject) {
        let otherEnv = fnObject.environment;
        /**
         * There may be multiple levels of anonymous function frames, e.g.
         * from the expression (w => x => y => z)(1)(2), where
         * w => x => ... generates one frame, and
         * x => y => ... generates another.
         * The while loop ensure all of these frames are extracted.
         */
        while (!allEnvs.includes(otherEnv)) {
          missing.push(otherEnv);
          allEnvs.push(otherEnv);
          // find function definition expression to use as frame name
          let pointer = otherEnv.callExpression.callee;
          let i = 0;
          while (pointer.callee) {
            pointer = pointer.callee;
            i++;
          }
          while (i > 0) {
            pointer = pointer.body;
            i--;
          }
          const params = pointer.params;
          let paramArray = [];
          let paramString;
          try {
            params.forEach(function(p) {
              paramArray.push(p.name);
            });
            const paramString = "(" + paramArray.join(", ") + ") => ...";
            otherEnv.vizName = paramString;
          } catch (e) {
            // for some reason or other the function definition expression is
            // not always available. In that case, just use the frame name
          }
          otherEnv = otherEnv.tail;
        };
      });
      if (missing.length > 0) {
        frames = (parseInput(allFrames, missing));
      } 

      return allFrames;
    }

    frames = parseInput([], allEnvs);
    /**
     * Find the source frame for each fnObject. The source frame is the frame
     * which generated the function. This may be different from the parent
     * frame, which is the first frame where the object is referenced.
     */
    fnObjects.forEach(function(fnObject) {
      if (fnObject.environment.name == "programEnvironment") {
        fnObject.source = getFrameByName(frames, "Program");
      } else {
        fnObject.source = getFrameByKey(frames, fnObject.environment.envKeyCounter);
      }
    });

    positionItems(frames);
    viewport.setSize(getDrawingWidth(levels) * 1.6, getDrawingHeight(levels));
    // "* 1.6" is a partial workaround for drawing being cut off on the right
    
    drawSceneFrames();
    drawSceneFnObjects();
    drawHitFnObjects();
    drawSceneDataObjects();
    drawHitDataObjects();
    drawSceneFrameArrows();
    drawSceneFrameObjectArrows();
    drawSceneFnFrameArrows();

    // add concrete container handlers
    container.addEventListener('mousemove', function(evt) {
      var boundingRect = container.getBoundingClientRect(),
        x = evt.clientX - boundingRect.left,
        y = evt.clientY - boundingRect.top,
        key = viewport.getIntersection(x, y),
        fnObject,
        dataObject;
      // unhover all circles
      fnObjects.forEach(function(fnObject) {
        fnObject.hovered = false;
      });

      for (d in dataObjects) {
        dataObjectWrappers[d].hovered = false;
      }

      if (key >= 0 && key < Math.pow(2, 23)) {
        fnObject = getFnObjectFromKey(key);
        try {
          fnObject.hovered = true;
        } catch (e) {}
      } else if (key >= Math.pow(2, 23)) {
        dataObject = getDataObjectFromKey(key);
        try {
          getWrapperFromDataObject(dataObject).hovered = true;
        } catch (e) {}
      }
      drawSceneFnObjects();
      drawSceneDataObjects();
    });

    container.addEventListener('click', function(evt) {
      var boundingRect = container.getBoundingClientRect(),
        x = evt.clientX - boundingRect.left,
        y = evt.clientY - boundingRect.top,
        key = viewport.getIntersection(x, y),
        fnObject,
        dataObject;
      // unhover all circles
      fnObjects.forEach(function(fnObject) {
        fnObject.selected = false;
      });

      for (d in dataObjects) {
        dataObjectWrappers[d].hovered = false;
      }

      if (key >= 0 && key < Math.pow(2, 23)) {
        fnObject = getFnObjectFromKey(key);
        try {
          fnObject.selected = true;
        } catch (e) {}
      } else if (key > Math.pow(2, 23)) {
        dataObject = getDataObjectFromKey(key);
        try {
          getWrapperFromDataObject(dataObject).selected = true;
          draw_data(dataObject.data);
        } catch (e) {}
      }

      drawSceneFnObjects();
      drawSceneDataObjects();
    });

    frames.reverse();
  }
  exports.draw_env = draw_env;

  function getFnObjectFromKey(key) {
    for (f in fnObjects) {
      if (fnObjects[f].key === key) {
        return fnObjects[f];
      }
    }
  }

  function getDataObjectFromKey(key) {
    for (d in dataObjects) {
      if (dataObjects[d].key === key) {
        return dataObjects[d];
      }
    }
  }

  function getFnName(fn) {
    if (fn.node.type == "FunctionDeclaration" && !fn.functionName) {
      return undefined;
    } else if (fn.node.type == "FunctionDeclaration") {
      return fn.functionName;
    } else {
      return fn
        .toString()
        .split('(')[0]
        .split(' ')[1];
    }
  }

  function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
  
  function isArrowFunction(fn) {
    return fn.node.type == "ArrowFunctionExpression";
  }

  function createEmptyFrame(frameName) {
    const frame = {name: frameName};
    frame.hovered = false;
    frame.layer = frameLayer;
    frame.color = white;
    frame.children = [];
    return frame;
  }
  
  function getFrameByKey(frames, key) {
    for (let i in frames) {
      if (frames[i].key == key) {
        return frames[i];
      }
    }
    return null;
  }
  
  function getEnvByKeyCounter(frames, key) {
    for (let i in frames) {
      if (frames[i].envKeyCounter == key) {
        return frames[i];
      }
    }
    return null;
  }
  
  function getFrameByName(frames, name) {
    for (let i in frames) {
      if (frames[i].name == name) {
        return frames[i];
      }
    }
    return null;
  }
  
  function getFrameHeight(frame) {
    return Object.keys(frame.elements).length * FRAME_HEIGHT_LINE + FRAME_HEIGHT_PADDING;
  }
  
  function getFrameWidth(frame) {
    let maxLength = 0;
    const elements = frame.elements;
    for (e in elements) {
      let currLength;
      const literals = ["number", "string", "boolean"];
      if (literals.includes(typeof elements[e])) {
        currLength = e.length + elements[e].toString().length;
      } else {
        currLength = e.length;
      }
      maxLength = Math.max(maxLength, currLength);
    }
    return maxLength * FRAME_WIDTH_CHAR + FRAME_WIDTH_PADDING;    
  }
  
  function getDrawingWidth(levels) {
    let maxX = 0;
    for (l in levels) {
      let currX = 0;
      level = levels[l];
      level.frames.forEach(function(f) {
        currX += f.width + FRAME_SPACING;
      });
      maxX = Math.max(maxX, currX);
    }
    return maxX;
  }
  
  function getDrawingHeight(levels) {
    let y = 0;
    for (l in levels) {
      y += levels[l].height + LEVEL_SPACING;
    }
    return y;
  }
  
  function getWrapperFromDataObject(dataObject) {
    return dataObjectWrappers[dataObjects.indexOf(dataObject)];
  }
  
  function initialiseFnObject(fnObject, parent) {
    fnObject.hovered = false;
    fnObject.selected = false;
    fnObject.layer = fnObjectLayer;
    fnObject.color = 'white';
    fnObject.key = fnObjectKey--;
    fnObject.parent = parent;
  }
  
  function initialiseDataObjectWrapper(objectName, objectData, parent) {
    const dataObjectWrapper = {
      hovered: false,
      selected: false,
      layer: dataObjectLayer,
      color: 'white',
      key: dataObjectKey--,
      parent: parent,
      data: objectData,
      name: objectName
    };
    return dataObjectWrapper;
  }
  
  function findElementPosition(element, frame) {
    const elements = frame.elements;
    let i = 0;
    for (e in elements) {
      if (elements[e] == element) {
        return i;
      }
      i++;
    }
    return -1;
  }

  function findElementNamePosition(elementName, frame) {
    return Object.keys(frame.elements).indexOf(elementName);
  }
  
  function findFrameIndexInLevel(frame) {
    const level = frame.level;
    return levels[level].frames.indexOf(frame);
  }
  
  function isEmptyFrame(frame) {
    let hasObject = false;
    fnObjects.forEach(function(f) {
      if (f.parent == frame) {
        hasObject = true;
      }
    });
    dataObjectWrappers.forEach(function(d) {
      if (d.parent == frame) {
        hasObject = true;
      }
    });
    return !hasObject 
            && frame.children.length == 0 
            && Object.keys(frame.elements).length == 0;
  }
  
  exports.EnvVisualizer = {
    draw_env: draw_env,
    init: function(parent) {
      container.hidden = false;
      parent.appendChild(container);
    }
  };

  setTimeout(() => {}, 1000);
})(window);
