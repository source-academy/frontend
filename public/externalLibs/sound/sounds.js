// Constants
var FS = 44100; // Standard sampling rate for all problems

const fourier_expansion_level = 5; // expansion level for
                                   // square, sawtooth, triangle

// ---------------------------------------------
// Fast reimplementations of the list library
// ---------------------------------------------
function vector_to_list(arr) {
    var xs = [];

    for (var i=arr.length-1; i>=0; i--) {
        xs = pair(arr[i], xs);
    }

    return xs;
}

function list_to_vector(xs) {
    var vector = [];

    while(!is_null(xs)) {
        vector.push(head(xs));
        xs = tail(xs);
    }

    return vector;
}

function length(xs) {
    var len = 0;
    while(!is_null(xs)) {
        len++;
        xs = tail(xs);
    }
    return len;
}

function append(xs, ys) {
    var v1 = list_to_vector(xs);
    var v2 = list_to_vector(ys);
    var vector = v1.concat(v2);
    return vector_to_list(vector);
}

function map(f, xs) {
    var vector = list_to_vector(xs);
    for (var i=0; i<vector.length; i++) {
        vector[i] = f(vector[i]);
    }
    return vector_to_list(vector);
}

// ---------------------------------------------
// Low-level sound support
// ---------------------------------------------

// Samples a continuous wave to a discrete waves at sampling rate for duration
// in seconds
function discretize(wave, duration) {
    var vector = [];

    for (var i = 0; i < duration * FS; i++) {
        vector.push(wave( i / FS));
    }

    return vector;
}

// Discretizes a sound to a sound starting from elapsed_duration, for
// sample_length seconds
function discretize_from(wave, duration, elapsed_duration, sample_length, data) {
    if (elapsed_duration + sample_length > duration) {
        for (var i = elapsed_duration * FS; i < duration * FS; i++) {
            data[i - elapsed_duration * FS] = wave(i / FS);
        }
        return data;
    } else if (duration - elapsed_duration > 0) {
        for (var i = elapsed_duration * FS;
	     i < (elapsed_duration + sample_length) * FS;
	     i++) {
            data[i - elapsed_duration * FS] = wave(i / FS);
        }
        return data;
    }
}

// Quantize real amplitude values into standard 4-bit PCM levels
function quantize(data) {
    for (var i = 0; i < data.length; i++) {
        data[i] = Math.round((data[i] + 1) * 126);
    }
    return data;
}

// Try to eliminate clicks by smoothening out sudden jumps at the end of a wave
function simple_filter(data) {
    for (var i = 0; i < data.length; i++) {
        if (data[i] > 1) {
          data[i] = 1;
        }
        if (data[i] < -1) {
          data[i] = -1;
        }
    }
    var old_value = 0;
    for (var i = 0; i < data.length; i++) {
        if (Math.abs(old_value - data[i]) > 0.01 && data[i] == 0) {
            data[i] = old_value * 0.999;
        }
        old_value = data[i];
    }
    return data;
}

function copy(data) {
    var ret = [];
    for (var i = 0; i < data.length; i++) {
        ret[i] = data[i];
    }
    return ret;
}

// Raw data to html5 audio element
function raw_to_audio(_data) {
    data = copy(_data);
    data = simple_filter(data);
    data = quantize(data);
    var riffwave = new RIFFWAVE();
    riffwave.header.sampleRate = FS;
    riffwave.header.numChannels = 1;
    riffwave.Make(data);
    var audio = new Audio(riffwave.dataURI);
    return audio;
}

// ---------------------------------------------
// Source API for Students
// ---------------------------------------------

// Data abstractions:
// time: real value in seconds  x > 0
// amplitude: real value -1 <= x <= 1
// duration: real value in seconds 0 < x < Infinity
// sound: (time -> amplitude) x duration

/**
 * Makes a sound from a wave and a duration.
 * The wave is a function from time (in seconds)
 * to an amplitude value that should lie between
 * -1 and 1. The duration is given in seconds.
 * @param {function} wave - given wave function
 * @param {number} duration - in seconds
 * @returns {sound} 
 */
function make_sound(wave, duration) {
    return pair(t => t >= duration ? 0 : wave(t), duration);
}

/**
 * Accesses the wave of a sound.
 * The wave is a function from time (in seconds)
 * to an amplitude value that should lie between
 * -1 and 1.
 * @param {sound} sound - given sound
 * @returns {function} wave function of the sound
 */
function get_wave(sound) {
    return head(sound);
}

/**
 * Accesses the duration of a sound, in seconds.
 * @param {sound} sound - given sound
 * @returns {number} duration in seconds
 */
function get_duration(sound) {
    return tail(sound);
}

/**
 * Checks if a given value is a sound
 * @param {value} x - given value
 * @returns {boolean} whether <CODE>x</CODE> is a sound
 */
function is_sound(x) {
    return is_pair(x) &&
    ((typeof get_wave(x)) === 'function') &&
    ((typeof get_duration(x)) === 'number');
}

// Keeps track of whether play() is currently running,
// and the current audio context.
var _playing = false;
var _player;

function play_unsafe(sound) {
    // type-check sound
    if ( !is_sound(sound) ) {
        throw new Error("play is expecting sound, but encountered " + sound);
    // If a sound is already playing, terminate execution
    } else if (_playing || _safeplaying) {
        throw new Error("play: audio system still playing previous sound");
    } else {
        // Declaring duration and wave variables
        var wave = get_wave(sound);
        var duration = get_duration(sound);
        
        _playing = true;

        // Create AudioContext (test this out might fix safari issue)
        //const AudioContext = window.AudioContext || window.webkitAudioContext;
        
        // Main audio context
        _player = new AudioContext();

        // Controls Length of buffer in seconds.
        var buffer_length = 0.1;

        // Define Buffer Size
        var bufferSize = FS * buffer_length;

        // Create two buffers
        var buffer1 = _player.createBuffer(1, bufferSize, FS);
        var buffer2 = _player.createBuffer(1, bufferSize, FS);

        // Keep track of elapsed_duration & first run of ping_pong
        var elapsed_duration = 0;
        var first_run = true;

        // Schedules playback of sounds
        function ping_pong(current_sound, next_sound, current_buffer, next_buffer) {
            // If sound has exceeded duration, early return to stop calls.
            if (elapsed_duration > duration || !_playing) { 
                stop();
                return;
            }

            // Fill current_buffer, then play current_sound.
            if (first_run) {
                // No longer first run of ping_pong.
                first_run = false;

                // Discretize first chunk, load into current_buffer.
                let current_data = current_buffer.getChannelData(0);
                current_data = discretize_from(wave, duration, elapsed_duration,
                        buffer_length, current_data);

                // Create current_sound.
                current_sound = new AudioBufferSourceNode(_player);

                // Set current_sound's buffer to current_buffer.
                current_sound.buffer = current_buffer;

                // Play current_sound.
                current_sound.connect(_player.destination);
                current_sound.start();

                // Increment elapsed duration.
                elapsed_duration += buffer_length;
            }

            // Fill next_buffer while current_sound is playing,
            // schedule next_sound to play after current_sound terminates.

            // Discretize next chunk, load into next_buffer.
            let next_data = next_buffer.getChannelData(0);
            next_data = discretize_from(wave, duration, elapsed_duration,
                        buffer_length, next_data);

            // Create next_sound.
            next_sound = new AudioBufferSourceNode(_player);

            // Set next_sound's buffer to next_buffer.
            next_sound.buffer = next_buffer;

            // Schedule next_sound to play after current_sound.
            next_sound.connect(_player.destination);
            next_sound.start(start_time + elapsed_duration);

            // Increment elapsed duration.
            elapsed_duration += buffer_length;

            current_sound.onended =
            event => 
                ping_pong(next_sound, current_sound, next_buffer, current_buffer);
        }
        var start_time = _player.currentTime;
        ping_pong(null, null, buffer1, buffer2);
        return sound;
    }
}

// "Safe" playing for overly complex sounds.
// Discretizes full sound before playing
// (i.e. plays sound properly, but possibly with
// a delay).
var _safeplaying = false;
var _safeaudio = null;

/**
 * plays a given sound using your computer's sound device
 * @param {sound} sound - given sound
 * @returns {sound} given sound
 */
function play(sound) {
    // If a sound is already playing, terminate execution.
    if (_safeplaying || _playing) {
        throw new Error("play: audio system still playing previous sound");
    } else {
        // Discretize the input sound
        var data = discretize(get_wave(sound), get_duration(sound));
        _safeaudio = raw_to_audio(data);

        _safeaudio.addEventListener('ended', stop);
        _safeaudio.play();
        _safeplaying = true;
        return sound;
    }
}

// Requires 'All' libraries!
function display_waveform(num_points_per_second, sound) {
    let wave = get_wave(sound);
    let duration = get_duration(sound);
    let num_points = num_points_per_second * duration;
    return draw_connected_full_view_proportional(num_points)(t => pair(t, wave(duration * t)));
}

/* sound_to_string and string_to_sound would be really cool!!!

function sound_to_string(sound) {
    let discretized_wave = discretize(wave(sound), duration(sound));
    let discretized_sound = pair(discretized_wave, duration(sound));
    return stringify(pair(data), tail(sound));
}

function string_to_sound(str) {
    var discretized_sound = eval(str);
    
    return pair(t => ..., duration(data));
}
*/

/**
 * Stops playing the current sound
 * @returns {undefined} undefined
 */
function stop() {
    // If using normal play()
    if (_playing) {
        _player.close();
    }
    // If using play_safe()
    if (_safeplaying) {
        _safeaudio.pause();
        _safeaudio = null;
    }
    _playing = false;
    _safeplaying = false;
}

// Concats a list of sounds
/**
 * makes a new sound by combining the sounds in a given
 * list so that
 * they play consecutively, each next sound starting when the
 * previous sound ends
 * @param {list_of_sounds} sounds - given list of sounds
 * @returns {sound} resulting sound
 */
function consecutively(list_of_sounds) {
    function consec_two(ss1, ss2) {
        var wave1 = head(ss1);
        var wave2 = head(ss2);
        var dur1 = tail(ss1);
        var dur2 = tail(ss2);
        var new_wave = t => t < dur1 ? wave1(t) : wave2(t - dur1);
        return pair(new_wave, dur1 + dur2);
    }
    return accumulate(consec_two, silence_sound(0), list_of_sounds);
}

// Mushes a list of sounds together
/**
 * makes a new sound by combining the sounds in a given
 * list so that
 * they play simutaneously, all starting at the beginning of the 
 * resulting sound
 * @param {list_of_sounds} sounds - given list of sounds
 * @returns {sound} resulting sound
 */
function simultaneously(list_of_sounds) {
    function musher(ss1, ss2) {
        var wave1 = head(ss1);
        var wave2 = head(ss2);
        var dur1 = tail(ss1);
        var dur2 = tail(ss2);
        // new_wave assumes sound discipline (ie, wave(t) = 0 after t > dur)
        var new_wave = t => wave1(t) + wave2(t);
        // new_dur is higher of the two dur
        var new_dur = dur1 < dur2 ? dur2 : dur1;
        return pair(new_wave, new_dur);
    }

    var mushed_sounds = accumulate(musher, silence_sound(0), list_of_sounds);
    var normalised_wave =  t =>
	(head(mushed_sounds))(t) / length(list_of_sounds);
    var highest_duration = tail(mushed_sounds);
    return pair(normalised_wave, highest_duration);
}

/**
 * makes a sound of a given duration by randomly
 * generating amplitude values
 * @param {number} duration - duration of result sound, in seconds
 * @returns {sound} resulting noise sound
 */
function noise_sound(duration) {
    return make_sound(t => Math.random() * 2 - 1, duration);
}

/**
 * makes a sine wave sound with given frequency and a given duration
 * @param {number} freq - frequency of result sound, in Hz
 * @param {number} duration - duration of result sound, in seconds
 * @returns {sound} resulting sine sound
 */
function sine_sound(freq, duration) {
    return make_sound(t => Math.sin(2 * Math.PI * t * freq), duration);
}

/**
 * makes a silence sound with a given duration
 * @param {number} duration - duration of result sound, in seconds
 * @returns {sound} resulting silence sound
 */
function silence_sound(duration) {
    return make_sound(t => 0, duration);
}

// for mission 14

/**
 * converts a letter name <CODE>str</CODE> to corresponding midi note.
 * Examples for letter names are <CODE>"A5"</CODE>, <CODE>"B3"</CODE>, <CODE>"D#4"</CODE>.
 * See <a href="https://i.imgur.com/qGQgmYr.png">mapping from
 * letter name to midi notes</a>
 * @param {string} str - given letter name
 * @returns {number} midi value of the corresponding note
 */
function letter_name_to_midi_note(note) {
    // we don't consider double flat/ double sharp
    var note = note.split("");
    var res = 12; //MIDI notes for mysterious C0
    var n = note[0].toUpperCase();
    switch(n) {
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

        default :
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


/**
 * converts a letter name <CODE>str</CODE> to corresponding frequency.
 * First converts <CODE>str</CODE> to a note using <CODE>letter_name_to_midi_note</CODE>
 * and then to a frequency using <CODE>midi_note_to_frequency</CODE>
 * @param {string} str - given letter name
 * @returns {number} frequency of corresponding note in Hz
 */
function letter_name_to_frequency(note) {
    return midi_note_to_frequency(note_to_midi_note(note));
}

/**
 * converts a midi note <CODE>n</CODE> to corresponding frequency.
 * The note is given as an integer number.
 * @param {number} n - given midi note
 * @returns {number} frequency of the note in Hz
 */
function midi_note_to_frequency(note) {
    return 8.1757989156 * Math.pow(2, (note / 12));
}

/**
 * makes a square wave sound with given frequency and a given duration
 * @param {number} freq - frequency of result sound, in Hz
 * @param {number} duration - duration of result sound, in seconds
 * @returns {sound} resulting square sound
 */
function square_sound(freq, duration) {
    function fourier_expansion_square(t) {
        var answer = 0;
        for (var i = 1; i <= fourier_expansion_level; i++) {
            answer = answer +
		Math.sin(2 * Math.PI * (2 * i - 1) * freq * t)
		/
		(2 * i - 1);
        }
        return answer;
    }
    return make_sound(t => 
        (4 / Math.PI) * fourier_expansion_square(t),
        duration);
}

/**
 * makes a triangle wave sound with given frequency and a given duration
 * @param {number} freq - frequency of result sound, in Hz
 * @param {number} duration - duration of result sound, in seconds
 * @returns {sound} resulting triangle sound
 */
function triangle_sound(freq, duration) {
    function fourier_expansion_triangle(t) {
        var answer = 0;
        for (var i = 0; i < fourier_expansion_level; i++) {
            answer = answer +
		Math.pow(-1, i) *
		Math.sin((2 * i + 1) * t * freq * Math.PI * 2)
		/
		Math.pow((2 * i + 1), 2);
        }
        return answer;
    }
    return make_sound(t => 
        (8 / Math.PI / Math.PI) * fourier_expansion_triangle(t),
        duration);
}

/**
 * makes a sawtooth wave sound with given frequency and a given duration
 * @param {number} freq - frequency of result sound, in Hz
 * @param {number} duration - duration of result sound, in seconds
 * @returns {sound} resulting sawtooth sound
 */
function sawtooth_sound(freq, duration) {
    function fourier_expansion_sawtooth(t) {
        var answer = 0;
        for (var i = 1; i <= fourier_expansion_level; i++) {
            answer = answer + Math.sin(2 * Math.PI * i * freq * t) / i;
        }
        return answer;
    }
    return make_sound(t =>
		      (1 / 2) - (1 / Math.PI) * fourier_expansion_sawtooth(t),
		      duration);
}
