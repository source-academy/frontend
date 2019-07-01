// // ---------------------------------------------
// // Microphone Functionality
// // ---------------------------------------------

// permission initially undefined
// set to true by granting microphone permission
// set to false by denying microphone permission
let permission = undefined;

let recorded_sound = undefined;

// check_permission is called whenever we try
// to record a sound
function check_permission() {
    if (permission === undefined) {
	throw new Error("Call init_record(); " +
		    "to obtain permission to use microphone");
    } else if (permission === false) {
	throw new Error("Permission has been denied.\n" +
		    "Re-start browser and call init_record();\n" +
		    "to obtain permission to use microphone.");
    } // (permission === true): do nothing
}

/**
 * Initialize recording by obtaining permission
 * to use the default device microphone
 * @returns {undefined} 
 */
function init_record(){
    navigator.mediaDevices.getUserMedia({ audio: true })
	.then(rememberStream, setPermissionToFalse);
    return "obtaining recording permission";
}

let globalStream;

function rememberStream(stream) {
    permission = true;	
    globalStream = stream;
}

function setPermissionToFalse() {
    permission = false;	
}

function start_recording(mediaRecorder, continuation) {
    const data = [];
    mediaRecorder.ondataavailable = e => e.data.size && data.push(e.data);
    mediaRecorder.start(); 
    mediaRecorder.onstop = () => process(data, continuation);
}

// there is a beep signal at the beginning and end
// of each recording
const recording_signal_duration_ms = 300;

function play_recording_signal() {
    play(sine_sound(500, recording_signal_duration_ms / 1000));
}

const buffer_ms = 40;

function record(continuation) {
    check_permission();
    const mediaRecorder = new MediaRecorder(globalStream);
    play_recording_signal();
    setTimeout(() => {    
	start_recording(mediaRecorder, continuation);
    }, recording_signal_duration_ms + buffer_ms);
    return () => {
	mediaRecorder.stop();
	play_recording_signal();
	return () => {
	    if (recorded_sound === undefined) {
		throw new Error("recording still being processed")
	    } else {
		return recorded_sound;
	    }
	};
    };
}

function record_for(duration_s) {
    recorded_sound = undefined;
    const duration_ms = duration_s * 1000;
    check_permission();
    const mediaRecorder = new MediaRecorder(globalStream);
    play_recording_signal();
    setTimeout(() => {
	start_recording(mediaRecorder);
        setTimeout(() => {
	    mediaRecorder.stop();
	    play_recording_signal();
        }, duration_ms);
    }, recording_signal_duration_ms + buffer_ms);
    return () => {
	    if (recorded_sound === undefined) {
		throw new Error("recording still being processed")
	    } else {
		return recorded_sound;
	    }
    };
}

function process(data, continuation) {
    const audioContext = new AudioContext();
    const blob = new Blob(data);
    
    convertToArrayBuffer(blob)
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(save);
}

// Converts input microphone sound (blob) into array format.
function convertToArrayBuffer(blob) {
    const url = URL.createObjectURL(blob);
    
    return fetch(url).then(response => {
        return response.arrayBuffer();
    });
}

function save(audioBuffer) {
    const array = audioBuffer.getChannelData(0);
    const duration = array.length / FS;
    recorded_sound = autocut_sound(
        make_sound(function(t) {
            const index = t * FS
            const lowerIndex = Math.floor(index)
            const upperIndex = lowerIndex + 1
            const ratio = index - lowerIndex
            const upper = array[upperIndex] ? array[upperIndex] : 0
            const lower = array[lowerIndex] ? array[lowerIndex] : 0
            return lower * (1 - ratio) + upper * ratio
        }, duration)
    );
}
