var viewport_size = 512; // This is the height of the viewport
// while a curve is approximated by a polygon,
// the side of the polygon will be no longer than maxArcLength pixels
var maxArcLength = 20;

/*-----------------------Some class definitions----------------------*/
function PrimaryShape(first, count) {
  this.isPrimary = true; // this is a primary shape
  this.first = first; // the first index in the index buffer
  // that belongs to this shape
  this.count = count; // number of indices to draw the shape
}

function Shape() {
  this.isPrimary = false;
  this.transMatrix = mat4.create();
  this.shapes = [];
  this.color = undefined;
}

// set the transformation matrix related to the shape
Shape.prototype.setM = function(matrix) {
  this.transMatrix = matrix;
};

// get the transformation matrix related to the shape
Shape.prototype.getM = function() {
  return this.transMatrix;
};

// get the sub-shapes (array) of the shape
Shape.prototype.getS = function() {
  return this.shapes;
};

Shape.prototype.setS = function(shapes) {
  this.shapes = shapes;
};

Shape.prototype.addS = function(shape) {
  this.shapes.push(shape);
};

Shape.prototype.getColor = function() {
  return this.color;
};

Shape.prototype.setColor = function(color) {
  this.color = color;
};

/*-----------------Initialize vertex and index buffer----------------*/
// vertices is an array of points
// Each point has the following attribute, in that order:
// x, y, z, t
// (will be converted to Float32Array later)
var vertices = [
  // center
  0.0,
  0.0,
  0.0,
  1.0,
  // 4 corners and 4 sides' midpoints
  1.0,
  0.0,
  0.0,
  1.0,
  1.0,
  1.0,
  0.0,
  1.0,
  0.0,
  1.0,
  0.0,
  1.0,
  -1.0,
  1.0,
  0.0,
  1.0,
  -1.0,
  0.0,
  0.0,
  1.0,
  -1.0,
  -1.0,
  0.0,
  1.0,
  0.0,
  -1.0,
  0.0,
  1.0,
  1.0,
  -1.0,
  0.0,
  1.0,
  // for rcross_bb
  0.5,
  0.5,
  0.0,
  1.0,
  -0.5,
  0.5,
  0.0,
  1.0,
  -0.5,
  -0.5,
  0.0,
  1.0,
  0.5,
  -0.5,
  0.0,
  1.0,
  // for nova_bb
  0.0,
  0.5,
  0.0,
  1.0,
  -0.5,
  0.0,
  0.0,
  1.0
];
// indices is an array of indices, each refer to a point in vertices
// (will be converted to Uint16Array later)
var indices = [
  // black_bb
  2,
  4,
  6,
  2,
  6,
  8,
  // rcross_bb
  2,
  4,
  10,
  2,
  9,
  10,
  2,
  9,
  12,
  2,
  12,
  8,
  10,
  11,
  12,
  // sail_bb
  7,
  8,
  3,
  // corner_bb
  1,
  2,
  3,
  // nova_bb
  3,
  0,
  14,
  13,
  0,
  1
];

function makeCircle() {
  // draw a polygon with many vertices to approximate a circle
  var centerVerInd = 0;
  var firstVer = vertices.length / 4;
  var firstInd = indices.length;
  var numPoints = Math.ceil(Math.PI * viewport_size / maxArcLength);
  // generate points and store it in the vertex buffer
  for (var i = 0; i < numPoints; i++) {
    var angle = Math.PI * 2 * i / numPoints;
    vertices.push(Math.cos(angle), Math.sin(angle), 0, 1);
  }
  // generate indices for the triangles and store in the index buffer
  for (var i = firstVer; i < firstVer + numPoints - 1; i++) {
    indices.push(centerVerInd, i, i + 1);
  }
  indices.push(centerVerInd, firstVer, firstVer + numPoints - 1);
  var count = 3 * numPoints;
  return new PrimaryShape(firstInd, count);
}

function makeHeart() {
  var bottomMidInd = 7;
  var firstVer = vertices.length / 4;
  var firstInd = indices.length;
  var root2 = Math.sqrt(2);
  var r = 4 / (2 + 3 * root2);
  var scaleX = 1 / (r * (1 + root2 / 2));
  var numPoints = Math.ceil(Math.PI / 2 * viewport_size * r / maxArcLength);
  // right semi-circle
  var rightCenterX = r / root2;
  var rightCenterY = 1 - r;
  for (var i = 0; i < numPoints; i++) {
    var angle = Math.PI * (-1 / 4 + i / numPoints);
    vertices.push(
      (Math.cos(angle) * r + rightCenterX) * scaleX,
      Math.sin(angle) * r + rightCenterY,
      0,
      1
    );
  }
  // left semi-circle
  var leftCenterX = -r / root2;
  var leftCenterY = 1 - r;
  for (var i = 0; i <= numPoints; i++) {
    var angle = Math.PI * (1 / 4 + i / numPoints);
    vertices.push(
      (Math.cos(angle) * r + leftCenterX) * scaleX,
      Math.sin(angle) * r + leftCenterY,
      0,
      1
    );
  }
  // update index buffer
  for (var i = firstVer; i < firstVer + 2 * numPoints; i++) {
    indices.push(bottomMidInd, i, i + 1);
  }
  var count = 3 * 2 * numPoints;
  return new PrimaryShape(firstInd, count);
}

function makePentagram() {
  var firstVer = vertices.length / 4;
  var firstInd = indices.length;

  var v1 = Math.sin(Math.PI / 10);
  var v2 = Math.cos(Math.PI / 10);

  var w1 = Math.sin(3 * Math.PI / 10);
  var w2 = Math.cos(3 * Math.PI / 10);

  vertices.push(v2, v1, 0, 1);
  vertices.push(w2, -w1, 0, 1);
  vertices.push(-w2, -w1, 0, 1);
  vertices.push(-v2, v1, 0, 1);
  vertices.push(0, 1, 0, 1);

  for (var i = 0; i < 5; i++) {
    indices.push(0, firstVer + i, firstVer + (i + 2) % 5);
  }

  return new PrimaryShape(firstInd, 15);
}

function makeRibbon() {
  var firstVer = vertices.length / 4;
  var firstInd = indices.length;

  var theta_max = 30;
  var thickness = -1 / theta_max;
  var unit = 0.1;

  for (var i = 0; i < theta_max; i += unit) {
    vertices.push(
      i / theta_max * Math.cos(i),
      i / theta_max * Math.sin(i),
      0,
      1
    );
    vertices.push(
      Math.abs(Math.cos(i) * thickness) + i / theta_max * Math.cos(i),
      Math.abs(Math.sin(i) * thickness) + i / theta_max * Math.sin(i),
      0,
      1
    );
  }

  var totalPoints = Math.ceil(theta_max / unit) * 2;

  for (var i = firstVer; i < firstVer + totalPoints - 2; i++) {
    indices.push(i, i + 1, i + 2);
  }

  return new PrimaryShape(firstInd, 3 * totalPoints - 6);
}

var black_bb = new PrimaryShape(0, 6);
var blank_bb = new PrimaryShape(0, 0);
var rcross_bb = new PrimaryShape(6, 15);
var sail_bb = new PrimaryShape(21, 3);
var corner_bb = new PrimaryShape(24, 3);
var nova_bb = new PrimaryShape(27, 6);
var circle_bb = makeCircle();
var heart_bb = makeHeart();
var pentagram_bb = makePentagram();
var ribbon_bb = makeRibbon();

// convert vertices and indices to typed arrays
vertices = new Float32Array(vertices);
indices = new Uint16Array(indices);

/*-----------------------Drawing functions----------------------*/
function generateFlattenedShapeList(shape) {
  var matStack = [];
  var matrix = mat4.create();
  var shape_list = {};
  function pushMat() {
    matStack.push(mat4.clone(matrix));
  }
  function popMat() {
    if (matStack.length == 0) {
      throw 'Invalid pop matrix!';
    } else {
      matrix = matStack.pop();
    }
  }
  function helper(shape, color) {
    if (shape.isPrimary) {
      if (shape.count === 0) {
        // this is blank_bb, do nothing
        return;
      }
      if (!shape_list[shape.first]) {
        shape_list[shape.first] = {
          shape: shape,
          matrices: [],
          colors: []
        };
      }
      shape_list[shape.first].matrices.push(matrix);
      shape_list[shape.first].colors.push(color || [0, 0, 0, 1]);
    } else {
      if (color === undefined && shape.getColor() !== undefined) {
        color = shape.getColor();
      }
      pushMat();
      mat4.multiply(matrix, matrix, shape.getM());
      var childShapes = shape.getS();
      for (var i = 0; i < childShapes.length; i++) {
        helper(childShapes[i], color);
      }
      popMat();
    }
  }
  function flatten(matrices, colors) {
    var instanceArray = new Float32Array(matrices.length * 20);
    for (var i = 0; i < matrices.length; i++) {
      instanceArray.set(matrices[i], 20 * i);
      instanceArray.set(colors[i], 20 * i + 16);
    }
    return instanceArray;
  }
  helper(shape);
  var flattened_shape_list = [];
  // draw a white square background first
  flattened_shape_list.push({
    shape: black_bb,
    instanceArray: new Float32Array([
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      -1,
      1,
      1,
      1,
      1,
      1
    ])
  });
  for (var key in shape_list) {
    if (shape_list.hasOwnProperty(key)) {
      var shape = shape_list[key].shape;
      var instanceArray = flatten(
        shape_list[key].matrices,
        shape_list[key].colors
      );
      flattened_shape_list.push({ shape: shape, instanceArray: instanceArray });
    }
  }
  return flattened_shape_list;
}

function drawWithWebGL(flattened_shape_list, drawFunction) {
  for (var i = 0; i < flattened_shape_list.length; i++) {
    var shape = flattened_shape_list[i].shape;
    var instanceArray = flattened_shape_list[i].instanceArray;
    drawFunction(shape.first, shape.count, instanceArray);
  }
}

function show(shape) {
  clear_viewport();
  var flattened_shape_list = generateFlattenedShapeList(shape);
  drawWithWebGL(flattened_shape_list, drawRune);
  return new ShapeDrawn();
}

function anaglyph(shape) {
  clear_viewport();
  clearAnaglyphFramebuffer();
  var flattened_shape_list = generateFlattenedShapeList(shape);
  drawWithWebGL(flattened_shape_list, drawAnaglyph);
  return new ShapeDrawn();
}

var hollusionTimeout;
function hollusion(shape, num) {
  clear_viewport();
  var num = num > 3 ? num : 3;
  var flattened_shape_list = generateFlattenedShapeList(shape);
  var frame_list = [];
  for (var j = 0; j < num; j++) {
    var frame = open_pixmap('frame' + j, viewport_size, viewport_size, false);
    for (var i = 0; i < flattened_shape_list.length; i++) {
      var shape = flattened_shape_list[i].shape;
      var instanceArray = flattened_shape_list[i].instanceArray;
      var cameraMatrix = mat4.create();
      mat4.lookAt(
        cameraMatrix,
        vec3.fromValues(
          -halfEyeDistance + j / (num - 1) * 2 * halfEyeDistance,
          0,
          0
        ),
        vec3.fromValues(0, 0, -0.4),
        vec3.fromValues(0, 1, 0)
      );
      draw3D(
        shape.first,
        shape.count,
        instanceArray,
        cameraMatrix,
        [1, 1, 1, 1],
        null,
        true
      );
    }
    gl.finish();
    copy_viewport(gl.canvas, frame);
    frame_list.push(frame);
    clear_viewport();
  }
  for (var i = frame_list.length - 2; i > 0; i--) {
    frame_list.push(frame_list[i]);
  }

  function animate() {
    var frame = frame_list.shift();
    copy_viewport_webGL(frame);
    frame_list.push(frame);
    hollusionTimeout = setTimeout(animate, 500 / num);
  }
  animate();
  return new ShapeDrawn();
}

function clearHollusion() {
  clearTimeout(hollusionTimeout);
}

function stereogram(shape) {
  clear_viewport();
  var flattened_shape_list = generateFlattenedShapeList(shape);
  var depth_map = open_pixmap('depth_map', viewport_size, viewport_size, true);
  // draw the depth map
  for (var i = 0; i < flattened_shape_list.length; i++) {
    var shape = flattened_shape_list[i].shape;
    var instanceArray = flattened_shape_list[i].instanceArray;
    drawRune(shape.first, shape.count, instanceArray);
  }
  gl.finish();
  copy_viewport(gl.canvas, depth_map);

  // copy from the old library, with some modifications
  var E = 100; //; distance between eyes, 300 pixels
  var D = 600; //distance between eyes and image plane, 600 pixels
  var delta = 40; //stereo seperation
  var MAX_X = depth_map.width;
  var MAX_Y = depth_map.height;
  var MAX_Z = 0;
  var CENTRE = Math.round(MAX_X / 2);

  var stereo_data = depth_map
    .getContext('2d')
    .createImageData(depth_map.width, depth_map.height);
  var pixels = stereo_data.data;
  var depth_data = depth_map
    .getContext('2d')
    .getImageData(0, 0, depth_map.width, depth_map.height);
  var depth_pix = depth_data.data;
  function get_depth(x, y) {
    if (x >= 0 && x < MAX_X) {
      var tgt = 4 * (y * depth_map.width + x);
      return -100 * depth_pix[tgt] / 255 - 400;
    } else return -500;
  }
  for (var y = 0; y < MAX_Y; y++) {
    //may want to use list of points instead
    var link_left = [];
    var link_right = [];
    var colours = [];
    //varraint creation
    for (var x = 0; x < MAX_X; x++) {
      var z = get_depth(x, y);
      var s = delta + z * (E / (z - D)); // Determine distance between intersection of lines of sight on image plane
      var left = x - Math.round(s / 2); //x is integer, left is integer
      var right = left + Math.round(s); //right is integer
      if (left > 0 && right < MAX_X) {
        if (
          (!link_right[left] || s < link_right[left]) &&
          (!link_left[right] || s < link_left[right])
        ) {
          link_right[left] = Math.round(s);
          link_left[right] = Math.round(s);
        }
      }
    }
    //varraint resolution
    for (var x = 0; x < MAX_X; x++) {
      var s = link_left[x];
      if (s == undefined) s = Infinity;
      else s = x;
      var d;
      if (x - s > 0) d = link_right[x - s];
      else d = Infinity;
      if (s == Infinity || s > d) link_left[x] = 0;
    }
    //drawing step
    for (var x = 0; x < MAX_X; x++) {
      var s = link_left[x]; //should be valid for any integer till MAX_X
      var colour = colours[x - s] || [
        Math.round(Math.round(Math.random() * 10 / 9) * 255),
        Math.round(Math.round(Math.random() * 10 / 9) * 255),
        Math.round(Math.round(Math.random() * 10 / 9) * 255)
      ];
      var tgt = 4 * (y * depth_map.width + x);
      pixels[tgt] = colour[0];
      pixels[tgt + 1] = colour[1];
      pixels[tgt + 2] = colour[2];
      pixels[tgt + 3] = 255;
      colours[x] = colour;
    }
  }
  //throw on canvas
  depth_map.getContext('2d').putImageData(stereo_data, 0, 0);
  copy_viewport_webGL(depth_map);
  return new ShapeDrawn();
}

/*-----------------------Color functions----------------------*/
function hexToColor(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
    1
  ];
}

/**
 * Function to add color to shape by specifying the red, green, blue value.
 * Opacity is kept at default value of 1. (Full opacity)
 * @param {*} shape The shape to add color to.
 * @param {*} r The red value.
 * @param {*} g The green value.
 * @param {*} b The blue value.
 */
function color(shape, r, g, b) {
  var wrapper = new Shape();
  wrapper.addS(shape);
  var color = [
    r,
    g,
    b,
    1
  ]
  wrapper.setColor(color);
  return wrapper;
}

function addColorFromHex(shape, hex) {
  var wrapper = new Shape();
  wrapper.addS(shape);
  wrapper.setColor(hexToColor(hex));
  return wrapper;
}

function random_color(shape) {
  var wrapper = new Shape();
  wrapper.addS(shape);
  var randomColor = hexToColor(
    colorPalette[Math.floor(Math.random() * colorPalette.length)]
  );
  wrapper.setColor(randomColor);
  return wrapper;
}

// black and white not included because they are boring colors
// colorPalette is used in generateFlattenedShapeList to generate a random color
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
];

function red(shape) {
  return addColorFromHex(shape, '#F44336');
}

function pink(shape) {
  return addColorFromHex(shape, '#E91E63');
}

function purple(shape) {
  return addColorFromHex(shape, '#AA00FF');
}

function indigo(shape) {
  return addColorFromHex(shape, '#3F51B5');
}

function blue(shape) {
  return addColorFromHex(shape, '#2196F3');
}

function green(shape) {
  return addColorFromHex(shape, '#4CAF50');
}

function yellow(shape) {
  return addColorFromHex(shape, '#FFEB3B');
}

function orange(shape) {
  return addColorFromHex(shape, '#FF9800');
}

function brown(shape) {
  return addColorFromHex(shape, '#795548');
}

function black(shape) {
  return addColorFromHex(shape, '#000000');
}

function white(shape) {
  return addColorFromHex(shape, '#FFFFFF');
}

/*-----------------------Transformation functions----------------------*/
function scale_independent(ratio_x, ratio_y, shape) {
  var scaleVec = vec3.fromValues(ratio_x, ratio_y, 1);
  var scaleMat = mat4.create();
  mat4.scale(scaleMat, scaleMat, scaleVec);
  var wrapper = new Shape();
  wrapper.addS(shape);
  wrapper.setM(scaleMat);
  return wrapper;
}

function scale(ratio, shape) {
  return scale_independent(ratio, ratio, shape);
}

function translate(x, y, shape) {
  var translateVec = vec3.fromValues(x, -y, 0);
  var translateMat = mat4.create();
  mat4.translate(translateMat, translateMat, translateVec);
  var wrapper = new Shape();
  wrapper.addS(shape);
  wrapper.setM(translateMat);
  return wrapper;
}

function rotate(rad, shape) {
  var rotateMat = mat4.create();
  mat4.rotateZ(rotateMat, rotateMat, rad);
  var wrapper = new Shape();
  wrapper.addS(shape);
  wrapper.setM(rotateMat);
  return wrapper;
}

function stack_frac(frac, shape1, shape2) {
  var upper = translate(0, -(1 - frac), scale_independent(1, frac, shape1));
  var lower = translate(0, frac, scale_independent(1, 1 - frac, shape2));
  var combined = new Shape();
  combined.setS([upper, lower]);
  return combined;
}

function stack(shape1, shape2) {
  return stack_frac(1 / 2, shape1, shape2);
}

function stackn(n, shape) {
  if (n === 1) {
    return shape;
  } else {
    return stack_frac(1 / n, shape, stackn(n - 1, shape));
  }
}

function quarter_turn_right(shape) {
  return rotate(-Math.PI / 2, shape);
}

function quarter_turn_left(shape) {
  return rotate(Math.PI / 2, shape);
}

function turn_upside_down(shape) {
  return rotate(Math.PI, shape);
}

function beside_frac(frac, shape1, shape2) {
  var left = translate(-(1 - frac), 0, scale_independent(frac, 1, shape1));
  var right = translate(frac, 0, scale_independent(1 - frac, 1, shape2));
  var combined = new Shape();
  combined.setS([left, right]);
  return combined;
}

function beside(shape1, shape2) {
  return beside_frac(1 / 2, shape1, shape2);
}

function flip_vert(shape) {
  return scale_independent(1, -1, shape);
}

function flip_horiz(shape) {
  return scale_independent(-1, 1, shape);
}

function make_cross(shape) {
  return stack(
    beside(quarter_turn_right(shape), rotate(Math.PI, shape)),
    beside(shape, rotate(Math.PI / 2, shape))
  );
}

function repeat_pattern(n, pattern, shape) {
  if (n === 0) {
    return shape;
  } else {
    return pattern(repeat_pattern(n - 1, pattern, shape));
  }
}

function overlay_frac(frac, shape1, shape2) {
  var front = new Shape();
  front.addS(shape1);
  var frontMat = front.getM();
  // z: scale by frac
  mat4.scale(frontMat, frontMat, vec3.fromValues(1, 1, frac));

  var back = new Shape();
  back.addS(shape2);
  var backMat = back.getM();
  // z: scale by (1-frac), translate by -frac
  mat4.scale(
    backMat,
    mat4.translate(backMat, backMat, vec3.fromValues(0, 0, -frac)),
    vec3.fromValues(1, 1, 1 - frac)
  );

  var combined = new Shape();
  combined.setS([front, back]); // render front first to avoid redrawing
  return combined;
}

function overlay(shape1, shape2) {
  return overlay_frac(0.5, shape1, shape2);
}
