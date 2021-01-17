(function (exports) {
  /*
  |--------------------------------------------------------------------------
  | Configurations
  |--------------------------------------------------------------------------
  */
  const container = document.createElement('div');
  container.id = 'env-visualizer-container';
  container.hidden = true;
  container.style.width = 0;
  document.body.appendChild(container);
  // create viewport
  const viewport = new Concrete.Viewport({
    container: container
  });

  const PRODUCTION_ENV = true;
  const DEBUG_MODE = !PRODUCTION_ENV && true; // enable to see debug messages in development

  const SA_WHITE = '#999999';
  const SA_BLUE = '#2c3e50';
  const WHITE = '#FFFFFF';
  const GREEN = '#00FF00';
  const REGENT_GRAY_80 = '#8a9ba8cc'; // 80% opacity

  const FONT_SETTING = '14px Roboto Mono, Courier New';
  const FONT_HEIGHT = 14;
  const TEXT_PADDING = 5;
  const MAX_TEXT_WIDTH = 200;
  const FNTEXT_WIDTH = MAX_TEXT_WIDTH + 70;
  const ARROW_OFFSET = 5;
  const FNOBJECT_RADIUS = 15; // radius of function object circle
  const FN_MAX_WIDTH = FNOBJECT_RADIUS * 4 + FNTEXT_WIDTH;
  const DRAWING_PADDING = 70; // side padding for entire drawing
  const FRAME_ARROW_TARGET = 30;
  const FRAME_HEIGHT_LINE = 55; // height in px of between two lines of text in a frame;
  const FRAME_PADDING_TOP = 40; // perpendicular distance to top border
  const FRAME_PADDING_BOTTOM = FRAME_PADDING_TOP / 2; // height in px to pad each frame with
  const FRAME_PADDING_LEFT = 10;
  const FRAME_MARGIN_RIGHT = 25; // space to right frame border
  const FRAME_WIDTH_CHAR = 8; // width in px of each text character in a frame;
  const FRAME_WIDTH_PADDING = 50; // width in px to pad each frame with;
  const FRAME_SPACING = 70; // spacing between horizontally adjacent frameObjects
  const LEVEL_SPACING = 60; // spacing between vertical frame levels
  const PAIR_SPACING = 15; // spacing between pairs
  const INNER_RADIUS = 2; // radius of inner dot within a fn object
  const DATA_UNIT_WIDTH = 80; // width of a pairBlock
  const DATA_UNIT_HEIGHT = 40; // height of a pairBlock

  // functions prefixed with intialise- are reponsible for collecting the objects to draw
  // order of collector and draw functions matters
  const DRAW_ON_STARTUP = [
    drawBackground,
    initialiseFrameArrows,
    initialiseFnFrameArrows,
    initialiseFrameTitles,
    drawSceneFrameObjects,
    drawHitFrameObjects,
    drawSceneFnObjects,
    drawHitFnObjects,
    initialiseDataObjects,
    initialiseFrameValueArrows,
    drawScenePairBlocks,
    drawHitPairBlocks,
    drawSceneArrayBlocks,
    drawHitArrayBlocks,
    drawSceneTextObjects,
    drawHitTextObjects,
    drawSceneArrowObjects,
    drawHitArrowObjects
  ];

  // TODO: invoke addEventListener outside draw_env
  // check if event listeners have already been attached to the container
  let alreadyListening = false;

  /**
   * Create a different layer for each type of element. May be more useful
   * in future for manipulating groups of elements.
   */
  const backgroundLayer = new Concrete.Layer(),
    fnObjectLayer = new Concrete.Layer(),
    dataObjectLayer = new Concrete.Layer(),
    frameObjectLayer = new Concrete.Layer(),
    arrowObjectLayer = new Concrete.Layer(),
    textObjectLayer = new Concrete.Layer(),
    pairBlockLayer = new Concrete.Layer(),
    arrayBlockLayer = new Concrete.Layer();

  // initialise the layers here
  const LAYERS = [
    backgroundLayer,
    frameObjectLayer,
    fnObjectLayer,
    dataObjectLayer,
    pairBlockLayer,
    arrayBlockLayer,
    arrowObjectLayer,
    textObjectLayer
  ];

  LAYERS.forEach(layer => viewport.add(layer));

  /**
   * Unlike function objects, data objects are represented internally not as
   * objects, but as arrays. As such, we cannot assign properties like x- and
   * y-coordinates directly to them. These properties are stored instead in
   * another array of objects called boundDataObjectWrappers, which maps 1-to-1 to
   * the objects they represent in boundDataObjects.
   */
  let boundDataObjectWrappers, builtins, levels, drawnArrowLines;

  // objects that need to be drawn
  let fnObjects,
    boundDataObjects,
    drawnDataObjects,
    initialisedPairBlocks,
    initialisedArrayBlocks,
    frameObjects,
    textObjects,
    arrowObjects,
    pairBlocks,
    arrayBlocks;

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
  let dataObjectKey,
    fnObjectKey,
    arrowObjectKey,
    textObjectKey,
    pairBlockKey,
    arrayBlockKey,
    envKeyCounter; // frameObject key follows envKeyCounter

  let drawingWidth = 0,
    drawingHeight = 0;

  function resetVariables() {
    fnObjects = [];
    boundDataObjects = [];
    boundDataObjectWrappers = [];
    builtins = { names: [], values: [] };
    levels = {};
    drawnArrowLines = { x: [], y: [] };
    drawnDataObjects = [];
    initialisedPairBlocks = [];
    initialisedArrayBlocks = [];
    frameObjects = [];
    textObjects = [];
    arrowObjects = [];
    pairBlocks = [];
    arrayBlocks = [];
    dataObjectKey = Math.pow(2, 24) - 1;
    fnObjectKey = Math.pow(2, 22) - 1;
    arrowObjectKey = Math.pow(2, 20) - 1;
    textObjectKey = Math.pow(2, 18) - 1;
    pairBlockKey = Math.pow(2, 16) - 1;
    arrayBlockKey = Math.pow(2, 14) - 1;
    envKeyCounter = 0;
  }

  resetVariables();
  /*
  |--------------------------------------------------------------------------
  | Draw functions
  |--------------------------------------------------------------------------
  | eg. drawScene, drawHit: plural, singular
  | only include those that have their own layers
  */
  // General Scene
  // --------------------------------------------------.

  // main function to be exported
  function draw_env(context) {
    if (PRODUCTION_ENV) {
      // hide the default text
      document.getElementById('env-visualizer-default-text').hidden = true;
      // blink icon
      const icon = document.getElementById('env_visualiser-icon');
      icon.classList.add('side-content-tab-alert');
    }

    // reset current drawing
    viewport.layers.forEach(layer => layer.scene.clear());

    // reset all variables
    resetVariables();

    // add built-in functions to list of builtins
    const contextEnvs = context.context.context.runtime.environments;
    const allEnvs = [];

    // process backwards so that global env comes first
    for (let i = contextEnvs.length - 1; i >= 0; i--) {
      allEnvs.push(contextEnvs[i]);
    }

    const globalEnv = allEnvs[0];
    const globalElems = globalEnv.head;
    const libraryEnv = allEnvs[1];
    const libraryElems = libraryEnv.head;

    builtins.names = [...Object.keys(globalElems), ...Object.keys(libraryElems)];
    builtins.values = [...Object.values(globalElems), ...Object.values(libraryElems)];

    // add library-specific built-in functions to list of builtins
    const externalSymbols = context.context.context.externalSymbols;
    for (const i in externalSymbols) {
      builtins.names.push(externalSymbols[i]);
    }

    // add extra props to primitive fnObjects
    const primitiveElems = { ...globalElems, ...libraryElems };
    for (const name in primitiveElems) {
      const value = primitiveElems[name];
      if (isFnObject(value)) {
        value.environment = globalEnv;
        value.node = {};
        value.node.type = 'FunctionDeclaration';
        value.functionName = '' + name;
      }
    }

    // parse input from the interpreter
    function parseInput(accFrames, environments) {
      let newFrameObjects = [];
      /**
       * environments is the array of environments in the interpreter.
       * newFrameObjects is the current newFrameObjects being created
       * accFrames is all newFrameObjects created so far (including from previous
       * recursive calls of parseInput).
       */

      /**
       * Create a frame for each environment
       * Each frame represents one frame to be drawn
       */
      environments.forEach(function (environment) {
        let newFrameObject;
        environment.envKeyCounter = envKeyCounter++;

        /**
         * There are two environments named programEnvironment. We only want one
         * corresponding "Program" frame.
         */
        if (environment.name === 'programEnvironment') {
          let isProgEnvPresent = false;
          // look through existing frame objects, check if program frame already exists
          newFrameObjects.forEach(function (frameObject) {
            if (frameObject.name === 'Program') {
              newFrameObject = frameObject;
              isProgEnvPresent = true;
            }
          });
          if (!isProgEnvPresent) {
            newFrameObject = initialiseFrameObject('Program', environment.envKeyCounter);
            newFrameObjects.push(newFrameObject);
            accFrames.push(newFrameObject);
          }
        } else {
          newFrameObject = initialiseFrameObject(
            environment.name.replace('Environment', ''),
            environment.envKeyCounter
          );
          newFrameObjects.push(newFrameObject);
          accFrames.push(newFrameObject);
        }

        // extract elements from the head of the environment into the frame
        newFrameObject.elements = {};
        if (newFrameObject.name === 'global') {
          newFrameObject.elements['(predeclared names)'] = '';
          // don't copy over built-in functions
        } else if (
          environment.name === 'programEnvironment' &&
          environment.tail.name === 'global'
        ) {
          // do nothing (this environment contains library functions)
        } else {
          // copy everything (possibly including redeclared built-ins) over
          const envElems = environment.head;
          for (const name in envElems) {
            const value = envElems[name];
            newFrameObject.elements[name] = value;
            if (isPrimitiveFnObject(value)) {
              // this is a built-in function referenced to in a later frame,
              // e.g. "const a = pair". In this case, add it to the global frame
              // to be drawn and subsequently referenced.
              getFrameByName(accFrames, 'global').elements[getFnName(value)] = value;
            }
          }
        }
      });

      /**
       * - Assign parent frame of each frame (except global frame)
       * - Assign level of each frame. Frames are organised into distinct
       *   vertical bands. Global frame is at the top (level 0). Every
       *   other frame is 1 level below its parent.
       */
      newFrameObjects.forEach(function (frameObject) {
        if (frameObject.name === 'global') {
          frameObject.parent = null;
          frameObject.level = 0;
        } else {
          if (frameObject.name === 'Program') {
            frameObject.parent = getFrameByName(accFrames, 'global');
          } else {
            let env = getEnvByKeyCounter(environments, frameObject.key);
            if (env.tail.name === 'programEnvironment') {
              env = env.tail;
            }
            // need to extract non-empty ancestor frame from the frame
            frameObject.parent = extractParentFrame(
              getFrameByKey(accFrames, env.tail.envKeyCounter)
            );
          }
          // For loops do not have frameObject.parent, only while loops and functions do
          if (frameObject.parent) {
            frameObject.parent.children.push(frameObject.key);
            // don't increment the level if the frame object is empty
            frameObject.level = frameObject.parent.level + (isEmptyFrame(frameObject) ? 0 : 1);
          }
        }

        // update total number of newFrameObjects in the current level
        if (levels[frameObject.level]) {
          levels[frameObject.level].count++;
          if (!isEmptyFrame(frameObject)) levels[frameObject.level].frameObjects.push(frameObject);
        } else {
          levels[frameObject.level] = { count: 1 };
          levels[frameObject.level].frameObjects = [frameObject];
        }

        frameObject.levelObject = levels[frameObject.level];
      });

      /**
       * Extract function and data objects from newFrameObjects. Each distinct object is
       * drawn next to the first frame where it is referenced; subsequent
       * references point back to the object.
       */
      newFrameObjects.forEach(function (frameObject) {
        const { elements } = frameObject;
        for (const name in elements) {
          const value = elements[name];
          if (isFnObject(value) && !fnObjects.includes(value)) {
            fnObjects.push(initialiseFrameFnObject(value, frameObject));
          } else if (isDataObject(value) && !boundDataObjects.includes(value)) {
            boundDataObjects.push(value);
            boundDataObjectWrappers.push(initialiseDataObjectWrapper(name, value, frameObject));
            findFnInDataObject(value);
          }
        }
      });

      function findFnInDataObject(dataObject) {
        const traversedStructures = [];

        function helper(mainStructure, subStructure, value, index) {
          if (traversedStructures.includes(value)) {
            // do nothing
          } else if (isFnObject(value) && !fnObjects.includes(value)) {
            if (isPrimitiveFnObject(value)) {
              const globalFrame = getFrameByName(accFrames, 'global');
              globalFrame.elements[getFnName(value)] = value;

              fnObjects.push(initialiseFrameFnObject(value, globalFrame));
            } else {
              fnObjects.push(initialiseDataFnObject(value, { mainStructure, subStructure, index }));
            }
          } else if (isDataObject(value)) {
            traversedStructures.push(value);
            value.forEach((subValue, index) => {
              helper(mainStructure, value, subValue, index);
            });
          }
        }

        helper(dataObject, dataObject, dataObject);
      }

      /**
       * Some functions may have been generated via anonymous functions, whose
       * environments would not have been present in initial array from the
       * interpreter.
       * Find these environments, and recursively process them.
       */
      const topLevelMissingEnvs = [];
      // extract the outermost environments from all the function objects
      fnObjects.forEach(function (fnObject) {
        let otherEnv = fnObject.environment;
        /**
         * There may be multiple levels of anonymous function newFrameObjects, e.g.
         * from the expression (w => x => y => z)(1)(2), where
         * w => x => ... generates one frame, and
         * x => y => ... generates another.
         * The while loop ensure all of these newFrameObjects are extracted.
         */
        while (!allEnvs.includes(otherEnv)) {
          topLevelMissingEnvs.push(otherEnv);
          // find function definition expression to use as frame name
          if (isUndefined(otherEnv.callExpression)) {
            // When the environment is a loop, it does't have a call expression
            break;
          }

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
          try {
            params.forEach(param => {
              paramArray.push(param.name);
            });
            const paramString = '(' + paramArray.join(', ') + ') => ...';
            otherEnv.vizName = paramString;
          } catch (e) {
            // for some reason or other the function definition expression is
            // not always available. In that case, just use the frame name
            if (DEBUG_MODE) console.error(e.message);
          }
          otherEnv = otherEnv.tail;
        }
      });

      // a helper func to extract all the missing tail envs from the given environment
      function extractEnvs(environment) {
        // TODO: include in general helper functions
        if (
          isNull(environment) ||
          environment.name === 'programEnvironment' ||
          environment.name === 'global'
        ) {
          return [];
        } else {
          // prepend the extracted tail envs, so that the outermost environment comes last
          return [...extractEnvs(environment.tail), environment];
        }
      }

      // extract all envs from the top level missing envs
      if (topLevelMissingEnvs.length > 0) {
        const allMissingEnvs = [];

        topLevelMissingEnvs.forEach(missingEnv => {
          const extractedEnvs = extractEnvs(missingEnv);
          Array.prototype.push.apply(allMissingEnvs, extractedEnvs);
        });

        // remove repeated env in the array using Set constructor
        const uniqMissingEnvs = [...new Set(allMissingEnvs)];
        Array.prototype.push.apply(allEnvs, uniqMissingEnvs);

        newFrameObjects = parseInput(accFrames, uniqMissingEnvs);
      }

      /**
       * - Find width and height of each frame
       */
      for (let i = newFrameObjects.length - 1; i >= 0; i--) {
        const frameObject = newFrameObjects[i];
        frameObject.height = getFrameHeight(frameObject);
        frameObject.width = getFrameWidth(frameObject);
        frameObject.fullwidth = getFrameAndObjectWidth(frameObject);
      }

      return accFrames;
    }

    frameObjects = parseInput([], allEnvs);
    /**
     * Find the source frame for each fnObject. The source frame is the frame
     * which generated the function. This may be different from the parent
     * frame, which is the first frame where the object is referenced.
     */
    fnObjects.forEach(function (fnObject) {
      if (fnObject.environment.envKeyCounter === 1) {
        // library functions, points to global frame
        fnObject.source = getFrameByName(frameObjects, 'global');
      } else if (fnObject.environment.envKeyCounter === 2) {
        // program environment functions
        fnObject.source = getFrameByName(frameObjects, 'Program');
      } else {
        fnObject.source = getFrameByKey(frameObjects, fnObject.environment.envKeyCounter);
      }
    });

    positionItems();

    drawingWidth = Math.max(getDrawingWidth() + DRAWING_PADDING * 2, 300);

    drawingHeight = getDrawingHeight();

    viewport.layers.forEach(layer => {
      // set size layer by layer
      layer.setSize(drawingWidth, drawingHeight);
    });

    viewport.setSize(drawingWidth, drawingHeight);

    // invoke all drawing functions
    DRAW_ON_STARTUP.forEach(drawSceneObjects => {
      try {
        drawSceneObjects();
      } catch (e) {
        if (DEBUG_MODE) console.error(drawSceneObjects, e.message);
      }
    });

    if (!alreadyListening) {
      alreadyListening = true;
      container.addEventListener('mousemove', function (evt) {
        let boundingRect = container.getBoundingClientRect(),
          x = evt.clientX - boundingRect.left,
          y = evt.clientY - boundingRect.top,
          key = viewport.getIntersection(x, y);

        if (key >= 0) {
          container.style.cursor = 'pointer';
        } else {
          container.style.cursor = 'default';
        }

        // Arrow Mousemove
        // --------------------------------------------------.
        // unhover all arrowObjects
        arrowObjects.forEach(function (arrowObject) {
          arrowObject.hovered = false;
        });

        if (key >= 0 && key < Math.pow(2, 20)) {
          const arrowObject = getObjFromKey(arrowObjects, key);
          if (arrowObject) arrowObject.hovered = true;
        }

        drawSceneArrowObjects();

        // Text Mousemove
        // --------------------------------------------------.
        // unhover all textObjects
        textObjects.forEach(function (textObject) {
          textObject.hovered = false;
        });

        if (key >= 0 && key < Math.pow(2, 18)) {
          const textObject = getObjFromKey(textObjects, key);
          if (textObject) textObject.hovered = true;
        }

        drawSceneTextObjects();

        // Fn Mousemove
        // --------------------------------------------------.
        // unhover all fnObjects
        fnObjects.forEach(function (fnObject) {
          fnObject.hovered = false;
        });

        if (key >= 0 && key < Math.pow(2, 23)) {
          const fnObject = getObjFromKey(fnObjects, key);
          if (fnObject) fnObject.hovered = true;
        }

        drawSceneFnObjects();

        // Pair Mousemove
        // --------------------------------------------------.
        // unhover all pairBlocks
        pairBlocks.forEach(function (pairBlock) {
          pairBlock.hovered = false;
        });

        if (key >= 0 && key < Math.pow(2, 16)) {
          const pairBlock = getObjFromKey(pairBlocks, key);
          if (pairBlock) pairBlock.hovered = true;
        }

        drawScenePairBlocks();

        // Array Mousemove
        // --------------------------------------------------.
        // unhover all arrayBlocks
        arrayBlocks.forEach(function (arrayBlock) {
          arrayBlock.hovered = false;
        });

        if (key >= 0 && key < Math.pow(2, 14)) {
          const arrayBlock = getObjFromKey(arrayBlocks, key);
          if (arrayBlock) arrayBlock.hovered = true;
        }

        drawSceneArrayBlocks();

        // Frame Mousemove
        // --------------------------------------------------.
        // unhover all frameObjects
        frameObjects.forEach(function (frameObject) {
          frameObject.hovered = false;
        });

        if (key >= 0) {
          const frameObject = getObjFromKey(frameObjects, key);
          if (frameObject) frameObject.hovered = true;
        }

        drawSceneFrameObjects();
      });

      container.addEventListener('click', function (evt) {
        let boundingRect = container.getBoundingClientRect(),
          x = evt.clientX - boundingRect.left,
          y = evt.clientY - boundingRect.top,
          key = viewport.getIntersection(x, y);

        // Text Click
        // --------------------------------------------------.
        // unhover all textObjects
        textObjects.forEach(function (textObject) {
          textObject.selected = false;
        });

        if (key >= 0 && key < Math.pow(2, 18)) {
          const textObject = getObjFromKey(textObjects, key);
          if (textObject) {
            if (DEBUG_MODE) console.log(textObject);
            textObject.selected = true;
          }
        }

        drawSceneTextObjects();

        // Fn Click
        // --------------------------------------------------.
        // unselect all fnObjects
        fnObjects.forEach(function (fnObject) {
          fnObject.selected = false;
        });

        if (key >= 0 && key < Math.pow(2, 23)) {
          const fnObject = getObjFromKey(fnObjects, key);
          if (fnObject) {
            if (DEBUG_MODE) console.log(fnObject);
            fnObject.selected = true;
          }
        }

        drawSceneFnObjects();

        // Pair Click
        // --------------------------------------------------.
        // unselect all pairBlocks
        pairBlocks.forEach(function (pairBlock) {
          pairBlock.selected = false;
        });

        if (key >= 0 && key < Math.pow(2, 16)) {
          const pairBlock = getObjFromKey(pairBlocks, key);
          if (pairBlock) {
            if (DEBUG_MODE) console.log(pairBlock);
            pairBlock.selected = true;
          }
        }

        drawScenePairBlocks();

        // Array Click
        // --------------------------------------------------.
        // unselect all arrayBlocks
        arrayBlocks.forEach(function (arrayBlock) {
          arrayBlock.selected = false;
        });

        if (key >= 0 && key < Math.pow(2, 14)) {
          const arrayBlock = getObjFromKey(arrayBlocks, key);
          if (arrayBlock) {
            if (DEBUG_MODE) console.log(arrayBlock);
            arrayBlock.selected = true;
          }
        }

        drawSceneArrayBlocks();

        // Frame Click
        // --------------------------------------------------.
        // unselect all frames
        frameObjects.forEach(function (frameObject) {
          frameObject.selected = false;
        });

        if (key >= 0) {
          const frameObject = getObjFromKey(frameObjects, key);
          if (frameObject) {
            if (DEBUG_MODE) console.log(frameObject);
            frameObject.selected = true;
          }
        }

        drawSceneFrameObjects();
      });
    }
  }

  function drawBackground() {
    const scene = backgroundLayer.scene,
      context = scene.context;
    context.save();
    scene.clear();
    context.fillStyle = SA_BLUE;
    context.fillRect(0, 0, drawingWidth, drawingHeight);
    context.restore();
    viewport.render();
  }

  // Frame Scene
  // --------------------------------------------------.
  function initialiseFrameTitles() {
    frameObjects.forEach(frameObject => {
      const { name, x, y } = frameObject;
      let frameName;
      switch (name) {
        case 'forLoop':
          frameName = 'Body of for-loop';
          break;
        case 'forBlock':
          frameName = 'Control variable of for-loop';
          break;
        case 'block':
          frameName = 'Block';
          break;
        case 'global':
          frameName = 'Global';
          break;
        case 'functionBody':
          frameName = 'Function Body';
          break;
        default:
          frameName = name;
      }

      textObjects.push(
        initialiseTextObject(frameName, x, y - 10, { color: WHITE, maxWidth: 100, isSymbol: true })
      );
    });
  }

  function drawSceneFrameObjects() {
    const scene = frameObjectLayer.scene;
    scene.clear();
    frameObjects.forEach(function (frameObject) {
      if (!isEmptyFrame(frameObject)) {
        drawSceneFrameObject(frameObject);
      }
    });
    viewport.render();
  }

  function drawHitFrameObjects() {
    frameObjects.forEach(function (frameObject) {
      drawHitFrameObject(frameObject);
    });
  }

  function drawSceneFrameObject(frameObject) {
    const scene = frameObject.layer.scene,
      context = scene.context,
      { x, y, elements, width, height, hovered } = frameObject;
    context.save();
    context.font = FONT_SETTING;
    context.fillStyle = WHITE;
    context.beginPath();

    // render text in frame
    let i = 0;
    let textX = x + FRAME_PADDING_LEFT;
    let textY = y + FRAME_PADDING_TOP;

    for (const name in elements) {
      const value = elements[name];
      if (isNull(value)) {
        // null primitive in Source
        context.fillText(`${'' + name}: null`, textX, textY + i * FRAME_HEIGHT_LINE);
      } else {
        switch (typeof value) {
          case 'number':
          case 'boolean':
          case 'undefined':
            context.fillText(`${'' + name}: ${'' + value}`, textX, textY + i * FRAME_HEIGHT_LINE);
            break;
          case 'string':
            if (name === '(predeclared names)') {
              context.fillText(`${'' + name}`, textX, textY + i * FRAME_HEIGHT_LINE);
            } else {
              context.fillText(
                `${'' + name}: "${'' + value}"`,
                textX,
                textY + i * FRAME_HEIGHT_LINE
              );
            }
            break;
          default:
            context.fillText(`${'' + name}:`, textX, textY + i * FRAME_HEIGHT_LINE);
        }
      }
      if (isDataObject(value) && !belongToOtherData(value)) {
        i += getDataUnitHeight(value);
      } else {
        i++;
      }
    }
    context.strokeStyle = hovered ? GREEN : WHITE;
    context.strokeRect(x, y, width, height);

    context.restore();
  }

  function drawHitFrameObject(frameObject) {
    if (!isEmptyFrame(frameObject)) {
      const { x, y, width, height, key } = frameObject;
      const hit = frameObjectLayer.hit,
        context = hit.context;
      context.save();
      context.fillStyle = hit.getColorFromIndex(key);
      //---//
      context.fillRect(x, y, width, height);
      //---//
      context.restore();
    }
  }

  // Function Scene
  // --------------------------------------------------.
  function drawSceneFnObjects() {
    let isSelected = false; // check if any fnObject is selected
    fnObjectLayer.scene.clear();
    fnObjects.forEach(fnObject => {
      drawSceneFnObject(fnObject);
      if (fnObject.selected) isSelected = true;
    });

    if (isSelected) {
      // move layer to the top to see the text
      fnObjectLayer.moveToTop();
    } else {
      reorderLayers();
    }

    viewport.render();
  }

  function drawHitFnObjects() {
    for (let i = 0; i < fnObjects.length; i++) {
      drawHitFnObject(fnObjects[i]);
    }
  }

  function drawSceneFnObject(fnObject) {
    const scene = fnObject.layer.scene,
      context = scene.context;

    const { x, y } = fnObject;
    context.save();

    const color = !fnObject.hovered && !fnObject.selected ? SA_WHITE : GREEN;
    context.fillStyle = color;
    context.strokeStyle = color;

    // inner filled circle
    context.beginPath();
    context.arc(x - FNOBJECT_RADIUS, y, INNER_RADIUS, 0, Math.PI * 2, false);
    context.fill();

    context.beginPath();
    context.arc(x - FNOBJECT_RADIUS, y, FNOBJECT_RADIUS, 0, Math.PI * 2, false);
    context.stroke();

    context.beginPath();
    context.arc(x + FNOBJECT_RADIUS, y, INNER_RADIUS, 0, Math.PI * 2, false);
    context.fill();

    context.beginPath();
    context.arc(x + FNOBJECT_RADIUS, y, FNOBJECT_RADIUS, 0, Math.PI * 2, false);
    context.stroke();

    if (fnObject.selected) {
      // TODO: refactoring required
      context.save();
      let fnString = fnObject.fnString;
      let params;
      let body;
      // filter out the params and body
      if (fnObject.node.type === 'FunctionDeclaration' || fnString.substring(0, 8) === 'function') {
        params = fnString.substring(fnString.indexOf('('), fnString.indexOf('{')).trim();
        body = fnString.substring(fnString.indexOf('{'));
      } else {
        params = fnString.substring(0, fnString.indexOf('=') - 1);
        body = fnString.substring(fnString.indexOf('=') + 3);
      }

      // fill text into multi lines
      context.font = FONT_SETTING;
      context.fillStyle = GREEN;

      const marginLeft = 50,
        lineHeight = 20;

      // TODO: consider the entire text box as a whole, don't split them
      body = body.split('\n');
      context.fillText(
        `params: ${truncateText(context, params, MAX_TEXT_WIDTH).result}`,
        x + marginLeft,
        y
      );
      context.fillText('body:', x + marginLeft, y + lineHeight);
      let i = 0;
      let j = 0; // indicates the row
      while (j < 5 && i < body.length) {
        if (body[i] && body[i].replace(/ /g, '') !== 'debugger;') {
          // ignore the debugger line
          context.fillText(
            truncateText(context, body[i], MAX_TEXT_WIDTH).result,
            x + marginLeft * 2,
            y + lineHeight * (j + 1)
          );
          j++;
        }
        i++;
      }
      if (i < body.length) {
        context.fillText('...', x + 120, y + 120);
      }
      context.restore();
    }

    context.restore();
  }

  function drawHitFnObject(fnObject) {
    const hit = fnObject.layer.hit,
      context = hit.context;
    const { x, y } = fnObject;
    context.save();

    fnObject.x = x;
    fnObject.y = y;
    context.beginPath();
    context.arc(x - FNOBJECT_RADIUS, y, FNOBJECT_RADIUS, 0, Math.PI * 2, false);
    context.fillStyle = hit.getColorFromIndex(fnObject.key);
    context.fill();
    context.beginPath();
    context.arc(x + FNOBJECT_RADIUS, y, FNOBJECT_RADIUS, 0, Math.PI * 2, false);
    context.fillStyle = hit.getColorFromIndex(fnObject.key);
    context.fill();

    context.restore();
  }

  // Pair Scene
  // --------------------------------------------------.
  function drawScenePairBlocks() {
    const scene = pairBlockLayer.scene;
    scene.clear();
    pairBlocks.forEach(function (pairBlock) {
      drawScenePairBlock(pairBlock);
    });
    viewport.render();
  }

  function drawHitPairBlocks() {
    pairBlocks.forEach(function (pairBlock) {
      drawHitPairBlock(pairBlock);
    });
  }

  function drawScenePairBlock(pairBlock) {
    const { x, y, hovered } = pairBlock,
      scene = pairBlockLayer.scene,
      context = scene.context;
    context.save();
    //---//
    context.strokeStyle = hovered ? GREEN : SA_WHITE;
    context.strokeRect(x, y, DATA_UNIT_WIDTH, DATA_UNIT_HEIGHT);
    context.beginPath();
    context.moveTo(x + DATA_UNIT_WIDTH / 2, y);
    context.lineTo(x + DATA_UNIT_WIDTH / 2, y + DATA_UNIT_HEIGHT);
    context.stroke();
    //---//
    context.restore();
  }

  function drawHitPairBlock(pairBlock) {
    const { x, y, key } = pairBlock,
      hit = pairBlockLayer.hit,
      context = hit.context;
    context.save();
    //---//
    context.fillStyle = hit.getColorFromIndex(key);
    context.fillRect(x, y, DATA_UNIT_WIDTH, DATA_UNIT_HEIGHT);
    context.strokeStyle = hit.getColorFromIndex(key);
    context.strokeRect(x, y, DATA_UNIT_WIDTH, DATA_UNIT_HEIGHT);
    context.beginPath();
    context.moveTo(x + DATA_UNIT_WIDTH / 2, y);
    context.lineTo(x + DATA_UNIT_WIDTH / 2, y + DATA_UNIT_HEIGHT);
    context.stroke();
    //---//
    context.restore();
  }

  function initialiseDataObjects() {
    drawnDataObjects = [];
    dataObjectLayer.scene.clear();
    boundDataObjects.forEach(function (dataObject) {
      if (!isNull(dataObject)) {
        if (checkDraw(dataObject)) {
          initialiseDataObject(dataObject);
          drawnDataObjects.push(dataObject);
        } else {
          reassignCoordinates(dataObject);
        }
      }
    });
    viewport.render();
  }

  function initialiseDataObject(dataObject) {
    const wrapper = getDataObjectWrapper(dataObject),
      { x, y } = wrapper,
      scene = dataObjectLayer.scene,
      context = scene.context;
    context.save();
    initialisedArrayBlocks = [];
    initialisedPairBlocks = [];
    if (isArrayData(dataObject)) {
      initialiseArrayBlocks(dataObject, wrapper, x, y);
    } else {
      initialisePairBlocks(dataObject, wrapper, x, y);
    }
    context.restore();
  }

  // deprecated
  // Arrow Scene
  // --------------------------------------------------.
  // function initialiseArrowObjects() {
  //   initialiseFrameArrows();
  //   initialiseFrameValueArrows();
  //   initialiseFnFrameArrows();
  // }

  // invoke this after initialiseDataObjects, since this will require reassigned coordinates
  function initialiseFrameValueArrows() {
    frameObjects.forEach(function (frameObject) {
      const { elements } = frameObject;
      for (const name in elements) {
        const value = elements[name];
        if (isDataObject(value)) {
          initialiseFrameDataArrow(frameObject, name, value);
        } else if (isFnObject(value)) {
          initialiseFrameFnArrow(frameObject, name, value);
        }
      }
    });
    viewport.render();
  }

  function initialiseFnFrameArrows() {
    fnObjects.forEach(function (fnObject) {
      initialiseFnFrameArrow(fnObject);
    });
    viewport.render();
  }

  function initialiseFrameArrows() {
    frameObjects.forEach(function (frameObject) {
      if (!isEmptyFrame(frameObject)) {
        initialiseFrameArrow(frameObject);
      }
    });
    viewport.render();
  }

  /**
   * Trivial - the arrow just points straight to a fixed position relative to
   * the frame.
   */
  function initialiseFrameDataArrow(frameObject, name, dataObject) {
    const wrapper = getDataObjectWrapper(dataObject);
    arrowObjects.push(
      initialiseArrowObject([
        makeArrowNode(
          frameObject.x + (name.length + 1) * FRAME_WIDTH_CHAR + FRAME_PADDING_LEFT * 2,
          frameObject.y +
            getElementNamePosition(name, frameObject) * FRAME_HEIGHT_LINE +
            FRAME_PADDING_TOP
        ),
        makeArrowNode(wrapper.x, wrapper.y + DATA_UNIT_HEIGHT / 2)
      ])
    );
  }

  /**
   * For each function variable, either the function is defined in the scope
   * the same frame, in which case drawing the arrow is simple, or it is in
   * a different frame. If so, more care is needed to route the arrow back up
   * to its destination.
   */
  function initialiseFrameFnArrow(frameObject, name, fnObject) {
    const fnRight = fnObject.x + FNOBJECT_RADIUS * 2,
      fnLeft = fnObject.x - FNOBJECT_RADIUS * 2,
      fnHeight = fnObject.y;

    if (fnObject.parent === frameObject) {
      // fnObject belongs to current frame
      // simply draw straight arrow from frame to function
      arrowObjects.push(
        initialiseArrowObject([
          makeArrowNode(
            frameObject.x + (name.length + 1) * FRAME_WIDTH_CHAR + FRAME_PADDING_LEFT * 2,
            frameObject.y +
              getElementNamePosition(name, frameObject) * FRAME_HEIGHT_LINE +
              FRAME_PADDING_TOP
          ),
          makeArrowNode(fnLeft, fnHeight)
        ])
      );
    } else {
      /**
       * From this position, the arrow needs to move upward to reach the
       * target fnObject. Make sure it does not intersect any other object
       * when doing so, or adjust its position if it does.
       * This currently only works for the frame level directly above the origin
       * frame, which suffices in most cases.
       * TODO: Improve implementation to handle any number of frame levels. (see issue sample 2, should form 2 stair steps)
       */
      // TODO: what is this for?
      const frameOffset = getFrameIndexInLevel(frameObject);
      const x0 = frameObject.x + (name.length + 1) * FRAME_WIDTH_CHAR + FRAME_PADDING_LEFT * 2,
        y0 =
          frameObject.y +
          getElementNamePosition(name, frameObject) * FRAME_HEIGHT_LINE +
          FRAME_PADDING_TOP,
        x1 = frameObject.x + frameObject.width + frameOffset * 20 + FRAME_MARGIN_RIGHT / 2,
        y1 = y0,
        x2 = x1,
        y2 = frameObject.y + frameOffset * 5 - LEVEL_SPACING / 2,
        x3 = fnRight + FNOBJECT_RADIUS,
        y3 = y2,
        x4 = x3,
        y4 = fnHeight,
        xf = fnRight,
        yf = y4;

      arrowObjects.push(
        initialiseArrowObject([
          makeArrowNode(x0, y0),
          makeArrowNode(x1, y1),
          makeArrowNode(x2, y2),
          makeArrowNode(x3, y3),
          makeArrowNode(x4, y4),
          makeArrowNode(xf, yf)
        ])
      );
    }
  }

  function initialiseFnFrameArrow(fnObject) {
    const frameObject = extractParentFrame(fnObject.source); // extract non-empty parent frame
    const x0 = fnObject.x + FNOBJECT_RADIUS,
      y0 = fnObject.y;
    if (
      fnObject.x > frameObject.x &&
      fnObject.x + FNOBJECT_RADIUS < frameObject.x + frameObject.width
    ) {
      // point up or down to a wide frame
      const x1 = x0,
        y1 = y0,
        x2 = x1,
        y2 = frameObject.y + (fnObject.y > frameObject.y ? frameObject.height : 0);

      arrowObjects.push(
        initialiseArrowObject([makeArrowNode(x0, y0), makeArrowNode(x1, y1), makeArrowNode(x2, y2)])
      );
    } else if (
      fnObject.y < frameObject.y + frameObject.height && // fnObject is within the body of frameObject
      fnObject.y > frameObject.y
    ) {
      const x1 = x0,
        y1 = y0 - (FNOBJECT_RADIUS * 2 - ARROW_OFFSET),
        x2 = frameObject.x + (frameObject.x > fnObject.x ? 0 : frameObject.width), // point to the left side of fnObject if it is on the right
        y2 = y1;

      arrowObjects.push(
        initialiseArrowObject([makeArrowNode(x0, y0), makeArrowNode(x1, y1), makeArrowNode(x2, y2)])
      );
    } else {
      const x1 = x0,
        y1 =
          frameObject.y > fnObject.y
            ? frameObject.y - LEVEL_SPACING / 2
            : frameObject.y + frameObject.height + LEVEL_SPACING / 2,
        x2 = frameObject.x + FRAME_ARROW_TARGET + ARROW_OFFSET,
        y2 = y1,
        x3 = x2,
        y3 = frameObject.y > fnObject.y ? frameObject.y : frameObject.y + frameObject.height;

      arrowObjects.push(
        initialiseArrowObject([
          makeArrowNode(x0, y0),
          makeArrowNode(x1, y1),
          makeArrowNode(x2, y2),
          makeArrowNode(x3, y3)
        ])
      );
    }
  }

  /**
   * Arrows between child and parent frameObjects.
   * Uses an offset factor to prevent lines overlapping, similar to with
   * frame-function arrowObjects.
   */
  function initialiseFrameArrow(frameObject) {
    if (isNull(frameObject.parent)) return; // TODO: be more explicit, eg. isGlobal(parent)

    const parent = extractParentFrame(frameObject.parent);
    const frameOffset = levels[parent.level].frameObjects.indexOf(frameObject.parent);
    const x0 = frameObject.x + FRAME_ARROW_TARGET,
      y0 = frameObject.y,
      x1 = x0,
      y1 = (parent.y + parent.height + y0) / 2 + frameOffset * 4,
      x2 = parent.x + FRAME_ARROW_TARGET,
      y2 = y1,
      x3 = x2,
      y3 = parent.y + parent.height;

    arrowObjects.push(
      initialiseArrowObject(
        [
          makeArrowNode(x0, y0),
          makeArrowNode(x1, y1),
          makeArrowNode(x2, y2),
          makeArrowNode(x3, y3)
        ],
        {
          color: WHITE,
          detectOverlap: false
        }
      )
    );
  }

  function drawSceneArrowObjects() {
    const scene = arrowObjectLayer.scene;
    let hoveredArrow;
    scene.clear();
    arrowObjects.forEach(function (arrowObject) {
      if (arrowObject.hovered) {
        hoveredArrow = arrowObject;
      } else {
        drawSceneArrowObject(arrowObject);
      }
    });
    if (hoveredArrow) drawSceneArrowObject(hoveredArrow);
    viewport.render();
  }

  function drawHitArrowObjects() {
    arrowObjects.forEach(function (arrowObject) {
      drawHitArrowObject(arrowObject);
    });
  }

  function drawSceneArrowObject(arrowObject) {
    const { nodes, color, hovered } = arrowObject;
    const scene = arrowObjectLayer.scene,
      context = scene.context;
    context.save();

    for (let i = 0; i < nodes.length - 1; i++) {
      context.save();
      context.beginPath();
      context.moveTo(nodes[i].x, nodes[i].y);
      context.lineTo(nodes[i + 1].x, nodes[i + 1].y);
      context.strokeStyle = hovered ? GREEN : color;
      context.setLineDash(
        nodes[i].x !== nodes[i + 1].x && nodes[i].y !== nodes[i + 1].y
          ? [5, 5] // dashed line if it is diagonal for aesthetic reasons
          : []
      );
      context.stroke();
      context.restore();
    }

    const secondLastNode = nodes.slice(-2)[0],
      lastNode = nodes.slice(-1)[0];

    // draw arrow head
    drawArrowObjectHead(secondLastNode.x, secondLastNode.y, lastNode.x, lastNode.y, color, hovered);

    context.restore();
  }

  function drawHitArrowObject(arrowObject) {
    const { nodes, key } = arrowObject,
      hit = arrowObjectLayer.hit,
      context = hit.context;
    const color = hit.getColorFromIndex(key);
    context.save();
    context.beginPath();

    for (let i = 0; i < nodes.length - 1; i++) {
      context.moveTo(nodes[i].x, nodes[i].y);
      context.lineTo(nodes[i + 1].x, nodes[i + 1].y);
    }

    const secondLastNode = nodes.slice(-2)[0],
      lastNode = nodes.slice(-1)[0];

    // draw arrow head
    drawArrowObjectHead(secondLastNode.x, secondLastNode.y, lastNode.x, lastNode.y, color);

    context.strokeStyle = color;
    context.lineWidth = 15;
    context.stroke();
    context.restore();
  }

  // Text Scene
  // --------------------------------------------------.
  function drawSceneTextObjects() {
    const scene = textObjectLayer.scene;
    let hoveredText;
    scene.clear();
    textObjects.forEach(function (textObject) {
      // drawSceneTextObject(textObject);
      if (textObject.hovered) {
        hoveredText = textObject;
      } else {
        drawSceneTextObject(textObject);
      }
    });
    if (hoveredText) drawSceneTextObject(hoveredText);
    viewport.render();
  }

  function drawHitTextObjects() {
    textObjects.forEach(function (textObject) {
      drawHitTextObject(textObject);
    });
  }

  function drawSceneTextObject(textObject) {
    const { value, x, y, color, hovered, maxWidth, isSymbol } = textObject;
    const scene = textObjectLayer.scene,
      context = scene.context,
      text = isString(value) && !isSymbol ? `"${value}"` : value;
    context.save();
    //---//
    context.font = FONT_SETTING;

    if (hovered) {
      //---//
      // add background to the text
      context.fillStyle = REGENT_GRAY_80;
      context.fillRect(
        x - TEXT_PADDING,
        y - FONT_HEIGHT - TEXT_PADDING / 2,
        context.measureText(text).width + TEXT_PADDING * 2,
        FONT_HEIGHT + TEXT_PADDING
      );
      //---//
      context.fillStyle = WHITE;
      context.fillText(text, x, y - TEXT_PADDING / 2);
    } else {
      context.fillStyle = color;
      const { result, truncated } = truncateText(context, text, maxWidth);
      if (truncated) {
        context.fillText(result, x - 10, y);
      } else {
        context.fillText(result, x, y);
      }
    }
    //---//
    context.restore();
  }

  function drawHitTextObject(textObject) {
    const { value, x, y, key } = textObject,
      hit = textObjectLayer.hit,
      context = hit.context;
    context.save();
    context.font = FONT_SETTING;
    context.fillStyle = hit.getColorFromIndex(key);
    const textWidth = Math.min(
      context.measureText(value).width + TEXT_PADDING * 2,
      DATA_UNIT_WIDTH / 2
    );
    //---//
    context.fillRect(x - TEXT_PADDING, y - FONT_HEIGHT, textWidth, FONT_HEIGHT + TEXT_PADDING);
    //---//
    context.restore();
  }

  /*
  |--------------------------------------------------------------------------
  | Helper functions
  |--------------------------------------------------------------------------
  */
  // General Helpers
  // --------------------------------------------------.

  function reorderLayers() {
    LAYERS.forEach(layer => layer.moveToTop());
  }

  function getObjFromKey(objects, key) {
    let len = objects.length,
      n,
      obj;

    for (n = 0; n < len; n++) {
      obj = objects[n];
      if (obj.key === key) {
        return obj;
      }
    }

    return null;
  }

  /**
   * Assigns an x- and a y-coordinate to every frame and object.
   */
  function positionItems() {
    /**
     * Find and store the height of each level
     * (i.e. the height of the tallest environment)
     */
    for (const l in levels) {
      const level = levels[l];
      let maxHeight = 0,
        fullwidthArray = [];
      level.frameObjects.forEach(function (frameObject) {
        if (frameObject.height > maxHeight) {
          maxHeight = frameObject.height;
        }
        fullwidthArray.push(frameObject.fullwidth);
      });
      level.height = maxHeight;
      level.widthArray = fullwidthArray;
    }

    /**
     * Calculate x- and y-coordinates for each frame
     */
    frameObjects.forEach(function (frameObject) {
      let currLevel = frameObject.level;

      /**
       * y-coordinate
       * Simply the total height of all levels above the frameObject, plus a
       * fixed spacing factor (60) per level.
       */
      let y = 30;
      for (let i = 0; i < currLevel; i++) {
        y += levels[i].height + LEVEL_SPACING;
      }
      frameObject.y = y;
    });

    /**
     * x-coordinate
     * All frameObjects are left-aligned. Iterate through each level, assigning the x-coordinate
     * depending on how much space the frameObjects on the left are taking up
     * Potential future improvement: Group frameObjects together in a tree structure, and assign space recurisvely
     * to each frame. However, need to fix max drawing size, which is currently limited.
     */
    for (const l in levels) {
      const level = levels[l];
      const frameWidthArray = level.widthArray;
      level.frameObjects.forEach(function (frameObject) {
        const frameIndex = level.frameObjects.indexOf(frameObject);
        if (frameIndex > 0) {
          frameObject.x = DRAWING_PADDING;
          for (let i = 0; i < frameIndex; i++) {
            frameObject.x += frameWidthArray[i] + FRAME_SPACING;
          }
        } else {
          frameObject.x = DRAWING_PADDING;
        }
      });
    }

    /**
     * Calculate coordinates for each fnObject and dataObject.
     */
    boundDataObjects.forEach(dataObject => {
      const wrapper = getDataObjectWrapper(dataObject);
      const { parent } = wrapper;
      wrapper.x = parent.x + parent.width + FRAME_MARGIN_RIGHT;
      wrapper.y =
        parent.y +
        getElementPosition(dataObject, parent) * FRAME_HEIGHT_LINE +
        FRAME_PADDING_TOP -
        DATA_UNIT_HEIGHT / 2;
    });

    fnObjects.forEach(function (fnObject) {
      // check the parent of the function, calculate the coordinates accordingly
      const { parent, parentType } = fnObject;

      if (parentType === 'data') {
        const { mainStructure: mainParent, subStructure: subParent, index } = parent;

        const { x, y } =
          mainParent === subParent ? getDataObjectWrapper(subParent) : getShiftInfo(subParent);

        if (isPairData(subParent) && subParent[1] === fnObject) {
          // function resides in tail
          fnObject.x = x + DATA_UNIT_WIDTH + FNOBJECT_RADIUS * 2 + PAIR_SPACING;
          fnObject.y = y + DATA_UNIT_HEIGHT / 2;
        } else {
          fnObject.x = x + DATA_UNIT_WIDTH * (1 / 4) + index * (DATA_UNIT_WIDTH / 2);
          fnObject.y =
            y +
            PAIR_SPACING +
            (DATA_UNIT_HEIGHT + FNOBJECT_RADIUS) *
              Math.max(getTailUnitHeight(subParent, isArrayData(subParent) ? index : 0), 1);
        }
      } else {
        fnObject.x = parent.x + parent.width + FRAME_MARGIN_RIGHT + FNOBJECT_RADIUS * 2;
        fnObject.y =
          parent.y + getElementPosition(fnObject, parent) * FRAME_HEIGHT_LINE + FRAME_PADDING_TOP;
      }
    });
  }

  /**
   * Space Calculation Functions
   */
  function getDataObjectWidth(dataObject) {
    const traversedStructures = [];

    function helper(value) {
      if (isDataObject(value)) {
        if (traversedStructures.includes(value) || !isParentMainStructure(dataObject, value)) {
          return 0;
        } else if (isEmptyArray(value)) {
          return DATA_UNIT_WIDTH / 4;
        } else if (isArrayData(value)) {
          traversedStructures.push(value);
          let maxWidth = 0;

          for (let i = value.length - 1; i >= 0; i--) {
            const elementWidth = Math.max(helper(value[i]), DATA_UNIT_WIDTH / 2);
            const totalWidth = elementWidth + i * (DATA_UNIT_WIDTH / 2);
            if (totalWidth > maxWidth) {
              maxWidth = totalWidth;
            }
          }

          return maxWidth;
        } else {
          // pair data
          traversedStructures.push(value);
          const pairDataLength = getPairDataLength(value);
          let maxWidth = isFnObject(getNthTail(value, pairDataLength - 1)[1])
            ? FN_MAX_WIDTH + PAIR_SPACING + pairDataLength * (DATA_UNIT_WIDTH + PAIR_SPACING)
            : 0;
          for (let i = pairDataLength - 1; i >= 0; i--) {
            const elementWidth = Math.max(helper(getNthTail(value, i)[0]), DATA_UNIT_WIDTH);
            const totalWidth = elementWidth + i * (DATA_UNIT_WIDTH + PAIR_SPACING);
            if (totalWidth > maxWidth) {
              maxWidth = totalWidth;
            }
          }

          return maxWidth;
        }
      } else if (isFnObject(value)) {
        if (value.parent.mainStructure !== dataObject) {
          return 0;
        } else {
          return FN_MAX_WIDTH;
        }
      } else {
        return 0;
      }
    }

    // used for debug
    const width = helper(dataObject);
    const wrapper = getDataObjectWrapper(dataObject);
    if (isUndefined(wrapper.width)) wrapper.width = width;
    return width;
  }

  // Calculates list/array height
  // Used in frame height calculations
  function getDataObjectHeight(dataObject) {
    const height = getDataUnitHeight(dataObject) * (DATA_UNIT_HEIGHT + PAIR_SPACING);
    const wrapper = getDataObjectWrapper(dataObject);
    if (isUndefined(wrapper.height)) wrapper.height = height;
    return height;
  }

  function getFrameHeight(frameObject) {
    let elemLines = 0;
    let dataObjectHeight = 0;
    const { elements } = frameObject;

    for (const name in elements) {
      const value = elements[name];
      if (isFnObject(value)) {
        elemLines += 1;
      } else if (isDataObject(value)) {
        if (
          getDataObjectWrapper(value).parent === frameObject &&
          !belongToOtherData(value, value)
        ) {
          dataObjectHeight += getDataObjectHeight(value);
        } else {
          dataObjectHeight += FRAME_HEIGHT_LINE;
        }
      } else {
        elemLines += 1;
      }
    }
    return dataObjectHeight + elemLines * FRAME_HEIGHT_LINE + FRAME_PADDING_BOTTOM;
  }

  // Calculates width of frame only
  function getFrameWidth(frameObject) {
    let maxLength = 0;
    const { elements } = frameObject;
    for (const name in elements) {
      const value = elements[name];
      let currLength;
      const literals = ['number', 'string', 'boolean'];
      if (literals.includes(typeof value)) {
        currLength = name.length + value.toString().length + (isString(value) ? 2 : 0);
      } else if (isUndefined(value)) {
        currLength = name.length + 9;
      } else {
        currLength = name.length;
      }
      maxLength = Math.max(maxLength, currLength);
    }
    return maxLength * FRAME_WIDTH_CHAR + FRAME_WIDTH_PADDING;
  }

  // Calculates width of objects + frame
  function getFrameAndObjectWidth(frameObject) {
    const { elements } = frameObject;
    if (elements.length === 0) {
      return frameObject.width;
    } else {
      let maxWidth = 0;
      for (const name in elements) {
        const value = elements[name];
        // Can be either primitive, function or array
        if (isDataObject(value)) {
          const wrapper = getDataObjectWrapper(value);
          if (wrapper.parent === frameObject) {
            maxWidth = Math.max(maxWidth, getDataObjectWidth(value));
          }
        } else if (isFnObject(value)) {
          if (value.parent === frameObject) {
            const { frameObjects } = value.parent.levelObject;
            maxWidth = Math.max(
              maxWidth,
              frameObjects.indexOf(frameObject) === frameObjects.length - 1
                ? FN_MAX_WIDTH
                : FNOBJECT_RADIUS * 4
            );
          }
        }
      }
      return frameObject.width + maxWidth + FRAME_MARGIN_RIGHT;
    }
  }

  function getDrawingWidth() {
    function getTotalWidth(frameObject) {
      // Compare fullwidth + width of children
      const childLevelIndex = frameObject.level + 1,
        childLevel = levels[childLevelIndex];
      let childLength = 0;

      if (!isUndefined(childLevel)) {
        const childFrameObjects = childLevel.frameObjects.filter(
          childFrameObject => childFrameObject.parent === frameObject
        );
        if (isEmptyArray(childFrameObjects)) {
          return frameObject.fullwidth;
        } else {
          childFrameObjects.forEach(childFrameObject => {
            childLength += getTotalWidth(childFrameObject) + FRAME_SPACING;
          });
        }
      } else {
        return frameObject.fullwidth;
      }

      return Math.max(frameObject.fullwidth, childLength);
    }
    // recursively determine the longest width between this frame
    // and all the subsequent children frames
    return getTotalWidth(levels[0].frameObjects[0]);
  }

  function getDrawingHeight() {
    let y = 30;
    for (const l in levels) {
      y += levels[l].height + LEVEL_SPACING;
    }
    return y;
  }

  function drawLine(context, startX, startY, endX, endY) {
    context.save();
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.strokeStyle = SA_WHITE;
    context.stroke();
    context.restore();
  }

  // Frame Helpers
  // --------------------------------------------------.
  // For both function objects and data objects

  function isPrimitiveFnObject(value) {
    return isFnObject(value) && builtins.values.includes(value);
  }

  // extract the first non-empty ancestor frameObject from the given frameObject
  function extractParentFrame(frameObject) {
    if (isEmptyFrame(frameObject)) {
      return extractParentFrame(frameObject.parent);
    } else {
      return frameObject;
    }
  }

  function getFrameIndexInLevel(frameObject) {
    const { level } = frameObject;
    return levels[level].frameObjects.indexOf(frameObject);
  }

  function isEmptyFrame(frameObject) {
    const { elements } = frameObject;
    return Object.keys(elements).length === 0 && elements.constructor === Object;
  }

  function getElementPosition(element, frameObject) {
    let position = 0;
    const { elements } = frameObject;
    for (const name in elements) {
      const value = elements[name];
      if (value === element) {
        break;
      } else if (isDataObject(value) && !belongToOtherData(value)) {
        position += getDataUnitHeight(value);
      } else {
        position++;
      }
    }
    return position;
  }

  function getElementNamePosition(elementName, frameObject) {
    let position = 0;
    const { elements } = frameObject;
    for (const name in elements) {
      const value = elements[name];
      if (name === elementName) {
        break;
      } else if (isDataObject(value) && !belongToOtherData(value)) {
        position += getDataUnitHeight(value);
      } else {
        position++;
      }
    }
    return position;
  }

  function initialiseFrameObject(frameName, key) {
    // key of frame object is same as its corresponding envkeycounter
    const frameObject = {
      key,
      name: frameName,
      hovered: false,
      selected: false,
      layer: frameObjectLayer,
      color: WHITE,
      children: []
    };
    return frameObject;
  }

  function getFrameByKey(frameObjects, key) {
    for (const i in frameObjects) {
      if (frameObjects[i].key === key) {
        return frameObjects[i];
      }
    }
    return null;
  }

  function getEnvByKeyCounter(frameObjects, key) {
    for (const i in frameObjects) {
      if (frameObjects[i].envKeyCounter === key) {
        return frameObjects[i];
      }
    }
    return null;
  }

  function getFrameByName(frameObjects, name) {
    // TODO: change the implementation to ensure that frame name is unique
    // return the first matched frameObject with the name
    for (const i in frameObjects) {
      if (frameObjects[i].name === name) {
        return frameObjects[i];
      }
    }
    return null;
  }

  function getFnObject(fnObject) {
    if (fnObjects[fnObjects.indexOf(fnObject)] === undefined) {
      if (DEBUG_MODE) console.warn('FnObject not found in the array');
    }
    return fnObject;
  }

  function getFnName(fn) {
    if (fn.node === undefined || (fn.node.type === 'FunctionDeclaration' && !fn.functionName)) {
      return undefined;
    } else if (fn.node.type === 'FunctionDeclaration') {
      return fn.functionName;
    } else {
      return fn.toString().split('(')[0].split(' ')[1];
    }
  }

  function isFnObject(value) {
    // or typeof value === "function"
    return value && {}.toString.call(value) === '[object Function]';
  }

  function initialiseFnObject(fnObject, parent) {
    fnObject.key = fnObjectKey--;
    if (!isUndefined(fnObject.fun)) {
      fnObject.fnString = fnObject.fun.toString();
    } else {
      fnObject.fnString = fnObject.toString();
    }
    fnObject.hovered = false;
    fnObject.selected = false;
    fnObject.layer = fnObjectLayer;
    fnObject.color = WHITE;
    fnObject.parent = parent;
  }

  function initialiseDataFnObject(fnObject, parent) {
    initialiseFnObject(fnObject, parent);
    fnObject.parentType = 'data';
    return fnObject;
  }

  function initialiseFrameFnObject(fnObject, parent) {
    initialiseFnObject(fnObject, parent);
    fnObject.parentType = 'frame';
    return fnObject;
  }

  // Array Helpers
  // --------------------------------------------------.
  function initialiseArrayBlock(x, y, mainStructure, wrapper, index) {
    const arrayBlock = {
      key: arrayBlockKey--,
      hovered: false,
      selected: false,
      x,
      y,
      mainStructure,
      wrapper,
      index
    };
    return arrayBlock;
  }

  // initialise arrayBlocks array
  function initialiseArrayBlocks(
    dataObject,
    wrapper,
    startX,
    startY,
    startIndex = 0 // default pointer at 0 (if dataObject is non-empty array)
  ) {
    if (isEmptyArray(dataObject)) {
      // need to do a check for empty array since initialiseArrayBlocks can take empty array as input
      // startIndex is irrelevant for empty array
      arrayBlocks.push(initialiseArrayBlock(startX, startY, dataObject, wrapper, null));
    } else if (
      startIndex < dataObject.length &&
      (isUndefined(initialisedArrayBlocks[startIndex]) ||
        !initialisedArrayBlocks[startIndex].includes(dataObject))
    ) {
      if (isUndefined(initialisedArrayBlocks[startIndex])) {
        // TODO: refactoring required
        initialisedArrayBlocks[startIndex] = [];
      }
      initialisedArrayBlocks[startIndex].push(dataObject);

      const element = dataObject[startIndex];
      const context = dataObjectLayer.scene.context;
      const newStartX = startX + DATA_UNIT_WIDTH / 4,
        newStartY = startY + DATA_UNIT_HEIGHT / 2;
      const mainStructure = wrapper.data;

      arrayBlocks.push(initialiseArrayBlock(startX, startY, mainStructure, wrapper, startIndex));
      initialiseArrayBlocks(
        dataObject,
        wrapper,
        startX + DATA_UNIT_WIDTH / 2,
        startY,
        startIndex + 1
      );

      if (isArrayData(element)) {
        const { x: shiftX, y: shiftY } = getShiftInfo(element);

        if (checkDraw(element)) {
          initialiseArrayBlocks(element, wrapper, startX, shiftY);
        }

        if (startX === shiftX) {
          // point up or down
          arrowObjects.push(
            initialiseArrowObject([
              makeArrowNode(newStartX, newStartY),
              makeArrowNode(newStartX, shiftY + (shiftY > startY ? 0 : DATA_UNIT_HEIGHT))
            ])
          );
        } else if (startY === shiftY) {
          // same level
          const x0 = newStartX,
            y0 = newStartY,
            x1 = newStartX,
            y1 = newStartY - DATA_UNIT_HEIGHT / 2 - 10,
            x2 = shiftX + (1 / 4) * DATA_UNIT_WIDTH,
            y2 = newStartY - DATA_UNIT_HEIGHT / 2 - 10,
            x3 = shiftX + (1 / 4) * DATA_UNIT_WIDTH,
            y3 = shiftY;

          arrowObjects.push(
            initialiseArrowObject([
              makeArrowNode(x0, y0),
              makeArrowNode(x1, y1),
              makeArrowNode(x2, y2),
              makeArrowNode(x3, y3)
            ])
          );
        } else {
          // point up or down
          arrowObjects.push(
            initialiseArrowObject([
              makeArrowNode(newStartX, newStartY),
              makeArrowNode(
                shiftX + DATA_UNIT_WIDTH / 4,
                shiftY + (shiftY > startY ? 0 : DATA_UNIT_HEIGHT)
              )
            ])
          );
        }
      } else if (isPairData(element)) {
        // TODO: add more cases for arrow pointing
        const { x: shiftX, y: shiftY } = getShiftInfo(element);

        if (checkDraw(element)) {
          initialisePairBlocks(element, wrapper, shiftX, shiftY);
        }

        arrowObjects.push(
          initialiseArrowObject([
            makeArrowNode(newStartX, newStartY),
            makeArrowNode(
              shiftX + DATA_UNIT_WIDTH / 4,
              shiftY + (shiftY > startY ? 0 : DATA_UNIT_HEIGHT)
            )
          ])
        );
      } else if (isNull(element)) {
        drawLine(context, startX + DATA_UNIT_WIDTH / 2, startY, startX, startY + DATA_UNIT_HEIGHT);
      } else if (isFnObject(element)) {
        drawArrayFnArrow(element, startX, startY);
      } else {
        textObjects.push(
          initialiseTextObject(
            element,
            startX + DATA_UNIT_WIDTH / 6,
            startY + DATA_UNIT_HEIGHT * (2 / 3)
          )
        );
      }
    }
  }

  function drawSceneArrayBlocks() {
    const scene = arrayBlockLayer.scene;
    let hoveredArrayBlock;
    scene.clear();
    arrayBlocks.forEach(function (arrayBlock) {
      if (arrayBlock.hovered) {
        hoveredArrayBlock = arrayBlock;
      } else {
        drawSceneArrayBlock(arrayBlock);
      }
    });
    if (hoveredArrayBlock) drawSceneArrayBlock(hoveredArrayBlock);
    viewport.render();
  }

  function drawHitArrayBlocks() {
    arrayBlocks.forEach(function (arrayBlock) {
      drawHitArrayBlock(arrayBlock);
    });
  }

  function drawSceneArrayBlock(arrayBlock) {
    const { x, y, hovered, index } = arrayBlock;
    var scene = arrayBlockLayer.scene,
      context = scene.context;
    context.save();
    //---//
    context.strokeStyle = hovered ? GREEN : SA_WHITE;
    context.strokeRect(x, y, DATA_UNIT_WIDTH / (isNull(index) ? 3 : 2), DATA_UNIT_HEIGHT);
    context.stroke();
    //---//
    context.restore();
  }

  function drawHitArrayBlock(arrayBlock) {
    const { x, y, key } = arrayBlock;
    var hit = arrayBlockLayer.hit,
      context = hit.context;
    context.save();
    context.fillStyle = hit.getColorFromIndex(key);
    //---//
    context.fillRect(x, y, DATA_UNIT_WIDTH / 2, DATA_UNIT_HEIGHT);
    context.fill();
    //---//
    context.restore();
  }

  // Data Helpers
  // --------------------------------------------------.
  function initialisePairBlock(x, y, mainStructure, subStructure, wrapper) {
    // TODO: consider adding layer prop
    const pairBlock = {
      key: pairBlockKey--,
      hovered: false,
      selected: false,
      x,
      y,
      mainStructure,
      subStructure,
      wrapper
    };
    return pairBlock;
  }

  // initialise pairBlocks array
  function initialisePairBlocks(dataObject, wrapper, startX, startY) {
    const context = dataObjectLayer.scene.context;
    const head = dataObject[0],
      tail = dataObject[1];

    context.save();
    context.font = FONT_SETTING;

    if (!initialisedPairBlocks.includes(dataObject)) {
      initialisedPairBlocks.push(dataObject);

      pairBlocks.push(initialisePairBlock(startX, startY, wrapper.data, dataObject, wrapper));
      // tail
      if (isDataObject(tail)) {
        const { x: shiftX, y: shiftY } = getShiftInfo(tail);
        const newStartX = startX + DATA_UNIT_WIDTH * (3 / 4),
          newStartY = startY + DATA_UNIT_HEIGHT / 2;
        const draw = checkDraw(tail);

        if (draw) {
          if (isArrayData(tail)) {
            initialiseArrayBlocks(tail, wrapper, startX + DATA_UNIT_WIDTH + PAIR_SPACING, startY);
          } else {
            initialisePairBlocks(tail, wrapper, startX + DATA_UNIT_WIDTH + PAIR_SPACING, startY);
          }
        }

        if (shiftY === startY) {
          if (draw) {
            arrowObjects.push(
              initialiseArrowObject([
                makeArrowNode(newStartX, newStartY),
                makeArrowNode(shiftX, newStartY)
              ])
            );
          } else {
            // cycle is on the same level
            const x0 = newStartX,
              y0 = newStartY,
              x1 = newStartX,
              y1 = newStartY - DATA_UNIT_HEIGHT / 2 - 10,
              x2 = shiftX + DATA_UNIT_WIDTH * (3 / 4),
              y2 = newStartY - DATA_UNIT_HEIGHT / 2 - 10,
              x3 = shiftX + DATA_UNIT_WIDTH * (3 / 4),
              y3 = shiftY;

            arrowObjects.push(
              initialiseArrowObject([
                makeArrowNode(x0, y0),
                makeArrowNode(x1, y1),
                makeArrowNode(x2, y2),
                makeArrowNode(x3, y3)
              ])
            );
          }
        } else {
          arrowObjects.push(
            initialiseArrowObject([
              makeArrowNode(newStartX, newStartY),
              makeArrowNode(
                shiftX + DATA_UNIT_WIDTH / 4,
                shiftY + (shiftY > startY ? 0 : DATA_UNIT_HEIGHT)
              )
            ])
          );
        }
      } else if (isNull(tail)) {
        drawLine(
          context,
          startX + DATA_UNIT_WIDTH,
          startY,
          startX + DATA_UNIT_WIDTH / 2,
          startY + DATA_UNIT_HEIGHT
        );
      } else if (isFnObject(tail)) {
        const newStartX = startX + DATA_UNIT_WIDTH * (3 / 4),
          newStartY = startY + DATA_UNIT_HEIGHT / 2;

        if (tail.y === newStartY) {
          // same level
          const x0 = newStartX,
            y0 = newStartY,
            x1 = tail.x - FNOBJECT_RADIUS * 2,
            y1 = tail.y;

          arrowObjects.push(initialiseArrowObject([makeArrowNode(x0, y0), makeArrowNode(x1, y1)]));
        } else if (Math.abs(tail.x - newStartX) < DATA_UNIT_WIDTH) {
          // vertically aligned
          const x0 = newStartX,
            y0 = newStartY,
            x1 = tail.x,
            y1 = tail.y;
          arrowObjects.push(initialiseArrowObject([makeArrowNode(x0, y0), makeArrowNode(x1, y1)]));
        } else if (
          tail.y < startY - (DATA_UNIT_HEIGHT + PAIR_SPACING) ||
          tail.y > startY + (DATA_UNIT_HEIGHT + PAIR_SPACING) * 2
        ) {
          // far from data vertically (more than one unit height above or below)
          const x0 = newStartX,
            y0 = newStartY,
            x1 = newStartX,
            y1 = tail.y + 25 * (tail.y < newStartY ? 1 : -1),
            x2 = tail.x,
            y2 = y1,
            x3 = tail.x,
            y3 = tail.y;

          arrowObjects.push(
            initialiseArrowObject([
              makeArrowNode(x0, y0),
              makeArrowNode(x1, y1),
              makeArrowNode(x2, y2),
              makeArrowNode(x3, y3)
            ])
          );
        } else {
          // close to data vertically
          const x0 = newStartX,
            y0 = newStartY,
            x1 = newStartX,
            y1 = tail.y,
            x2 = tail.x + FNOBJECT_RADIUS * 2,
            y2 = tail.y;

          arrowObjects.push(
            initialiseArrowObject([
              makeArrowNode(x0, y0),
              makeArrowNode(x1, y1),
              makeArrowNode(x2, y2)
            ])
          );
        }
      } else {
        textObjects.push(
          initialiseTextObject(
            tail,
            startX + DATA_UNIT_WIDTH * (2 / 3),
            startY + DATA_UNIT_HEIGHT * (2 / 3)
          )
        );
      }

      // head
      if (isDataObject(head)) {
        const { x: shiftX, y: shiftY } = getShiftInfo(head);
        const newStartX = startX + DATA_UNIT_WIDTH / 4,
          newStartY = startY + DATA_UNIT_HEIGHT / 2;

        // check if need to draw the data object or it has already been drawn
        if (checkDraw(head)) {
          if (isArrayData(head)) {
            initialiseArrayBlocks(head, wrapper, startX, shiftY);
          } else {
            initialisePairBlocks(head, wrapper, startX, shiftY);
          }
        }

        if (shiftY === startY) {
          // cycle is on the same level
          const x0 = newStartX,
            y0 = newStartY,
            x1 = newStartX,
            y1 = newStartY - DATA_UNIT_HEIGHT / 2 - 10,
            x2 = shiftX + DATA_UNIT_WIDTH * (1 / 4),
            y2 = y1,
            x3 = x2,
            y3 = shiftY;

          arrowObjects.push(
            initialiseArrowObject([
              makeArrowNode(x0, y0),
              makeArrowNode(x1, y1),
              makeArrowNode(x2, y2),
              makeArrowNode(x3, y3)
            ])
          );
        } else {
          arrowObjects.push(
            initialiseArrowObject([
              makeArrowNode(newStartX, newStartY),
              makeArrowNode(
                shiftX + DATA_UNIT_WIDTH / 4,
                shiftY + (shiftY > startY ? 0 : DATA_UNIT_HEIGHT)
              )
            ])
          );
        }
      } else if (isNull(head)) {
        drawLine(context, startX + DATA_UNIT_WIDTH / 2, startY, startX, startY + DATA_UNIT_HEIGHT);
      } else if (isFnObject(head)) {
        drawArrayFnArrow(head, startX, startY);
      } else {
        textObjects.push(
          initialiseTextObject(
            head,
            startX + DATA_UNIT_WIDTH / 6,
            startY + DATA_UNIT_HEIGHT * (2 / 3)
          )
        );
      }
    }

    context.restore();
  }

  // deprecated
  function getDataObjectFromKey(key) {
    for (const d in boundDataObjects) {
      if (boundDataObjects[d].key === key) {
        return boundDataObjects[d];
      }
    }
  }

  function isNull(x) {
    return x === null;
  }

  function isUndefined(x) {
    return typeof x === 'undefined';
  }

  function isString(x) {
    return typeof x === 'string';
  }

  function isNumber(x) {
    return typeof x === 'number';
  }

  function isEmptyArray(xs) {
    return isDataObject(xs) && xs.length === 0;
  }

  // check if v is a member of the list
  function isMember(v, list) {
    if (isNull(list)) {
      return false;
    } else {
      return v === list[0] || isMember(v, list[1]);
    }
  }

  function isDataObject(value) {
    // or typeof value === "object" && value !== null
    return Array.isArray(value);
  }

  // check if dataObject is an array
  // however does not work with arrays of size 2
  function isArrayData(dataObject) {
    return isDataObject(dataObject) ? dataObject.length !== 2 : false;
  }

  function isPairData(dataObject) {
    return isDataObject(dataObject) && dataObject.length === 2;
  }

  function getPairDataLength(pairData) {
    const traversedPairData = [];
    function helper(subPairData) {
      if (isPairData(subPairData[1]) && !traversedPairData.includes(subPairData)) {
        traversedPairData.push(subPairData);
        return 1 + helper(subPairData[1]);
      } else {
        return 1;
      }
    }
    return helper(pairData);
  }

  // get nth tail in a pairData
  function getNthTail(pairData, n) {
    if (n <= 0) {
      return pairData;
    } else {
      return getNthTail(pairData[1], n - 1);
    }
  }

  function getDataObjectWrapper(dataObject) {
    return boundDataObjectWrappers[boundDataObjects.indexOf(dataObject)];
  }

  function initialiseDataObjectWrapper(objectName, objectData, parent) {
    const dataObjectWrapper = {
      key: dataObjectKey--,
      name: objectName,
      hovered: false,
      selected: false,
      layer: dataObjectLayer,
      color: WHITE,
      parent: parent,
      data: objectData
    };
    return dataObjectWrapper;
  }

  /**
   * Helper functions for drawing different types of elements on the canvas.
   */
  function getShiftInfo(dataObject) {
    const parentMainStructure = getParentMainStructure(dataObject); // get the first parent mainstructure of this dataobject

    function helper(parentStructure) {
      // get relative pos of dataObject wrt the parentStructure
      if (!isDataObject(parentStructure)) {
        if (DEBUG_MODE)
          console.warn('Please only pass in dataObject as argument.', parentStructure);
        return { x: 0, y: 0 };
      } else if (isEmptyArray(parentStructure) || parentStructure === dataObject) {
        return { x: 0, y: 0 };
      } else if (isArrayData(parentStructure)) {
        const result = { x: 0, y: 0 };

        for (let i = 0; i < parentStructure.length; i++) {
          const subStructure = parentStructure[i];
          if (isSubStructure(subStructure, dataObject) && subStructure !== parentMainStructure) {
            const { x, y } = helper(subStructure);
            result.x = x + (DATA_UNIT_WIDTH / 2) * i;
            result.y =
              y +
              (DATA_UNIT_HEIGHT + PAIR_SPACING) *
                Math.max(getDataUnitHeight(parentStructure, i + 1), 1);
          }
        }

        return result;
      } else {
        // pair data
        const head = parentStructure[0],
          tail = parentStructure[1];
        if (isSubStructure(tail, dataObject)) {
          const { x, y } = helper(tail);
          return {
            x: x + (DATA_UNIT_WIDTH + PAIR_SPACING),
            y
          };
        } else {
          // must be in head
          const { x, y } = helper(head);
          return {
            x,
            y:
              y +
              (DATA_UNIT_HEIGHT + PAIR_SPACING) * Math.max(getTailUnitHeight(parentStructure), 1)
          };
        }
      }
    }

    const wrapper = getDataObjectWrapper(parentMainStructure);

    if (wrapper) {
      const wrapper = getDataObjectWrapper(parentMainStructure);
      const { x: relativeX, y: relativeY } = helper(parentMainStructure);
      const { x: wrapperX, y: wrapperY } = wrapper;
      return { x: wrapperX + relativeX, y: wrapperY + relativeY };
    } else {
      if (DEBUG_MODE)
        console.warn(
          'Wrapper does not exist. Please only pass in dataObject as argument.',
          dataObject
        );
      return { x: 0, y: 0 };
    }
  }

  function isSubStructure(d1, d2) {
    let traversedStructures = [];

    function helper(value) {
      if (traversedStructures.includes(value)) {
        return false;
      } else if (value === d2) {
        return true;
      } else if (isDataObject(value)) {
        traversedStructures.push(value);
        return (
          value.includes(d2) || value.reduce((acc, subValue) => acc || helper(subValue), false)
        );
      } else {
        return false;
      }
    }

    return isDataObject(d2) && helper(d1, d2);
  }

  // mainstructures are those boundDataObjects that contain the dataobject
  function getMainStructures(dataObject) {
    return boundDataObjects.filter(boundDataObject => isSubStructure(boundDataObject, dataObject));
  }

  // parent mainstructure is the first mainstructure among all mainstructures
  function getParentMainStructure(subStructure) {
    return getMainStructures(subStructure)[0];
  }

  // deprecated
  // function foundInOtherObjects(mainStructure, subStructure) {
  //     return boundDataObjects
  //         .filter(dataObject => dataObject !== mainStructure)
  //         .reduce((acc, dataObject) => {
  //             return acc || isSubStructure(dataObject, subStructure)
  //         }, false);
  // }

  // function belongToOtherObjects(mainStructure, subStructure) {
  //     return foundInOtherObjects(mainStructure, subStructure) &&
  //         getParentMainStructure(subStructure) !== mainStructure;
  // }

  function isParentMainStructure(mainStructure, datObject) {
    if (DEBUG_MODE) {
      if (!isSubStructure(mainStructure, datObject)) {
        console.warn('Not a mainStructure of datObject', mainStructure, datObject);
      } else if (!boundDataObjects.includes(mainStructure)) {
        console.warn('Not a mainstructure', mainStructure, datObject);
      }
    }
    return getParentMainStructure(datObject) === mainStructure;
  }

  // check if dataObject is drawn as a substructure of other dataObject
  function belongToOtherData(dataObject) {
    return !isParentMainStructure(dataObject, dataObject);
  }

  function checkDraw(dataObject) {
    // use this instead of isParentMainStructure to check if need to draw
    return drawnDataObjects.every(drawnDataObject => !isSubStructure(drawnDataObject, dataObject));
  }

  function getTailUnitHeight(dataObject, currIndex = 0) {
    // get unit height of the tail of the dataobject
    // can be array or pair data
    if (isArrayData(dataObject)) {
      return getDataUnitHeight(dataObject, currIndex + 1);
    } else {
      const tail = dataObject[1];
      return isDataObject(tail) ? getDataUnitHeight(tail) : 0;
    }
  }

  function getDataUnitHeight(
    // only array or pair data
    dataObject,
    // if dataObject is a non-empty array, default pointer at 0
    // does not apply to empty array
    startIndex = 0
  ) {
    const traversedStructures = [],
      mainStructure = getParentMainStructure(dataObject);

    let heightBeforeIndex = 0; // the height of the part before the pointer
    // get data unit height of value given that prevValue is its subparent
    function helper(
      // can be any value
      value,
      // the subparent of value, the dataObject that directly contains the value
      prevValue
    ) {
      if (isDataObject(value)) {
        if (!isParentMainStructure(mainStructure, value)) {
          return 0;
        } else if (isArrayData(value)) {
          if (traversedStructures.includes(value)) {
            return 0;
          } else if (isEmptyArray(value)) {
            return 1;
          } else {
            traversedStructures.push(value);
            return (
              1 +
              value.reduce((acc, subValue, currIndex) => {
                if (value === dataObject && currIndex === startIndex) {
                  heightBeforeIndex = acc;
                }
                // accumulate all heights of its elements
                return acc + helper(subValue, value);
              }, 0)
            );
          }
        } else {
          // pair data
          const head = value[0],
            tail = value[1];
          if (traversedStructures.includes(value)) {
            return 0;
          } else {
            traversedStructures.push(value);
            const tailHeight = helper(tail, value) - 1;
            return 1 + helper(head, value) + (tailHeight > 0 ? tailHeight : 0);
          }
        }
      } else if (isFnObject(value)) {
        if (value.parentType === 'frame' || value.parent.subStructure !== prevValue) {
          return 0;
        } else {
          return 1;
        }
      } else {
        return 0;
      }
    }

    if (isArrayData(dataObject)) {
      if (isEmptyArray(dataObject)) {
        return helper(dataObject, null);
      } else if (startIndex >= dataObject.length) {
        return 0;
      }
      const totalHeight = helper(dataObject, null);
      return totalHeight - heightBeforeIndex;
    } else if (isPairData(dataObject)) {
      return helper(dataObject, null);
    } else {
      if (DEBUG_MODE) console.warn('Please only pass in dataObject as argument.', dataObject);
      return 0;
    }
  }

  function reassignCoordinates(dataObject) {
    // if we do not need to draw this dataObject, reassign the coordinates
    const trueCoordinates = getShiftInfo(dataObject);
    const wrapper = getDataObjectWrapper(dataObject);
    wrapper.x = trueCoordinates.x;
    wrapper.y = trueCoordinates.y;
  }

  // Text Helpers
  // --------------------------------------------------.
  function truncateText(c, text, maxWidth) {
    let width = c.measureText(text).width,
      ellipsis = '…',
      ellipsisWidth = c.measureText(ellipsis).width,
      result,
      truncated = false,
      textString = '' + text;

    if (width <= maxWidth || width <= ellipsisWidth) {
      result = textString;
    } else {
      let len = textString.length;
      while (width >= maxWidth - ellipsisWidth && len-- > 0) {
        textString = textString.substring(0, len);
        width = c.measureText(textString).width;
      }
      result = textString + ellipsis;
      truncated = true;
    }

    return { result, truncated };
  }

  function initialiseTextObject(value, x, y, options = {}) {
    const { color = SA_WHITE, maxWidth = DATA_UNIT_WIDTH / 2, isSymbol = false } = options;

    const textObject = {
      key: textObjectKey--,
      value,
      hovered: false,
      selected: false,
      layer: textObjectLayer,
      color,
      x,
      y,
      maxWidth,
      isSymbol
    };
    return textObject;
  }

  // Arrow Helpers
  // --------------------------------------------------.
  function drawArrowObjectHead(xi, yi, xf, yf, color, hovered = false) {
    const { context } = arrowObjectLayer.scene;
    const gradient = (yf - yi) / (xf - xi);
    const angle = Math.atan(gradient);
    context.save();
    context.beginPath();
    if (xf - xi >= 0) {
      // left to right arrow
      const xR = xf - 10 * Math.cos(angle - Math.PI / 6);
      const yR = yf - 10 * Math.sin(angle - Math.PI / 6);
      context.moveTo(xf, yf);
      context.lineTo(xR, yR);
      context.moveTo(xf, yf);
      const xL = xf - 10 * Math.cos(angle + Math.PI / 6);
      const yL = yf - 10 * Math.sin(angle + Math.PI / 6);
      context.lineTo(xL, yL);
    } else {
      // right to left arrow
      const xR = xf + 10 * Math.cos(angle - Math.PI / 6);
      const yR = yf + 10 * Math.sin(angle - Math.PI / 6);
      context.moveTo(xf, yf);
      context.lineTo(xR, yR);
      context.moveTo(xf, yf);
      const xL = xf + 10 * Math.cos(angle + Math.PI / 6);
      const yL = yf + 10 * Math.sin(angle + Math.PI / 6);
      context.lineTo(xL, yL);
    }
    context.strokeStyle = hovered ? GREEN : color;
    context.stroke();
    context.restore();
  }

  function drawArrayFnArrow(fnObject, x0, y0) {
    const newStartX = x0 + DATA_UNIT_WIDTH / 4,
      newStartY = y0 + DATA_UNIT_HEIGHT / 2;

    if (Math.abs(fnObject.x - newStartX) < DATA_UNIT_WIDTH) {
      // vertically aligned with some offset
      const x0 = newStartX,
        y0 = newStartY,
        x1 = fnObject.x,
        y1 = fnObject.y;
      arrowObjects.push(initialiseArrowObject([makeArrowNode(x0, y0), makeArrowNode(x1, y1)]));
    } else if (
      fnObject.y < y0 - (DATA_UNIT_HEIGHT + PAIR_SPACING) ||
      fnObject.y > y0 + (DATA_UNIT_HEIGHT + PAIR_SPACING) * 2
    ) {
      // far from data vertically
      const x0 = newStartX,
        y0 = newStartY,
        x1 = x0,
        y1 = fnObject.y + 25 * (fnObject.y < newStartY ? 1 : -1),
        x2 = fnObject.x,
        y2 = y1,
        x3 = x2,
        y3 = fnObject.y;

      arrowObjects.push(
        initialiseArrowObject([
          makeArrowNode(x0, y0),
          makeArrowNode(x1, y1),
          makeArrowNode(x2, y2),
          makeArrowNode(x3, y3)
        ])
      );
    } else {
      // close to data vertically
      const x0 = newStartX,
        y0 = newStartY,
        x1 = x0,
        y1 = fnObject.y,
        x2 = fnObject.x + (fnObject.x > newStartX ? 0 : FNOBJECT_RADIUS * 2),
        y2 = y1;

      arrowObjects.push(
        initialiseArrowObject([makeArrowNode(x0, y0), makeArrowNode(x1, y1), makeArrowNode(x2, y2)])
      );
    }
  }

  // TODO: combine registerArrowPaths and registerEndPaths
  // push all arrow segments into the arrow overlap detector
  function registerArrowPaths(nodes) {
    for (let i = 0; i < nodes.length - 1; i++) {
      const currNode = nodes[i],
        nextNode = nodes[i + 1];

      if (currNode.x === nextNode.x) {
        drawnArrowLines.x.push({
          coord: currNode.x,
          range: [currNode.y, nextNode.y]
        });
      } else if (currNode.y === nextNode.y) {
        drawnArrowLines.y.push({
          coord: currNode.y,
          range: [currNode.x, nextNode.x]
        });
      }
    }

    return nodes;
  }

  // push the initial and final arrow segments into the arrow overlap detector
  function registerEndPaths(nodes) {
    for (let i = 0; i < nodes.length - 1; i++) {
      if (i === 0 || i === nodes.length - 2) {
        const currNode = nodes[i],
          nextNode = nodes[i + 1];
        if (currNode.x === nextNode.x) {
          drawnArrowLines.x.push({
            coord: currNode.x,
            range: [currNode.y, nextNode.y]
          });
        } else if (currNode.y === nextNode.y) {
          drawnArrowLines.y.push({
            coord: currNode.y,
            range: [currNode.x, nextNode.x]
          });
        }
      }
    }
  }

  function checkArrowNodes(nodes) {
    // return new nodes with no overlapped intermediate lines
    registerEndPaths(nodes);
    if (nodes.length <= 3) return nodes;
    const newNodes = [];
    newNodes[0] = nodes[0];
    newNodes[nodes.length - 1] = nodes[nodes.length - 1];

    // check if x is in the range
    function checkRange(x, range) {
      if (x < range[0]) {
        return x >= range[1];
      } else if (x === range[0]) {
        return true;
      } else {
        return x <= range[1];
      }
    }

    // check if line with endpoints (s,t0) and (s,t1) (or (t0, s) and (t1, s))
    // is already drawn
    function checkOverlap(arrowOverlapDetector, s, t0, t1) {
      for (let i = 0; i < arrowOverlapDetector.length; i++) {
        if (
          arrowOverlapDetector[i].coord === s &&
          (checkRange(t0, arrowOverlapDetector[i].range) ||
            checkRange(t1, arrowOverlapDetector[i].range))
        ) {
          return true;
        }
      }
      return false;
    }

    for (let i = 1; i < nodes.length - 2; i++) {
      // loop each intermediate line
      const currNode = nodes[i],
        nextNode = nodes[i + 1];
      if (currNode.x === nextNode.x) {
        // vertical
        let newX = currNode.x;
        while (checkOverlap(drawnArrowLines.x, newX, currNode.y, nextNode.y)) {
          newX = newX + ARROW_OFFSET;
        }
        drawnArrowLines.x.push({
          coord: newX,
          range: [currNode.y, nextNode.y]
        });

        newNodes[i] = { ...(newNodes[i] ? newNodes[i] : currNode), x: newX };
        newNodes[i + 1] = { ...nextNode, x: newX };
      } else if (currNode.y === nextNode.y) {
        // horizontal
        let newY = currNode.y;
        while (checkOverlap(drawnArrowLines.y, newY, currNode.x, nextNode.x)) {
          newY = newY + ARROW_OFFSET;
        }
        drawnArrowLines.y.push({
          coord: newY,
          range: [currNode.x, nextNode.x]
        });

        newNodes[i] = { ...(newNodes[i] ? newNodes[i] : currNode), y: newY };
        newNodes[i + 1] = { ...nextNode, y: newY };
      } else {
        // diagonal
        if (isUndefined(newNodes[i])) newNodes[i] = currNode;
        newNodes[i + 1] = nextNode;
      }
    }
    return newNodes;
  }

  function initialiseArrowObject(nodes, options = {}) {
    const { color = SA_WHITE, detectOverlap = true } = options;
    // TODO: consider adding layer prop
    const arrowObject = {
      key: arrowObjectKey--,
      hovered: false,
      selected: false,
      color: color,
      nodes: detectOverlap ? checkArrowNodes(nodes) : registerArrowPaths(nodes)
    };
    return arrowObject;
  }

  function makeArrowNode(x, y) {
    return { x, y };
  }

  /*
  | --------------------------------------------------------------------------
  | Export
  |--------------------------------------------------------------------------
  */
  function download_env() {
    viewport.scene.download({
      fileName: 'environment-model.png'
    });
  }

  exports.EnvVisualizer = {
    draw_env: draw_env,
    init: function (parent) {
      container.hidden = false;
      parent.appendChild(container);
    },
    download_env: download_env
  };

  setTimeout(() => {}, 1000);
})(window);
