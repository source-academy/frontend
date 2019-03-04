// Constants
var FS = 32000; // Standard sampling rate for all problems

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

    while(!is_empty_list(xs)) {
        vector.push(head(xs));
        xs = tail(xs);
    }

    return vector;
}

function length(xs) {
    var len = 0;
    while(!is_empty_list(xs)) {
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

// samples a continuous wave to a discrete waves at sampling rate for duration
// in seconds
function discretize(wave, duration) {
    var vector = [];

    for (var i=0; i<duration*FS; i++) {
        vector.push(wave(i/FS));
    }

    return vector;
}

// quantize real amplitude values into standard 4-bit PCM levels
function quantize(data) {
    for (var i=0; i<data.length; i++) {
        data[i] = Math.round((data[i]+1)*126);
    }
    return data;
}

// try to eliminate clicks by smoothening out sudden jumps at the end of a wave
function simple_filter(data) {
    for (var i=0; i<data.length; i++) {
        if (data[i] > 1) {
          data[i] = 1;
        }
        if (data[i] < -1) {
          data[i] = -1;
        }
    }
    var old_value = 0;
    for (var i=0; i<data.length; i++) {
        if (Math.abs(old_value - data[i]) > 0.01 && data[i] == 0) {
            data[i] = old_value * 0.999;
        }
        old_value = data[i];
    }
    return data;
}

function copy(data) {
    var ret = [];
    for (var i=0; i<data.length; i++) {
        ret[i] = data[i];
    }
    return ret;
}

// raw data to html5 audio element
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
/*

time: real value in seconds  x>0
amplitude: real value -1<=x<=1
duration: real value in seconds 0<x<Infinity

sound: (time -> amplitude) x duration

*/
function make_sourcesound(wave, duration) {
    return pair(wave, duration);
}

function get_wave(sourcesound) {
    return head(sourcesound);
}

function get_duration(sourcesound) {
    return tail(sourcesound);
}

var _playing = false;
var _audio = null;

function play(sourcesound) {
    var duration = get_duration(sourcesound);
    var wave = get_wave(sourcesound);
    var data = discretize(wave, duration);
    if (_playing) return;
    _audio = raw_to_audio(data);
    _audio.addEventListener('ended', stop);
    _audio.play();
    _playing = true;
}

function stop() {
    if (_playing) {
        _audio.pause();
        _audio = null;
    }
    _playing = false;
}

function cut_sourcesound(sourcesound, duration) {
    var wave = get_wave(sourcesound);
    return make_sourcesound(function(t) {
        if (t >= duration) {
            return 0;
        } else {
            return wave(t);
        }
    }, duration);
}

function autocut_sourcesound(sourcesound) {
    return cut_sourcesound(sourcesound, get_duration(sourcesound));
}

// Concats two sourcesounds (not intended for student use, only to implement consecutively)
function consec_two(ss1, ss2) {
    wave1 = head(ss1);
    wave2 = head(ss2);
    dur1 = tail(ss1);
    dur2 = tail(ss2);
    return pair(t => t < dur1 ? wave1(t) : wave2(t) , dur1 + dur2);
}


// Concats a list of sourcesounds
function consecutively(list_of_sourcesounds) {
    return accumulate(consec_two, silence_sourcesound(0), list_of_sourcesounds);
}

// Mushes a list of sourcesounds together
function simultaneously(list_of_sourcesounds) {
    function musher(ss1, ss2) {
        wave1 = head(ss1);
        wave2 = head(ss2);
        dur1 = tail(ss1);
        dur2 = tail(ss2);
        // new_wave assumes sound discipline (ie, wave(t) = 0 after t > dur)
        new_wave = t => wave1(t) + wave2(t);
        // new_dur is higher of the two dur
        new_dur = dur1 < dur2 ? dur2 : dur1;
        return pair(new_wave, new_dur);
    }

    mushed_sounds = accumulate(musher, silence_sourcesound(0), list_of_sourcesounds);
    normalised_wave = t => (head(mushed_sounds))(t) / length(list_of_sourcesounds);
    highest_duration = tail(mushed_sounds);
    return pair(normalised_wave, highest_duration);
}

function noise_sourcesound(duration) {
    return autocut_sourcesound(make_sourcesound(function(t) {
        return Math.random()*2-1;
    }, duration));
}

function sine_sourcesound(freq, duration) {
    return autocut_sourcesound(make_sourcesound(function(t) {
        return Math.sin(2 * Math.PI * t * freq);
    }, duration));
}

function constant_sourcesound(constant, duration) {
    return autocut_sourcesound(make_sourcesound(function(t) {
        return 0;
    }, duration));
}

function silence_sourcesound(duration) {
    return constant_sourcesound(0, duration);
}

function high_sourcesound(duration) {
    return constant_sourcesound(1, duration);
}

function invert_sourcesound(sourcesound) {
    var wave = get_wave(sourcesound);
    var duration = get_duration(sourcesound);
    return make_sourcesound(function(t) {
        return -wave(t);
    }, duration);
}

function clamp_sourcesound(sourcesound) {
    var wave = get_wave(sourcesound);
    var duration = get_duration(sourcesound);
    return make_sourcesound(function(t) {
        var a = wave(t);
        if (a > 1) {
            return 1;
        } else if (a < -1) {
            return -1;
        } else {
            return a;
        }
    }, duration);
}

// for mission 14
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

function letter_name_to_frequency(note) {
    return midi_note_to_frequency(note_to_midi_note(note));
}

function midi_note_to_frequency(note) {
    return 8.1757989156 * Math.pow(2, (note / 12));
}

function square_sourcesound(freq, duration) {
    function fourier_expansion_square(level, t) {
        var answer = 0;
        for (var i = 1; i <= level; i++) {
            answer = answer + Math.sin(2 * Math.PI * (2 * i - 1) * freq * t) / (2 * i - 1);
        }
        return answer;
    }
    return autocut_sourcesound(make_sourcesound(function(t) {
        var x = (4 / Math.PI) * fourier_expansion_square(5, t);
        if (x > 1) {
            return 1;
        } else if (x < -1) {
            return -1;
        } else {
            return x;
        }
    }, duration));
}

function triangle_sourcesound(freq, duration) {
    function fourier_expansion_triangle(level, t) {
        var answer = 0;
        for (var i = 0; i < level; i++) {
            answer = answer + Math.pow(-1, i) * Math.sin((2 * i + 1) * t * freq * Math.PI * 2) / Math.pow((2 * i + 1), 2);
        }
        return answer;
    }
    return autocut_sourcesound(make_sourcesound(function(t) {
        var x = (8 / Math.PI / Math.PI) * fourier_expansion_triangle(5, t);
        if (x > 1) {
            return 1;
        } else if (x < -1) {
            return -1;
        } else {
            return x;
        }
    }, duration));
}

function sawtooth_sourcesound(freq, duration) {
    function fourier_expansion_sawtooth(level, t) {
        var answer = 0;
        for (var i = 1; i <= level; i++) {
            answer = answer + Math.sin(2 * Math.PI * i * freq * t) / i;
        }
        return answer;
    }
    return autocut_sourcesound(make_sourcesound(function(t) {
        var x = (1 / 2) - (1 / Math.PI) * fourier_expansion_sawtooth(5, t);
        if (x > 1) {
            return 1;
        } else if (x < -1) {
            return -1;
        } else {
            return x;
        }
    }, duration));
}

function play_concurrently(sourcesound) {
    var duration = get_duration(sourcesound);
    var wave = get_wave(sourcesound);
    var data = discretize(wave, duration);
    var audio = raw_to_audio(data);
    audio.play();
}
