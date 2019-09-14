/*
  Support for CS1101S Mission 15
  Sound mission - Tone Matrix

  Author:
  v1 (2014/2015) Su Xuan - September 2014

  Modifier:
  v2 (2016/2017) Xiao Pu - September 2016 - fit source academy IDE
*/

var $tone_matrix; // canvas container for tone matrix

var color_white = "#ffffff"; // color of the highlighted square
var color_white_2 = "#666666"; // color of the adjacent squares
var color_white_3 = "#444444"; // color of the squares that are two units from the highlighted square
var color_on = "#cccccc";
var color_off = "#333333";

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

var timeout_objects = new Array();

// given the x, y coordinates of a "click" event
// return the row and column numbers of the clicked square
function x_y_to_row_column(x, y) {
  var row = Math.floor((y - margin_length) / (square_side_length + distance_between_squares));
  var column = Math.floor((x - margin_length) / (square_side_length + distance_between_squares));
  return Array(row, column);
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
  };
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

  var ctx = $tone_matrix.getContext("2d");
  ctx.fillStyle = color;

  ctx.fillRect(column_to_x(column),
    row_to_y(row),
    square_side_length,
    square_side_length);
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
    };
  };
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
    var ctx = $tone_matrix.getContext("2d");

    // draw the initial matrix
    for (var i = 15; i >= 0; i--) {
      matrix[i] = new Array(16);
      for (var j = 15; j >= 0; j--) {
        set_color(i, j, color_off);
        matrix[i][j] = false;
      };
    };

    bind_events_to_rect($tone_matrix);
  }
  $tone_matrix.hidden = false
  $container.appendChild($tone_matrix)
}
ToneMatrix.initialise_matrix = initialise_matrix;

// bind the click events to the matrix
function bind_events_to_rect(c) {
  c.addEventListener('click', function (event) {
    // calculate the x, y coordinates of the click event
    var offset_left = $(this).offset().left;
    var offset_top = $(this).offset().top;
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
  }, false);
}

function random_animate() {
  for (var i = 5; i >= 0; i--) {
    var row = Math.floor(Math.random() * 16);
    var column = Math.floor(Math.random() * 16);
    if (!is_on(row, column)) {
      set_color(row, column, color_white_3);
    }
  };

  for (var i = 10; i >= 0; i--) {
    var row = Math.floor(Math.random() * 16);
    var column = Math.floor(Math.random() * 16);
    if (!is_on(row, column)) {
      set_color(row, column, color_off);
    }
  };
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
  };
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
  };
}

// generate a randomised matrix
function randomise_matrix() {
  var ctx = $tone_matrix.getContext("2d");
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
    };
  };
}
ToneMatrix.randomise_matrix = randomise_matrix;

function bindMatrixButtons() {
  $("#clear-matrix").on("click", function () {
    clear_matrix();
    // stop_matrix();
    $("#play-matrix").attr("value", "Play");
  });

  // $("#play-matrix").on("click", function () {
  //     if ($(this).attr("value") == "Play") {
  //         $(this).attr("value", "Stop");
  //         play_matrix_continuously();
  //     } else {
  //         $(this).attr("value", "Play");
  //         // stop_matrix();
  //         redraw_matrix();
  //     }
  // });

  // $("#random-matrix").on("click", function () {
  //     randomise_matrix();
  // });
};
ToneMatrix.bindMatrixButtons = bindMatrixButtons;

// ********** THE FOLLOWING FUNCTIONS ARE EXPOSED TO STUDENTS **********
// return the current state of the matrix, represented by a list of lists of bits
function get_matrix() {
  if (!matrix) {
    throw new Error("Please activate the tone matrix first by clicking on the tab!")
  }
  var matrix_list = matrix.slice(0);
  var result = [];
  for (var i = 0; i <= 15; i++) {
    result[i] = vector_to_list(matrix_list[15 - i]);
  };

  return vector_to_list(result);
}

// reset the matrix to the initial state
function clear_matrix() {
  matrix = new Array(16);
  var ctx = $tone_matrix.getContext("2d");

  // draw the initial matrix
  for (var i = 15; i >= 0; i--) {
    matrix[i] = new Array(16);
    for (var j = 15; j >= 0; j--) {
      set_color(i, j, color_off);
      matrix[i][j] = false;
    };
  };
}

ToneMatrix.clear_matrix = clear_matrix;

var set_time_out_renamed = window.setTimeout;

function set_timeout(f, t) {
  var timeoutObj = set_time_out_renamed(f, t);
  timeout_objects.push(timeoutObj);
}

function clear_all_timeout() {
  for (var i = timeout_objects.length - 1; i >= 0; i--) {
    clearTimeout(timeout_objects[i]);
  };

  timeout_objects = new Array();
}

// functions from mission 14
function letter_name_to_midi_note(note) {
  // we don't consider double flat/ double sharp
  var note = note.split("");
  var res = 12; //MIDI notes for mysterious C0
  var n = note[0].toUpperCase();
  switch (n) {
    case 'D':
      res = res + 2;
      break;

    case 'E':
      res = res + 4;
      break;

    case 'F':
      res = res + 5;
      break;

    case 'G':
      res = res + 7;
      break;

    case 'A':
      res = res + 9;
      break;

    case 'B':
      res = res + 11;
      break;

    default:
      break;
  }

  if (note.length === 2) {
    res = parseInt(note[1]) * 12 + res;
  } else if (note.length === 3) {
    switch (note[1]) {
      case '#':
        res = res + 1;
        break;

      case 'b':
        res = res - 1;
        break;

      default:
        break;
    }
    res = parseInt(note[2]) * 12 + res;
  }

  return res;
}

function letter_name_to_frequency(note) {
  return midi_note_to_frequency(note_to_midi_note(note));
}

function midi_note_to_frequency(note) {
  return 8.1757989156 * Math.pow(2, (note / 12));
}

function linear_decay(decay_period) {
  return function (t) {
    if ((t > decay_period) || (t < 0)) {
      return 0;
    } else {
      return 1 - (t / decay_period);
    }
  }
}

/**
 * Returns an envelope: a function from Sound to Sound.
 * When the envelope is applied to a Sound, it returns
 * a new Sound that results from applying ADSR to
 * the given Sound. The Attack, Sustain and
 * Release ratios are given in the first, second and fourth
 * arguments, and the Sustain level is given in 
 * the third argument as a fraction between 0 and 1.
 * @param {Number} attack_ratio - proportion of Sound in attack phase
 * @param {Number} decay_ratio - proportion of Sound decay phase
 * @param {Number} sustain_level - sustain level between 0 and 1
 * @param {Number} release_ratio - proportion of Sound release phase
 * @returns {function} envelope: function from Sound to Sound
 */
function adsr(attack_ratio, decay_ratio, sustain_level, release_ratio) {
  return sound => {
    var wave = get_wave(sound);
    var duration = get_duration(sound);
    var attack_time = duration * attack_ratio;
    var decay_time = duration * decay_ratio;
    var release_time = duration * release_ratio;
    return make_sound( x => {
      if (x < attack_time) {
        return wave(x) * (x / attack_time);
      } else if (x < attack_time + decay_time) {
        return ((1 - sustain_level) * (linear_decay(decay_time))(x - attack_time) + sustain_level) * wave(x);
      } else if (x < duration - release_time) {
        return wave(x) * sustain_level;
      } else if (x <= duration) {
        return wave(x) * sustain_level * (linear_decay(release_time))(x - (duration - release_time));
      } else {
        return 0;
      }
    }, duration);
  };
}

// waveform is a function that accepts freq, dur and returns Sound
/**
 * Returns a Sound that results from applying a list of envelopes
 * to a given wave form. The wave form should be a Sound generator that
 * takes a frequency and a duration as arguments and produces a
 * Sound with the given frequency and duration. Each envelope is
 * applied to a harmonic: the first harmonic has the given frequency,
 * the second has twice the frequency, the third three times the
 * frequency etc.
 * @param {function} waveform - function from frequency and duration to Sound
 * @param {Number} base_frequency - frequency of the first harmonic
 * @param {Number} duration - duration of the produced Sound, in seconds
 * @param {list_of_envelope} envelopes - each a function from Sound to Sound
 * @returns {Sound} resulting Sound
 */
function stacking_adsr(waveform, base_frequency, duration, envelopes) {
  function zip(lst, n) {
    if (is_null(lst)) {
      return lst;
    } else {
      return pair(pair(n, head(lst)), zip(tail(lst), n + 1));
    }
  }

  return simultaneously(accumulate(
      (x, y) => pair((tail(x))
		     (waveform(base_frequency * head(x), duration))
		     , y)
      , null
      , zip(envelopes, 1)));
}

// instruments for students

/**
 * returns a Sound that is reminiscent of a trombone, playing
 * a given note for a given <CODE>duration</CODE> of seconds
 * @param {Number} note - midi note
 * @param {Number} duration - duration in seconds
 * @returns {Sound} resulting trombone Sound with given given pitch and duration
 */
function trombone(note, duration) {
  return stacking_adsr(square_sound, midi_note_to_frequency(note), duration,
    list(adsr(0.2, 0, 1, 0.1),
      adsr(0.3236, 0.6, 0, 0.1)));
}

/**
 * returns a Sound that is reminiscent of a piano, playing
 * a given note for a given <CODE>duration</CODE> of seconds
 * @param {Number} note - midi note
 * @param {Number} duration - duration in seconds
 * @returns {Sound} resulting piano Sound with given given pitch and duration
 */
function piano(note, duration) {
  return stacking_adsr(triangle_sound, midi_note_to_frequency(note), duration,
    list(adsr(0, 0.515, 0, 0.05),
      adsr(0, 0.32, 0, 0.05),
      adsr(0, 0.2, 0, 0.05)));
}

/**
 * returns a Sound that is reminiscent of a bell, playing
 * a given note for a given <CODE>duration</CODE> of seconds
 * @param {Number} note - midi note
 * @param {Number} duration - duration in seconds
 * @returns {Sound} resulting bell Sound with given given pitch and duration
 */
function bell(note, duration) {
  return stacking_adsr(square_sound, midi_note_to_frequency(note), duration,
    list(adsr(0, 0.6, 0, 0.05),
      adsr(0, 0.6618, 0, 0.05),
      adsr(0, 0.7618, 0, 0.05),
      adsr(0, 0.9071, 0, 0.05)));
}

/**
 * returns a Sound that is reminiscent of a violin, playing
 * a given note for a given <CODE>duration</CODE> of seconds
 * @param {Number} note - midi note
 * @param {Number} duration - duration in seconds
 * @returns {Sound} resulting violin Sound with given given pitch and duration
 */
function violin(note, duration) {
  return stacking_adsr(sawtooth_sound, midi_note_to_frequency(note), duration,
    list(adsr(0.35, 0, 1, 0.15),
      adsr(0.35, 0, 1, 0.15),
      adsr(0.45, 0, 1, 0.15),
      adsr(0.45, 0, 1, 0.15)));
}

/**
 * returns a Sound that is reminiscent of a cello, playing
 * a given note for a given <CODE>duration</CODE> of seconds
 * @param {Number} note - midi note
 * @param {Number} duration - duration in seconds
 * @returns {Sound} resulting cello Sound with given given pitch and duration
 */
function cello(note, duration) {
  return stacking_adsr(square_sound, midi_note_to_frequency(note), duration,
    list(adsr(0.05, 0, 1, 0.1),
      adsr(0.05, 0, 1, 0.15),
      adsr(0, 0, 0.2, 0.15)));
}

function string_to_list_of_numbers(string) {
  var array_of_numbers = string.split("");
  return map(function (x) {
    return parseInt(x);
  }, vector_to_list(array_of_numbers));
}
