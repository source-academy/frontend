// Constants
const FS = 44100; // Standard sampling rate for all problems

const fourier_expansion_level = 5; // expansion level for
                                   // square, sawtooth, triangle

// ---------------------------------------------
// Fast reimplementations of the list library
// ---------------------------------------------

function append(xs, ys) {
    const v1 = list_to_vector(xs);
    const v2 = list_to_vector(ys);
    const vector = v1.concat(v2);
    return vector_to_list(vector);
}

function map(f, xs) {
    const vector = list_to_vector(xs);
    for (let val of vector) {
        val = f(val);
    }
    return vector_to_list(vector);
}

// ---------------------------------------------
// Low-level sound support
// ---------------------------------------------

/*
// Samples a continuous wave to a discrete waves at sampling rate for duration
// in seconds
function discretize(wave, duration) {
    var vector = [];

    for (var i = 0; i < duration * FS; i++) {
        vector.push(wave( i / FS));
    }

    return vector;
}
*/

// Discretizes a Sound to a Sound starting from elapsed_duration, for
// sample_length seconds
function discretize_from(wave, duration, elapsed_duration, sample_length, data) {
    if (elapsed_duration + sample_length > duration) {
        for (let i = elapsed_duration * FS; i < duration * FS; i++) {
            data[i - elapsed_duration * FS] = wave(i / FS);
        }
        return data;
    } else if (duration - elapsed_duration > 0) {
        for (let i = elapsed_duration * FS;
	     i < (elapsed_duration + sample_length) * FS;
	     i++) {
            data[i - elapsed_duration * FS] = wave(i / FS);
        }
        return data;
    }
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
 * Makes a Sound from a wave and a duration.
 * The wave is a function from a non-negative time (in seconds)
 * to an amplitude value that should lie between
 * -1 and 1. The duration is given in seconds.
 * @param {function} wave - given wave function
 * @param {Number} duration - in seconds
 * @returns {Sound} 
 */
function make_sound(wave, duration) {
    return pair(t => t >= duration ? 0 : wave(t), duration);
}

/**
 * Accesses the wave of a Sound.
 * The wave is a function from a non-negative time (in seconds)
 * to an amplitude value that should lie between
 * -1 and 1.
 * @param {Sound} sound - given sound
 * @returns {function} wave function of the sound
 */
function get_wave(sound) {
    return head(sound);
}

/**
 * Accesses the duration of a Sound, in seconds.
 * @param {Sound} sound - given Sound
 * @returns {Number} duration in seconds
 */
function get_duration(sound) {
    return tail(sound);
}

/**
 * Checks if a given value is a Sound
 * @param {value} x - given value
 * @returns {boolean} whether <CODE>x</CODE> is a Sound
 */
function is_sound(x) {
    return is_pair(x) &&
    ((typeof get_wave(x)) === 'function') &&
    ((typeof get_duration(x)) === 'number');
}

// Singular audio context for all playback functions
let _audioplayer;
// Track if a sound is currently playing
let _playing;

// Instantiates new audio context
function init_audioCtx() {
    _audioplayer = new (window.AudioContext || window.webkitAudioContext)();
}

// Real time playback of a sound, unsuitable for complex sounds
function play_unsafe(sound) {
    // type-check sound
    if ( !is_sound(sound) ) {
        throw new Error(`play is expecting sound, but encountered ${sound}`);
    // If a sound is already playing, terminate execution
    } else if (_playing) {
        throw new Error("play: audio system still playing previous sound");
    } else if (get_duration(sound) <= 0) {
        return sound;
    } else {
        // Declaring duration and wave variables
        let wave = get_wave(sound);
        let duration = get_duration(sound);
        
        _playing = true;
      
        // Instantiate audio context if it has not been instantiated
        if (!_audioplayer) {
            init_audioCtx();
        }

        // Controls Length of buffer in seconds.
        const buffer_length = 0.1;

        // Define Buffer Size
        const bufferSize = FS * buffer_length;

        // Create two buffers
        let buffer1 = _audioplayer.createBuffer(1, bufferSize, FS);
        let buffer2 = _audioplayer.createBuffer(1, bufferSize, FS);

        // Keep track of elapsed_duration & first run of ping_pong
        let elapsed_duration = 0;
        let first_run = true;

        // Schedules playback of sounds
        function ping_pong(current_sound, next_sound, current_buffer, next_buffer) {
            // If sound has exceeded duration, early return to stop calls.
            if (elapsed_duration > duration || !_playing) { 
                current_sound.disconnect(_audioplayer.destination);
                _playing = false;
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
                current_sound = new AudioBufferSourceNode(_audioplayer);

                // Set current_sound's buffer to current_buffer.
                current_sound.buffer = current_buffer;

                // Play current_sound.
                current_sound.connect(_audioplayer.destination);
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
            next_sound = new AudioBufferSourceNode(_audioplayer);

            // Set next_sound's buffer to next_buffer.
            next_sound.buffer = next_buffer;

            // Schedule next_sound to play after current_sound.
            next_sound.connect(_audioplayer.destination);
            next_sound.start(start_time + elapsed_duration);

            // Increment elapsed duration.
            elapsed_duration += buffer_length;

            current_sound.onended =
            () => 
                ping_pong(next_sound, current_sound, next_buffer, current_buffer);
        }
        let start_time = _audioplayer.currentTime;
        ping_pong(null, null, buffer1, buffer2);
        return sound;
    }
}

// Fully processes a sound before playback
// Frontloads processing so the sound plays back properly,
//   but possibly with a delay
/**
 * plays a given Sound using your computer's sound device
 * @param {Sound} sound - given Sound
 * @returns {Sound} given Sound
 */
function play(sound) {
    // Type-check sound
    if (!is_sound(sound)) {
        throw new Error(`play is expecting sound, but encountered ${sound}`);
    // If a sound is already playing, terminate execution.
    } else if (_playing) {
        throw new Error("play: audio system still playing previous sound");
    } else if (get_duration(sound) <= 0) {
        return sound;
    } else {
        // Instantiate audio context if it has not been instantiated.
        if (!_audioplayer) {
            init_audioCtx();
        }

        // Create mono buffer
        let theBuffer = _audioplayer.createBuffer(1, FS * get_duration(sound), FS);
        let channel = theBuffer.getChannelData(0);

        // Discretize the function and clip amplitude
        // Discretize the function and clip amplitude
        let temp;
        let prev_value = 0;
        
        const wave = get_wave(sound);
        for (let i = 0; i < channel.length; i++) {
            temp = wave(i/FS);
            // clip amplitude
            channel[i] = temp > 1 ? 1 : temp < -1 ? -1 : temp;

            // smoothen out sudden cut-outs
            if (channel[i] == 0 && Math.abs(channel[i] - prev_value) > 0.01) {
                channel[i] = prev_value * 0.999;
            }

            prev_value = channel[i];
        }

        // Connect data to output destination
        let source = _audioplayer.createBufferSource();
        source.buffer = theBuffer;
        
        source.connect(_audioplayer.destination);
        _playing = true;
        source.start();
        source.onended = () => {
            source.disconnect(_audioplayer.destination);
            _playing = false;
        }

        return sound;
    }
}

/**
 * plays a given sound without regard if a sound is already playing
 * @param {Sound} sound - given sound
 * @returns {undefined}  undefined
 */
function play_concurrently(sound) {
    // Type-check sound
    if (!is_sound(sound)) {
        throw new Error(`play_concurrently is expecting sound, but encountered ${sound}`);
    }  else if (get_duration(sound) <= 0) {
        return;
    } else {
        // Instantiate audio context if it has not been instantiated
        if (!_audioplayer) {
            init_audioCtx();
        }

        // Create mono buffer
        let theBuffer = _audioplayer.createBuffer(1, FS * get_duration(sound), FS);
        let channel = theBuffer.getChannelData(0);

        // Discretize the function and clip amplitude
        let temp;
        let prev_value = 0;

        const wave = get_wave(sound);
        for (let i = 0; i < channel.length; i++) {
            temp = wave(i/FS);
            // clip amplitude
            channel[i] = temp > 1 ? 1 : temp < -1 ? -1 : temp;

            // smoothen out sudden cut-outs
            if (channel[i] == 0 && Math.abs(channel[i] - prev_value) > 0.01) {
                channel[i] = prev_value * 0.999;
            }

            prev_value = channel[i];
        }

        // Connect data to output destination
        let source = _audioplayer.createBufferSource();
        source.buffer = theBuffer;
        
        source.connect(_audioplayer.destination);
        _playing = true;
        source.start();
        source.onended = () => {
            source.disconnect(_audioplayer.destination);
            _playing = false;
        }
        
    }

}

/**
 * Stops playing the current sound
 * @returns {undefined} undefined
 */
function stop() {
    _audioplayer.close();
    _audioplayer = null;
    _playing = false;
}

// Concats a list of sounds
/**
 * makes a new sound by combining the sounds in a given
 * list so that
 * they are arranged consecutively. Let us say the durations
 * of the sounds are <CODE>d1</CODE>, ..., <CODE>dn</CODE> and the wave 
 * functions are <CODE>w1</CODE>, ..., <CODE>wn</CODE>. Then the resulting
 * sound has the duration of the sum of <CODE>d1</CODE>, ..., <CODE>dn</CODE>.
 * The wave function <CODE>w</CODE> of the resulting sound uses <CODE>w1</CODE> for the first
 * <CODE>d1</CODE> seconds, <CODE>w2</CODE> for the next 
 * <CODE>d2</CODE> seconds etc. We specify that <CODE>w(d1) = w2(0)</CODE>,
 * <CODE>w(d1+d2) = w3(0)</CODE>, etc
 * @param {list_of_sounds} sounds - given list of sounds
 * @returns {Sound} resulting sound
 */
function consecutively(list_of_sounds) {
    function consec_two(ss1, ss2) {
        const wave1 = head(ss1);
        const wave2 = head(ss2);
        const dur1 = tail(ss1);
        const dur2 = tail(ss2);
        const new_wave = t => t < dur1 ? wave1(t) : wave2(t - dur1);
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
 * @returns {Sound} resulting sound
 */
function simultaneously(list_of_sounds) {
    function musher(ss1, ss2) {
        const wave1 = head(ss1);
        const wave2 = head(ss2);
        const dur1 = tail(ss1);
        const dur2 = tail(ss2);
        // new_wave assumes sound discipline (ie, wave(t) = 0 after t > dur)
        const new_wave = t => wave1(t) + wave2(t);
        // new_dur is higher of the two dur
        const new_dur = dur1 < dur2 ? dur2 : dur1;
        return pair(new_wave, new_dur);
    }

    const mushed_sounds = accumulate(musher, silence_sound(0), list_of_sounds);
    const normalised_wave =  t =>
	(head(mushed_sounds))(t) / length(list_of_sounds);
    const highest_duration = tail(mushed_sounds);
    return pair(normalised_wave, highest_duration);
}

/**
 * makes a Sound of a given duration by randomly
 * generating amplitude values
 * @param {Number} duration - duration of result sound, in seconds
 * @returns {Sound} resulting noise sound
 */
function noise_sound(duration) {
    return make_sound(t => Math.random() * 2 - 1, duration);
}

/**
 * makes a sine wave Sound with given frequency and a given duration
 * @param {Number} freq - frequency of result Sound, in Hz, <CODE>freq</CODE> ≥ 0
 * @param {Number} duration - duration of result Sound, in seconds
 * @returns {Sound} resulting sine Sound
 */
function sine_sound(freq, duration) {
    return make_sound(t => Math.sin(2 * Math.PI * t * freq), duration);
}

/**
 * makes a silence Sound with a given duration
 * @param {Number} duration - duration of result Sound, in seconds
 * @returns {Sound} resulting silence Sound
 */
function silence_sound(duration) {
    return make_sound(t => 0, duration);
}

/**
 * makes a square wave Sound with given frequency and a given duration
 * @param {Number} freq - frequency of result Sound, in Hz, <CODE>freq</CODE> ≥ 0
 * @param {Number} duration - duration of result Sound, in seconds
 * @returns {Sound} resulting square Sound
 */
function square_sound(freq, duration) {
    function fourier_expansion_square(t) {
        let answer = 0;
        for (let i = 1; i <= fourier_expansion_level; i++) {
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
 * makes a triangle wave Sound with given frequency and a given duration
 * @param {Number} freq - frequency of result Sound, in Hz, <CODE>freq</CODE> ≥ 0
 * @param {Number} duration - duration of result Sound, in seconds
 * @returns {Sound} resulting triangle Sound
 */
function triangle_sound(freq, duration) {
    function fourier_expansion_triangle(t) {
        let answer = 0;
        for (let i = 0; i < fourier_expansion_level; i++) {
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
 * makes a sawtooth wave Sound with given frequency and a given duration
 * @param {Number} freq - frequency of result Sound, in Hz; <CODE>freq</CODE> ≥ 0
 * @param {Number} duration - duration of result Sound, in seconds
 * @returns {Sound} resulting sawtooth Sound
 */
function sawtooth_sound(freq, duration) {
    function fourier_expansion_sawtooth(t) {
        let answer = 0;
        for (let i = 1; i <= fourier_expansion_level; i++) {
            answer = answer + Math.sin(2 * Math.PI * i * freq * t) / i;
        }
        return answer;
    }
    return make_sound(t =>
		      (1 / 2) - (1 / Math.PI) * fourier_expansion_sawtooth(t),
		      duration);
}

/**
 * converts a letter name <CODE>str</CODE> to corresponding midi note.
 * Examples for letter names are <CODE>"A5"</CODE>, <CODE>"B3"</CODE>, <CODE>"D#4"</CODE>.
 * See <a href="https://i.imgur.com/qGQgmYr.png">mapping from
 * letter name to midi notes</a>
 * @param {string} str - given letter name
 * @returns {Number} midi value of the corresponding note
 */
function letter_name_to_midi_note(note) {
    // we don't consider double flat/ double sharp
    note = [...note];
    let res = 12; // C0 is midi note 12
    const n = note[0].toUpperCase();
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


/**
 * converts a midi note <CODE>n</CODE> to corresponding frequency.
 * The note is given as an integer Number.
 * @param {Number} n - given midi note
 * @returns {Number} frequency of the note in Hz
 */
function midi_note_to_frequency(note) {
    // A4 = 440Hz = midi note 69
    return 440 * Math.pow(2, ((note - 69) / 12));
}

/**
 * converts a letter name <CODE>str</CODE> to corresponding frequency.
 * First converts <CODE>str</CODE> to a note using <CODE>letter_name_to_midi_note</CODE>
 * and then to a frequency using <CODE>midi_note_to_frequency</CODE>
 * @param {string} str - given letter name
 * @returns {Number} frequency of corresponding note in Hz
 */
function letter_name_to_frequency(note) {
    return midi_note_to_frequency(letter_name_to_midi_note(note));
}

// linear decay from 1 to 0 over decay_period
function linear_decay(decay_period) {
    return t => {
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
        let wave = get_wave(sound);
        let duration = get_duration(sound);
        let attack_time = duration * attack_ratio;
        let decay_time = duration * decay_ratio;
        let release_time = duration * release_ratio;
        return make_sound( x => {
            if (x < attack_time) {
                return wave(x) * (x / attack_time);
            } else if (x < attack_time + decay_time) {
                return ((1 - sustain_level) * 
                        (linear_decay(decay_time))(x - attack_time) + sustain_level) *
                         wave(x);
            } else if (x < duration - release_time) {
                return wave(x) * sustain_level;
            } else if (x <= duration) {
                return wave(x) * sustain_level * 
                        (linear_decay(release_time))(x - (duration - release_time));
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

// Requires 'All' libraries!
function display_waveform(num_points_per_second, sound) {
    const wave = get_wave(sound);
    const duration = get_duration(sound);
    const num_points = num_points_per_second * duration;
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