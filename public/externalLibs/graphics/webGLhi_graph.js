// USEFUL, SIMPLE, GENERAL PROCEDURES

function compose(f, g) {
  return function(x) {
    return f(g(x))
  }
}

function thrice(f) {
  return compose(compose(f, f), f)
}

function identity(t) {
  return t
}

function repeated(f, n) {
  if (n === 0) {
    return identity
  } else {
    return compose(f, repeated(f, n - 1))
  }
}

// USEFUL NUMERICAL PROCEDURE

function square(x) {
  return x * x
}

// SOME CURVES

/**
 * this function is a curve: a function from a
 * fraction t to a point. The points lie on the
 * unit circle. They start at Point (1,0) when
 * t is 0. When t is 0.25, they reach Point (0,1),
 * when t is 0.5, they reach Point (-1, 0), etc.
 * 
 * @param {number} t - fraction between 0 and 1
 * @returns {Point} Point in the line at t
 */
function unit_circle(t) {
    return make_point(Math.sin(2 * Math.PI * t),
		      Math.cos(2 * Math.PI * t))
}

/**
 * this function is a curve: a function from a
 * fraction t to a point. The x-coordinate at
 * franction t is t, and the y-coordinate is 0.
 * 
 * @param {number} t - fraction between 0 and 1
 * @returns {Point} Point in the line at t
 */
function unit_line(t) {
  return make_point(t, 0)
}

/**
 * this function is a Curve generator: it takes
 * a number and returns a horizontal curve. The number
 * is a y-coordinate, and the Curve generates
 * only points with the given y-coordinate.
 * 
 * @param {number} t - fraction between 0 and 1
 * @returns {Curve} horizontal Curve 
 */
function unit_line_at(y) {
  return function(t) {
    return make_point(t, y)
  }
}

// alternative_unit_circle: undocumented feature

function alternative_unit_circle(t) {
    return make_point(Math.sin(2 * Math.PI * square(t)),
		      Math.cos(2 * Math.PI * square(t)))
}

/**
 * this function is a curve: a function from a
 * fraction t to a point. The points lie on the
 * right half of the unit circle. They start at Point (0,1) when
 * t is 0. When t is 0.5, they reach Point (1,0),
 * when t is 1, they reach Point (0, -1).
 * 
 * @param {number} t - fraction between 0 and 1
 * @returns {Point} Point in the line at t
 */
function arc(t) {
  return make_point(Math.sin(Math.PI * t), Math.cos(Math.PI * t))
}

// Curve-Transform = (Curve --> Curve)

// SOME CURVE-TRANSFORMS

/**
 * this function is a unary Curve operator: a function from a
 * Curve to a Curve. The points of the result Curve are
 * the same points as the points of the original Curve, but
 * in reverse: The result Curve applied to 0 is the original Curve
 * applied to 1 and vice versa.
 * 
 * @param {Curve} original - original Curve
 * @returns {Curve} result Curve
 */
function invert(curve) {
  return function(t) {
    return curve(1 - t)
  }
}

/**
 * this function is a unary Curve operator: a function from a
 * Curve to a Curve. The result Curve is the original Curve
 * rotated by 90 degrees in counterclockwise direction around
 * the origin.
 * @param {Curve} original - original Curve
 * @returns {Curve} result Curve
 */
function rotate_pi_over_2(curve) {
    return t => {
	var ct = curve(t)
	return make_point(-y_of(ct), x_of(ct))
    }
}

// CONSTRUCTORS OF CURVE-TRANSFORMS

// TRANSLATE is of type (JS-Num, JS-Num --> Curve-Transform)

/**
 * this function returns a unary Curve operator: 
 * It takes an x-value x0 and a y-value y0 as arguments and returns a
 * unary Curve operator that
 * takes a Curve as argument and returns
 * a new Curve, by translating the original by x0 in x-direction
 * and by y0 in y-direction.
 * 
 * @param {number} x0 - x-value
 * @param {number} y0 - y-value
 * @returns {function} unary Curve operator
 */
function translate(x0, y0) {
  return curve => 
	(t) => {
	    var ct = curve(t)
	    return make_point(x0 + x_of(ct), y0 + y_of(ct))
	}
}

// ROTATE-AROUND-ORIGIN is of type (JS-Num --> Curve-Transform)
/**
 * this function 
 * takes an angle theta as parameter and returns a unary Curve operator:
 * a function that takes
 * a Curve a argument and returns
 * a new Curve, which is the original Curve rotated by the given angle
 * around the origin, in counter-clockwise direction.
 * @param {number} theta - given angle
 * @returns {unary_Curve_operator} function that takes a Curve and returns a Curve
 */
function rotate_around_origin(theta) {
  var cth = Math.cos(theta)
  var sth = Math.sin(theta)
  return function(curve) {
    return function(t) {
      var ct = curve(t)
      var x = x_of(ct)
      var y = y_of(ct)
      return make_point(cth * x - sth * y, sth * x + cth * y)
    }
  }
}

function deriv_t(n) {
  var delta_t = 1 / n
  return function(curve) {
    return function(t) {
      var ct = curve(t)
      var ctdelta = curve(t + delta_t)
      return make_point((x_of(ctdelta) - x_of(ct)) / delta_t, (y_of(ctdelta) - y_of(ct)) / delta_t)
    }
  }
}

/**
 * this function takes scaling factors <CODE>a</CODE> and <CODE>b</CODE> as arguments 
 * and returns a unary Curve operator that
 * scales a given Curve by <CODE>a</CODE> in x-direction and by <CODE>b</CODE> 
 * in y-direction.
 * 
 * @param {number} a - scaling factor in x-direction
 * @param {number} b - scaling factor in y-direction
 * @returns {unary_Curve_operator} function that takes a Curve and returns a Curve
 */
function scale_x_y(a, b) {
  return curve => 
	t => {
	    var ct = curve(t)
	    return make_point(a * x_of(ct), b * y_of(ct))
	}
}

/**
 * this function takes a scaling factor s argument and returns a
 * unary Curve operator that
 * scales a given Curve by s in x and y direction.
 * 
 * @param {number} s - scaling factor
 * @returns {unary_Curve_operator} function that takes a Curve and returns a Curve
 */
function scale(s) {
  return scale_x_y(s, s)
}

// SQUEEZE-RECTANGULAR-PORTION translates and scales a curve
// so the portion of the Curve in the rectangle
// with corners xlo xhi ylo yhi will appear in a display window
// which has x, y coordinates from 0 to 1.
// It is of type (JS-Num, JS-Num, JS-Num, JS-Num --> Curve-Transform).

// squeeze_rectangular_portion: undocumented feature

function squeeze_rectangular_portion(xlo, xhi, ylo, yhi) {
  var width = xhi - xlo
  var height = yhi - ylo
  if (width === 0 || height === 0) {
    throw 'attempt to squeeze window to zero'
  } else {
    return compose(scale_x_y(1 / width, 1 / height), translate(-xlo, -ylo))
  }
}

// SQUEEZE-FULL-VIEW translates and scales a Curve such that
// the ends are fully visible.
// It is very similar to the squeeze-rectangular-portion procedure
// only that that procedure does not allow the edges to be easily seen

// squeeze_full_view: undocumented feature

function squeeze_full_view(xlo, xhi, ylo, yhi) {
  var width = xhi - xlo
  var height = yhi - ylo
  if (width === 0 || height === 0) {
    throw 'attempt to squeeze window to zero'
  } else {
    return compose(
      scale_x_y(0.99 * 1 / width, 0.99 * 1 / height),
      translate(-(xlo - 0.01), -(ylo - 0.01))
    )
  }
}

// full_view_proportional: undocumented feature

function full_view_proportional(xlo, xhi, ylo, yhi) {
  var width = xhi - xlo
  var height = yhi - ylo
  if (width === 0 || height === 0) {
    throw 'attempt to squeeze window to zero'
  } else {
    var scale_factor = Math.min(0.9 * 1 / width, 0.9 * 1 / height)
    var new_mid_x = scale_factor * (xlo + xhi) / 2
    var new_mid_y = scale_factor * (ylo + yhi) / 2
    return compose(
      translate(0.5 - new_mid_x, 0.5 - new_mid_y),
      scale_x_y(scale_factor, scale_factor)
    )
  }
}

// PUT-IN-STANDARD-POSITION is a Curve-Transform.
// A Curve is in "standard position" if it starts at (0,0) ends at (1,0).
// A Curve is PUT-IN-STANDARD-POSITION by rigidly translating it so its
// start Point is at the origin, then rotating it about the origin to put
// its endpoint on the x axis, then scaling it to put the endpoint at (1,0).
// Behavior is unspecified on closed curves (with start-point = end-point).

/**
 * this function is a unary Curve operator: It
 * takes a Curve as argument and returns
 * a new Curve, as follows.
 * A Curve is in <EM>standard position</EM> if it starts at (0,0) ends at (1,0).
 * This function puts the given Curve in standard position by 
 * rigidly translating it so its
 * start Point is at the origin (0,0), then rotating it about the origin to put
 * its endpoint on the x axis, then scaling it to put the endpoint at (1,0).
 * Behavior is unspecified on closed Curves where start-point equal end-point.
 * 
 * @param {Curve} curve - given Curve
 * @returns {Curve} result Curve
 */

function put_in_standard_position(curve) {
  var start_point = curve(0)
  var curve_started_at_origin = translate(-x_of(start_point), -y_of(start_point))(curve)
  var new_end_point = curve_started_at_origin(1)
  var theta = Math.atan2(y_of(new_end_point), x_of(new_end_point))
  var curve_ended_at_x_axis = rotate_around_origin(-theta)(curve_started_at_origin)
  var end_point_on_x_axis = x_of(curve_ended_at_x_axis(1))
  return scale(1 / end_point_on_x_axis)(curve_ended_at_x_axis)
}

// Binary-transform = (Curve,Curve --> Curve)

// CONNECT-RIGIDLY makes a Curve consisting of curve1 followed by curve2.

/**
 * this function is a binary Curve operator: It
 * takes two Curves as arguments and returns
 * a new Curve. The two Curves are combined
 * by using the full first Curve for the first portion
 * of the result and by using the full second Curve for the 
 * second portion of the result.
 * The second Curve is not changed, and therefore
 * there might be a big jump in the middle of the
 * result Curve.
 * @param {Curve} curve1 - first Curve
 * @param {Curve} curve2 - second Curve
 * @returns {Curve} result Curve
 */
function connect_rigidly(curve1, curve2) {
  return function(t) {
    if (t < 1 / 2) {
      return curve1(2 * t)
    } else {
      return curve2(2 * t - 1)
    }
  }
}

// CONNECT-ENDS makes a Curve consisting of curve1 followed by
// a copy of curve2 starting at the end of curve1

/**
 * this function is a binary Curve operator: It
 * takes two Curves as arguments and returns
 * a new Curve. The two Curves are combined
 * by using the full first Curve for the first portion
 * of the result and by using the full second Curve for the second
 * portion of the result.
 * The second Curve is translated such that its point
 * at fraction 0 is the same as the Point of the first
 * Curve at fraction 1.
 * 
 * @param {Curve} curve1 - first Curve
 * @param {Curve} curve2 - second Curve
 * @returns {Curve} result Curve
 */
function connect_ends(curve1, curve2) {
    const start_point_of_curve2 = curve2(0);
    const end_point_of_curve1 = curve1(1);
    return connect_rigidly(curve1,
			   (translate(x_of(end_point_of_curve1) -
				      x_of(start_point_of_curve2),
				      y_of(end_point_of_curve1) -
				      y_of(start_point_of_curve2)))
			   (curve2));
}


// function connect_ends(curve1, curve2) {...}

// FRACTAL CURVES

// GOSPERIZE is a Curve-Transform


/**
 * this function is a unary Curve operator: It
 * takes a Curve as argument and returns
 * a new Curve, according to the Gosper operation.
 * 
 * @param {Curve} curve - given Curve
 * @returns {Curve} result Curve
 */
function gosperize(curve) {
  var scaled_curve = scale(Math.sqrt(2) / 2)(curve)
  return connect_rigidly(
    rotate_around_origin(Math.PI / 4)(scaled_curve),
    translate(0.5, 0.5)(rotate_around_origin(-Math.PI / 4)(scaled_curve))
  )
}

// GOSPER-CURVE is of type (JS-Num --> Curve)

/**
 * returns a gosper Curve, that results from
 * apply gosperize as many times to the unit line
 * as given by the parameter <CODE>level</CODE> of
 * the function <CODE>gosper_curve</CODE>
 * 
 * @param {number} level - number of repeated applications
 * @returns {Curve} 
 */
function gosper_curve(level) {
  return repeated(gosperize, level)(unit_line)
}

// DRAWING GOSPER CURVES

/**
 * shows a gosper Curve of given level, by drawing it
 * with suitable parameters
 * 
 * @param {number} level - number of repeated applications of gosperize to the unit line
 * @returns {Drawing} 
 */
function show_connected_gosper(level) {
  return draw_connected(200)(squeeze_rectangular_portion(-0.5, 1.5, -0.5, 1.5)(gosper_curve(level)))
}

/**
 * returns a Curve that results from gosperizing the unit line
 * as often as given by the level parameter, each time
 * applying an angle given by the given angle-producing function
 * @param {number} level - number of repeated applications of gosperize to the curve
 * @param {function} angle_at - function that determines the angle at each level
 * @returns {Curve} 
 */
function param_gosper(level, angle_at) {
  if (level === 0) {
    return unit_line
  } else {
    return param_gosperize(angle_at(level))(param_gosper(level - 1, angle_at))
  }
}

/**
 * this function takes an angle theta and returns a unary Curve operator:
 * A function that takes a Curve as argument and returns
 * a new Curve, according to the Gosper operation, modified
 * with the given angle theta
 * 
 * @param {Curve} curve - given Curve
 * @returns {Curve} result Curve
 */
function param_gosperize(theta) {
  return function(curve) {
    var scale_factor = 1 / Math.cos(theta) / 2
    var scaled_curve = scale(scale_factor)(curve)
    return connect_rigidly(
      rotate_around_origin(theta)(scaled_curve),
      translate(0.5, Math.sin(theta) * scale_factor)(rotate_around_origin(-theta)(scaled_curve))
    )
  }
}

// DRAGONIZE

// zc-dragonize is a Curve-Transform

function zc_dragonize(n, curve) {
  if (n === 0) {
    return curve
  } else {
    var c = zc_dragonize(n - 1, curve)
    return put_in_standard_position(connect_ends(rotate_around_origin(-Math.PI / 2)(c), c))
  }
}
