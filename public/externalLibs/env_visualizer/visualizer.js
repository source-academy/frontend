;(function(exports) {
  /**
   * Setup Stage
   */
  var stage
  var container = document.createElement('div')
  container.id = 'env-visualizer-container'
  container.hidden = true
  document.body.appendChild(container)
  /*stage = new Kinetic.Stage({
    width: 1000,
    height: 1000,
    container: 'env-visualizer-container'
  })*/
  
  /*************************************************************************************************************/
  /*************************************************************************************************************/
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
        'draw_list',
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
        fnObjects[0].layer.scene.clear();
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
      function drawSceneFrameFnArrows() {
        for (let i = 0; i < frames.length; i++) {
          params = frames[i].params;
          for (let j = 0; j < params.length; j++) {
            if (params[j].type === "function") {
              targetFn = params[j].value;
              /*
              i: index of frame
              targetFn: index of function
              j: relative position of param within frame
              */
              drawSceneFrameFnArrow(i, targetFn, j);
            }
            
          }
        }
        viewport.render();
      }

      function drawSceneFnFrameArrows() {
        fnToFrameArrows.forEach(function(pair) {
          drawSceneFnFrameArrow(pair);
        });
        viewport.render();
      }
        
      function drawSceneFrameArrows() {
        for (let i = 0; i < frames.length; i++) {
          drawSceneFrameArrow(i);
        }
        viewport.render();
      }

      function drawSceneFnObject(pos) {
        var config = fnObjects[pos];
        var scene = config.layer.scene,
            context = scene.context;
        var parent = frames[config.parent];
        
        // find index position of function object within frame
        var offset = parent.fnObjects.indexOf(pos);
        var x = parent.x + parent.frameWidth + 60;
        var y = parent.y + 25 + offset * 30;
        config.x = x;
        config.y = y;
        config.offset = offset;
        context.beginPath();
        context.arc(x - fnRadius, y, fnRadius, 0, Math.PI*2, false);
        
        if (!config.hovered) {
          context.strokeStyle = 'white';
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
          context.fillText(`params: ${config.params}`, x + 50, y);
          context.fillText(`body: ${config.body}`, x + 50, y + 20);
        }
        context.arc(x + fnRadius, y, fnRadius, 0, Math.PI*2, false);
        if (!config.hovered) {
          context.strokeStyle = 'white';
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
        var parent = frames[config.parent];

        // find index position of function object within frame
        var offset = parent.fnObjects.indexOf(pos);
        var x = parent.x + parent.frameWidth + 60;
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
        
        // parse params
        const params = config.params;
        const frameHeight = 20 + 30 * params.length;
        
        // track length of longest param name to determine frame width
        var maxLength = 0;
        // create array to track objects that are pointed to from this frame
        const fnObjects = [];
        const listObjects = [];
        // create arrays to track positions of various objects for easier
        // drawing of arrows later
        const fnIndex = [];
        const listIndex = [];
        for (var i = 0; i < params.length; i++) {
          const param = params[i];
          if (param.type === "value") {
            context.fillText(`${param.name}: ${param.value}`, x + 10, y + 30 + (i * 30));
            fnIndex.push(null);
            fnObjects.push(null);
            if ((param.name.length + param.value.toString().length + 1) > maxLength) maxLength = param.name.length + param.value.toString().length + 1;
          } else if (param.type === "function") {
            context.fillText(`${param.name}:`, x + 10, y + 30 + (i * 30));
            fnIndex.push(param.value);
            fnObjects.push(param.value);
            if (param.name.length > maxLength) maxLength = param.name.length;
          }
        }
        const frameWidth = maxLength * 20;
        config.fnIndex = fnIndex;
        config.listIndex = listIndex;
        config.fnObjects = fnObjects;
        config.frameHeight = frameHeight;
        config.frameWidth = frameWidth;
        
        context.rect(x, y, frameWidth, frameHeight);
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
        //context.restore();
        
        // calculate positions for child frames
        if (config.children == null) return;
        childrenCount = config.children.length;
        children = config.children;
        for (i = 0; i < childrenCount; i++) {
          frames[children[i]].y = y + frameHeight + 50;
          totalWidth = childrenCount * 300;
          startingX = x - (totalWidth / 2) + 150;
          frames[children[i]].x = startingX + 300 * i;
        }
        
      }

      function drawHitFrame(config) {
        var hit = config.layer.hit,
            context = hit.context;

        var x, y;
        if (config.parent != null) {
          x = frames[config.parent].x;
          y = frames[config.parent].y + 200;
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

      /*
      targetFrame: index of starting frame
      targetFn: index of target function
      frameOffset: relative position of starting param in frame
      */
      function drawSceneFrameFnArrow(targetFrame, targetFn, frameOffset) {
        var scene = arrowLayer.scene,
            context = scene.context;
        var startCoord = [frames[targetFrame].x + frames[targetFrame].frameWidth, frames[targetFrame].y + frameOffset * 30];
        var endCoord = [fnObjects[targetFn].x, fnObjects[targetFn].y];
        //scene.clear();
        context.save();
        context.strokeStyle = "white";
        context.beginPath();
        const x0 = startCoord[0],
              y0 = startCoord[1] + 25;
              
        if (fnObjects[targetFn].parent == targetFrame) {
          // fnObject belongs to current frame
          // simply draw straight arrow from frame to function
          const x1 = endCoord[0] - (fnRadius * 2) - 3, // left circle
                y1 = endCoord[1];
          context.moveTo(x0, y0);
          context.lineTo(x1, y1);

          // draw arrow head
          drawArrowHead(context, x0, y0, x1, y1);
          context.stroke();
        } else {
          // fnObject belongs to different frame
          
          // fnOffset: relative position of target fnObject at target frame
          const fnOffset = frames[fnObjects[targetFn].parent].fnObjects.indexOf(targetFn);
          const xf = endCoord[0] + (fnRadius * 2) + 3, //right circle
                yf = endCoord[1];
          const x1 = x0 + frameOffset * 20,
                y1 = y0;
          const x2 = x1,
                y2 = frames[targetFrame].y - 20 + fnOffset * 5;
          const x3 = xf + 10 + fnOffset * 5,
                y3 = y2;
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

      function drawSceneFnFrameArrow(pair) {
        var scene = arrowLayer.scene,
            context = scene.context;
        //const offset = frames[pair[0]].fnIndex.indexOf(pair[1]);
        
        var startCoord = [fnObjects[pair[0]].x + 15, fnObjects[pair[0]].y];
        var endX = frames[pair[1]].x + frames[pair[1]].frameWidth;

        //scene.clear();
        context.save();
        context.strokeStyle = "white";
        context.beginPath();
        const x0 = startCoord[0],
              y0 = startCoord[1],
              x1 = x0,
              y1 = y0 - 15,
              x2 = endX,
              y2 = y1;
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.lineTo(x2, y2);
        // draw arrow head
        drawArrowHead(context, x1, y1, x2, y2);
        context.stroke();
      }

      function drawSceneFrameArrow(pos) {
        var config = frames[pos];
        var scene = arrowLayer.scene,
            context = scene.context;
        context.save();
        context.strokeStyle = "white";
        
        if (config.parent == null) return null;
        const x0 = config.x + (config.frameWidth / 2),
              y0 = config.y,
              x1 = x0,
              y1 = (frames[config.parent].y 
                   + frames[config.parent].frameHeight + y0) / 2,
              /*
              x2 = frames[config.parent].x
                   + ((150 / frames[config.parent].children.length) * 
                      frames[config.parent].children.indexOf(pos)),
              */
              x2 = frames[config.parent].x + (frames[config.parent].frameWidth / 2);
              y2 = y1,
              x3 = x2,
              y3 = frames[config.parent].y 
                   + frames[config.parent].frameHeight + 3; // offset by 3 for aesthetic reasons
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.lineTo(x2, y2);
        context.lineTo(x3, y3);
        // draw arrow head
        const gradient = (y3 - y2) / (x3 - x2);
        const angle = Math.atan(gradient);
        if (x1 - x0 >= 0) { // left to right arrow 
          const xR = x3 - 10 * Math.cos(angle - Math.PI / 6);
          const yR = y3 - 10 * Math.sin(angle - Math.PI / 6);
          context.lineTo(xR, yR);
          context.moveTo(x3, y3);
          const xL = x3 - 10 * Math.cos(angle + Math.PI / 6);
          const yL = y3 - 10 * Math.sin(angle + Math.PI / 6);
          context.lineTo(xL, yL);
        } else { // right to left arrow
          // draw arrow head
          const xR = x3 + 10 * Math.cos(angle - Math.PI / 6);
          const yR = y3 + 10 * Math.sin(angle - Math.PI / 6);
          context.lineTo(xR, yR);
          context.moveTo(x3, y3);
          const xL = x3 + 10 * Math.cos(angle + Math.PI / 6);
          const yL = y3 + 10 * Math.sin(angle + Math.PI / 6);
          context.lineTo(xL, yL);
        }
        context.stroke();
      }

      // var concreteContainer = document.getElementById('concreteContainer');

      // create viewport
      var viewport = new Concrete.Viewport({
        width: 1000,
        height: 1000,
        container: container
      });

      // create layers
      var layer1 = new Concrete.Layer();
      var layer2 = new Concrete.Layer();
      var layer3 = new Concrete.Layer();
      var layer4 = new Concrete.Layer();
      var arrowLayer = new Concrete.Layer();

      // add layers
      viewport.add(layer1).add(layer2).add(layer3).add(layer4).add(arrowLayer);

      /*
      fnObject fields:
        parent: index # in frames array of frame that the function belongs to
        offset: for determining position relative to other fnObjects. Default: 0
        key: unique identifier for use with hit detection
        params: String of parameters that function takes in
        body: String containing function body
      */

      var fnObjects = [
        {
          hovered: false,
          selected: false,
          layer: layer2,
          color: 'white',
          parent: 0, // index of frames array
          offset: 0,
          key: 100,
          params: "a",
          body: "..."
        },
        {
          hovered: false,
          selected: false,
          layer: layer2,
          color: 'white',
          parent: 0, // index of frames array
          offset: 0,
          key: 101,
          params: "b",
          body: "..."
        },
        {
          hovered: false,
          selected: false,
          layer: layer2,
          color: 'white',
          parent: 0, // index of frames array
          offset: 0,
          key: 102,
          params: "c",
          body: "..."
        }
      ];

      /*
      frame fields:
        key: unique identifier for use with hit detection
        params: array of parameters in frame. Fields:
          type: value (primitive/string), function, list
          name: name of argument
          value: primitive/string, or index # in fnObjects/listObjects arrays
        parent: index # in frames array of parent frame, or null for global env
      */

      var frames = [
        // global env
        {
          x: viewport.width/2 - 200,
          y: 100,
          hovered: false,
          selected: false,
          layer: layer4,
          color: 'white',
          key: 0,
          params: [
            {type: "value",
            name: "x",
            value: 1},
            {type: "function",
            name: "fn1",
            value: 0},
            {type: "function",
            name: "fn2",
            value: 1},
            {type: "value",
            name: "z",
            value: 3},
            {type: "function",
            name: "fn3",
            value: 2}
          ],
          parent: null,
          children: [1, 2]
        },
        // first level child
        {
          x: 0,
          y: 0,
          hovered: false,
          selected: false,
          layer: layer4,
          color: 'white',
          key: 1,
          callExpression: {
            arguments: [
              {type: "literal",
              value: 10},
              {type: "literal",
              value: 20}
            ],
            __id: "node_297"
          },
          environment: {
            param1: 10,
            param2: 20
          },
          name: "a",
          parent: {
            callExpression: {
              __id: "node_306"
            }
          },
          params: [
            {type: "value",
            name: "y",
            value: 2},
            {type: "function",
            name: "fn1",
            value: 0},
            {type: "function",
            name: "fn2",
            value: 1},
          ],
          parent: 0,
        },
        
        {
          x: 0,
          y: 0,
          hovered: false,
          selected: false,
          layer: layer4,
          color: 'white',
          key: 1,
          params: [
            {type: "value",
            name: "a",
            value: 5}
          ],
          parent: 0,
          children: [3]
        },
        // second level child
        {
          x: 0,
          y: 0,
          hovered: false,
          selected: false,
          layer: layer4,
          color: 'white',
          key: 3,
          params: [
            {type: "value",
            name: "b",
            value: 6}
          ],
          parent: 2,
        }
        
      ];

      var input = [
        {
          name: "a",
          environment: {
            param1: 10,
            param2: 20,
          }
        },
        {
          name: "global",
          environment: {
            a: {
              functionName: "a",
              body: "..."
            },
            x: 1,
            accumulate: {}
            // other built-ins
          }
        }
      ];
  
      // parse input from interpreter
      function parseInput(input) {
        for (i in input) {
          let frame = input[i];
          frame.hovered = false;
          frame.layer = layer4;
          frame.color = white;
          const environment = frame.environment;
          for (param in environment) {
            if (environment[param] == "functionName") {
              const fnObject = {
                hovered: false,
                selected: false,
                layer: layer2,
                color: 'white',
                parent: 0, // index of frames array
                offset: 0,
                key: 102,
                params: "c",
                body: "..."
              };
            }
          }
        }
        // global frame
        var global = input[input.length - 1];
        global.x = viewport.width/2 - 200;
        global.y = 100;
      }

      var fnToFrameArrows = [
        [0, 0],
        [1, 0],
        [2, 0]
      ];

      drawSceneFrames();
      drawSceneFnObjects();
      drawSceneFrameFnArrows();
      drawSceneFnFrameArrows();
      drawSceneFrameArrows();
      drawHitFrames();
      drawHitFnObjects();

      // add concrete container handlers
      container.addEventListener('mousemove', function(evt) {
        var boundingRect = container.getBoundingClientRect(),
            x = evt.clientX - boundingRect.left,
            y = evt.clientY - boundingRect.top,
            key = viewport.getIntersection(x, y),
            fnObject;
        // unhover all circles
        fnObjects.forEach(function(fnObject) {
          fnObject.hovered = false;
        });
        
        if (key >= 0) {
          fnObject = getFnObjectFromKey(key);
          fnObject.hovered = true;
        }

        drawSceneFnObjects();
      });

      container.addEventListener('click', function(evt) {
        var boundingRect = container.getBoundingClientRect(),
            x = evt.clientX - boundingRect.left,
            y = evt.clientY - boundingRect.top,
            key = viewport.getIntersection(x, y),
            fnObject;
       
        // unselect all fnObjects
        fnObjects.forEach(function(fnObject) {
          fnObject.selected = false;
        });
        
        if (key >= 0) {
          fnObject = getFnObjectFromKey(key);
          fnObject.selected = true;
        }

        drawSceneFnObjects();
        
      });

      function getFnObjectFromKey(key) {
        var len = fnObjects.length,
            n, fnObject;

        for (n=0; n<len; n++) {
          fnObject = fnObjects[n];
          if (fnObject.key === key) {
            return fnObject;
          }
        }

        return null;
      }

      function drawArrowHead(context, xi, yi, xf, yf) {
        const gradient = (yf - yi) / (xf - xi);
          const angle = Math.atan(gradient);
          if (xf - xi > 0) { // left to right arrow 
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

  /*************************************************************************************************************/
  /*************************************************************************************************************/
      
  /**
   *  Converts a list, or a pair, to a tree object. Wrapper function.
   */
  function list_to_tree(lst) {
    // actual function in the wrapper
    function construct_tree(lst) {
      var thisNode = new TreeNode()

      // memoise the current sublist
      perms[counter] = lst
      // assigns an ID to the current node
      thisNode.id = counter
      counter++
      // if the head is also a list, draw it's sublist
      if (is_pair(head(lst))) {
        // check if such list has been built
        if (perms.indexOf(head(lst)) > -1) {
          thisNode.leftid = perms.indexOf(head(lst))
        } else {
          thisNode.left = construct_tree(head(lst))
        }
        // otherwise, it's a data item
      } else {
        thisNode.data = head(lst)
      }
      // similarly for right subtree.
      if (is_pair(tail(lst)) || (is_list(tail(lst)) && is_null(tail(lst)))) {
        if (perms.indexOf(tail(lst)) > -1) {
          thisNode.rightid = perms.indexOf(tail(lst))
        } else if (!is_null(tail(lst))) {
          thisNode.right = construct_tree(tail(lst))
        }
      } else {
        thisNode.data2 = tail(lst)
      }

      return thisNode
    }
    // keeps track of all sublists in order to detect cycles
    var perms = []
    var tree = new Tree()
    var counter = 0
    tree.rootNode = construct_tree(lst)
    return tree
  }

  var tcon = {
    strokeWidth: 2,
    stroke: 'white',
    distanceX: 50,
    distanceY: 60,

    boxWidth: 90,
    boxHeight: 30,
    vertBarPos: 0.5,
    boxSpacingX: 50,
    boxSpacingY: 60,

    arrowSpace: 5,
    arrowSpaceH: 13, // horizontal
    arrowLength: 8,
    arrowAngle: 0.5236, //25 - 0.4363,//20 - 0.3491,// 30 - 0.5236

    triangeSize: 5,

    padding: 5,
    canvasWidth: 1000
  }

  function displaySpecialContent(nodeLabel, value) {
    if (typeof display === 'function') {
      display('*' + nodeLabel + ': ' + value)
    } else {
      console.log('*' + nodeLabel + ': ' + value)
    }
  }
  /**
   *  A tree object built based on a list or pair.
   */
  function Tree() {
    this.rootNode = new TreeNode()
  }
  /**
      A node in a binary tree.
      left : pointer to the left subtree
      right: pointer to the right subtree
      data: left data item stored in the node.
              note that only leaves without left tail should/must have data.
              data for intermediate nodes should be null.
      data2: right data item stored in the node. Similar to data.
              if list dicipline is enforced, all data2 shall be empty
  */
  function TreeNode() {
    this.data = null
    this.data2 = null
    this.left = null
    this.right = null
  }

  /**
   *  Gets the drawer function of a tree
   */
  Tree.prototype.getDrawer = function() {
    return new TreeDrawer(this)
  }

  /**
   *  Drawer function of a tree
   */
  function TreeDrawer(tree) {
    this.tree = tree
  }

  /**
   *  Draws a tree at x,y on a give layer.
   *  It actually calls drawNode and draws the root at x,y
   */
  TreeDrawer.prototype.draw = function(x, y, layer) {
    this.drawNode(this.tree.rootNode, x, y, layer)
  }

  /**
   *  Draws a root node at x, y on a given layer.
   *  It first draws the individual box, then see if it's children have been drawn before (by set_head and set_tail).
   *  If so, it checks the position of the children and draws an arrow pointing to the children.
   *  Otherwise, recursively draws the children, or a slash in case of empty lists.
   */
  TreeDrawer.prototype.drawNode = function(node, x, y, layer) {
    if (node !== null) {
      // draws the content
      realDrawNode(node.data, node.data2, node.id, x, y, x, y, layer)

      // if it has a left new child, draw it
      if (node.left !== null) {
        this.drawLeft(node.left, x, y, layer)
        // (FIXME the next check may be redundant)
        // if it's left child is part of a cycle and it's been drawn, link back to that node instead
      } else if (node.leftid != null) {
        backwardLeftEdge(x, y, nodelist[node.leftid].getX(), nodelist[node.leftid].getY(), layer)
      }

      // similarly for right child
      if (node.right !== null) {
        this.drawRight(node.right, x, y, layer)
        // (FIXME the next check may be redundant)
      } else if (node.rightid != null) {
        backwardRightEdge(x, y, nodelist[node.rightid].getX(), nodelist[node.rightid].getY(), layer)
        // if the tail is an empty box, draw the respective representation
      } else if (node.data2 === null) {
        var nullbox = new NodeEmpty_list(x, y)
        nullbox.put(layer)
      }
    }
  }

  /**
   *  Draws a node at x, y on a given layer, making necessary left shift depending how far the structure of subtree
   *  extends to the right.
   *
   *  It first draws the individual box, then see if it's children have been drawn before (by set_head and set_tail).
   *  If so, it checks the position of the children and draws an arrow pointing to the children.
   *  Otherwise, recursively draws the children, or a slash in case of empty lists.
   */
  TreeDrawer.prototype.drawLeft = function(node, parentX, parentY, layer) {
    var count, x, y
    // checks if it has a right child, how far it extends to the right direction
    if (node.right === null) {
      count = 0
    } else {
      count = 1 + this.shiftScaleCount(node.right)
    }
    // shifts left accordingly
    x = parentX - tcon.distanceX - count * tcon.distanceX
    y =      + tcon.distanceY

    realDrawNode(node.data, node.data2, node.id, x, y, parentX, parentY, layer)

    if (node.left !== null) {
      this.drawLeft(node.left, x, y, layer)
    } else if (node.leftid != null) {
      backwardLeftEdge(x, y, nodelist[node.leftid].getX(), nodelist[node.leftid].getY(), layer)
    }
    if (node.right !== null) {
      this.drawRight(node.right, x, y, layer)
    } else if (node.rightid != null) {
      backwardRightEdge(x, y, nodelist[node.rightid].getX(), nodelist[node.rightid].getY(), layer)
    } else if (node.data2 === null) {
      var nullbox = new NodeEmpty_list(x, y)
      nullbox.put(layer)
    }
  }

  /**
   *  Draws a node at x, y on a given layer, making necessary right shift depending how far the structure of subtree
   *  extends to the left.
   *
   *  It first draws the individual box, then see if it's children have been drawn before (by set_head and set_tail).
   *  If so, it checks the position of the children and draws an arrow pointing to the children.
   *  Otherwise, recursively draws the children, or a slash in case of empty lists.
   */
  TreeDrawer.prototype.drawRight = function(node, parentX, parentY, layer) {
    var count, x, y
    if (node.left === null) {
      count = 0
    } else {
      count = 1 + this.shiftScaleCount(node.left)
    }
    x = parentX + tcon.distanceX + count * tcon.distanceX
    y = parentY + tcon.distanceY

    realDrawNode(node.data, node.data2, node.id, x, y, parentX, parentY, layer)

    if (node.left !== null) {
      this.drawLeft(node.left, x, y, layer)
    } else if (node.leftid != null) {
      backwardLeftEdge(x, y, nodelist[node.leftid].getX(), nodelist[node.leftid].getY(), layer)
    }
    if (node.right !== null) {
      this.drawRight(node.right, x, y, layer)
    } else if (node.rightid != null) {
      backwardRightEdge(x, y, nodelist[node.rightid].getX(), nodelist[node.rightid].getY(), layer)
    } else if (node.data2 === null) {
      var nullbox = new NodeEmpty_list(x, y)
      nullbox.put(layer)
    }
  }
  /**
   * Returns the distance necessary for the shift of each node, calculated recursively.
   */
  TreeDrawer.prototype.shiftScaleCount = function(node) {
    var count = 0
    // if there is something on the left, it needs to be shifted to the right for 1 + how far that right child shifts
    if (node.left !== null) {
      count = count + 1 + this.shiftScaleCount(node.left)
    }
    // if there is something on the right, it needs to be shifted to the left for 1 + how far that left child shifts
    if (node.right !== null) {
      count = count + 1 + this.shiftScaleCount(node.right)
    }
    return count
  }

  // a list of nodes drawn for a tree. Used to check if a node has appeared before.
  var nodelist = []
  // keeps track the extreme left end of the tree. In units of pixels.
  var minLeft = 500

  /**
   *  Internal function that puts two data at x1, y1 on a given layer. Connects it to it's parent which is at x2, y2
   */
  function realDrawNode(data, data2, id, x1, y1, x2, y2, layer) {
    var box = new NodeBox(data, data2)
    var node = new Kinetic.Group()

    box.put(node)

    // no pointer is drawn to root
    if (x2 !== x1) {
      box.connectTo(x2 - x1, y2 - y1)
    }

    node.setX(x1)
    node.setY(y1)
    layer.add(node)

    // add node to the known list
    nodelist[id] = node
    // update left extreme of the tree
    minLeft = Math.min(minLeft, x1)
  }

  /**
   *   Draws a tree object on the canvas at x,y on a given layer
   */
  function drawTree(tree, x, y, layer) {
    var drawer = tree.getDrawer()
    drawer.draw(x, y, layer)

    layer.draw()
  }

  /**
   *  Try to fit any data into the box. If not possible, assign a number and log it in the console.
   */
  function toText(data, full) {
    if (full) {
      return '' + data
    } else {
      var type = typeof data
      if (type === 'function' || type === 'object') {
        return false
      } else {
        var str = '' + data
        if (str.length > 5) {
          return false
        } else {
          return str
        }
      }
    }
  }

  /**
   *  Creates a Kinetic.Group that is used to represent a node in a tree. It takes up to two data items.
   *  The data items are simply converted with toString()
   */
  function NodeBox(value, value2) {
    // this.image is the inner content
    this.image = new Kinetic.Group()

    // outer rectangle
    var rect = new Kinetic.Rect({
      width: tcon.boxWidth,
      height: tcon.boxHeight,
      strokeWidth: tcon.strokeWidth,
      stroke: 'white',
      fill: '#17181A'
    })

    // vertical bar seen in the box
    var line = new Kinetic.Line({
      points: [tcon.boxWidth * tcon.vertBarPos, 0, tcon.boxWidth * tcon.vertBarPos, tcon.boxHeight],
      strokeWidth: tcon.strokeWidth,
      stroke: 'white'
    })

    var txtValue
    var label
    // text for data item #1
    if (value !== null && (!is_list(value) || !is_null(value))) {
      txtValue = toText(value)
      label = false
      if (txtValue === false) {
        label = true
        nodeLabel++
        displaySpecialContent(nodeLabel, value)
      }
      var txt = new Kinetic.Text({
        text: label ? '*' + nodeLabel : txtValue,
        align: 'center',
        width: tcon.vertBarPos * tcon.boxWidth,
        y: Math.floor((tcon.boxHeight - 1.2 * 12) / 2),
        fontStyle: label ? 'italic' : 'normal',
        fill: 'white'
      })
      this.image.add(txt)
    } else if (is_list(value) && is_null(value)) {
      var empty = new NodeEmpty_list(-tcon.boxWidth * tcon.vertBarPos, 0)
      var emptyBox = empty.getRaw()
      this.image.add(emptyBox)
    }

    // text for data item #2
    if (value2 !== null) {
      txtValue = toText(value2)
      label = false
      if (txtValue === false) {
        label = true
        nodeLabel++
        displaySpecialContent(nodeLabel, value2)
      }
      var txt2 = new Kinetic.Text({
        text: label ? '*' + nodeLabel : txtValue,
        align: 'center',
        width: tcon.vertBarPos * tcon.boxWidth,
        x: tcon.vertBarPos * tcon.boxWidth,
        y: Math.floor((tcon.boxHeight - 1.2 * 12) / 2),
        fontStyle: label ? 'italic' : 'normal',
        fill: 'white'
      })
      this.image.add(txt2)
    }

    this.image.add(rect)
    this.image.add(line)

    // text need to be on top of the box background
    if (value !== null && (!is_list(value) || !is_null(value))) {
      txt.moveToTop()
    } else if (emptyBox) {
      emptyBox.moveToTop()
    }
    if (value2 !== null) {
      txt2.moveToTop()
    }
  }

  /**
   *  Connects a NodeBox to it's parent at x,y by using line segments with arrow head
   */
  NodeBox.prototype.connectTo = function(x, y) {
    // starting point
    var start = { x: tcon.boxWidth / 4, y: -tcon.arrowSpace }

    // end point
    if (x > 0) {
      var end = { x: x + tcon.boxWidth / 4, y: y + tcon.boxHeight / 2 }
    } else {
      var end = { x: x + tcon.boxWidth * 3 / 4, y: y + tcon.boxHeight / 2 }
    }

    var pointer = new Kinetic.Line({
      points: [start, end],
      strokeWidth: tcon.strokeWidth,
      stroke: 'white'
    })
    // the angle of the incoming arrow
    var angle = Math.atan((end.y - start.y) / (end.x - start.x))

    // left and right part of an arrow head, rotated to the calculated angle
    if (x > 0) {
      var left = {
        x: start.x + Math.cos(angle + tcon.arrowAngle) * tcon.arrowLength,
        y: start.y + Math.sin(angle + tcon.arrowAngle) * tcon.arrowLength
      }
      var right = {
        x: start.x + Math.cos(angle - tcon.arrowAngle) * tcon.arrowLength,
        y: start.y + Math.sin(angle - tcon.arrowAngle) * tcon.arrowLength
      }
    } else {
      var left = {
        x: start.x - Math.cos(angle + tcon.arrowAngle) * tcon.arrowLength,
        y: start.y - Math.sin(angle + tcon.arrowAngle) * tcon.arrowLength
      }
      var right = {
        x: start.x - Math.cos(angle - tcon.arrowAngle) * tcon.arrowLength,
        y: start.y - Math.sin(angle - tcon.arrowAngle) * tcon.arrowLength
      }
    }

    var arrow = new Kinetic.Line({
      points: [left, start, right],
      strokeWidth: tcon.strokeWidth,
      stroke: 'white'
    })

    this.image.getParent().add(pointer)
    this.image.getParent().add(arrow)
  }

  /**
   *  equivalent to container.add(this.image)
   */
  NodeBox.prototype.put = function(container) {
    container.add(this.image)
  }

  /**
   *  Connects a box to a previously known box, the arrow path is more complicated.
   *  After coming out of the starting box, it moves to the left or the right for a short distance,
   *  Then goes to the correct y-value and turns to reach the top of the end box.
   *  It then directly points to the end box. All turnings are 90 degress.
   */
  function backwardLeftEdge(x1, y1, x2, y2, layer) {
    // coordinates of all the turning points, execpt the first segment in the path
    if (x1 > x2 && y1 > y2) {
      // lower right to upper left
      var path = [
        //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
        x1 + tcon.boxWidth / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x2 - tcon.boxSpacingX / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x2 - tcon.boxSpacingX / 4,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 - tcon.arrowSpaceH,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 - tcon.arrowSpaceH,
        y2 - tcon.arrowSpace
      ]
    } else if (x1 <= x2 && y1 > y2) {
      // lower left to upper right
      var path = [
        //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
        x1 + tcon.boxWidth / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x1 - tcon.boxSpacingX / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x1 - tcon.boxSpacingX / 4,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 - tcon.arrowSpaceH,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 - tcon.arrowSpaceH,
        y2 - tcon.arrowSpace
      ]
    } else if (x1 > x2) {
      // upper right to lower left
      var path = [
        //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
        x1 + tcon.boxWidth / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x1 + tcon.boxWidth / 4,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 + tcon.arrowSpaceH,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 + tcon.arrowSpaceH,
        y2 - tcon.arrowSpace
      ]
    } else {
      // upper left to lower right
      var path = [
        //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
        x1 + tcon.boxWidth / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x1 + tcon.boxWidth / 4,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 - tcon.arrowSpaceH,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 - tcon.arrowSpaceH,
        y2 - tcon.arrowSpace
      ]
    }
    var endX = path[path.length - 2]
    var endY = path[path.length - 1]
    var arrowPath = [
      endX - Math.cos(Math.PI / 2 - tcon.arrowAngle) * tcon.arrowLength,
      endY - Math.sin(Math.PI / 2 - tcon.arrowAngle) * tcon.arrowLength,
      endX,
      endY,
      endX + Math.cos(Math.PI / 2 - tcon.arrowAngle) * tcon.arrowLength,
      endY - Math.sin(Math.PI / 2 - tcon.arrowAngle) * tcon.arrowLength
    ]
    // pointy arrow
    var arrow = new Kinetic.Line({
      points: arrowPath,
      strokeWidth: tcon.strokeWidth,
      stroke: 'white'
    })

    // first segment of the path
    var pointerHead = new Kinetic.Line({
      points: [
        x1 + tcon.boxWidth / 4,
        y1 + tcon.boxHeight / 2,
        x1 + tcon.boxWidth / 4,
        y1 + tcon.boxSpacingY * 3 / 4
      ],
      strokeWidth: tcon.strokeWidth,
      stroke: 'white'
    })

    // following segments of the path
    var pointer = new Kinetic.Line({
      points: path,
      strokeWidth: tcon.strokeWidth,
      stroke: 'white'
    })
    layer.add(pointerHead)
    layer.add(pointer)
    layer.add(arrow)
    // since arrow path is complicated, move to bottom in case it covers some other box
    pointer.moveToBottom()
  }

  /**
   *  Same as backwardLeftEdge
   */
  function backwardRightEdge(x1, y1, x2, y2, layer) {
    if (x1 > x2 && y1 > y2) {
      var path = [
        //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
        x1 + tcon.boxWidth * 3 / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x1 + tcon.boxWidth + tcon.boxSpacingX / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x1 + tcon.boxWidth + tcon.boxSpacingX / 4,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 + tcon.arrowSpaceH,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 + tcon.arrowSpaceH,
        y2 - tcon.arrowSpace
      ]
    } else if (x1 <= x2 && y1 > y2) {
      var path = [
        //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
        x1 + tcon.boxWidth * 3 / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x2 + tcon.boxWidth + tcon.boxSpacingX / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x2 + tcon.boxWidth + tcon.boxSpacingX / 4,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 + tcon.arrowSpaceH,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 + tcon.arrowSpaceH,
        y2 - tcon.arrowSpace
      ]
    } else if (x1 > x2) {
      var path = [
        //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
        x1 + tcon.boxWidth * 3 / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x1 + tcon.boxWidth * 3 / 4,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 + tcon.arrowSpaceH,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 + tcon.arrowSpaceH,
        y2 - tcon.arrowSpace
      ]
    } else {
      var path = [
        //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
        x1 + tcon.boxWidth * 3 / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x1 + tcon.boxWidth * 3 / 4,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 - tcon.arrowSpaceH,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 - tcon.arrowSpaceH,
        y2 - tcon.arrowSpace
      ]
    }
    var endX = path[path.length - 2]
    var endY = path[path.length - 1]
    var arrowPath = [
      endX - Math.cos(Math.PI / 2 - tcon.arrowAngle) * tcon.arrowLength,
      endY - Math.sin(Math.PI / 2 - tcon.arrowAngle) * tcon.arrowLength,
      endX,
      endY,
      endX + Math.cos(Math.PI / 2 - tcon.arrowAngle) * tcon.arrowLength,
      endY - Math.sin(Math.PI / 2 - tcon.arrowAngle) * tcon.arrowLength
    ]
    var arrow = new Kinetic.Line({
      points: arrowPath,
      strokeWidth: tcon.strokeWidth,
      stroke: 'white'
    })
    var pointerHead = new Kinetic.Line({
      points: [
        x1 + tcon.boxWidth * 3 / 4,
        y1 + tcon.boxHeight / 2,
        x1 + tcon.boxWidth * 3 / 4,
        y1 + tcon.boxSpacingY * 3 / 4
      ],
      strokeWidth: tcon.strokeWidth,
      stroke: 'white'
    })
    var pointer = new Kinetic.Line({
      points: path,
      strokeWidth: tcon.strokeWidth,
      stroke: 'white'
    })
    layer.add(pointerHead)
    layer.add(pointer)
    layer.add(arrow)
    pointer.moveToBottom()
  }

  /**
   *  Complements a NodeBox when the tail is an empty box.
   */
  function NodeEmpty_list(x, y) {
    var null_box = new Kinetic.Line({
      x: x,
      y: y,
      points: [
        tcon.boxWidth * tcon.vertBarPos,
        tcon.boxHeight,
        tcon.boxWidth * tcon.vertBarPos,
        0,
        tcon.boxWidth,
        0,
        tcon.boxWidth * tcon.vertBarPos,
        tcon.boxHeight,
        tcon.boxWidth,
        tcon.boxHeight,
        tcon.boxWidth,
        0
      ],
      strokeWidth: tcon.strokeWidth - 1,
      stroke: 'white'
    })
    this.image = null_box
  }

  /**
   *  Adds it to a container
   */
  NodeEmpty_list.prototype.put = function(container) {
    container.add(this.image)
  }

  NodeEmpty_list.prototype.getRaw = function() {
    return this.image
  }

  // A list of layers drawn, used for history
  var layerList = []
  // ID of the current layer shown. Avoid changing this value externally as layer is not updated.
  var currentListVisualizer = -1
  // label numbers when the data cannot be fit into the box
  var nodeLabel = 0
  /**
   *  For student use. Draws a list by converting it into a tree object, attempts to draw on the canvas,
   *  Then shift it to the left end.
   */
  /*function draw(xs) {
    minLeft = 500
    nodelist = []
    nodeLabel = 0
    // hides all other layers
    for (var i = 0; i < layerList.length; i++) {
      layerList[i].hide()
    }
    // creates a new layer and add to the stage
    var layer = new Kinetic.Layer()
    stage.add(layer)
    layerList.push(layer)

    if (!is_pair(xs)) {
      if (is_null(xs)) {
        var display = '[  ]'
      } else {
        var display = toText(xs, true)
      }
      var txt = new Kinetic.Text({
        text: display,
        align: 'center',
        x: 500,
        y: 50,
        fontStyle: 'normal',
        fontSize: 20,
        fill: 'white'
      })
      layer.add(txt)
    } else {
      // attempts to draw the tree
      drawTree(list_to_tree(xs), 500, 50, layer)
    }

    // adjust the position
    layer.setOffset(minLeft - 20, 0)
    layer.draw()

    // update current ID
    currentListVisualizer = layerList.length - 1
    updateListVisualizerButtons()
  }*/
  function draw(context) {
      // WIP
  }
  exports.draw = draw

  /**
   *  Shows the layer with a given ID while hiding the others.
   */
  function showListVisualizer(id) {
    for (var i = 0; i < layerList.length; i++) {
      layerList[i].hide()
    }
    if (layerList[id]) {
      layerList[id].show()
      currentListVisualizer = id
    }
  }

  function updateListVisualizerButtons() {
    if (currentListVisualizer <= 0) {
      $('.sa-env-visualizer #previous').attr('disabled', 'disabled')
    } else {
      $('.sa-env-visualizer #previous').removeAttr('disabled')
    }

    if (currentListVisualizer >= layerList.length - 1) {
      $('.sa-env-visualizer #next').attr('disabled', 'disabled')
    } else {
      $('.sa-env-visualizer #next').removeAttr('disabled')
    }
  }

  function clearListVisualizer() {
    currentListVisualizer = -1
    for (var i = 0; i < layerList.length; i++) {
      layerList[i].hide()
    }
    layerList = []
    updateListVisualizerButtons()
  }

  exports.EnvVisualizer = {
    draw: draw,
    clear: clearListVisualizer,
    init: function(parent) {
      container.hidden = false
      parent.appendChild(container)
      updateListVisualizerButtons()
    },
    next: function() {
      if (currentListVisualizer > 0) {
        currentListVisualizer--
      }
      showListVisualizer(currentListVisualizer)
      updateListVisualizerButtons()
    },
    previous: function() {
      if (currentListVisualizer > 0) {
        currentListVisualizer--
      }
      showListVisualizer(currentListVisualizer)
      updateListVisualizerButtons()
    }
  }

  setTimeout(() => {}, 1000)
})(window)
