/*
  Support for CS1101S Mission 15
  Sound mission - Tone Matrix

  Author:
  v1 (2014/2015) Su Xuan - September 2014

  Modifier:
  v2 (2016/2017) Xiao Pu - September 2016 - fit source academy IDE
*/

var $tone_matrix; // canvas container for tone matrix

var color_white = '#ffffff'; // color of the highlighted square
var color_white_2 = '#666666'; // color of the adjacent squares
var color_white_3 = '#444444'; // color of the squares that are two units from the highlighted square
var color_on = '#cccccc';
var color_off = '#333333';

// the side length of the squares in the matrix
var square_side_length = 18;

// the distance between two adjacent squares in the matrix
var distance_between_squares = 6;

// margin of the canvas
var margin_length = 20;

// the duration for playing one grid is 0.5s
var grid_duration = 0.5;
// but the duration for playing one entire sound is 1 (which means there will be reverberations)
var sound_duration = 1;

// for playing the tone matrix repeatedly in play_matrix_continuously function
var timeout_matrix;
// for coloring the matrix accordingly while it's being played
var timeout_color;

var timeout_objects = [];

// vector_to_list returns a list that contains the elements of the argument vector
// in the given order.
// vector_to_list throws an exception if the argument is not a vector
function vector_to_list(vector) {
  let result = null;
  for (let i = vector.length - 1; i >= 0; i = i - 1) {
    result = [vector[i], result];
  }
  return result;
}

// given the x, y coordinates of a "click" event
// return the row and column numbers of the clicked square
function x_y_to_row_column(x, y) {
  var row = Math.floor((y - margin_length) / (square_side_length + distance_between_squares));
  var column = Math.floor((x - margin_length) / (square_side_length + distance_between_squares));
  return [row, column];
}

// given the row number of a square, return the leftmost coordinate
function row_to_y(row) {
  return margin_length + row * (square_side_length + distance_between_squares);
}

// given the column number of a square, return the topmost coordinate
function column_to_x(column) {
  return margin_length + column * (square_side_length + distance_between_squares);
}

// return a list representing a particular row
function get_row(row) {
  return vector_to_list(matrix[row]);
}

// return a list representing a particular column
function get_column(column) {
  var result = new Array(16);
  for (var i = 15; i >= 0; i--) {
    result[i] = matrix[i][column];
  }
  return vector_to_list(result);
}

function is_on(row, column) {
  if (row < 0 || row > 15 || column < 0 || column > 15) {
    return;
  }

  return matrix[row][column];
}

// set the color of a particular square
function set_color(row, column, color) {
  if (row < 0 || row > 15 || column < 0 || column > 15) {
    return;
  }

  var ctx = $tone_matrix.getContext('2d');
  ctx.fillStyle = color;

  ctx.fillRect(column_to_x(column), row_to_y(row), square_side_length, square_side_length);
}

// highlight a given square
function highlight_color(row, column, color) {
  set_color(row, column, color);
}

// given the square that we are supposed to highlight, color the neighboring squares
function set_adjacent_color_1(row, column, color) {
  if (!is_on(row, column - 1)) {
    set_color(row, column - 1, color);
  }

  if (!is_on(row, column + 1)) {
    set_color(row, column + 1, color);
  }

  if (!is_on(row - 1, column)) {
    set_color(row - 1, column, color);
  }

  if (!is_on(row + 1, column)) {
    set_color(row + 1, column, color);
  }
}

// given the square that we are supposed to highlight, color the squares 2 units from it
function set_adjacent_color_2(row, column, color) {
  if (!is_on(row, column - 2)) {
    set_color(row, column - 2, color);
  }

  if (!is_on(row + 1, column - 1)) {
    set_color(row + 1, column - 1, color);
  }

  if (!is_on(row + 2, column)) {
    set_color(row + 2, column, color);
  }

  if (!is_on(row + 1, column + 1)) {
    set_color(row + 1, column + 1, color);
  }

  if (!is_on(row, column + 2)) {
    set_color(row, column + 2, color);
  }

  if (!is_on(row - 1, column + 1)) {
    set_color(row - 1, column + 1, color);
  }

  if (!is_on(row - 2, column)) {
    set_color(row - 2, column, color);
  }

  if (!is_on(row - 1, column - 1)) {
    set_color(row - 1, column - 1, color);
  }
}

// redraw a matrix according to the current state of the matrix
function redraw_matrix() {
  for (var i = 15; i >= 0; i--) {
    for (var j = 15; j >= 0; j--) {
      if (matrix[i][j]) {
        set_color(i, j, color_on);
      } else {
        set_color(i, j, color_off);
      }
    }
  }
}

var ToneMatrix = {};

function initialise_matrix($container) {
  if (!$tone_matrix) {
    $tone_matrix = document.createElement('canvas');
    $tone_matrix.width = 420;
    $tone_matrix.height = 420;
    // the array representing the configuration of the matrix
    matrix = new Array(16);

    // the visualisation of the matrix itself
    var ctx = $tone_matrix.getContext('2d');

    // draw the initial matrix
    for (var i = 15; i >= 0; i--) {
      matrix[i] = new Array(16);
      for (var j = 15; j >= 0; j--) {
        set_color(i, j, color_off);
        matrix[i][j] = false;
      }
    }

    bind_events_to_rect($tone_matrix);
  }
  $tone_matrix.hidden = false;
  $container.appendChild($tone_matrix);
}
ToneMatrix.initialise_matrix = initialise_matrix;

// bind the click events to the matrix
function bind_events_to_rect(c) {
  c.addEventListener(
    'click',
    function (event) {
      // calculate the x, y coordinates of the click event
      var rect = c.getBoundingClientRect();
      var offset_top = rect.top + document.documentElement.scrollTop;
      var offset_left = rect.left + document.documentElement.scrollLeft;
      var x = event.pageX - offset_left;
      var y = event.pageY - offset_top;

      // obtain the row and column numbers of the square clicked
      var row_column = x_y_to_row_column(x, y);
      var row = row_column[0];
      var column = row_column[1];

      if (row < 0 || row > 15 || column < 0 || column > 15) {
        return;
      }

      if (matrix[row][column] == undefined || !matrix[row][column]) {
        matrix[row][column] = true;
        set_color(row, column, color_on);
      } else {
        matrix[row][column] = false;
        set_color(row, column, color_off);
      }
    },
    false
  );
}

function random_animate() {
  for (var i = 5; i >= 0; i--) {
    var row = Math.floor(Math.random() * 16);
    var column = Math.floor(Math.random() * 16);
    if (!is_on(row, column)) {
      set_color(row, column, color_white_3);
    }
  }

  for (var i = 10; i >= 0; i--) {
    var row = Math.floor(Math.random() * 16);
    var column = Math.floor(Math.random() * 16);
    if (!is_on(row, column)) {
      set_color(row, column, color_off);
    }
  }
}

function animate_column(n) {
  if (n < 0 || n > 15) {
    return;
  }

  var column = list_to_vector(get_column(n));

  for (var j = 0; j <= 15; j++) {
    if (column[j]) {
      // if a particular square is clicked, highlight itself
      // and the neighboring squares in the animation
      highlight_color(j, n, color_white);
      set_adjacent_color_1(j, n, color_white_2);
      set_adjacent_color_2(j, n, color_white_3);
    }
  }
}

function unanimate_column(n) {
  if (n < 0 || n > 15) {
    return;
  }

  var column = list_to_vector(get_column(n));

  for (var j = 0; j <= 15; j++) {
    if (column[j]) {
      highlight_color(j, n, color_on);
      set_adjacent_color_1(j, n, color_off);
      set_adjacent_color_2(j, n, color_off);
    }
  }
}

// generate a randomised matrix
function randomise_matrix() {
  var ctx = $tone_matrix.getContext('2d');
  var on; // the square in the matrix is on or off

  clear_matrix();
  // draw the randomised matrix
  for (var i = 15; i >= 0; i--) {
    for (var j = 15; j >= 0; j--) {
      on = Math.random() > 0.9;
      if (on) {
        set_color(i, j, color_on);
        matrix[i][j] = true;
      } else {
        set_color(i, j, color_off);
        matrix[i][j] = false;
      }
    }
  }
}
ToneMatrix.randomise_matrix = randomise_matrix;

function bindMatrixButtons() {
  document.getElementById('clear-matrix').addEventListener('click', function () {
    clear_matrix();
    document.getElementById('play-matrix').setAttribute('value', 'Play');
  });
}
ToneMatrix.bindMatrixButtons = bindMatrixButtons;

// ********** THE FOLLOWING FUNCTIONS ARE EXPOSED TO STUDENTS **********
// return the current state of the matrix, represented by a list of lists of bits
function get_matrix() {
  if (!matrix) {
    throw new Error('Please activate the tone matrix first by clicking on the tab!');
  }
  var matrix_list = matrix.slice(0);
  var result = [];
  for (var i = 0; i <= 15; i++) {
    result[i] = vector_to_list(matrix_list[15 - i]);
  }

  return vector_to_list(result);
}

// reset the matrix to the initial state
function clear_matrix() {
  matrix = new Array(16);
  var ctx = $tone_matrix.getContext('2d');

  // draw the initial matrix
  for (var i = 15; i >= 0; i--) {
    matrix[i] = new Array(16);
    for (var j = 15; j >= 0; j--) {
      set_color(i, j, color_off);
      matrix[i][j] = false;
    }
  }
}

ToneMatrix.clear_matrix = clear_matrix;

var set_time_out_renamed = window.setTimeout;

function set_timeout(f, t) {
  if (typeof f === 'function' && typeof t === 'number') {
    var timeoutObj = set_time_out_renamed(f, t);
    timeout_objects.push(timeoutObj);
  } else {
    throw new Error('set_timeout(f, t) expects a function and a number respectively.');
  }
}

function clear_all_timeout() {
  for (var i = timeout_objects.length - 1; i >= 0; i--) {
    clearTimeout(timeout_objects[i]);
  }

  timeout_objects = [];
}
