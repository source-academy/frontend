function Curve() {
  this.curve = undefined 
  this.color = undefined // color is a function of t that states the color of Curve at t
  this.toReplString = () => '<CURVE>'
}

Curve.prototype.getCurve = function() {
  return this.curve
}

Curve.prototype.setCurve = function(curve) {
  this.curve = curve
}

Curve.prototype.getColor = function() {
  return this.color
}

Curve.prototype.setColor = function(color) {
  this.color = color
}


function makeColorfulCurve(curveColor, curveFunction) {
  var wrapper = new Curve();
  wrapper.setColor(curveColor);
  wrapper.setCurve(curveFunction);
  return wrapper;
}

var color_curve = makeColorfulCurve;

function generateCurve(scaleMode, drawMode, numPoints, func, isFullView) {
  curveColor = func instanceof Curve ? func.getColor() : t => [0, 0, 0, 1]
  func = func instanceof Curve ? func.getCurve() : func
  const viewport_size = 600
  const frame = open_pixmap('frame', viewport_size, viewport_size, true);
  var curvePosArray = []
  var curveColorArray = []
  var transMat = mat4.create()
  var curveObject = {}
  // initialize the min/max to extreme values
  var min_x = Infinity
  var max_x = -Infinity
  var min_y = Infinity
  var max_y = -Infinity

  function evaluator(num, func) {
    // func should take input of [0, 1] and output pair(x, y)
    // where x,y is in [0, 1]
    // evaluator has a side effect of recording the max/min
    // x and y value for adjusting the position
    curveObject = {}
    curvePosArray = []
    curveColorArray = []
    for (var i = 0; i <= num; i += 1) {
      var value = func(i / num)
      if (
        typeof value !== 'object' ||
        value.length !== 2 ||
        typeof value[0] !== 'number' ||
        typeof value[1] !== 'number'
      ) {
        throw 'Expected a point, encountered ' + value
      }
      var x = value[0] * 2 - 1
      var y = value[1] * 2 - 1
      curvePosArray.push(x, y)
      var colorArray = curveColor(i / num)
      var color_r = colorArray[0]
      var color_g = colorArray[1]
      var color_b = colorArray[2]
      var color_a = colorArray[3]
      curveColorArray.push(color_r, color_g, color_b, color_a)
      min_x = Math.min(min_x, x)
      max_x = Math.max(max_x, x)
      min_y = Math.min(min_y, y)
      max_y = Math.max(max_y, y)
    }
  }

  evaluator(numPoints, func)

  if (isFullView) {
    var vert_padding = 0.05 * (max_y - min_y)
    min_y -= vert_padding
    max_y += vert_padding
    var horiz_padding = 0.05 * (max_x - min_x)
    min_x -= horiz_padding
    max_x += horiz_padding
  }

  if (scaleMode == 'fit') {
    var center = [(min_x + max_x) / 2, (min_y + max_y) / 2]
    var scale = Math.max(max_x - min_x, max_y - min_y)
    scale = scale === 0 ? 1 : scale;
    mat4.scale(transMat, transMat, vec3.fromValues(2 / scale, 2 / scale, 0))
                                     // use 2 because the value is in [-1, 1]
    mat4.translate(transMat, transMat, vec3.fromValues(-center[0], -center[1], 0))
  } else if (scaleMode == 'stretch') {
    var center = [(min_x + max_x) / 2, (min_y + max_y) / 2]
    var x_scale = max_x === min_x ? 1 : (max_x - min_x)
    var y_scale = max_y === min_y ? 1 : (max_y - min_y)
    mat4.scale(transMat, transMat, vec3.fromValues(2 / x_scale, 2 / y_scale, 0))
                                    // use 2 because the value is in [-1, 1]
    mat4.translate(transMat, transMat, vec3.fromValues(-center[0], -center[1], 0))
  } else {
    // do nothing for normal situations
  }
  clear_viewport()
  gl.uniformMatrix4fv(u_transformMatrix, false, transMat)
  curveObject.curvePos = curvePosArray
  curveObject.color = curveColorArray
  drawCurve(drawMode, curveObject)
  copy_viewport(gl.canvas, frame);
  return new ShapeDrawn(frame);
}

/**
 * returns a function that turns a given Curve into a Drawing, 
 * by sampling the Curve at <CODE>num</CODE> sample points 
 * and connecting each pair with a line. 
 * When a program evaluates to a Drawing, the Source system
 * displays it graphically, in a window, instead of textually.
 * The parts between (0,0) and (1,1) of the resulting Drawing 
 * are shown in the window.
 * @param {Number} num - determines the number of points to be 
 * sampled. Including 0 and 1,
 * there are <CODE>num + 1</CODE> evenly spaced sample points.
 * @return {function} function of type Curve → Drawing
 */
function draw_connected(num) {
  return function(func) {
    return generateCurve('none', 'lines', num, func)
  }
}

/**
 * returns a function that turns a given Curve into a Drawing, 
 * by sampling the Curve at <CODE>num</CODE> sample points.
 * The Drawing consists of isolated points, and does not connect them.
 * When a program evaluates to a Drawing, the Source system
 * displays it graphically, in a window, instead of textually.
 * The parts between (0,0) and (1,1) of the resulting Drawing 
 * are shown in the window.
 * @param {Number} num - determines the number of points to be 
 * sampled. Including 0 and 1,
 * there are <CODE>num + 1</CODE> evenly spaced sample points.
 * @return {function} function of type Curve → Drawing
 */
function draw_points_on(num) {
  return curve => 
	generateCurve('none', 'points', num, curve)
}

/**
 * returns a function that turns a given Curve into a Drawing, 
 * by sampling the Curve at <CODE>num</CODE> sample points.
 * The Drawing consists of isolated points, and does not connect them.
 * When a program evaluates to a Drawing, the Source system
 * displays it graphically, in a window, instead of textually.
 * The Drawing is squeezed such that all its parts are shown in the
 * window.
 * @param {Number} num - determines the number of points to be 
 * sampled. Including 0 and 1,
 * there are <CODE>num + 1</CODE> evenly spaced sample points.
 * @return {function} function of type Curve → Drawing
 */
function draw_points_squeezed_to_window(num) {
  return function(func) {
    return generateCurve('fit', 'points', num, func)
  }
}

/**
 * returns a function that turns a given Curve into a Drawing, 
 * by sampling the Curve at <CODE>num</CODE> sample points 
 * and connecting each pair with a line. 
 * When a program evaluates to a Drawing, the Source system
 * displays it graphically, in a window, instead of textually.
 * The Drawing is resized proportionally such that it 
 * is shown as big as possible, and still fits entirely 
 * inside the window.
 * @param {Number} num - determines the number of points to be 
 * sampled. Including 0 and 1,
 * there are <CODE>num + 1</CODE> evenly spaced sample points.
 * @return {function} function of type Curve → Drawing
 */
function draw_connected_squeezed_to_window(num) {
  return function(func) {
    return generateCurve('fit', 'lines', num, func)
  }
}

/**
 * returns a function that turns a given Curve into a Drawing, 
 * by sampling the Curve at <CODE>num</CODE> sample points 
 * and connecting each pair with a line. 
 * When a program evaluates to a Drawing, the Source system
 * displays it graphically, in a window, instead of textually.
 * The Drawing is stretched or shrunk
 * to show the full curve
 * and maximize its width and height, with some padding.
 * @param {Number} num - determines the number of points to be 
 * sampled. Including 0 and 1,
 * there are <CODE>num + 1</CODE> evenly spaced sample points.
 * @return {function} function of type Curve → Drawing
 */
function draw_connected_full_view(num) {
  return function(func) {
    return generateCurve('stretch', 'lines', num, func, true)
  }
}

/**
 * returns a function that turns a given Curve into a Drawing, 
 * by sampling the Curve at <CODE>num</CODE> sample points 
 * and connecting each pair with a line. 
 * When a program evaluates to a Drawing, the Source system
 * displays it graphically, in a window, instead of textually.
 * The Drawing is scaled proportionally to show the full curve
 * and maximize its size, with some padding.
 * @param {Number} num - determines the number of points to be 
 * sampled. Including 0 and 1,
 * there are <CODE>num + 1</CODE> evenly spaced sample points.
 * @return {function} function of type Curve → Drawing
 */
function draw_connected_full_view_proportional(num) {
  return function(func) {
    return generateCurve('fit', 'lines', num, func, true)
  }
}

/**
 * makes a Point with given x and y coordinates
 * @param {Number} x - x-coordinate of new point
 * @param {Number} y - y-coordinate of new point
 * @returns {Point} with x and y as coordinates
 */
function make_point(x, y) {
  return [x, y]
}

/**
 * retrieves the x-coordinate a given Point
 * @param {Point} p - given point
 * @returns {Number} x-coordinate of the Point
 */
function x_of(pt) {
  return pt[0]
}

/**
 * retrieves the y-coordinate a given Point
 * @param {Point} p - given point
 * @returns {Number} y-coordinate of the Point
 */
function y_of(pt) {
  return pt[1]
}

/*-----------------------Color functions----------------------*/
function hexToColor(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
    1
  ]
}

/**
 * adds color to curve by specifying 
 * the red, green, blue (RGB) value, ranging from 0.0 to 1.0.
 * RGB is additive: if all values are 1, the color is white,
 * and if all values are 0, the color is black.
 * @param {Curve} Curve - the curve to add color to
 * @param {number} r - red value (0.0-1.0)
 * @param {number} g - green value (0.0-1.0)
 * @param {number} b - blue value (0.0-1.0)
 * @returns {Curve} the colored Curve
 */
function color(curve, r, g, b) {
  // throwIfNotRune('color', rune)
  var wrapper = new Curve()
  wrapper.setCurve(curve instanceof Curve ? curve.getCurve() : curve)
  var color = [r, g, b, 1]
  wrapper.setColor(t => color)
  return wrapper
}

function addColorFromHex(curve, hex) {
  // throwIfNotRune('addColorFromHex', rune)
  var wrapper = new Curve()
  wrapper.setCurve(curve instanceof Curve ? curve.getCurve() : curve)
  wrapper.setColor(t => hexToColor(hex))
  return wrapper
}

/**
 * Gives random color to the given curve.
 * The color is chosen randomly from the following nine 
 * colors: red, pink, purple, indigo, blue, green, yellow, orange, brown
 * @param {Curve} curve - the curve to color
 * @returns {Curve} the colored Rune
 */
function random_color(curve) {
  // throwIfNotRune('random_color', rune)
  var wrapper = new Curve()
  wrapper.setCurve(curve instanceof Curve ? curve.getCurve() : curve)
  var randomColor = hexToColor(colorPalette[Math.floor(Math.random() * colorPalette.length)])
  wrapper.setColor(t => randomColor)
  return wrapper
}

// black and white not included because they are boring colors
// colorPalette is used in generateFlattenedRuneList to generate a random color
var colorPalette = [
  '#F44336',
  '#E91E63',
  '#AA00FF',
  '#3F51B5',
  '#2196F3',
  '#4CAF50',
  '#FFEB3B',
  '#FF9800',
  '#795548'
]

/**
 * colors the given curve red.
 * @param {Curve} curve - the curve to color
 * @returns {Curve} the colored Curve
 */
function red(curve) {
  // throwIfNotRune('red', rune)
  return addColorFromHex(curve, '#F44336')
}

/**
 * colors the given curve pink.
 * @param {Curve} curve - the curve to color
 * @returns {Curve} the colored Curve
 */
function pink(curve) {
  // throwIfNotRune('pink', rune)
  return addColorFromHex(curve, '#E91E63')
}

/**
 * colors the given curve purple.
 * @param {Curve} curve - the curve to color
 * @returns {Curve} the colored Curve
 */
function purple(curve) {
  // throwIfNotRune('purple', rune)
  return addColorFromHex(curve, '#AA00FF')
}

/**
 * colors the given curve indigo.
 * @param {Curve} curve - the curve to color
 * @returns {Curve} the colored Curve
 */
function indigo(curve) {
  // throwIfNotRune('indigo', rune)
  return addColorFromHex(curve, '#3F51B5')
}

/**
 * colors the given curve blue.
 * @param {Curve} curve - the curve to color
 * @returns {Curve} the colored Curve
 */
function blue(curve) {
  // throwIfNotRune('blue', rune)
  return addColorFromHex(curve, '#2196F3')
}

/**
 * colors the given curve green.
 * @param {Curve} curve - the curve to color
 * @returns {Curve} the colored Curve
 */
function green(curve) {
  // throwIfNotRune('green', rune)
  return addColorFromHex(curve, '#4CAF50')
}

/**
 * colors the given curve yellow.
 * @param {Curve} curve - the curve to color
 * @returns {Curve} the colored Rune
 */
function yellow(curve) {
  // throwIfNotRune('yellow', rune)
  return addColorFromHex(curve, '#FFEB3B')
}

/**
 * colors the given curve orange.
 * @param {Curve} curve - the curve to color
 * @returns {Curve} the colored Rune
 */
function orange(curve) {
  // throwIfNotRune('orange', rune)
  return addColorFromHex(curve, '#FF9800')
}

/**
 * colors the given curve brown.
 * @param {Curve} curve - the curve to color
 * @returns {Curve} the colored Rune
 */
function brown(curve) {
  // throwIfNotRune('brown', rune)
  return addColorFromHex(curve, '#795548')
}

/**
 * colors the given curve black.
 * @param {Curve} curve - the curve to color
 * @returns {Curve} the colored Rune
 */
function black(curve) {
  // throwIfNotRune('black', rune)
  return addColorFromHex(curve, '#000000')
}

/**
 * colors the given curve white.
 * @param {Curve} curve - the curve to color
 * @returns {Curve} the colored Rune
 */
function white(curve) {
  // throwIfNotRune('white', rune)
  return addColorFromHex(curve, '#FFFFFF')
}