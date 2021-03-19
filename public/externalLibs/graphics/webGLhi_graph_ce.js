// USEFUL, SIMPLE, GENERAL PROCEDURES

function compose(f, g) {
  return function(x) {
    return f(g(x))
  }
}

function thrice(f) {
  return compose(compose(f, f), f)
}

function repeated(f, n) {
  if (n === 0) {
    return t => t
  } else {
    return compose(f, repeated(f, n - 1))
  }
}

// USEFUL NUMERICAL PROCEDURE

function square(x) {
  return x * x
}

// SOME CURVES

function unit_circle(t) {
  return make_point(Math.cos(2 * Math.PI * t), Math.sin(2 * Math.PI * t))
}

function unit_line(t) {
  return make_point(t, 0)
}

function unit_line_at(y) {
  return function(t) {
    return make_point(t, y)
  }
}

// made available for Mission 6
function arc(t) {
  return make_point(Math.sin(Math.PI * t), Math.cos(Math.PI * t))
}

// Curve-Transform = (Curve --> Curve)

// SOME CURVE-TRANSFORMS

function invert(curve) {
  return t => curve(1 - t)
}

// CONSTRUCTORS OF CURVE-TRANSFORMS

// TRANSLATE is of type (JS-Num, JS-Num --> Curve-Transform)

function translate_curve(x0, y0, z0) {
  return function(curve) {
    var transformation = c => (function(t) {
      x0 = x0 == undefined ? 0 : x0
      y0 = y0 == undefined ? 0 : y0
      z0 = z0 == undefined ? 0 : z0
      var ct = c(t)
      return make_3D_color_point(x0 + x_of(ct), y0 + y_of(ct), z0 + z_of(ct), r_of(ct), g_of(ct), b_of(ct))
    })
    return transformation(curve)
  }
}

// ROTATE-AROUND-ORIGIN is of type (JS-Num --> Curve-Transform)

function rotate_around_origin(theta1, theta2, theta3) {
  if (theta3 == undefined && theta1 != undefined && theta2 != undefined) {
    // 2 args
    throw new Error('Expected 1 or 3 arguments, but received 2')
  } else if (theta1 != undefined && theta2 == undefined && theta3 == undefined) {
    // 1 args
    var cth = Math.cos(theta1)
    var sth = Math.sin(theta1)
    return function(curve) {
      var transformation = c => (function(t) {
        var ct = c(t)
        var x = x_of(ct)
        var y = y_of(ct)
        var z = z_of(ct)
        return make_3D_color_point(cth * x - sth * y, sth * x + cth * y, z, r_of(ct), g_of(ct), b_of(ct))
      })
      return transformation(curve)
    }
  } else {
    var cthx = Math.cos(theta1)
    var sthx = Math.sin(theta1)
    var cthy = Math.cos(theta2)
    var sthy = Math.sin(theta2)
    var cthz = Math.cos(theta3)
    var sthz = Math.sin(theta3)
    return function(curve) {
      var transformation = c => (function(t) {
        var ct = c(t)
        var coord = [x_of(ct), y_of(ct), z_of(ct)]
        var mat = [
          [cthz * cthy, cthz * sthy * sthx - sthz * cthx, cthz * sthy * cthx + sthz * sthx],
          [sthz * cthy, sthz * sthy * sthx + cthz * cthx, sthz * sthy * cthx - cthz * sthx],
          [-sthy, cthy * sthx, cthy * cthx]]
        var xf = 0, yf = 0, zf = 0;
        for (var i = 0; i < 3; i++) {
          xf += mat[0][i] * coord[i]
          yf += mat[1][i] * coord[i]
          zf += mat[2][i] * coord[i]
        }
        return make_3D_color_point(xf, yf, zf, r_of(ct), g_of(ct), b_of(ct))
      })
      return transformation(curve)
    }
  }
}

function deriv_t(n) {
  var delta_t = 1 / n
  return function(curve) {
    var transformation = c => (function(t) {
      var ct = c(t)
      var ctdelta = c(t + delta_t)
      return make_3D_color_point((x_of(ctdelta) - x_of(ct)) / delta_t, (y_of(ctdelta) - y_of(ct)) / delta_t, z_of(ct), r_of(ct), g_of(ct), b_of(ct))
    })
    return transformation(curve)
  }
}

function scale_curve(a1, b1, c1) {
  return function(curve) {
    var transformation = c => (function(t) {
      var ct = c(t)
      a1 = a1 == undefined ? 1 : a1
      b1 = b1 == undefined ? 1 : b1
      c1 = c1 == undefined ? 1 : c1
      return make_3D_color_point(a1 * x_of(ct), b1 * y_of(ct), c1 * z_of(ct), r_of(ct), g_of(ct), b_of(ct))
    })
    return transformation(curve)
  }
}

function scale_proportional(s) {
  return scale_curve(s, s, s)
}

// PUT-IN-STANDARD-POSITION is a Curve-Transform.
// A curve is in "standard position" if it starts at (0,0) ends at (1,0).
// A curve is PUT-IN-STANDARD-POSITION by rigidly translating it so its
// start point is at the origin, then rotating it about the origin to put
// its endpoint on the x axis, then scaling it to put the endpoint at (1,0).
// Behavior is unspecified on closed curves (with start-point = end-point).

function put_in_standard_position(curve) {
  var start_point = curve(0)
  var curve_started_at_origin = translate_curve(-x_of(start_point), -y_of(start_point))(curve)
  var new_end_point = curve_started_at_origin(1)
  var theta = Math.atan2(y_of(new_end_point), x_of(new_end_point))
  var curve_ended_at_x_axis = rotate_around_origin(-theta)(curve_started_at_origin)
  var end_point_on_x_axis = x_of(curve_ended_at_x_axis(1))
  return scale_proportional(1 / end_point_on_x_axis)(curve_ended_at_x_axis)
}

// Binary-transform = (Curve,Curve --> Curve)

// CONNECT-RIGIDLY makes a curve consisting of curve1 followed by curve2.

function connect_rigidly(curve1, curve2) {
  return t => t < 1 / 2 ? curve1(2 * t) : curve2(2 * t - 1)
}

// CONNECT-ENDS makes a curve consisting of curve1 followed by
// a copy of curve2 starting at the end of curve1

function connect_ends(curve1, curve2) {
  var start_point_of_curve2 = curve2(0)
  var end_point_of_curve1 = curve1(1)
  return connect_rigidly(
    curve1,
    translate_curve(
      x_of(end_point_of_curve1) - x_of(start_point_of_curve2),
      y_of(end_point_of_curve1) - y_of(start_point_of_curve2),
      z_of(end_point_of_curve1) - z_of(start_point_of_curve2)
    )(curve2)
  )
}