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

      const frameFontSetting = "14px Roboto Mono";
      const fnRadius = 12;
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

      function drawHitFrames() {
        frames.forEach(function(frame) {
          drawHitFrame(frame);
        });
      }

      /*
      For each frame, find params which have a function as their value.
      For each such param, draw the arrow.
      */
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

      function drawSceneFnObject(pos) {
        var config = fnObjects[pos];
        var scene = config.layer.scene,
            context = scene.context;
            
        // find index position of function object within frame
        var parent = config.parent;
        // var offset = parent.fnObjects.indexOf(config.key);
        var offset = config.offset;
        var x = parent.x + parent.width + 60;
        var y = parent.y + 25 + offset * 30;
        config.x = x;
        config.y = y;
        config.offset = offset;
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
          context.font = "14px Roboto Mono Light";
          context.fillStyle = 'white';
          const fnString = config.fun.toString();
          const params = fnString.substring(fnString.indexOf('(') + 1, 
                                             fnString.indexOf(')'));
          let body = fnString.substring(fnString.indexOf(')') + 1);
          body = body.split("\n");
          context.fillText(`params: ${params == "" ? "(none)" : params}`, x + 50, y);
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

      function drawSceneDataObject(dataObject) {
        var config = dataObject;
        var scene = config.layer.scene,
            context = scene.context;
        var parent = config.parent;
        var offset = config.offset;
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
        context.font = "14px Roboto Mono Light";
        context.fillText("!", x0 - 4, y0 + 20);
        
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
        var scene = config.layer.scene,
            context = scene.context;
        context.save();
        context.font = frameFontSetting;
        context.fillStyle = "white";
        var x, y;
        x = config.x;
        y = config.y;
        context.beginPath();
        
        let env = config.head;
        let i = 0;
        for (let k in env) {
            if (builtins.indexOf(''+k) < 0) {
                if (typeof(env[k]) == "number" 
                    || typeof(env[k]) == "string") {
                        context.fillText(`${'' + k}: ${''  +env[k]}`, x + 10, y + 30 + (i * 30));
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
      
      function drawSceneFrameFnArrow(frame, fnObject, frameOffset) {
        var scene = arrowLayer.scene,
            context = scene.context;
        const x0 = frame.x + frame.variables[frameOffset].functionName.length * 10 + 20, 
              y0 = frame.y + frameOffset * 30 + 25,
              yf = fnObject.y;
        //scene.clear();
        context.save();
        context.strokeStyle = "#999999";
        context.beginPath();
              
        if (fnObject.parent == frame) {
          // fnObject belongs to current frame
          // simply draw straight arrow from frame to function
          const xf = fnObject.x - (fnRadius * 2) - 3; // left circle
          context.moveTo(x0, y0);
          context.lineTo(xf, yf);

          // draw arrow head
          drawArrowHead(context, x0, y0, xf, yf);
          context.stroke();
        } else {
          // fnObject belongs to different frame
          
          // fnOffset: relative position of target fnObject at target frame
          const fnOffset = fnObject.offset;
          const xf = fnObject.x + (fnRadius * 2) + 3, 
                x1 = x0 + 70 + frameOffset * 20,
                y1 = y0;
          const x2 = x1,
                y2 = frame.y - 20 + fnOffset * 5;
          let x3 = xf + 10 + fnOffset * 5,
                y3 = y2;
          /* From this position, the arrow needs to move upward to reach the
             target fnObject. Make sure it does not intersect any other object
             when doing so, or adjust its position if it does. */
          levels[frame.level - 1].frames.forEach(function(frame) {
              const leftBound = frame.x;
              let rightBound = frame.x + frame.width;
              if (frame.fnObjects.length != 0) {
                  rightBound += 84;
              }
              if (x3 > leftBound && x3 < rightBound) { // overlap
                  x3 = rightBound + 10;
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
          // draw arrow head
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
        // draw arrow head
        drawArrowHead(context, x1, y1, x2, y2);
        context.stroke();
      }

      function drawSceneFrameArrow(frame) {
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

      // create layers
      var fnObjectLayer = new Concrete.Layer();
      var dataObjectLayer = new Concrete.Layer();
      var frameLayer = new Concrete.Layer();
      var arrowLayer = new Concrete.Layer();

      // add layers
      viewport.add(frameLayer).add(fnObjectLayer).add(dataObjectLayer).add(arrowLayer);

      var fnObjects = [];
      var dataObjects = [];
      var levels = {};
      
      var frames = [];
      // parse input from interpreter
      function parseInput(input) {
        let frames = input.context.context.runtime.environments;
        for (let i in frames) {
          let frame = frames[i];
          frame.hovered = false;
          frame.layer = frameLayer;
          frame.color = white;
        }

        /*
        First pass:
        - combine function calls and associated frames
        - assign unique keys to frames
        - find height level of frames
        - store keys of child frames within each frame
        - store number of frames in each heigh level for space partitioning
        - calculate height and width of frame
        */
        let i = frames.length - 1;
        let key_counter = 0;
        while (i >= 0) {
            const frame = frames[i];
            if (i > 0 && frames[i - 1].name == "blockFrame") {
                // assume for now that it belongs to prev frame function call
                frames[i - 1].fnFrame = frame;
                for (j in frames[i - 1].head) {
                    frame.head[j] = frames[i - 1].head[j];
                }
                frames.splice(i - 1, 1);
                i--;
            }
            
            // load basic ConcreteJS properties
            frame.hovered = false;
            frame.selected = false;
            frame.layer = frameLayer;
            frame.color = 'white';
            
            frame.fnObjects = [];
            frame.dataObjects = [];
            
            // assign id to frame                
            frame.key = key_counter;
            key_counter++;
            
            // change parent pointer from parent blockFrame to parent Function
            if (frame.name !== "global" && frame.tail.name === "blockFrame") {
                frame.tail = frame.tail.tail;
            }
            
            // update array of children keys of parent frame
            frame.children = []; // stores keys of child frames
            if (frame.tail !== null) {
                frame.tail.children.push(frame.key);
            }
            
            // find frame height level (parent height + 1)
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
                                            
            // find height and width of frame from length of contained variable names
            // if variable points to a function, add it to list of function objects
            let env = frame.head;
            frame.variables = []; // array to store non-built-in variables
            let maxLength = 0;
            let heightFactor = 0;
            let pos = 0;
            /* dataObject and fnObject keys must be differentiated,
               as dataObject keys need to be manually assigned.
               Since HTML Canvas uses [0, 2^24) as its range of keys
               (and -1 for not found), take 2^24 - 1 as the key for 
               the first dataObject and decrement from there.
            */ 
            let dataObjectKey = Math.pow(2, 24) - 1;
            for (let k in env) {
                if (builtins.indexOf(''+k) < 0) {
                    if (typeof(env[k]) == "object") {
                        frame.variables.push({
                                               name: k,
                                               data: env[k]
                                              });
                    } else {
                        frame.variables.push(env[k]);
                    }
                    heightFactor++;
                    let varLength = (typeof(env[k]) == "number" 
                                     || typeof(env[k]) == "string")
                                     ? k.length + ("" + env[k]).length
                                     : k.length + 20;
                    if (k.length > maxLength) {
                        maxLength = k.length;
                    }
                    pos++;
                } else {
                    delete env[k]; // why isn't this working?
                }
                
                if (typeof(env[k]) == "function") {
                    if (builtins.indexOf('' + k) < 0) {
                        // check if function was already declared in another frame
                        let existing = false;
                        for (let fn in fnObjects) {
                            if (fnObjects[fn].node.id.start == env[k].node.id.start) {
                                existing = true;
                                break;
                            }
                        }
                        if (!existing) {
                            env[k].hovered = false;
                            env[k].selected = false;
                            env[k].layer = fnObjectLayer;
                            env[k].color = 'white';
                            env[k].key = env[k].node.id.start;
                            env[k].offset = pos - 1;
                            let fnParent = frame;
                            while (fnParent.name === "blockFrame") {
                                fnParent = fnParent.tail;
                            }
                            fnParent.fnObjects.push(env[k].key);
                            env[k].parent = fnParent;
                            fnObjects.push(env[k]);
                        }
                    }
                } else if (env[k] != null && typeof(env[k]) == "object") {
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
                        offset: pos - 1,
                        parent: dataParent,
                        data: env[k]
                    };
                    dataObjects.push(dataObject);
                    frame.dataObjects.push(dataObject);
                }
            }
            frame.width = maxLength * 20 + 40;
            frame.height = heightFactor * 30 + 20;
            
            // update max height of level
            levels[frame.level].height = (!levels[frame.level].height
                                            || frame.height > levels[frame.level].height)
                                                ? frame.height
                                                : levels[frame.level].height;
            i--;
        }
        frames.reverse(); // more natural ordering! Global frame now comes first
        
        /*
        Second pass:
        - Assign x- and y-coordinates for each frame
        */
        let tempLevels = {};
        Object.keys(levels).forEach(function(level) {
            tempLevels[level] = levels[level].count;
        });
        
        for (f in frames) {
            // x-coordinate
            let frame = frames[f];
            let partitionWidth = viewport.width / levels[frame.level].count;
            frame.x = viewport.width - tempLevels[frame.level] * partitionWidth
                                      + partitionWidth / 2 - frame.width / 2;
            tempLevels[frame.level]--;
            
            // y-coordinate
            let level = frame.level;
            let y = 0;
            for (i = 0; i < level; i++) {
                y += levels[i].height + 60;
            }
            frame.y = y;
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
            // draw arrow head
            const xR = xf + 10 * Math.cos(angle - Math.PI / 6);
            const yR = yf + 10 * Math.sin(angle - Math.PI / 6);
            context.lineTo(xR, yR);
            context.moveTo(xf, yf);
            const xL = xf + 10 * Math.cos(angle + Math.PI / 6);
            const yL = yf + 10 * Math.sin(angle + Math.PI / 6);
            context.lineTo(xL, yL);
          }
      }
      
  function draw_env(context) {
      // reset current drawing
      fnObjectLayer.scene.clear()
      dataObjectLayer.scene.clear()
      frameLayer.scene.clear()
      arrowLayer.scene.clear()
      fnObjects = []
      dataObjects = []
      levels = {}
      
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

  exports.EnvVisualizer = {
    draw_env: draw_env,
    init: function(parent) {
      container.hidden = false
      parent.appendChild(container)
    },
  }

  setTimeout(() => {}, 1000)
})(window)
