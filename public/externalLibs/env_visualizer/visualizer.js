(function (exports) {
  /*
  |--------------------------------------------------------------------------
  | Configurations
  |--------------------------------------------------------------------------
  */
  const container = document.createElement("div");
  container.id = "env-visualizer-container";
  container.hidden = true;
  container.style.width = 0; // fix the problem of container expanding with the canvas
  document.body.appendChild(container);
  // create viewport
  const viewport = new Concrete.Viewport({
    container: container,
  });

  const SA_WHITE = "#999999";
  const SA_BLUE = "#2c3e50";
  const WHITE = "#FFFFFF";
  const GREEN = "#00FF00";
  const REGENT_GRAY_80 = "#8a9ba8cc"; // 80% opacity

  const PRODUCTION_ENV = true;
  const DEBUG_MODE = !PRODUCTION_ENV && true;
  const FONT_SETTING = "14px Roboto Mono, Courier New";
  const FONT_HEIGHT = 14;
  const TEXT_PADDING = 5;
  const MAX_TEXT_WIDTH = 200;
  const FNTEXT_WIDTH = MAX_TEXT_WIDTH + 70;
  const ARROW_SPACING = 5;

  const FNOBJECT_RADIUS = 15; // radius of function object circle
  const FN_MAX_WIDTH = FNOBJECT_RADIUS * 4 + FNTEXT_WIDTH;
  const DRAWING_PADDING = 70; // side padding for entire drawing
  const FRAME_HEIGHT_LINE = 55; // height in px of each line of text in a frame;
  const FRAME_HEIGHT_PADDING = 20; // height in px to pad each frame with
  const FRAME_WIDTH_CHAR = 8; // width in px of each text character in a frame;
  const FRAME_WIDTH_PADDING = 50; // width in px to pad each frame with;
  const FRAME_SPACING = 70; // spacing between horizontally adjacent frameObjects
  const LEVEL_SPACING = 60; // spacing between vertical frame levels
  const OBJECT_FRAME_RIGHT_SPACING = 25; // space to right frame border
  const OBJECT_FRAME_TOP_SPACING = 35; // perpendicular distance to top border
  const PAIR_SPACING = 15; // spacing between pairs
  const INNER_RADIUS = 2; // radius of inner dot within a fn object

  // TEXT SPACING
  const HORIZONTAL_TEXT_MARGIN = 10;
  const VERITCAL_TEXT_MARGIN = 40;

  // DATA STRUCTURE DIMENSIONS
  const DATA_UNIT_WIDTH = 80;
  const DATA_UNIT_HEIGHT = 40;

  const DRAW_ON_STARTUP = [
    drawBackground,
    drawSceneFrameObjects,
    drawHitFrameObjects,
    drawSceneFnObjects,
    drawHitFnObjects,
    drawSceneDataObjects,
    drawScenePairBlocks,
    drawHitPairBlocks,
    drawSceneArrayBlocks,
    drawHitArrayBlocks,
    initialiseArrowObjects,
    drawSceneTextObjects,
    drawHitTextObjects,
    drawSceneArrowObjects,
    drawHitArrowObjects,
  ];

  let alreadyListening = false; // check if event listener has already been attached to the container

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
    textObjectLayer,
  ];

  LAYERS.forEach((layer) => viewport.add(layer));

  /**
   * Unlike function objects, data objects are represented internally not as
   * objects, but as arrays. As such, we cannot assign properties like x- and
   * y-coordinates directly to them. These properties are stored instead in
   * another array of objects called boundDataObjectWrappers, which maps 1-to-1 to
   * the objects they represent in boundDataObjects.
   */
  let boundDataObjectWrappers,
    builtins,
    levels,
    drawnArrowLines;

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

  function resetVariables() {
    fnObjects = [];
    boundDataObjects = [];
    boundDataObjectWrappers = [];
    builtins = [];
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

  let drawingWidth = 0,
    drawingHeight = 0;
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
      (document.getElementById('env-visualizer-default-text')).hidden = true;
      // enable blink icon
      const icon = document.getElementById('env_visualiser-icon');
      icon.classList.add('side-content-tab-alert');
    }

    // reset current drawing
    viewport.layers.forEach(function (layer) {
      layer.scene.clear();
    });

    // reset all variables
    resetVariables();

    // add built-in functions to list of builtins
    const contextEnvs = context.context.context.runtime.environments;
    const allEnvs = [];

    // process backwards so that global env comes first
    for (let i = contextEnvs.length - 1; i >= 0; i--) {
      allEnvs.push(contextEnvs[i]);
    }

    // Add extra props to primitive fnObjects
    const globalEnv = allEnvs[0];
    const globalElems = globalEnv.head;
    const libraryEnv = allEnvs[1];
    const libraryElems = libraryEnv.head;

    builtins = builtins.concat(Object.keys(globalElems));
    builtins = builtins.concat(Object.keys(libraryElems));

    // add library-specific built-in functions to list of builtins
    const externalSymbols = context.context.context.externalSymbols;
    for (const i in externalSymbols) {
      builtins.push(externalSymbols[i]);
    }

    function initialisePrimitiveFnObjects() {
      const primitiveElems = { ...globalElems, ...libraryElems };
      for (const name in primitiveElems) {
        const value = primitiveElems[name];
        if (isFnObject(value)) {
          value.environment = globalEnv;
          value.node = {};
          value.node.type = "FunctionDeclaration";
          value.functionName = "" + name;
        }
      }
    }

    initialisePrimitiveFnObjects();

    // parse environments from interpreter
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
        environment.envKeyCounter = envKeyCounter;
        envKeyCounter++;

        /**
         * There are two environments named programEnvironment. We only want one
         * corresponding "Program" frame.
         */
        if (environment.name === "programEnvironment") {
          let isProgEnvPresent = false;
          // look through existing frame objects, check if program frame already exists
          newFrameObjects.forEach(function (frameObject) {
            if (frameObject.name === "Program") {
              newFrameObject = frameObject;
              isProgEnvPresent = true;
            }
          });
          if (!isProgEnvPresent) {
            newFrameObject = initialiseFrameObject(
              "Program",
              environment.envKeyCounter
            );
            newFrameObjects.push(newFrameObject);
            accFrames.push(newFrameObject);
          }
        } else {
          newFrameObject = initialiseFrameObject(
            environment.name.replace("Environment", ""),
            environment.envKeyCounter
          );
          newFrameObjects.push(newFrameObject);
          accFrames.push(newFrameObject);
        }

        // extract elements from the head of the environment into the frame
        newFrameObject.elements = {};
        if (newFrameObject.name === "global") {
          newFrameObject.elements["(predeclared names)"] = "";
          // don't copy over built-in functions
        } else if (
          environment.name === "programEnvironment" &&
          environment.tail.name === "global"
        ) {
          // do nothing (this environment contains library functions)
        } else {
          // copy everything (possibly including redeclared built-ins) over
          const envElems = environment.head;
          for (const name in envElems) {
            const value = envElems[name];
            newFrameObject.elements[name] = value;
            if (
              isFnObject(value) &&
              builtins.indexOf("" + getFnName(value)) > 0 &&
              getFnName(value)
            ) {
              // this is a built-in function referenced to in a later frame,
              // e.g. "const a = pair". In this case, add it to the global frame
              // to be drawn and subsequently referenced.
              getFrameByName(
                accFrames,
                "global"
              ).elements[
                getFnName(value)
              ] = value;
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
        if (frameObject.name === "global") {
          frameObject.parent = null;
          frameObject.level = 0;
        } else {
          if (frameObject.name === "Program") {
            frameObject.parent = getFrameByName(
              accFrames,
              "global"
            );
          } else {
            let env = getEnvByKeyCounter(
              environments,
              frameObject.key
            );
            if (env.tail.name === "programEnvironment") {
              env = env.tail;
            }
            // need to extract non empty parent frame from the frame
            frameObject.parent = extractParentFrame(
              getFrameByKey(accFrames, env.tail.envKeyCounter)
            );
          }
          // TO-DO: description not clear
          // For loops do not have frameObject.parent, only while loops and functions do
          if (frameObject.parent) {
            frameObject.parent.children.push(frameObject.key);
            frameObject.level =
              frameObject.parent.level +
              (isEmptyFrame(frameObject) ? 0 : 1);
            // dont increment the level if the frame object is empty
            // this will fix an issue with empty level
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
          if (
            isFnObject(value) &&
            !fnObjects.includes(value)
          ) {
            fnObjects.push(
              initialiseFrameFnObject(value, frameObject)
            );
          } else if (
            isDataObject(value) &&
            !boundDataObjects.includes(value)
          ) {
            boundDataObjects.push(value);
            boundDataObjectWrappers.push(
              initialiseDataObjectWrapper(
                name,
                value,
                frameObject
              )
            );
            findFnInDataObject(value);
          }
        }
      });

      function findFnInDataObject(dataObject) {
        const traversedStructures = [];

        function helper(
          mainStructure,
          subStructure,
          value,
          index
        ) {
          if (traversedStructures.includes(value)) {
            // do nothing
          } else if (isFnObject(value)) {
            if (!fnObjects.includes(value)) {
              if (builtins.includes(getFnName(value))) {
                const globalFrame = getFrameByName(
                  accFrames,
                  "global"
                );
                globalFrame.elements[
                  getFnName(value)
                ] = value;

                fnObjects.push(
                  initialiseFrameFnObject(
                    value,
                    globalFrame
                  )
                );
              } else {
                fnObjects.push(
                  initialiseDataFnObject(
                    value,
                    { mainStructure, subStructure, index }
                  )
                );
              }
            }
          } else if (isDataObject(value)) {
            traversedStructures.push(value);
            value.forEach((subValue, index) => {
              helper(mainStructure, value, subValue, index)
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
      // extract the outermost environment from all the function objects
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
            // When the environment is a loop, it doesn't have a call expression
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
            params.forEach(function (p) {
              paramArray.push(p.name);
            });
            const paramString =
              "(" + paramArray.join(", ") + ") => ...";
            otherEnv.vizName = paramString;
          } catch (e) {
            if (!PRODUCTION_ENV) console.error(e.message);
            // for some reason or other the function definition expression is
            // not always available. In that case, just use the frame name
          }
          otherEnv = otherEnv.tail;
        }
      });

      function extractEnvs(environment) {
        // TO-DO: refactor this, include in general helper functions
        // a helper func to extract all the missing tail envs from the environment
        if (
          isNull(environment) ||
          environment.name === "programEnvironment" ||
          environment.name === "global"
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

        topLevelMissingEnvs.forEach((missingEnv) => {
          const extractedEnvs = extractEnvs(missingEnv);
          extractedEnvs.push.apply(allMissingEnvs, extractedEnvs);
          allEnvs.push.apply(allEnvs, extractedEnvs);
        });

        newFrameObjects = parseInput(accFrames, allMissingEnvs);
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

    // parseinput will extract frames from allenvs and add it to the array
    frameObjects = parseInput([], allEnvs);
    /**
     * Find the source frame for each fnObject. The source frame is the frame
     * which generated the function. This may be different from the parent
     * frame, which is the first frame where the object is referenced.
     */
    fnObjects.forEach(function (fnObject) {
      if (fnObject.environment.envKeyCounter === 1) {
        // library functions, points to global frame
        fnObject.source = getFrameByName(frameObjects, "global");
      } else if (fnObject.environment.envKeyCounter === 2) {
        // program environment functions
        fnObject.source = getFrameByName(frameObjects, "Program");
      } else {
        fnObject.source = getFrameByKey(
          frameObjects,
          fnObject.environment.envKeyCounter
        );
      }
    });

    positionItems();

    drawingWidth = Math.max(
      getDrawingWidth() + DRAWING_PADDING * 2,
      300
    );

    drawingHeight = getDrawingHeight();

    viewport.layers.forEach(function (layer) {
      //set size layer by layer
      layer.setSize(drawingWidth, drawingHeight);
    });

    viewport.setSize(drawingWidth, drawingHeight);

    // invoke all drawing functions
    DRAW_ON_STARTUP.forEach((drawSceneObjects) => {
      try {
        drawSceneObjects();
      } catch (e) {
        if (!PRODUCTION_ENV) {
          console.error(drawSceneObjects, e.message);
        }
      }
    });

    if (!alreadyListening) {
      alreadyListening = true;
      container.addEventListener("mousemove", function (evt) {
        let boundingRect = container.getBoundingClientRect(),
          x = evt.clientX - boundingRect.left,
          y = evt.clientY - boundingRect.top,
          key = viewport.getIntersection(x, y);

        if (key >= 0) {
          container.style.cursor = "pointer";
        } else {
          container.style.cursor = "default";
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

      container.addEventListener("click", function (evt) {
        let boundingRect = container.getBoundingClientRect(),
          x = evt.clientX - boundingRect.left,
          y = evt.clientY - boundingRect.top,
          key = viewport.getIntersection(x, y);

        // Text Click
        // --------------------------------------------------.
        // unhover all textObjects
        // redraw the scene when clicked
        textObjects.forEach(function (textObject) {
          textObject.selected = false;
        });

        if (key >= 0 && key < Math.pow(2, 18)) {
          const textObject = getObjFromKey(textObjects, key);
          if (textObject) textObject.selected = true;
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
            if (!PRODUCTION_ENV) console.log(fnObject);
            fnObject.selected = true
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
            if (!PRODUCTION_ENV) console.log(pairBlock);
            pairBlock.selected = true
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
            if (!PRODUCTION_ENV) console.log(arrayBlock);
            arrayBlock.selected = true
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
            if (!PRODUCTION_ENV) console.log(frameObject);
            frameObject.selected = true
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
      { x, y, name, elements, width, height, hovered } = frameObject;
    context.save();
    context.font = FONT_SETTING;
    context.fillStyle = WHITE;
    context.beginPath();

    // render frame name; rename as needed for aesthetic reasons
    let frameName;
    switch (name) {
      case "forLoop":
        frameName = "Body of for-loop";
        break;
      case "forBlock":
        frameName = "Control variable of for-loop";
        break;
      case "block":
        frameName = "Block";
        break;
      case "global":
        frameName = "Global";
        break;
      case "functionBody":
        frameName = "Function Body";
        break;
      default:
        frameName = name;
    }

    if (frameName.length * 9 < width / 2 || frameName === "global") {
      context.fillText(frameName, x, y - 10);
    } else {
      context.fillText(frameName, x, y - 10);
    }

    // render text in frame
    let i = 0;
    let textX = x + HORIZONTAL_TEXT_MARGIN;
    let textY = y + VERITCAL_TEXT_MARGIN;

    for (const name in elements) {
      const value = elements[name];
      if (isNull(value)) {
        // null primitive in Source
        context.fillText(
          `${"" + name}: null`,
          textX,
          textY + i * FRAME_HEIGHT_LINE
        );
      } else {
        switch (typeof value) {
          case "number":
          case "boolean":
          case "undefined":
            context.fillText(
              `${"" + name}: ${"" + value}`,
              textX,
              textY + i * FRAME_HEIGHT_LINE
            );
            break;
          case "string":
            if (name === "(predeclared names)") {
              context.fillText(
                `${"" + name}`,
                textX,
                textY + i * FRAME_HEIGHT_LINE
              );
            } else {
              context.fillText(
                `${"" + name}: "${"" + value}"`,
                textX,
                textY + i * FRAME_HEIGHT_LINE
              );
            }
            break;
          default:
            context.fillText(
              `${"" + name}:`,
              textX,
              textY + i * FRAME_HEIGHT_LINE
            );

        }
      }
      if (isDataObject(value)) {
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
    if (frameObject.elements.length === 0) {
      return;
    }

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
    context.arc(
      x - FNOBJECT_RADIUS,
      y,
      INNER_RADIUS,
      0,
      Math.PI * 2,
      false
    );
    context.fill();

    context.beginPath();
    context.arc(
      x - FNOBJECT_RADIUS,
      y,
      FNOBJECT_RADIUS,
      0,
      Math.PI * 2,
      false
    );
    context.stroke();

    context.beginPath();
    context.arc(
      x + FNOBJECT_RADIUS,
      y,
      INNER_RADIUS,
      0,
      Math.PI * 2,
      false
    );
    context.fill();

    context.beginPath();
    context.arc(
      x + FNOBJECT_RADIUS,
      y,
      FNOBJECT_RADIUS,
      0,
      Math.PI * 2,
      false
    );
    context.stroke();

    if (fnObject.selected) {
      // TO-DO: refactor this
      // if (true) { //debug
      context.save();
      let fnString = fnObject.fnString;
      let params;
      let body;
      // filter out the params and body
      if (fnObject.node.type === "FunctionDeclaration" || fnString.substring(0, 8) === "function") {
        params = fnString.substring(
          fnString.indexOf("("),
          fnString.indexOf("{")
        ).trim();
        body = fnString.substring(fnString.indexOf("{"));
      } else {
        params = fnString.substring(0, fnString.indexOf("=") - 1);
        body = fnString.substring(fnString.indexOf("=") + 3);
      }

      // fill text into multi line
      context.font = FONT_SETTING;
      context.fillStyle = GREEN;

      const marginLeft = 50,
        lineHeight = 20;

      // TO-DO: refactor this part, quite messy, consider entire text box as a whole, don't split them
      body = body.split("\n");
      context.fillText(
        `params: ${truncateText(context, params, MAX_TEXT_WIDTH).result
        }`,
        x + marginLeft,
        y
      );
      context.fillText("body:", x + marginLeft, y + lineHeight);
      let i = 0;
      let j = 0; // indicates the row
      while (j < 5 && i < body.length) {
        if (body[i] && body[i].replace(/ /g, "") !== "debugger;") {
          // dont fill text if it is a debugger line
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
        context.fillText("...", x + 120, y + 120);
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
    context.arc(
      x - FNOBJECT_RADIUS,
      y,
      FNOBJECT_RADIUS,
      0,
      Math.PI * 2,
      false
    );
    context.fillStyle = hit.getColorFromIndex(fnObject.key);
    context.fill();
    context.beginPath();
    context.arc(
      x + FNOBJECT_RADIUS,
      y,
      FNOBJECT_RADIUS,
      0,
      Math.PI * 2,
      false
    );
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

  function drawSceneDataObjects() {
    // drawDataObjects array is declared as a global array below but must
    // be reset whenever this fn is called
    drawnDataObjects = [];
    dataObjectLayer.scene.clear();
    boundDataObjects.forEach(function (dataObject) {
      if (!isNull(dataObject)) {
        if (checkDraw(dataObject)) {
          drawSceneDataObject(dataObject);
          drawnDataObjects.push(dataObject);
        } else {
          reassignCoordinates(dataObject);
        }
      }
    });
    viewport.render();
  }

  function drawSceneDataObject(dataObject) {
    const wrapper = getDataWrapper(dataObject),
      { x, y } = wrapper,
      scene = dataObjectLayer.scene,
      context = scene.context;
    context.save();
    initialisedArrayBlocks = [];
    initialisedPairBlocks = [];
    if (isArrayData(dataObject)) {
      initialiseArrayBlocks(
        dataObject,
        wrapper,
        x,
        y
      );
    } else {
      initialisePairBlocks(
        dataObject,
        wrapper,
        x,
        y
      );
    }
    context.restore();
  }

  // Arrow Scene
  // --------------------------------------------------.
  function initialiseArrowObjects() {
    drawSceneFrameArrows();
    drawSceneFrameValueArrows();
    drawSceneFnFrameArrows();
  }

  function drawSceneFrameValueArrows() {
    frameObjects.forEach(function (frameObject) {
      const { elements } = frameObject;
      for (const name in elements) {
        const value = elements[name];
        if (isDataObject(value)) {
          drawSceneFrameDataArrow(frameObject, name, value);
        } else if (isFnObject(value)) {
          drawSceneFrameFnArrow(frameObject, name, value);
        }
      }
    });
    viewport.render();
  }

  function drawSceneFnFrameArrows() {
    fnObjects.forEach(function (fnObject) {
      drawSceneFnFrameArrow(fnObject);
    });
    viewport.render();
  }

  function drawSceneFrameArrows() {
    frameObjects.forEach(function (frameObject) {
      if (!isEmptyFrame(frameObject)) {
        drawSceneFrameArrow(frameObject);
      }
    });
    viewport.render();
  }

  /**
   * Trivial - the arrow just points straight to a fixed position relative to
   * the frame.
   */
  function drawSceneFrameDataArrow(frameObject, name, dataObject) {
    const wrapper = getDataWrapper(dataObject);
    arrowObjects.push(
      initialiseArrowObject([
        initialiseArrowNode(
          frameObject.x +
          name.length * FRAME_WIDTH_CHAR + 25,
          frameObject.y +
          findElementNamePosition(name, frameObject) * FRAME_HEIGHT_LINE +
          35
        ),
        initialiseArrowNode(
          wrapper.x,
          wrapper.y +
          DATA_UNIT_HEIGHT / 2
        ),
      ])
    );
  }

  /**
   * For each function variable, either the function is defined in the scope
   * the same frame, in which case drawing the arrow is simple, or it is in
   * a different frame. If so, more care is needed to route the arrow back up
   * to its destination.
   */
  function drawSceneFrameFnArrow(frameObject, name, fnObject) {
    // frame to fnobject
    const fnRight = fnObject.x + FNOBJECT_RADIUS * 2,
      fnLeft = fnObject.x - FNOBJECT_RADIUS * 2,
      fnHeight = fnObject.y;

    if (fnObject.parent === frameObject) {
      // fnObject belongs to current frame
      // simply draw straight arrow from frame to function
      arrowObjects.push(
        initialiseArrowObject([
          initialiseArrowNode(
            frameObject.x + name.length * FRAME_WIDTH_CHAR + 25,
            frameObject.y +
            findElementNamePosition(name, frameObject) *
            FRAME_HEIGHT_LINE +
            35
          ),
          initialiseArrowNode(
            fnLeft,
            fnHeight
          ),
        ])
      );
    } else {
      /**
       * From this position, the arrow needs to move upward to reach the
       * target fnObject. Make sure it does not intersect any other object
       * when doing so, or adjust its position if it does.
       * This currently only works for the frame level directly above the origin
       * frame, which suffices in most cases.
       * TO-DO: Improve implementation to handle any number of frame levels. (see issue sample 2, should form 2 stair steps)
       */
      const frameOffset = findFrameIndexInLevel(frameObject); // TO-DO: remove this
      const x0 = frameObject.x
        + name.length * 8 // around 8px per char
        + 20,
        y0 = frameObject.y +
          findElementNamePosition(name, frameObject) *
          FRAME_HEIGHT_LINE +
          35,
        x1 = frameObject.x
          + frameObject.width
          + 10 + frameOffset * 20,
        y1 = y0,
        x2 = x1,
        y2 = frameObject.y
          - 20
          + frameOffset * 5,
        x3 = fnRight + FNOBJECT_RADIUS,
        y3 = y2,
        x4 = x3,
        y4 = fnHeight,
        xf = fnRight,
        yf = y4;

      arrowObjects.push(
        initialiseArrowObject([
          initialiseArrowNode(x0, y0),
          initialiseArrowNode(x1, y1),
          initialiseArrowNode(x2, y2),
          initialiseArrowNode(x3, y3),
          initialiseArrowNode(x4, y4),
          initialiseArrowNode(xf, yf),
        ])
      );
    }
  }

  function drawSceneFnFrameArrow(fnObject) {

    const frameObject = extractParentFrame(fnObject.source); // extract non empty parent frame
    let x0 = fnObject.x + FNOBJECT_RADIUS,
      y0 = fnObject.y,
      x1,
      y1,
      x2,
      y2;

    if (
      fnObject.x > frameObject.x &&
      fnObject.x + FNOBJECT_RADIUS < frameObject.x + frameObject.width
    ) {
      // point up or down to a fat frame
      x1 = x0;
      y1 = y0;
      x2 = x1;
      y2 = frameObject.y +
        (fnObject.y > frameObject.y ? frameObject.height : 0);
    } else {
      // point to a thin frame
      x1 = x0;
      y1 = y0 - (
        fnObject.y < frameObject.y + frameObject.height &&
          fnObject.y > frameObject.y
          ? 25
          : y0 - frameObject.y - frameObject.height / 2
      );
      x2 = frameObject.x +
        (frameObject.x > fnObject.x ? 0 : frameObject.width); // point to the left side of fnObject if it is on the right
      y2 = y1;
    }

    arrowObjects.push(
      initialiseArrowObject([
        initialiseArrowNode(x0, y0),
        initialiseArrowNode(x1, y1),
        initialiseArrowNode(x2, y2),
      ])
    );
  }

  /**
   * Arrows between child and parent frameObjects.
   * Uses an offset factor to prevent lines overlapping, similar to with
   * frame-function arrowObjects.
   */
  function drawSceneFrameArrow(frameObject) {
    // TO-DO: point straight to the parent of the parent if parent is empty
    if (isNull(frameObject.parent)) return; // TO-DO: when is parent null? global?

    const parent = extractParentFrame(frameObject.parent);
    const frameOffset = levels[parent.level].frameObjects.indexOf(
      frameObject.parent
    ); // the index of parent frame on its level
    const x0 = frameObject.x + 40,
      y0 = frameObject.y,
      x1 = x0,
      y1 = (parent.y + parent.height + y0) / 2 + frameOffset * 4,
      x2 = parent.x + 40,
      y2 = y1,
      x3 = x2,
      y3 = parent.y + parent.height;

    arrowObjects.push(
      initialiseArrowObject(
        [
          initialiseArrowNode(x0, y0),
          initialiseArrowNode(x1, y1),
          initialiseArrowNode(x2, y2),
          initialiseArrowNode(x3, y3),
        ],
        {
          color: WHITE,
          detectOverlap: false,
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
        (nodes[i].x !== nodes[i + 1].x && nodes[i].y !== nodes[i + 1].y
          ? [5, 5] // dashed line if it is diagonal for aesthetic reasons
          : []
        )
      );
      context.stroke();
      context.restore();
    }
    // draw arrow head
    drawArrowObjectHead(
      nodes.slice(-2)[0].x,
      nodes.slice(-2)[0].y,
      nodes.slice(-1)[0].x,
      nodes.slice(-1)[0].y,
      color,
      hovered
    );
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
    // draw arrow head
    drawArrowObjectHead(
      nodes.slice(-2)[0].x,
      nodes.slice(-2)[0].y,
      nodes.slice(-1)[0].x,
      nodes.slice(-1)[0].y,
      color
    );
    context.strokeStyle = color;
    context.lineWidth = 15;
    context.stroke();
    context.restore();
  }

  // Text Scene
  // --------------------------------------------------.
  function drawSceneTextObjects() {
    const scene = textObjectLayer.scene;
    scene.clear();
    textObjects.forEach(function (textObject) {
      drawSceneTextObject(textObject);
    });
    viewport.render();
  }

  function drawHitTextObjects() {
    textObjects.forEach(function (textObject) {
      drawHitTextObject(textObject);
    });
  }

  function drawSceneTextObject(textObject) {
    const { value, x, y, color, hovered } = textObject;
    const scene = textObjectLayer.scene,
      context = scene.context,
      text = (isString(value)
        ? `"${value}"`
        : value
      );
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
      context.fillText(
        text,
        x,
        y - TEXT_PADDING / 2
      );
    } else {
      context.fillStyle = color;
      const { result, truncated } = truncateText(
        context,
        text,
        DATA_UNIT_WIDTH / 2
      );
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
    context.fillRect(
      x - TEXT_PADDING,
      y - FONT_HEIGHT,
      textWidth,
      FONT_HEIGHT + TEXT_PADDING
    );
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
    LAYERS.forEach((layer) => layer.moveToTop());
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
    // const drawingWidth = getDrawingWidth(levels) + 2 * DRAWING_PADDING;
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
    // for (const d in boundDataObjects) {
    boundDataObjects.forEach(dataObject => {
      const wrapper = getDataWrapper(dataObject);
      const { parent } = wrapper;
      wrapper.x = parent.x + parent.width + OBJECT_FRAME_RIGHT_SPACING;
      wrapper.y =
        parent.y +
        findElementPosition(dataObject, parent) * FRAME_HEIGHT_LINE +
        OBJECT_FRAME_TOP_SPACING -
        DATA_UNIT_HEIGHT / 2;
    });

    fnObjects.forEach(function (fnObject) {
      // Checks the parent of the function, calculate the coordinates accordingly
      const { parent, parenttype, subparenttype } = fnObject;

      if (parenttype === "data") {
        const { mainStructure: mainParent, subStructure: subParent, index } = parent;

        const { x, y } = (
          mainParent === subParent
            ? getDataWrapper(subParent)
            : getShiftInfo(subParent)
        );

        // If function resides in tail, shift it rightward
        if (
          subparenttype === "pair" &&
          subParent[1] === fnObject
        ) {
          fnObject.x = x + DATA_UNIT_WIDTH + FNOBJECT_RADIUS * 2 + PAIR_SPACING;
          fnObject.y = y + DATA_UNIT_HEIGHT / 2
        } else {
          fnObject.x = x + DATA_UNIT_WIDTH * (1 / 4) + index * (DATA_UNIT_WIDTH / 2);
          fnObject.y = y + PAIR_SPACING + (DATA_UNIT_HEIGHT + FNOBJECT_RADIUS) *
            Math.max(
              getTailUnitHeight(
                subParent,
                (subparenttype === "array" ? index : 0)
              ),
              1
            );
        }
      } else {
        fnObject.x =
          parent.x + parent.width + OBJECT_FRAME_RIGHT_SPACING + FNOBJECT_RADIUS * 2;
        fnObject.y =
          parent.y +
          findElementPosition(fnObject, parent) * FRAME_HEIGHT_LINE +
          OBJECT_FRAME_TOP_SPACING;
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
        if (
          traversedStructures.includes(value) ||
          !isFirstMainStructure(dataObject, value)
        ) {
          return 0;
        } else if (isEmptyArray(value)) {
          return DATA_UNIT_WIDTH / 4;
        } else if (isArrayData(value)) {
          traversedStructures.push(value);
          let maxWidth = 0;


          for (let i = value.length - 1; i >= 0; i--) {
            const elementWidth = Math.max(
              helper(value[i]), DATA_UNIT_WIDTH / 2
            );
            const totalWidth = elementWidth + i * (DATA_UNIT_WIDTH / 2);
            if (totalWidth > maxWidth) {
              maxWidth = totalWidth;
            }
          }

          return maxWidth;

        } else { // pair data
          traversedStructures.push(value);
          const pairDataLength = getPairDataLength(value);
          let maxWidth = (
            isFnObject(getNthTail(value, pairDataLength - 1)[1])
              ? FN_MAX_WIDTH +
              PAIR_SPACING +
              pairDataLength * (DATA_UNIT_WIDTH + PAIR_SPACING)
              : 0
          );
          for (let i = pairDataLength - 1; i >= 0; i--) {
            const elementWidth = Math.max(
              helper(getNthTail(value, i)[0]), DATA_UNIT_WIDTH
            );
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
    const wrapper = getDataWrapper(dataObject);
    if (isUndefined(wrapper.width)) wrapper.width = width;
    return width;
  }

  // Calculates list/array height
  // Used in frame height calculations
  function getDataObjectHeight(dataObject) {
    const height = getDataUnitHeight(dataObject) * (DATA_UNIT_HEIGHT + PAIR_SPACING);
    const wrapper = getDataWrapper(dataObject);
    if (isUndefined(wrapper.height)) wrapper.height = height;
    return height;
  }

  function getFrameHeight(frameObject) {
    // Assumes line spacing is separate from data object spacing
    let elemLines = 0;
    let dataSpace = 0;

    for (const name in frameObject.elements) {
      const value = frameObject.elements[name];
      if (isFnObject(value)) {
        elemLines += 1;
      } else if (isDataObject(value)) {
        if (getDataWrapper(value).parent === frameObject) {
          dataSpace += getDataObjectHeight(value);
        } else {
          dataSpace += FRAME_HEIGHT_LINE;
        }
      } else {
        elemLines += 1;
      }
    }
    return (
      dataSpace + elemLines * FRAME_HEIGHT_LINE + FRAME_HEIGHT_PADDING
    );
  }

  // Calculates width of frame only
  function getFrameWidth(frameObject) {
    let maxLength = 0;
    const { elements } = frameObject;
    for (const name in elements) {
      const value = elements[name];
      if (true) {
        let currLength;
        const literals = ["number", "string", "boolean"];
        if (literals.includes(typeof value)) {
          currLength =
            name.length +
            value.toString().length +
            (isString(value) ? 2 : 0);
        } else if (isUndefined(value)) {
          currLength = name.length + 9;
        } else {
          currLength = name.length;
        }
        maxLength = Math.max(maxLength, currLength);
      }
    }
    return maxLength * FRAME_WIDTH_CHAR + FRAME_WIDTH_PADDING;
  }

  // Calculates width of objects + frame
  function getFrameAndObjectWidth(frameObject) {
    if (frameObject.elements.length === 0) {
      return frameObject.width;
    } else {
      let maxWidth = 0;
      for (const name in frameObject.elements) {
        const value = frameObject.elements[name];
        // Can be either primitive, function or array
        if (isDataObject(value)) {
          const wrapper = getDataWrapper(value);
          if (wrapper.parent === frameObject) {
            maxWidth = Math.max(
              maxWidth,
              getDataObjectWidth(value)
            );
          }
        } else if (isFnObject(value)) {
          if (value.parent === frameObject) {
            const { frameObjects } = value.parent.levelObject;
            maxWidth = Math.max(
              maxWidth,
              (frameObjects.indexOf(frameObject) === frameObjects.length - 1
                ? FN_MAX_WIDTH
                : FNOBJECT_RADIUS * 4
              )
            );
          }
        }
      }
      return frameObject.width + maxWidth + OBJECT_FRAME_RIGHT_SPACING;
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
        if (isUndefined(childFrameObjects)) {
          return frameObject.fullwidth;
        } else {
          childFrameObjects.forEach(childFrameObject => {
            childLength += getTotalWidth(childFrameObject);
          })
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

  function extractParentFrame(frameObject) {
    // extract a frame object that is non empty from an outer frame object
    if (isEmptyFrame(frameObject)) {
      return extractParentFrame(frameObject.parent);
    } else {
      return frameObject;
    }
  }

  function findFrameIndexInLevel(frameObject) {
    const { level } = frameObject;
    return levels[level].frameObjects.indexOf(frameObject);
  }

  function isEmptyFrame(frameObject) {
    const { elements } = frameObject;
    return (
      Object.keys(elements).length === 0 &&
      elements.constructor === Object
    );
  }

  function findElementPosition(element, frameObject) {
    let position = 0;
    for (const name in frameObject.elements) {
      const value = frameObject.elements[name];
      if (value === element) {
        break;
      } else if (isDataObject(value)) {
        position += getDataUnitHeight(value);
      } else {
        position += 1;
      }
    }
    return position;
  }

  function findElementNamePosition(elementName, frameObject) {
    let position = 0;
    for (const name in frameObject.elements) {
      const value = frameObject.elements[name];
      if (name === elementName) {
        break;
      } else if (isDataObject(value)) {
        position += getDataUnitHeight(value);
      } else {
        position += 1;
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
      children: [],
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
    // TO-DO: change this, this will need to ensure that frame name is unique
    // return the first matched name
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
    if (
      fn.node === undefined ||
      (fn.node.type === "FunctionDeclaration" && !fn.functionName)
    ) {
      return undefined;
    } else if (fn.node.type === "FunctionDeclaration") {
      return fn.functionName;
    } else {
      return fn.toString().split("(")[0].split(" ")[1];
    }
  }

  function isFnObject(value) {
    // or typeof value === "function"
    return (
      value &&
      {}.toString.call(value) === "[object Function]"
    );
  }

  function initialiseFnObject(fnObject, parent) {
    // TO-DO: a fnobject can have multiple parents, refactor this using es6 syntax
    // add more props to the fnobject
    fnObject.key = fnObjectKey--;
    try {
      fnObject.fnString = fnObject.fun.toString();
    } catch (e) {
      fnObject.fnString = fnObject.toString();
    }
    fnObject.hovered = false;
    fnObject.selected = false;
    fnObject.layer = fnObjectLayer;
    fnObject.color = WHITE;
    fnObject.parent = parent;
  }

  function initialiseDataFnObject(fnObject, parent) {
    // TO-DO: parent is an array, make parent an object here, dont make it an array
    // [the entire parent data structure, the pair that contains the fnobject]
    initialiseFnObject(fnObject, parent);
    fnObject.parenttype = "data";
    fnObject.subparenttype = (isArrayData(parent.subStructure) ? "array" : "pair");
    return fnObject;
  }

  function initialiseFrameFnObject(fnObject, parent) {
    initialiseFnObject(fnObject, parent);
    fnObject.parenttype = "frame";
    return fnObject;
  }

  // Array Helpers
  // --------------------------------------------------.
  function initialiseArrayBlock(x, y, mainStructure, wrapper, index) {
    const arrayBlock = {
      key: arrayBlockKey,
      hovered: false,
      selected: false,
      x,
      y,
      mainStructure,
      wrapper,
      index
    };
    arrayBlockKey--;
    return arrayBlock;
  }

  function initialiseArrayBlocks( // TO-DO: fix the logic behind empty array
    dataObject,
    wrapper,
    startX,
    startY,
    startIndex = 0 // default pointer at 0 (if dataObject is nonempty array)
  ) {
    if (isEmptyArray(dataObject)) {
      // need to do a check for empty array since initialiseArrayBlocks can take empty array as input
      // startIndex is irrelevant for empty array 
      arrayBlocks.push(
        initialiseArrayBlock(startX, startY, dataObject, wrapper, null)
      );
    } else if (
      startIndex < dataObject.length &&
      (
        isUndefined(initialisedArrayBlocks[startIndex]) ||
        !initialisedArrayBlocks[startIndex].includes(dataObject)
      )
    ) {

      if (isUndefined(initialisedArrayBlocks[startIndex])) { // TO-DO: refactor this
        initialisedArrayBlocks[startIndex] = [];
      }
      initialisedArrayBlocks[startIndex].push(dataObject);

      const element = dataObject[startIndex];
      const context = dataObjectLayer.scene.context;
      const newStartX = startX + DATA_UNIT_WIDTH / 4,
        newStartY = startY + DATA_UNIT_HEIGHT / 2;
      const mainStructure = wrapper.data;

      arrayBlocks.push(
        initialiseArrayBlock(startX, startY, mainStructure, wrapper, startIndex)
      );
      initialiseArrayBlocks(
        dataObject,
        wrapper,
        startX + DATA_UNIT_WIDTH / 2,
        startY,
        startIndex + 1
      )

      if (isArrayData(element)) {
        const { x: shiftX, y: shiftY } = getShiftInfo(element);

        if (checkDraw(element)) {
          initialiseArrayBlocks(
            element,
            wrapper,
            startX,
            shiftY
          )
        }

        if (startX === shiftX) { // point up or down 
          arrowObjects.push(
            initialiseArrowObject([
              initialiseArrowNode(
                newStartX,
                newStartY
              ),
              initialiseArrowNode(
                newStartX,
                shiftY + (shiftY > startY ? 0 : DATA_UNIT_HEIGHT)
              ),
            ])
          );
        } else if (startY === shiftY) { // same level
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
              initialiseArrowNode(x0, y0),
              initialiseArrowNode(x1, y1),
              initialiseArrowNode(x2, y2),
              initialiseArrowNode(x3, y3),
            ])
          );
        } else { // point up or down
          arrowObjects.push(
            initialiseArrowObject([
              initialiseArrowNode(
                newStartX,
                newStartY
              ),
              initialiseArrowNode(
                shiftX + DATA_UNIT_WIDTH / 4,
                shiftY + (shiftY > startY ? 0 : DATA_UNIT_HEIGHT)
              ),
            ])
          );
        }


      } else if (isPairData(element)) { // TO-DO: add more pointing methods, 
        // so far it is just pointing directly to the pair data
        const { x: shiftX, y: shiftY } = getShiftInfo(element);

        if (checkDraw(element)) {
          initialisePairBlocks(
            element,
            wrapper,
            shiftX,
            shiftY
          );
        }

        arrowObjects.push(
          initialiseArrowObject([
            initialiseArrowNode(
              newStartX,
              newStartY,
            ),
            initialiseArrowNode(
              shiftX + DATA_UNIT_WIDTH / 4,
              shiftY + (shiftY > startY ? 0 : DATA_UNIT_HEIGHT)
            )
          ])
        );
      } else if (isNull(element)) {
        drawLine(
          context,
          startX + DATA_UNIT_WIDTH / 2,
          startY,
          startX,
          startY + DATA_UNIT_HEIGHT
        );
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
    context.strokeRect(x, y, DATA_UNIT_WIDTH / (isNull(index) ? 4 : 2), DATA_UNIT_HEIGHT);
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
    // TO-DO: consider adding layer prop
    const pairBlock = {
      key: pairBlockKey,
      hovered: false,
      selected: false,
      x,
      y,
      mainStructure,
      subStructure,
      wrapper
    };
    pairBlockKey--;
    return pairBlock;
  }

  function initialisePairBlocks(
    dataObject,
    wrapper,
    startX,
    startY
  ) {
    const context = dataObjectLayer.scene.context;
    const head = dataObject[0],
      tail = dataObject[1];

    context.save();
    context.font = FONT_SETTING;

    if (!initialisedPairBlocks.includes(dataObject)) {
      initialisedPairBlocks.push(dataObject);

      pairBlocks.push(
        initialisePairBlock(startX, startY, wrapper.data, dataObject, wrapper)
      );
      // tail
      if (isDataObject(tail)) {
        const { x: shiftX, y: shiftY } = getShiftInfo(tail);
        const newStartX = startX + DATA_UNIT_WIDTH * (3 / 4),
          newStartY = startY + DATA_UNIT_HEIGHT / 2;
        const draw = checkDraw(tail);

        if (draw) {
          if (isArrayData(tail)) {
            initialiseArrayBlocks(
              tail,
              wrapper,
              startX + DATA_UNIT_WIDTH + PAIR_SPACING,
              startY
            );
          } else {
            initialisePairBlocks(
              tail,
              wrapper,
              startX + DATA_UNIT_WIDTH + PAIR_SPACING,
              startY
            );
          }
        }

        if (shiftY === startY) {
          if (draw) {
            arrowObjects.push(
              initialiseArrowObject([
                initialiseArrowNode(newStartX, newStartY),
                initialiseArrowNode(shiftX, newStartY),
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
                initialiseArrowNode(x0, y0),
                initialiseArrowNode(x1, y1),
                initialiseArrowNode(x2, y2),
                initialiseArrowNode(x3, y3),
              ])
            );
          }
        } else {
          arrowObjects.push(
            initialiseArrowObject([
              initialiseArrowNode(
                newStartX,
                newStartY
              ),
              initialiseArrowNode(
                shiftX + DATA_UNIT_WIDTH / 4,
                shiftY + (shiftY > startY ? 0 : DATA_UNIT_HEIGHT)
              ),
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

        if (Math.abs(tail.x - newStartX) < DATA_UNIT_WIDTH) { // vertically aligned
          const x0 = newStartX,
            y0 = newStartY,
            x1 = head.x,
            y1 = head.y;
          arrowObjects.push(
            initialiseArrowObject([
              initialiseArrowNode(x0, y0),
              initialiseArrowNode(x1, y1),
            ])
          );
        } else if (tail.y === newStartY) { // same level
          const x0 = newStartX,
            y0 = newStartY,
            x1 = tail.x - FNOBJECT_RADIUS * 2,
            y1 = tail.y;

          arrowObjects.push(
            initialiseArrowObject([
              initialiseArrowNode(x0, y0),
              initialiseArrowNode(x1, y1),
            ])
          );
        } else if (
          tail.y < startY - (DATA_UNIT_HEIGHT + PAIR_SPACING) ||
          tail.y > startY + (DATA_UNIT_HEIGHT + PAIR_SPACING) * 2
        ) {
          // far from data vertically (more than one unit height above or below)
          const x0 = newStartX,
            y0 = newStartY,
            x1 = newStartX,
            y1 = tail.y + FNOBJECT_RADIUS * 2 * (tail.y < newStartY ? 1 : -1),
            x2 = tail.x,
            y2 = y1,
            x3 = tail.x,
            y3 = tail.y;

          arrowObjects.push(
            initialiseArrowObject([
              initialiseArrowNode(x0, y0),
              initialiseArrowNode(x1, y1),
              initialiseArrowNode(x2, y2),
              initialiseArrowNode(x3, y3)
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
              initialiseArrowNode(x0, y0),
              initialiseArrowNode(x1, y1),
              initialiseArrowNode(x2, y2),
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
            initialiseArrayBlocks(
              head,
              wrapper,
              startX,
              shiftY
            );
          } else {
            initialisePairBlocks(
              head,
              wrapper,
              startX,
              shiftY
            );
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
              initialiseArrowNode(x0, y0),
              initialiseArrowNode(x1, y1),
              initialiseArrowNode(x2, y2),
              initialiseArrowNode(x3, y3),
            ])
          );
        } else {
          arrowObjects.push(
            initialiseArrowObject([
              initialiseArrowNode(
                newStartX,
                newStartY
              ),
              initialiseArrowNode(
                shiftX + DATA_UNIT_WIDTH / 4,
                shiftY + (shiftY > startY ? 0 : DATA_UNIT_HEIGHT)
              ),
            ])
          );
        }

      } else if (isNull(head)) {
        drawLine(
          context,
          startX + DATA_UNIT_WIDTH / 2,
          startY,
          startX,
          startY + DATA_UNIT_HEIGHT
        );
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
    return typeof x === "undefined";
  }

  function isString(x) {
    return typeof x === "string";
  }

  function isNumber(x) {
    return typeof x === "number";
  }

  function isEmptyArray(xs) {
    return isDataObject(xs) && xs.length === 0;
  }

  function isMember(v, list) {
    // check if v is a member of the list
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

  // Current check to check if data structure is an array
  // However does not work with arrays of size 2
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

  function getNthTail(pairData, n) {
    // get nth tail in a pairData
    if (n <= 0) {
      return pairData;
    } else {
      return getNthTail(pairData[1], n - 1);
    }
  }

  function getDataWrapper(dataObject) {
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
      data: objectData,
    };
    return dataObjectWrapper;
  }

  /**
   * Helper functions for drawing different types of elements on the canvas.
   */
  function getShiftInfo(dataObject) {

    const mainStructure = getFirstMainStructure(dataObject);

    function helper(value) { // get relative pos of dataObject wrt the value 
      // can be any value
      if (
        !isDataObject(value) ||
        isEmptyArray(value) ||
        value === dataObject
      ) {
        return { x: 0, y: 0 };
      } else if (isArrayData(value)) {
        const result = { x: 0, y: 0 };

        for (let i = 0; i < value.length; i++) {
          const subStructure = value[i];
          if (isSubStructure(subStructure, dataObject) && subStructure !== mainStructure) {
            const { x, y } = helper(subStructure);
            result.x = x + (DATA_UNIT_WIDTH / 2) * i;
            result.y = y +
              (DATA_UNIT_HEIGHT + PAIR_SPACING) *
              Math.max(getDataUnitHeight(value, i + 1), 1);
          }
        }

        return result
      } else { // pair data
        const head = value[0],
          tail = value[1];
        if (isSubStructure(tail, dataObject)) {
          const { x, y } = helper(tail);
          return {
            x: x + (DATA_UNIT_WIDTH + PAIR_SPACING),
            y
          }
        } else { // must be in head 
          const { x, y } = helper(head);
          return {
            x,
            y: y +
              (DATA_UNIT_HEIGHT + PAIR_SPACING) *
              Math.max(getDataUnitHeight(tail), 1)
          };
        }

      }
    }

    const wrapper = getDataWrapper(mainStructure);

    if (wrapper) {
      const { x: relativeX, y: relativeY } = helper(mainStructure);
      const { x: wrapperX, y: wrapperY } = wrapper;
      return { x: wrapperX + relativeX, y: wrapperY + relativeY };
    } else {
      if (DEBUG_MODE) console.warn('wrapper does not exist', dataObject);
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
        return value.includes(d2) ||
          value.reduce(
            (acc, subValue) => acc || helper(subValue),
            false
          );
      } else {
        return false;
      }
    }

    return isDataObject(d2) && helper(d1, d2);
  }

  function getMainStructures(subStructure) {
    return boundDataObjects.filter(
      dataObject => isSubStructure(dataObject, subStructure)
    )
  }

  function getFirstMainStructure(subStructure) {
    return getMainStructures(subStructure)[0];
  }

  // function foundInOtherObjects(mainStructure, subStructure) { // deprecated
  //     return boundDataObjects
  //         .filter(dataObject => dataObject !== mainStructure)
  //         .reduce((acc, dataObject) => {
  //             return acc || isSubStructure(dataObject, subStructure)
  //         }, false);
  // }

  // function belongToOtherObjects(mainStructure, subStructure) {
  //     return foundInOtherObjects(mainStructure, subStructure) &&
  //         getFirstMainStructure(subStructure) !== mainStructure;
  // }

  function isFirstMainStructure(mainStructure, subStructure) {
    return getFirstMainStructure(subStructure) === mainStructure;
  }

  function checkDraw(dataObject) {
    // technically can use isFirstMainStructure
    // use this instead of isFirstMainStructure to check if need to draw
    return drawnDataObjects.every(
      drawnDataObject => !isSubStructure(drawnDataObject, dataObject)
    );
  }

  function getTailUnitHeight(dataObject, currIndex = 0) {
    if (isArrayData(dataObject)) {
      return getDataUnitHeight(dataObject, currIndex + 1);
    } else {
      const tail = dataObject[1];
      return (isDataObject(tail) ? getDataUnitHeight(tail) : 0);
    }
  }

  function getDataUnitHeight(
    dataObject, // only array or pair data
    startIndex = 0 // if dataObject is a non empty array, default pointer at 0
    // does not apply to empty array
  ) {
    const traversedStructures = [],
      mainStructure = getFirstMainStructure(dataObject);

    let heightBeforeIndex = 0; // if dataObject is a non empty array, 
    // the height of the part before the pointer
    function helper( // get data unit height of value given that prevValue is its subparent
      value, // can be any value
      prevValue // the subparent of value, the dataObject that directly contains the value 
    ) {
      if (isDataObject(value)) {
        if (!isFirstMainStructure(mainStructure, value)) {
          return 0;
        } else if (isArrayData(value)) {
          if (traversedStructures.includes(value)) {
            return 0;
          } else if (isEmptyArray(value)) {
            return 1;
          } else {
            traversedStructures.push(value);
            return 1 + value.reduce((acc, subValue, currIndex) => {
              if (value === dataObject && currIndex === startIndex) {
                heightBeforeIndex = acc;
              }
              return acc + helper(subValue, value); // accumulate all height of its elements
            }, 0);
          }
        } else { // pair data
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
        if (
          value.parenttype === "frame" ||
          value.parent.subStructure !== prevValue
        ) {
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
      if (DEBUG_MODE) console.warn('not a data object:', dataObject);
      return 0;
    }
  }

  function reassignCoordinates(dataObject) {
    // if we do not need to draw dataObject, reassign x and y coordinates to
    // be the corresponding coordinates of d1
    const trueCoordinates = getShiftInfo(dataObject);
    const wrapper = getDataWrapper(dataObject);
    wrapper.x = trueCoordinates.x;
    wrapper.y = trueCoordinates.y;
  }

  // Text Helpers
  // --------------------------------------------------.
  function truncateText(c, text, maxWidth) {
    let width = c.measureText(text).width,
      ellipsis = "…",
      ellipsisWidth = c.measureText(ellipsis).width,
      result,
      truncated = false,
      textString = "" + text;

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

  function initialiseTextObject(value, x, y, color = SA_WHITE) {
    const textObject = {
      key: textObjectKey,
      value,
      hovered: false,
      selected: false,
      layer: textObjectLayer,
      color,
      x,
      y,
    };
    textObjectKey--;
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

    if (Math.abs(fnObject.x - newStartX) < DATA_UNIT_WIDTH) { // vertically aligned or close to that
      const x0 = newStartX,
        y0 = newStartY,
        x1 = fnObject.x,
        y1 = fnObject.y;
      arrowObjects.push(
        initialiseArrowObject([
          initialiseArrowNode(x0, y0),
          initialiseArrowNode(x1, y1),
        ])
      );
    } else if (
      fnObject.y < y0 - (DATA_UNIT_HEIGHT + PAIR_SPACING) ||
      fnObject.y > y0 + (DATA_UNIT_HEIGHT + PAIR_SPACING) * 2
    ) {
      // far from data vertically
      const x0 = newStartX,
        y0 = newStartY,
        x1 = x0,
        y1 = fnObject.y + FNOBJECT_RADIUS * 2 * (fnObject.y < newStartY ? 1 : -1),
        x2 = fnObject.x,
        y2 = y1,
        x3 = x2,
        y3 = fnObject.y;

      arrowObjects.push(
        initialiseArrowObject([
          initialiseArrowNode(x0, y0),
          initialiseArrowNode(x1, y1),
          initialiseArrowNode(x2, y2),
          initialiseArrowNode(x3, y3),
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
        initialiseArrowObject([
          initialiseArrowNode(x0, y0),
          initialiseArrowNode(x1, y1),
          initialiseArrowNode(x2, y2),
        ])
      );
    }
  }

  function registerEndLines(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (i === 0 || i === nodes.length - 2) {
        const currNode = nodes[i],
          nextNode = nodes[i + 1];
        if (currNode.x === nextNode.x) {
          drawnArrowLines.x.push(
            {
              coord: currNode.x,
              range: [currNode.y, nextNode.y]
            }
          );
        } else if (currNode.y === nextNode.y) {
          drawnArrowLines.y.push(
            {
              coord: currNode.y,
              range: [currNode.x, nextNode.x]
            }
          );
        }
      }
    }
  }

  function checkArrowNodes(nodes) {
    // return new nodes with no overlapped intermediate lines
    registerEndLines(nodes);
    if (nodes.length <= 3) return nodes;
    const newNodes = [];
    newNodes[0] = nodes[0];
    newNodes[nodes.length - 1] = nodes[nodes.length - 1];

    function checkRange(x, range) {
      // check if x is in the range
      if (x < range[0]) {
        return x >= range[1];
      } else if (x === range[0]) {
        return true;
      } else {
        return x <= range[1];
      }
    }

    function checkOverlap(arrowOverlapDetector, s, t0, t1) {
      // check if line with endpoints (s,t0) and (s,t1) (or (t0, s) and (t1, s)) is already within the arrowOverlapDetector
      for (let i = 0; i < arrowOverlapDetector.length; i++) {
        if (arrowOverlapDetector[i].coord === s && (checkRange(t0, arrowOverlapDetector[i].range) || checkRange(t1, arrowOverlapDetector[i].range))) {
          return true;
        }
      }
      return false;
    }

    for (let i = 1; i < nodes.length - 2; i++) {
      // loop each intermediate line
      const currNode = nodes[i],
        nextNode = nodes[i + 1];
      if (currNode.x === nextNode.x) { // vertical
        if (checkOverlap(drawnArrowLines.x, currNode.x, currNode.y, nextNode.y)) { // overlapping detected
          let newX = currNode.x + ARROW_SPACING;
          while (checkOverlap(drawnArrowLines.x, newX, currNode.y, nextNode.y)) {
            newX = newX + ARROW_SPACING;
          }
          drawnArrowLines.x.push(
            {
              coord: newX,
              range: [currNode.y, nextNode.y]
            }
          );

          newNodes[i] = { ...(newNodes[i] ? newNodes[i] : currNode), x: newX };
          newNodes[i + 1] = { ...nextNode, x: newX };
        } else {
          drawnArrowLines.x.push(
            {
              coord: currNode.x,
              range: [currNode.y, nextNode.y]
            }
          );
          if (isUndefined(newNodes[i])) newNodes[i] = currNode;
          newNodes[i + 1] = nextNode;
        }
      } else if (currNode.y === nextNode.y) { // horizontal
        if (checkOverlap(drawnArrowLines.y, currNode.y, currNode.x, nextNode.x)) { // overlapping detected
          let newY = currNode.y + ARROW_SPACING;
          while (checkOverlap(drawnArrowLines.y, newY, currNode.x, nextNode.x)) {
            newY = newY + ARROW_SPACING;
          }
          drawnArrowLines.y.push(
            {
              coord: newY,
              range: [currNode.x, nextNode.x]
            }
          );

          newNodes[i] = { ...(newNodes[i] ? newNodes[i] : currNode), y: newY };
          newNodes[i + 1] = { ...nextNode, y: newY };
        } else {
          drawnArrowLines.y.push(
            {
              coord: currNode.y,
              range: [currNode.x, nextNode.x]
            }
          );
          if (isUndefined(newNodes[i])) newNodes[i] = currNode;
          newNodes[i + 1] = nextNode;
        }
      } else { // diagonal
        if (isUndefined(newNodes[i])) newNodes[i] = currNode;
        newNodes[i + 1] = nextNode;
      }
    }
    return newNodes;
  }

  function initialiseArrowObject(nodes, options = {}) {
    const { color, detectOverlap } = options;
    // TO-DO: consider adding layer prop
    const arrowObject = {
      key: arrowObjectKey,
      hovered: false,
      selected: false,
      color: color ? color : SA_WHITE,
      nodes: detectOverlap === false ? nodes : checkArrowNodes(nodes),
    };
    arrowObjectKey--;
    return arrowObject;
  }

  function initialiseArrowNode(x, y) {
    return { x, y };
  }

  /*
  | --------------------------------------------------------------------------
  | Export
  |--------------------------------------------------------------------------
  */
  function download_env() {
    viewport.scene.download({
      fileName: "environment-model.png",
    });
  }

  exports.EnvVisualizer = {
    draw_env: draw_env,
    init: function (parent) {
      container.hidden = false;
      parent.appendChild(container);
    },
    download_env: download_env,
  };

  setTimeout(() => { }, 1000);
})(window);