(function(exports) {
  /**
   * Setup Stage
   */
  var stage
  var container = document.createElement('div')
  container.id = 'env-visualizer-container'
  container.hidden = true
  document.body.appendChild(container)
  var drawDataButton = document.createElement('div')
  drawDataButton.id = 'draw-data-button'
  drawDataButton.hidden = true
  document.body.appendChild(drawDataButton)

  const frameFontSetting = "14px Roboto Mono, Courier New";
  const fnRadius = 12;
  // List of built-in functions to ignore (i.e. not draw)
  var builtins = [
    'runtime',
    'display',
    'raw_display',
    'stringify',
    'error',
    'prompt',
    'is_number',
    'is_string',
    'is_function',
    'is_boolean',
    'is_undefined',
    'parse_int',
    'undefined',
    'NaN',
    'Infinity',
    'null',
    'pair',
    'is_pair',
    'head',
    'tail',
    'is_null',
    'is_list',
    'list',
    'length',
    'map',
    'build_list',
    'for_each',
    'list_to_string',
    'reverse',
    'append',
    'member',
    'remove',
    'remove_all',
    'filter',
    'enum_list',
    'list_ref',
    'accumulate',
    'equal',
    'draw_data',
    'set_head',
    'set_tail',
    'array_length',
    'is_array',
    'parse',
    'apply_in_underlying_javascript',
    'is_object',
    'is_NaN',
    'has_own_property',
    'alert',
    'timed',
    'assoc',
    'rawDisplay',
    'prompt',
    'alert',
    'visualiseList',
    'math_abs',
    'math_acos',
    'math_acosh',
    'math_asin',
    'math_asinh',
    'math_atan',
    'math_atanh',
    'math_atan2',
    'math_ceil',
    'math_cbrt',
    'math_expm1',
    'math_clz32',
    'math_cos',
    'math_cosh',
    'math_exp',
    'math_floor',
    'math_fround',
    'math_hypot',
    'math_imul',
    'math_log',
    'math_log1p',
    'math_log2',
    'math_log10',
    'math_max',
    'math_min',
    'math_pow',
    'math_random',
    'math_round',
    'math_sign',
    'math_sin',
    'math_sinh',
    'math_sqrt',
    'math_tan',
    'math_tanh',
    'math_trunc',
    'math_E',
    'math_LN10',
    'math_LN2',
    'math_LOG10E',
    'math_LOG2E',
    'math_PI',
    'math_SQRT1_2',
    'math_SQRT2'
  ]
  
  /**
   * List of built-in functions to draw and not ignore,
   * i.e. built-ins that are called during the program's execution.
   * Add name of such a function to this list when one is found.
   */
  var builtinsToDraw = [];

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
    for (let i = 0; i < frames.length; i++) {
      drawSceneFrame(i);
    }
    viewport.render();
  }
	
  // For both function objects and data objects
  function drawSceneFrameObjectArrows() {
    frames.forEach(function(frame) {
        let variables = frame.variables;
        for (let i = 0; i < variables.length; i++) {
             if (typeof(variables[i]) == "function") {
                 var fn = getFnObjectFromKey(variables[i].key);
                 drawSceneFrameFnArrow(frame, fn, i);
             } else if (typeof(variables[i]) == "object") {
                 drawSceneFrameDataArrow(frame, i);
             }
        };
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
        drawSceneFrameArrow(frame);
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
        
    // find index position of function object within frame
    var parent = config.parent;
    var offset = config.offset;
    var x = parent.x + parent.width + 60;
    var y = parent.y + 25 + offset * 30;
    config.x = x;
    config.y = y;
    //config.offset = offset;
    context.beginPath();
    context.arc(x - fnRadius, y, fnRadius, 0, Math.PI*2, false);
    
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
      context.font = "14px Roboto Mono Light, Courier New";
      context.fillStyle = 'white';
      let fnString;
      try {
        fnString = config.fun.toString();
      } catch (e) {
        fnString = config.toString();
      }
      const params = fnString.substring(fnString.indexOf('(') + 1, 
                                         fnString.indexOf(')'));
      let body = fnString.substring(fnString.indexOf(')') + 1);
      body = body.split("\n");
      context.fillText(`params: ${params == "" ? "()" : params}`, x + 50, y);
      context.fillText(`body:`, x + 50, y + 20);
      let i = 0;
      while (i < 5 && i < body.length) {
          context.fillText(body[i], x + 100, y + 20 * (i + 1));
          i++;
      }
      if (i < body.length) {
          context.fillText("...", x + 120, y + 120);
      }
    }
    context.arc(x + fnRadius, y, fnRadius, 0, Math.PI*2, false);
    if (!config.hovered && !config.selected) {
      context.strokeStyle = '#999999';
      context.lineWidth = 2;
      context.stroke();
    } else {
      context.strokeStyle = 'green';
      context.lineWidth = 2;
      context.stroke();
    }

  }

  function drawHitFnObject(pos) {
    var config = fnObjects[pos];
    var hit = config.layer.hit,
        context = hit.context;
    var parent = config.parent;
    // var offset = parent.fnObjects.indexOf(config.key);
    var offset = config.offset;
    var x = parent.x + parent.width + 60;
    var y = parent.y + 25 + offset * 30;
    config.x = x;
    config.y = y;
    config.offset = offset;
    context.save();
    context.beginPath();
    context.arc(x - fnRadius, y, fnRadius, 0, Math.PI*2, false);
    context.fillStyle = hit.getColorFromIndex(config.key);
    context.fill();
    context.restore();
    
    context.beginPath();
    context.arc(x + fnRadius, y, fnRadius, 0, Math.PI*2, false);
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
    var config = dataObject;
    var scene = dataObjectLayer.scene,
        context = scene.context;
    var parent = config.parent;
    var offset = parent.variables.indexOf(config);
    const x0 = parent.x + parent.width + 48,
          y0 = parent.y + 25 + offset * 30 - 12;
    const x1 = x0 - 12,
          y1 = y0 + 24;
    const x2 = x1 + 24,
          y2 = y1;
    config.offset = offset;
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x0, y0);
    context.fillStyle = '#999999';
    context.font = "14px Roboto Mono Light, Courier New";
    context.fillText("!", x0 - 4, y0 + 20);
    
    if (!config.hovered && !config.selected) {
      context.strokeStyle = '#999999';
      context.lineWidth = 2;
      context.stroke();
    } else {
      context.strokeStyle = 'green';
      context.lineWidth = 2;
      if (config.hovered) {
	context.font = "14px Roboto Mono Light, Courier New";
	context.fillStyle = 'white';
	context.fillText("Data Object", x0 + 20, y0 + 15);	
      }
      context.stroke();
    }
  }
  
  function drawHitDataObject(dataObject) {
    var config = dataObject;
    var hit = dataObjectLayer.hit,
        context = hit.context;
    var parent = config.parent;
    var offset = config.offset;
    const x0 = parent.x + parent.width + 48,
          y0 = parent.y + 25 + offset * 30 - 12;
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
    context.fillStyle = hit.getColorFromIndex(config.key);
    context.fill();
    context.restore();
  }
  
  function drawSceneFrame(pos) {
    var config = frames[pos];
    if (config.variables.length == 0) {
      return;
    }
    var scene = config.layer.scene,
        context = scene.context;
    context.save();
    context.font = frameFontSetting;
    context.fillStyle = "white";
    var x, y;
    x = config.x;
    y = config.y;
    context.beginPath();

    // render frame name
    let frameName;
    if (config.name == "forLoopEnvironment") {
      frameName = "for loop";
    } else if (config.name == "forBlockEnvironment") {
      frameName = "for block";
    } else if (config.name == "blockEnvironment") {
      frameName = "block";
    } else {
      frameName = config.name;
    }
    if (frameName.length * 9 < config.width / 2 || frameName == "global") {
      context.fillText(frameName, x, y - 10);
    } else {
      context.fillText(frameName, x - (frameName.length * 9 - config.width / 2),
	   	       y - 10);
    }

    // render text in frame
    let env = config.headClone;
    let i = 0;
    for (let k in env) {
        if (builtins.indexOf(''+k) < 0
            || builtinsToDraw.indexOf(''+k) >= 0) {
            if (typeof(env[k]) == "number" 
                || typeof(env[k]) == "string") {
                    context.fillText(`${'' + k}: ${''  +env[k]}`,
																			x + 10, y + 30 + (i * 30));
                } else if (typeof(env[k]) == "object") {
                    context.fillText(`${'' + k}:`, x + 10, y + 30 + (i * 30));
                } else {
                    context.fillText(`${'' + k}:`, x + 10, y + 30 + (i * 30));
                }
            i++;
        }
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
  function drawSceneFrameDataArrow(frame, frameOffset) {
    var scene = arrowLayer.scene,
        context = scene.context;
    const x0 = frame.x + frame.variables[frameOffset].name.length * 10 + 20, 
          y0 = frame.y + frameOffset * 30 + 25,
          xf = frame.x + frame.width + 35,
          yf = y0;
    context.save();
    context.strokeStyle = "#999999";        
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(xf, yf);
    drawArrowHead(context, x0, y0, xf, yf);
    context.stroke();
  }
  
  /**
   * For each function variable, either the function is defined in the scope
   * the same frame, in which case drawing the arrow is simple, or it is in
   * a different frame. If so, more care is needed to route the arrow back up
   * to its destination.
   */
  function drawSceneFrameFnArrow(frame, fnObject, frameOffset) {
    var scene = arrowLayer.scene,
        context = scene.context;
    const yf = fnObject.y;
    context.save();
    context.strokeStyle = "#999999";
    context.beginPath();
          
    if (fnObject.parent == frame) {
      // fnObject belongs to current frame
      // simply draw straight arrow from frame to function
      const x0 = frame.x + getFnName(fnObject).length * 10 + 20,
            y0 = frame.y + fnObject.offset * 30 + 25,
            xf = fnObject.x - (fnRadius * 2) - 3; // left circle
      context.moveTo(x0, y0);
      context.lineTo(xf, yf);

      // draw arrow headClone
      drawArrowHead(context, x0, y0, xf, yf);
      context.stroke();
    } else {
      /** 
       * fnObject belongs to different frame.
       * Two "offset" factors are used: frameOffset, the index position of
       * the source variable in the starting frame, and fnOffset, the position
       * of the target fnObject in the destination frame. Offsetting the line
       * by these factors prevents overlaps between arrows that are pointing to
       * different objects.
       */
      const paramName = getKeyByValue(frame.headClone, frame.variables[frameOffset]);
      const x0 = frame.x 
                 + paramName.length * 8 + 22,
            y0 = frame.y + frameOffset * 30 + 25;
      const xf = fnObject.x + (fnRadius * 2) + 3,
            x1 = frame.x + frame.width + 10 + frameOffset * 20,
            y1 = y0;
      const x2 = x1,
            y2 = frame.y - 20 + frameOffset * 5;
			// find offset of fnObject at parent frame
			const fnOffset = fnObject.parent.variables.indexOf(fnObject);
      let x3 = xf + 10 + fnOffset * 7,
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
          if (frame.fnObjects.length != 0) {
              rightBound += 84;
          }
          if (x3 > leftBound && x3 < rightBound) { // overlap
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
   * Trivial case (arrow goes straight back to the adjacent frame).
   */
  function drawSceneFnFrameArrow(fnObject) {
    var scene = arrowLayer.scene,
        context = scene.context;
    //const offset = frames[pair[0]].fnIndex.indexOf(pair[1]);
    
    var startCoord = [fnObject.x + 15, fnObject.y];

    //scene.clear();
    context.save();
    context.strokeStyle = "#999999";
    context.beginPath();
    const x0 = startCoord[0],
          y0 = startCoord[1],
          x1 = x0,
          y1 = y0 - 15,
          x2 = x1 - 70,
          y2 = y1;
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    // draw arrow headClone
    drawArrowHead(context, x1, y1, x2, y2);
    context.stroke();
  }

  /**
   * Arrows between child and parent frames.
   * Uses an offset factor to prevent lines overlapping, similar to with
   * frame-function arrows.
   */
  function drawSceneFrameArrow(frame) {
    if (frame.variables.length == 0) {
      return;
    }
    var config = frame;
    var scene = arrowLayer.scene,
        context = scene.context;
    context.save();
    context.strokeStyle = "white";
    
    if (config.tail == null) return null;
    const offset = levels[frame.tail.level].frames.indexOf(frame.tail);
    const x0 = config.x + (config.width / 2),
          y0 = config.y,
          x1 = x0,
          y1 = (frame.tail.y 
               + frame.tail.height + y0) / 2 + offset * 4,
          x2 = frame.tail.x + (frame.tail.width / 2);
          y2 = y1,
          x3 = x2,
          y3 = frame.tail.y 
               + frame.tail.height + 3; // offset by 3 for aesthetic reasons
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x3, y3);
    drawArrowHead(context, x2, y2, x3, y3);
    context.stroke();
  }

  // create viewport
  var viewport = new Concrete.Viewport({
    width: 1000,
    height: 1000,
    container: container
  });

  /**
   * Create a different layer for each type of element. May be more useful
   * in future for manipulating groups of elements.
    */
  var fnObjectLayer = new Concrete.Layer();
  var dataObjectLayer = new Concrete.Layer();
  var frameLayer = new Concrete.Layer();
  var arrowLayer = new Concrete.Layer();

  // add layers
  viewport.add(frameLayer).add(fnObjectLayer).add(dataObjectLayer).add(arrowLayer);

  fnObjects = []
  dataObjects = []
  levels = {}
  builtinsToDraw = []
  
  var frames = [];
  // parse input from interpreter
  function parseInput(input) {
    let frames = input.context.context.runtime.environments;
    for (let i in frames) {
      let frame = frames[i];
      frame.hovered = false;
      frame.layer = frameLayer;
      frame.color = white;
			
      // reset frame
      frame.dataObjects = [];
      frame.fnObjects = [];
      frame.variables = [];
      frame.children = [];

      // clone frame.head to avoid disrupting rest of interpreter
      frame.headClone = {};
      for (k in frame.head) {
        frame.headClone[k] = frame.head[k];
      }
    }

    /**
     * First iteration through frames:
     * - assign unique keys to frames and data and function objects
     * - find height level of each frame
     * - store keys of child frames within each frame
     * - calculate dimensions of frame
     */
    let i = 0;
    let key_counter = 0;
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
    let builtinFnObjectKey = Math.pow(2, 23) - 1;
    frames.reverse(); // more natural ordering! Global frame now comes first
    while (i < frames.length) {
        const frame = frames[i];

        // load basic ConcreteJS properties
        frame.hovered = false;
        frame.selected = false;
        frame.layer = frameLayer;
        frame.color = 'white';
        
	// arrays to store keys of objects in scope of frame
        frame.fnObjects = [];
        frame.dataObjects = [];
        
        // assign id to frame                
        frame.key = key_counter;
        key_counter++;

        // update array of children keys of parent frame
        frame.children = []; // stores keys of child frames
        if (frame.tail !== null) frame.tail.children.push(frame.key);
        
	/**
	 * Frames are separated into distinct vertical "levels", where each frame
	 * is always drawn one level below its parent and the global frame is at 
	 * the top level (i.e. top of the screen/drawing).
	 */
        frame.level = frame.name === "global"
                           ? 0
                           : frame.tail.level + 1;
                           
        // update total number of frames in the current level
        if (levels[frame.level]) {
            levels[frame.level].count++;
            levels[frame.level].frames.push(frame);
        } else {
            levels[frame.level] = {count: 1};
            levels[frame.level].frames = [frame];
        }

        /**
	 * Iterate through variables to find the length of the longest one, 
	 * to determine the width of the frame. Calculate height of frame
	 * from the number of variables.
	 * Separately, if variable points to a function or data object,
	 * add the required properties for drawing of the object.
	 */
        let env = frame.headClone;

	/** 
	 * Array to store variables to be displayed. A separate array from head
	 * is used to maintain the ordering of variables, which is needed for
	 * determine the coordinates of function and data objects that need to
         * be drawn.
	 */
        frame.variables = []; 				
				
        let maxLength = 0; // track length of longest variable in frame
        let heightFactor = 0; // track number of variables in frame
        for (let k in env) {
            let varLength;
            // first sieve out built-in functions in non-global frames
            if (frame.name !== "global"
                && builtins.indexOf(getFnName(env[k])) >= 0) {
              builtinsToDraw.push(getFnName(env[k]));
              heightFactor++;
              if (k.length > maxLength) {
                maxLength = k.length;
              }
			  
	      // update width of global frame
	      let newWidth = getFnName(env[k]).length * 10 + 50;
	      if (frames[0].width < newWidth) {
	        frames[0].width = newWidth;
	      }
            } else if (builtins.indexOf(''+k) < 0) {
                heightFactor++;
                varLength = (typeof(env[k]) == "number" 
                             || typeof(env[k]) == "string")
                               ? k.length + ("" + env[k]).length
                               : k.length;
                if (varLength > maxLength) {
                    maxLength = varLength;
                }
            }
            
            if (typeof(env[k]) == "function") {
              const fnName = getFnName(env[k]);
              if (builtins.indexOf(fnName) < 0
                  || builtinsToDraw.indexOf(fnName) >= 0) {
                  // check if function was already declared in another frame
                  let existing = false;
                  if (builtinsToDraw.indexOf(fnName) < 0) { // not built-in
                    for (let fn in fnObjects) {
                      try {
                        if (fnObjects[fn].node.id.start == env[k].node.id.start) {
                            existing = true;
                            break;
                        }
                      } catch (e) {}
                    }
                  } else { // is built-in
                    for (let fn in fnObjects) {
                      if (getFnName(fnObjects[fn]) == fnName) {
                          existing = true;
                          break;
                      }
                    }
                  }

                  env[k].hovered = false;
                  env[k].selected = false;
                  env[k].layer = fnObjectLayer;
                  env[k].color = 'white';
                  if (builtinsToDraw.indexOf(fnName) < 0) {
                    if (!existing) {
                      env[k].key = env[k].node.id.start;
                      env[k].parent = frame;
                    }
                    frame.fnObjects.push(env[k].key);
                    frame.variables.push(env[k]);
                  } else {
                    if (!existing) {
                      env[k].key = builtinFnObjectKey--;
                      env[k].functionName = fnName;
                      env[k].parent = frames[0];
                      frames[0].fnObjects.push(env[k].key);
                      frames[0].variables.push(env[k]);
                      // update height of global frame
                      frames[0].height += 30;
                    }
                    frame.variables.push(env[k]);
                  }
                  if (!existing) {
                    fnObjects.push(env[k]);
                  }

              }
            } else if (builtins.indexOf('' + k) < 0) {
                if (env[k] != null && typeof(env[k]) == "object") {
                  let dataParent = frame;
                  while (dataParent.name === "blockFrame") {
                      dataParent = dataParent.tail;
                  }
                  dataObject = {
                      hovered: false,
                      selected: false,
                      layer: dataObjectLayer,
                      color: 'white',
                      key: dataObjectKey--,
                      parent: dataParent,
                      data: env[k],
                      name: k
                  };
                  dataObjects.push(dataObject);
                  frame.dataObjects.push(dataObject);
                  frame.variables.push(dataObject);
              } else {
                frame.variables.push(env[k]);
              }
            }
        }
        frame.width = maxLength * 10 + 50;
        frame.height = heightFactor * 30 + 20;
        i++;
    }
    
    /**
     * Find and store the height of each level
     * (i.e. the height of the tallest frame)
     */
    for (let l in levels) {
      let level = levels[l];
      let maxHeight = 0;
      level.frames.forEach(function(frame) {
        if (frame.height > maxHeight) {
          maxHeight = frame.height;
        }
      });
      level.height = maxHeight;
    }
    
    /**
     * Second pass:
     *  - Assign x- and y-coordinates for each frame
     */
    let tempLevels = {};
    Object.keys(levels).forEach(function(level) {
        tempLevels[level] = levels[level].count;
    });
    
    for (f in frames) {
        /**
	 * x-coordinate
	 * For each level, split the viewport width into n partitions where
	 * n = number of frames in that level. Place each frame in the centre 
	 * of each partition.
	 *
	 * Potential improvement: Assign space recursively to each frame and its
	 * "tree" of child frames.
	 */
        let frame = frames[f];
        let partitionWidth = viewport.width / levels[frame.level].count;
        frame.x = viewport.width - tempLevels[frame.level] * partitionWidth
                                  + partitionWidth / 2 - frame.width / 2;
        tempLevels[frame.level]--;
        
        /**
	 * y-coordinate
	 * Simply the total height of all levels above the frame, plus a
	 * fixed factor (60) per level.
	 */
        let level = frame.level;
        let y = 30;
        for (i = 0; i < level; i++) {
            y += levels[i].height + 60;
        }
        frame.y = y;
        
        let pos = 0;
        let headClone = frame.headClone;
        for (let k in headClone) {
          if (typeof(headClone[k]) == "function"
                  && ((builtins.indexOf('' + k) < 0
                      || builtinsToDraw.indexOf('' + k)) >= 0)) {
            if (headClone[k].offset == undefined) {
              headClone[k].offset = pos;
            }
            pos++;
          } else if (typeof(headClone[k]) !== "function"
                      && builtins.indexOf('' + k) < 0) {
            if (typeof(headClone[k]) == "object") {
              headClone[k].offset = pos;
            }
            pos++;
          }
        };
    }
    return frames;
  }

  function drawArrowHead(context, xi, yi, xf, yf) {
    const gradient = (yf - yi) / (xf - xi);
      const angle = Math.atan(gradient);
      if (xf - xi >= 0) { // left to right arrow 
        const xR = xf - 10 * Math.cos(angle - Math.PI / 6);
        const yR = yf - 10 * Math.sin(angle - Math.PI / 6);
        context.lineTo(xR, yR);
        context.moveTo(xf, yf);
        const xL = xf - 10 * Math.cos(angle + Math.PI / 6);
        const yL = yf - 10 * Math.sin(angle + Math.PI / 6);
        context.lineTo(xL, yL);
      } else { // right to left arrow
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
    
    // blink icon
    const icon = document.getElementById("Env Visualizer-icon")
    icon.classList.add("side-content-header-button-alert")
		
    // reset current drawing
    fnObjectLayer.scene.clear()
    dataObjectLayer.scene.clear()
    frameLayer.scene.clear()
    arrowLayer.scene.clear()
    fnObjects = []
    dataObjects = []
    levels = {}
    builtinsToDraw = []

    frames = parseInput(context)
    drawSceneFrames()
    drawSceneFnObjects()
    drawHitFnObjects()
    drawSceneDataObjects()
    drawHitDataObjects()
    drawSceneFrameArrows()
    drawSceneFrameObjectArrows()
    drawSceneFnFrameArrows()
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

    dataObjects.forEach(function(dataObject) {
      dataObject.hovered = false;
    });

   if (key >= 0 && key < Math.pow(2, 23)) {
    fnObject = getFnObjectFromKey(key);
      try {
        fnObject.hovered = true;
      } catch (e) {};
    }

    else if (key >= Math.pow(2, 23)) {
      dataObject = getDataObjectFromKey(key);
      try {
        dataObject.hovered = true;
      } catch (e) {};
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

      dataObjects.forEach(function(dataObject) {
        dataObject.selected = false;
      });

      if (key >= 0 && key < Math.pow(2, 23)) {
        fnObject = getFnObjectFromKey(key);
        try {
          fnObject.selected = true;
        } catch (e) {};
      }

      else if (key > Math.pow(2, 23)) {
        dataObject = getDataObjectFromKey(key);
        try {
	  dataObject.selected = true;
	  draw_data(dataObject.data);
        } catch (e) {};
      }

      drawSceneFnObjects();
      drawSceneDataObjects();
    });

    frames.reverse();
  }
  exports.draw_env = draw_env
  
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
    if (fn.functionName != undefined) {
      return fn.functionName;
    } else {
      return fn.toString().split("(")[0].split(" ")[1];
    }
  }
  
  function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

  exports.EnvVisualizer = {
    draw_env: draw_env,
    init: function(parent) {
      container.hidden = false
      parent.appendChild(container)
    },
  }

  setTimeout(() => {}, 1000)
})(window)
