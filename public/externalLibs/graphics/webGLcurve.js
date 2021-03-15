class Point{
  constructor(x, y, z, r, g, b) {
    this.x = x
    this.y = y
    this.z = z
    this.color = [r, g, b, 1]
  }
  getColor = function(){
    return this.color
  }
  getX = function(){
    return this.x
  }
  getY = function(){
    return this.y
  }
  getZ = function(){
    return this.z
  }
}

var cubeRotation = 0 //Used for testing
function generateCurve(scaleMode, drawMode, numPoints, func, space, isFullView) {
  const viewport_size = 600
  const frame = open_pixmap('frame', viewport_size, viewport_size, true);
  var curvePosArray = []
  var curveColorArray = []
  var drawCubeArray = []
  var transMat = mat4.create()
  var projMat = mat4.create()
  var curveObject = {}
  // initialize the min/max to extreme values
  var min_x = Infinity
  var max_x = -Infinity
  var min_y = Infinity
  var max_y = -Infinity
  var min_z = Infinity
  var max_z = -Infinity

  function evaluator(num, func) {
    curveObject = {}
    curvePosArray = []
    curveColorArray = []
    for (var i = 0; i <= num; i += 1) {
      var point = func(i / num)
      if (
        !(point instanceof Point)
      ) {
        throw 'Expected a point, encountered ' + point
      }
      var x = point.getX() * 2 - 1
      var y = point.getY() * 2 - 1
      var z = point.getZ() * 2 - 1
      space == '2D' ? curvePosArray.push(x, y) : curvePosArray.push(x, y, z)
      var color_r = point.getColor()[0]
      var color_g = point.getColor()[1]
      var color_b = point.getColor()[2]
      var color_a = point.getColor()[3]
      curveColorArray.push(color_r, color_g, color_b, color_a)
      min_x = Math.min(min_x, x)
      max_x = Math.max(max_x, x)
      min_y = Math.min(min_y, y)
      max_y = Math.max(max_y, y)
      min_z = Math.min(min_z, z)
      max_z = Math.max(max_z, z)
      if (Math.max(max_x, max_y, max_z, -min_x, -min_y, -min_z) > Math.pow(10, 32)) {
        throw "The absolute value of the coordinates of the curve is too big!"
      }
    }
  }
  evaluator(numPoints, func)

  // padding for 2d draw connected full-view
  if (isFullView) {
    var horiz_padding = 0.05 * (max_x - min_x)
    min_x -= horiz_padding
    max_x += horiz_padding
    var vert_padding = 0.05 * (max_y - min_y)
    min_y -= vert_padding
    max_y += vert_padding
    var depth_padding = 0.05 * (max_z - min_z)
    min_z -= depth_padding
    max_z += depth_padding
  }

  // box generation
  if (space == '3D') {
    drawCubeArray.push(
      -1, 1, 1, -1, -1, 1,
      -1, -1, -1, -1, 1, -1,
      1, 1, -1, 1, -1, -1,
      -1, -1, -1, 1, -1, -1,
      1, -1, 1, -1, -1, 1,
      1, -1, 1, 1, 1, 1,
      -1, 1, 1, -1, 1, -1,
      1, 1, -1, 1, 1, 1
    )
  } else {
    min_z = max_z = 0
  }

  if (scaleMode == 'fit') {
    var center = [(min_x + max_x) / 2, (min_y + max_y) / 2, (min_z + max_z) / 2]
    var scale = Math.max(max_x - min_x, max_y - min_y, max_z - min_z)
    scale = scale === 0 ? 1 : scale;
    if (space == '3D') {
      for (var i = 0; i < curvePosArray.length; i++) {
        if (i % 3 == 0) {
          curvePosArray[i] -= center[0]
          curvePosArray[i] /= scale/2
        } else if (i % 3 == 1) {
          curvePosArray[i] -= center[1]
          curvePosArray[i] /= scale/2
        } else {
          curvePosArray[i] -= center[2]
          curvePosArray[i] /= scale/2
        }
      }
    } else {
      for (var i = 0; i < curvePosArray.length; i++) {
        if (i % 2 == 0) {
          curvePosArray[i] -= center[0]
          curvePosArray[i] /= scale/2
        } else {
          curvePosArray[i] -= center[1]
          curvePosArray[i] /= scale/2
        }
      }
    }
  } else if (scaleMode == 'stretch') {
    var center = [(min_x + max_x) / 2, (min_y + max_y) / 2, (min_z + max_z) / 2]
    var x_scale = max_x === min_x ? 1 : (max_x - min_x)
    var y_scale = max_y === min_y ? 1 : (max_y - min_y)
    var z_scale = max_z === min_z ? 1 : (max_z - min_z)
    if (space == '3D') {
      for (var i = 0; i < curvePosArray.length; i++) {
        if (i % 3 == 0) {
          curvePosArray[i] -= center[0]
          curvePosArray[i] /= x_scale/2
        } else if (i % 3 == 1) {
          curvePosArray[i] -= center[1]
          curvePosArray[i] /= y_scale/2
        } else {
          curvePosArray[i] -= center[2]
          curvePosArray[i] /= z_scale/2
        }
      }
    } else {
      for (var i = 0; i < curvePosArray.length; i++) {
        if (i % 2 == 0) {
          curvePosArray[i] -= center[0]
          curvePosArray[i] /= x_scale/2
        } else {
          curvePosArray[i] -= center[1]
          curvePosArray[i] /= y_scale/2
        }
      }
    }
  }

  if (space == '3D') {
    var scale = Math.sqrt(1 / 3.1)
    mat4.scale(transMat, transMat, vec3.fromValues(scale, scale, scale))
    curveObject.drawCube = drawCubeArray
    mat4.translate(transMat, transMat, [0, 0, -5])
    mat4.rotate(transMat, transMat, -(Math.PI / 2), [1, 0, 0])  // axis to rotate around X
    mat4.rotate(transMat, transMat, -0.5, [0, 0, 1])            // axis to rotate around Z
    cubeRotation += 0.1 * Math.PI

    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.width / gl.canvas.height;
    const zNear = 0;
    const zFar = 50.0;
    mat4.perspective(projMat, fieldOfView, aspect, zNear, zFar);
  }

  clear_viewport()
  gl.uniformMatrix4fv(u_projectionMatrix, false, projMat)
  gl.uniformMatrix4fv(u_transformMatrix, false, transMat)
  curveObject.curvePos = curvePosArray
  curveObject.color = curveColorArray
  curveObject.drawCube = drawCubeArray
  drawCurve(drawMode, curveObject, space)
  copy_viewport(gl.canvas, frame)
  return new ShapeDrawn(frame)
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
  return curve => 
	generateCurve('none', 'lines', num, curve, '2D')
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
    return generateCurve('stretch', 'lines', num, func, '2D', true)
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
    return generateCurve('fit', 'lines', num, func, '2D', true)
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
	generateCurve('none', 'points', num, curve, '2D')
}

/**
 * returns a function that turns a given Curve into a Drawing, 
 * by sampling the Curve at <CODE>num</CODE> sample points.
 * The Drawing consists of isolated points, and does not connect them.
 * When a program evaluates to a Drawing, the Source system
 * displays it graphically, in a window, instead of textually.
 * The Drawing is scaled proportionally with its size maximized 
 * to fit entirely inside the window, with some padding.
 * @param {Number} num - determines the number of points to be 
 * sampled. Including 0 and 1,
 * there are <CODE>num + 1</CODE> evenly spaced sample points.
 * @return {function} function of type Curve → Drawing
 */
function draw_points_full_view_proportional(num) {
  return function(func) {
    return generateCurve('fit', 'points', num, func, '2D', true)
  }
}

/**
 * returns a function that turns a given 3D Curve into a Drawing, 
 * by sampling the 3D Curve at <CODE>num</CODE> sample points 
 * and connecting each pair with a line. 
 * When a program evaluates to a Drawing, the Source system 
 * displays it graphically, in a window, instead of textually. 
 * The parts between (0,0,0) and (1,1,1) of the resulting 
 * Drawing are shown within the unit cube.
 * @param {Number} num - determines the number of points to be 
 * sampled. Including 0 and 1,
 * there are <CODE>num + 1</CODE> evenly spaced sample points.
 * @return {function} function of type Curve → Drawing
 */
function draw_3D_connected(num) {
  return function(func) {
    return generateCurve('none', 'lines', num, func, '3D')
    //requestAnimationFrame(generateCurve)
  }
}

/**
 * returns a function that turns a given 3D Curve into a Drawing, 
 * by sampling the 3D Curve at <CODE>num</CODE> sample points 
 * and connecting each pair with a line. 
 * When a program evaluates to a Drawing, the Source system 
 * displays it graphically, in a window, instead of textually. 
 * The Drawing is stretched or shrunk 
 * to show the full curve 
 * and maximize its width and height within the cube.
 * @param {Number} num - determines the number of points to be 
 * sampled. Including 0 and 1,
 * there are <CODE>num + 1</CODE> evenly spaced sample points.
 * @return {function} function of type Curve → Drawing
 */
function draw_3D_connected_full_view(num) {
  return function(func) {
    return generateCurve('stretch', 'lines', num, func, '3D')
  }
}

/**
 * returns a function that turns a given 3D Curve into a Drawing, 
 * by sampling the 3D Curve at <CODE>num</CODE> sample points 
 * and connecting each pair with a line. 
 * When a program evaluates to a Drawing, the Source system 
 * displays it graphically, in a window, instead of textually. 
 * The Drawing is scaled proportionally with its size maximized 
 * to fit entirely inside the cube.
 * @param {Number} num - determines the number of points to be 
 * sampled. Including 0 and 1,
 * there are <CODE>num + 1</CODE> evenly spaced sample points.
 * @return {function} function of type Curve → Drawing
 */
function draw_3D_connected_full_view_proportional(num) {
  return function(func) {
    return generateCurve('fit', 'lines', num, func, '3D')
  }
}

/**
 * returns a function that turns a given 3D Curve into a Drawing, 
 * by sampling the 3D Curve at <CODE>num</CODE> sample points. 
 * The Drawing consists of isolated points, and does not connect them. 
 * When a program evaluates to a Drawing, the Source system 
 * displays it graphically, in a window, instead of textually. 
 * The parts between (0,0,0) and (1,1,1) of the resulting 
 * Drawing are shown within the unit cube.
 * @param {Number} num - determines the number of points to be 
 * sampled. Including 0 and 1,
 * there are <CODE>num + 1</CODE> evenly spaced sample points.
 * @return {function} function of type Curve → Drawing
 */
function draw_3D_points_on(num) {
  return function(func) {
    return generateCurve('none', 'points', num, func, '3D')
  }
}

/**
 * returns a function that turns a given 3D Curve into a Drawing, 
 * by sampling the 3D Curve at <CODE>num</CODE> sample points. 
 * The Drawing consists of isolated points, and does not connect them. 
 * When a program evaluates to a Drawing, the Source system 
 * displays it graphically, in a window, instead of textually. 
 * The Drawing is scaled proportionally with its size maximized 
 * to fit entirely inside the cube.
 * @param {Number} num - determines the number of points to be 
 * sampled. Including 0 and 1,
 * there are <CODE>num + 1</CODE> evenly spaced sample points.
 * @return {function} function of type Curve → Drawing
 */
function draw_3D_points_full_view_proportional(num) {
  return function(func) {
    return generateCurve('fit', 'points', num, func, '3D')
  }
}

/**
 * makes a Point with given x and y coordinates
 * @param {Number} x - x-coordinate of new point
 * @param {Number} y - y-coordinate of new point
 * @returns {Point} with x and y as coordinates
 */
function make_point(x, y) {
  return new Point(x, y, 0, 0, 0, 0)
}

/**
 * makes a 3D Point with given x, y and z coordinates
 * @param {Number} x - x-coordinate of new point
 * @param {Number} y - y-coordinate of new point
 * @param {Number} z - z-coordinate of new point
 * @returns {Point} with x, y and z as coordinates
 */
function make_3D_point(x, y, z) {
  return new Point(x, y, z, 0, 0, 0)
}

/**
 * makes a color Point with given x and y coordinates, 
 * and RGB values ranging from 0 to 255. 
 * Any input lower than 0 for RGB will be rounded up to 0, 
 * and any input higher than 255 will be rounded down to 255.
 * @param {Number} x - x-coordinate of new point
 * @param {Number} y - y-coordinate of new point
 * @param {Number} r - red component of new point
 * @param {Number} g - green component of new point
 * @param {Number} b - blue component of new point
 * @returns {Point} with x and y as coordinates, and r, g and b as RGB values
 */
function make_color_point(x, y, r, g, b){
  return new Point(x, y, 0, r/255, g/255, b/255)
}

/**
 * makes a 3D color Point with given x, y and z coordinates, 
 * and RGB values ranging from 0 to 255. 
 * Any input lower than 0 for RGB will be rounded up to 0, 
 * and any input higher than 255 will be rounded down to 255.
 * @param {Number} x - x-coordinate of new point
 * @param {Number} y - y-coordinate of new point
 * @param {Number} z - z-coordinate of new point
 * @param {Number} r - red component of new point
 * @param {Number} g - green component of new point
 * @param {Number} b - blue component of new point
 * @returns {Point} with x, y and z as coordinates, and r, g and b as RGB values
 */
function make_3D_color_point(x, y, z, r, g, b){
  return new Point(x, y, z, r/255, g/255, b/255)
}

/**
 * retrieves the x-coordinate of a given Point
 * @param {Point} p - given point
 * @returns {Number} x-coordinate of the Point
 */
function x_of(pt) {
  return pt.getX();
}

/**
 * retrieves the y-coordinate of a given Point
 * @param {Point} p - given point
 * @returns {Number} y-coordinate of the Point
 */
function y_of(pt) {
  return pt.getY();
}

/**
 * retrieves the z-coordinate of a given Point
 * @param {Point} p - given point
 * @returns {Number} z-coordinate of the Point
 */
function z_of(pt) {
  return pt.getZ();
}

/**
 * retrieves the red component of a given Point
 * @param {Point} p - given point
 * @returns {Number} Red component of the Point
 */
function r_of(pt) {
  return pt.getColor()[0] * 255;
}

/**
 * retrieves the green component of a given Point
 * @param {Point} p - given point
 * @returns {Number} Green component of the Point
 */
function g_of(pt) {
  return pt.getColor()[1] * 255;
}

/**
 * retrieves the blue component of a given Point
 * @param {Point} p - given point
 * @returns {Number} Blue component of the Point
 */
function b_of(pt) {
  return pt.getColor()[2] * 255;
}