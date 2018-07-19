var viewport_size = 600;

function generateCurve(scaleMode, drawMode, numPoints, func, isFullView) {
  var curvePosArray = [];
  var transMat = mat4.create();
  // initialize the min/max to extreme values
  var min_x = Infinity;
  var max_x = -Infinity;
  var min_y = Infinity;
  var max_y = -Infinity;

  function evaluator(num, func) {
    // func should take input of [0, 1] and output pair(x, y)
    // where x,y is in [0, 1]
    // evaluator has a side effect of recording the max/min
    // x and y value for adjusting the position
    curvePosArray = [];
    for (var i = 0; i <= num; i += 1) {
      var value = func(i / num);
      if (
        typeof value !== 'object' ||
        value.length !== 2 ||
        typeof value[0] !== 'number' ||
        typeof value[1] !== 'number'
      ) {
        throw 'Expected a point, encountered ' + value;
      }
      var x = value[0] * 2 - 1;
      var y = value[1] * 2 - 1;
      curvePosArray.push(x, y);
      min_x = Math.min(min_x, x);
      max_x = Math.max(max_x, x);
      min_y = Math.min(min_y, y);
      max_y = Math.max(max_y, y);
    }
  }

  evaluator(numPoints, func);

  if (isFullView) {
    var vert_padding = 0.05 * (max_y - min_y);
    min_y -= vert_padding;
    max_y += vert_padding;
    var horiz_padding = 0.05 * (max_x - min_x);
    min_x -= horiz_padding;
    max_x += horiz_padding;
  }

  if (scaleMode == 'fit') {
    var center = [(min_x + max_x) / 2, (min_y + max_y) / 2];
    var scale = Math.max(max_x - min_x, max_y - min_y);
    mat4.scale(transMat, transMat, vec3.fromValues(2 / scale, 2 / scale, 0)); // use 2 because the value is in [-1, 1]
    mat4.translate(
      transMat,
      transMat,
      vec3.fromValues(-center[0], -center[1], 0)
    );
  } else if (scaleMode == 'stretch') {
    var center = [(min_x + max_x) / 2, (min_y + max_y) / 2];
    mat4.scale(
      transMat,
      transMat,
      vec3.fromValues(2 / (max_x - min_x), 2 / (max_y - min_y), 0)
    ); // use 2 because the value is in [-1, 1]
    mat4.translate(
      transMat,
      transMat,
      vec3.fromValues(-center[0], -center[1], 0)
    );
  } else {
    // do nothing for normal situations
  }
  clear_viewport();
  gl.uniformMatrix4fv(u_transformMatrix, false, transMat);
  drawCurve(drawMode, curvePosArray);
  return new ShapeDrawn();
}

function draw_connected(num) {
  return function(func) {
    return generateCurve('none', 'lines', num, func);
  };
}

function draw_points_on(num) {
  return function(func) {
    return generateCurve('none', 'points', num, func);
  };
}

function draw_points_squeezed_to_window(num) {
  return function(func) {
    return generateCurve('fit', 'points', num, func);
  };
}

function draw_connected_squeezed_to_window(num) {
  return function(func) {
    return generateCurve('fit', 'lines', num, func);
  };
}

function draw_connected_full_view(num) {
  return function(func) {
    return generateCurve('stretch', 'lines', num, func, true);
  };
}

function draw_connected_full_view_proportional(num) {
  return function(func) {
    return generateCurve('fit', 'lines', num, func, true);
  };
}

function make_point(x, y) {
  return [x, y];
}

function x_of(pt) {
  return pt[0];
}

function y_of(pt) {
  return pt[1];
}
