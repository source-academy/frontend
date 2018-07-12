// USEFUL, SIMPLE, GENERAL PROCEDURES

function compose(f, g){
  return function(x){
             return f(g(x));
         }
}

function thrice(f){
  return compose(compose(f, f), f);
}

function identity(t){
  return t;
}

function repeated(f, n){
  if(n === 0){
      return identity;
  }else{
      return compose(f, repeated(f, n - 1));
  }
}

// USEFUL NUMERICAL PROCEDURE

function square(x){ return x * x; }

// SOME CURVES

function unit_circle(t){
  return make_point(Math.sin(2 * Math.PI * t),
                    Math.cos(2 * Math.PI * t));
}

function unit_line(t){
  return make_point(t, 0);
}

function unit_line_at(y) {
  return function(t) {
      return make_point(t, y);
  };
}

function alternative_unit_circle(t){
  return make_point(Math.sin(2 * Math.PI * square(t)),
                    Math.cos(2 * Math.PI * square(t)));
}

// made available for Mission 6
function arc(t){
  return make_point(Math.sin(Math.PI * t),
                    Math.cos(Math.PI * t));
}

// Curve-Transform = (Curve --> Curve)

// SOME CURVE-TRANSFORMS

function invert(curve){
  return function(t){
             return curve(1 - t);
         }
}

function rotate_pi_over_2(curve){
  return function(t){
             var ct = curve(t);
             return make_point(-y_of(ct),
                               x_of(ct));
         }
}

                 // CONSTRUCTORS OF CURVE-TRANSFORMS

// TRANSLATE is of type (JS-Num, JS-Num --> Curve-Transform)

function translate(x0, y0){
  return function(curve){
             return function(t){
                        var ct = curve(t);
                        return make_point(x0 + x_of(ct),
                                          y0 + y_of(ct));
                    }
         }
}

// ROTATE-AROUND-ORIGIN is of type (JS-Num --> Curve-Transform)

function rotate_around_origin(theta){
  var cth = Math.cos(theta);
  var sth = Math.sin(theta);
  return function (curve){
             return function(t){
                 var ct = curve(t);
                 var x = x_of(ct);
                 var y = y_of(ct);
                 return make_point((cth * x) - (sth * y),
                                   (sth * x) + (cth * y));
             }
         }
}

function deriv_t(n){
  var delta_t = 1 / n;
  return function (curve){
             return function(t){
                        var ct = curve(t);
                        var ctdelta = curve(t + delta_t);
                        return make_point((x_of(ctdelta) - x_of(ct)) / delta_t,
                                          (y_of(ctdelta) - y_of(ct)) / delta_t);
                    }
         }
}

function scale_x_y(a, b){
  return function (curve){
             return function(t){
                        var ct = curve(t);
                        return make_point(a * x_of(ct),
                                          b * y_of(ct));
                    }
         }
}

function scale(s){
  return scale_x_y(s, s);
}

// SQUEEZE-RECTANGULAR-PORTION translates and scales a curve
// so the portion of the curve in the rectangle
// with corners xlo xhi ylo yhi will appear in a display window
// which has x, y coordinates from 0 to 1.
// It is of type (JS-Num, JS-Num, JS-Num, JS-Num --> Curve-Transform).

function squeeze_rectangular_portion(xlo, xhi, ylo, yhi){
  var width = xhi - xlo;
  var height = yhi - ylo;
  if(width === 0 || height === 0){
      throw "attempt to squeeze window to zero";
  }else{
      return compose(scale_x_y(1 / width,
                               1 / height),
                     translate(-xlo, -ylo));
  }
}


// SQUEEZE-FULL-VIEW translates and scales a curve such that
// the ends are fully visible.
// It is very similar to the squeeze-rectangular-portion procedure
// only that that procedure does not allow the edges to be easily seen

function squeeze_full_view(xlo, xhi, ylo, yhi){
  var width = xhi - xlo;
  var height = yhi - ylo;
  if(width === 0 || height === 0){
      throw "attempt to squeeze window to zero";
  }else{
      return compose(scale_x_y(0.99 * 1 / width,
                               0.99 * 1 / height),
                     translate(-(xlo - 0.01), -(ylo - 0.01)));
  }
}

// FULL-VIEW

function full_view_proportional(xlo, xhi, ylo, yhi){
  var width = xhi - xlo;
  var height = yhi - ylo;
  if(width === 0 || height === 0){
      throw "attempt to squeeze window to zero";
  }else{
      var scale_factor = Math.min(0.9 * 1 / width, 0.9 * 1 / height);
      var new_mid_x = scale_factor * (xlo + xhi) / 2;
      var new_mid_y = scale_factor * (ylo + yhi) / 2;
      return compose(translate(0.5 - new_mid_x, 0.5 - new_mid_y), scale_x_y(scale_factor, scale_factor));
  }
}

// PUT-IN-STANDARD-POSITION is a Curve-Transform.
// A curve is in "standard position" if it starts at (0,0) ends at (1,0).
// A curve is PUT-IN-STANDARD-POSITION by rigidly translating it so its
// start point is at the origin, then rotating it about the origin to put
// its endpoint on the x axis, then scaling it to put the endpoint at (1,0).
// Behavior is unspecified on closed curves (with start-point = end-point).

function put_in_standard_position(curve){
  var start_point = curve(0);
  var curve_started_at_origin = translate(-x_of(start_point), -y_of(start_point))(curve);
  var new_end_point = curve_started_at_origin(1);
  var theta = Math.atan2(y_of(new_end_point), x_of(new_end_point));
  var curve_ended_at_x_axis = rotate_around_origin(-theta)(curve_started_at_origin);
  var end_point_on_x_axis = x_of(curve_ended_at_x_axis(1));
  return scale(1 / end_point_on_x_axis)(curve_ended_at_x_axis);
}

                                      // Binary-transform = (Curve,Curve --> Curve)

// CONNECT-RIGIDLY makes a curve consisting of curve1 followed by curve2.

function connect_rigidly(curve1, curve2){
  return function(t){
             if(t < 1/2){
                 return curve1(2 * t);
             }else{
                 return curve2(2 * t - 1);
             }
         }
}

// CONNECT-ENDS makes a curve consisting of curve1 followed by
// a copy of curve2 starting at the end of curve1

function connect_ends(curve1, curve2){
  var start_point_of_curve2 = curve2(0);
  var end_point_of_curve1 = curve1(1);
  return connect_rigidly(curve1,
                         translate(x_of(end_point_of_curve1) - x_of(start_point_of_curve2),
                                   y_of(end_point_of_curve1) - y_of(start_point_of_curve2))(curve2));
}


// function connect_ends(curve1, curve2) {...}

                          // FRACTAL CURVES

// GOSPERIZE is a Curve-Transform

function gosperize(curve){
  var scaled_curve = scale_x_y(Math.sqrt(2) / 2, Math.sqrt(2) / 2)(curve);
  return connect_rigidly(rotate_around_origin(Math.PI / 4)(scaled_curve),
                         translate(0.5, 0.5)(rotate_around_origin(-Math.PI / 4)(scaled_curve)));
}

// GOSPER-CURVE is of type (JS-Num --> Curve)

function gosper_curve(level){
  return repeated(gosperize, level)(unit_line);
}

                      // DRAWING GOSPER CURVES

function show_connected_gosper(level){
  draw_connected(200)(squeeze_rectangular_portion(-0.5, 1.5, -0.5, 1.5)(gosper_curve(level)));
}

function param_gosper(level, angle_at){
  if(level === 0){
      return unit_line;
  }else{
      return param_gosperize(angle_at(level))(param_gosper(level - 1, angle_at));
  }
}

function param_gosperize(theta){
  return function(curve){
             var scale_factor = 1 / Math.cos(theta) / 2;
             var scaled_curve = scale(scale_factor)(curve);
             return connect_rigidly(rotate_around_origin(theta)(scaled_curve),
                                    translate(0.5, Math.sin(theta) * scale_factor)(rotate_around_origin(-theta)(scaled_curve)));
         }
}

                       // DRAGONIZE

// zc-dragonize is a Curve-Transform

function zc_dragonize(n, curve){
  if(n === 0){
      return curve;
  }else{
      var c = zc_dragonize(n - 1, curve);
      return put_in_standard_position(connect_ends(rotate_around_origin(-Math.PI / 2)(c), c));
  }
}

function mingyu_rotate(theta) { // rotates around origin, but less efficiently
  var cth = Math.cos(theta);
  var sth = Math.sin(theta);
  return function (curve) {
             return function(t) {
                        var x = x_of(curve(t)); // Mingyu writes (curve t)
                        var y = y_of(curve(t)); // twice
                        return make_point((cth * x) - (sth * y),
                                          (sth * x) + (cth * y));
                 };
         };
}
