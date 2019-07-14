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

function start_recording(mediaRecorder) {
    const data = [];
    mediaRecorder.ondataavailable = e => e.data.size && data.push(e.data);
    mediaRecorder.start(); 
    mediaRecorder.onstop = () => process(data);
}

// there is a beep signal at the beginning and end
// of each recording
const recording_signal_duration_ms = 300;

function play_recording_signal() {
    play(sine_sound(500, recording_signal_duration_ms / 1000));
}

/**
 * takes a <CODE>buffer</CODE> duration (in seconds) as argument, and
 * returns a nullary stop function <CODE>stop</CODE>. A call
 * <CODE>stop()</CODE> returns a sound promise: a nullary function
 * that returns a sound. Example: <PRE><CODE>init_record();
 * const stop = record(0.5);
 * // record after 0.5 seconds. Then in next query:
 * const promise = stop();
 * // In next query, you can play the promised sound, by
 * // applying the promise:
 * play(promise());</CODE></PRE>
 * @param {number} buffer - pause before recording, in seconds
 * @returns {function} nullary <CODE>stop</CODE> function;
 * <CODE>stop()</CODE> stops the recording and 
 * returns a sound promise: a nullary function that returns the recorded sound
 */
function record(buffer) {
    check_permission();
    const mediaRecorder = new MediaRecorder(globalStream);
    play_recording_signal();
    setTimeout(() => {    
	start_recording(mediaRecorder);
    }, recording_signal_duration_ms + buffer * 1000);
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

/**
 * Records a sound of given <CODE>duration</CODE> in seconds, after
 * a <CODE>buffer</CODE> also in seconds, and
 * returns a sound promise: a nullary function
 * that returns a sound. Example: <PRE><CODE>init_record();
 * const promise = record_for(2, 0.5);
 * // In next query, you can play the promised sound, by
 * // applying the promise:
 * play(promise());</CODE></PRE>
 * @param {number} duration - duration in seconds
 * @param {number} buffer - pause before recording, in seconds
 * @returns {function} <CODE>promise</CODE>: nullary function which returns the recorded sound
 */
function record_for(duration, buffer) {
    recorded_sound = undefined;
    const duration_ms = duration * 1000;
    check_permission();
    const mediaRecorder = new MediaRecorder(globalStream);
    play_recording_signal();
    setTimeout(() => {
	start_recording(mediaRecorder);
        setTimeout(() => {
	    mediaRecorder.stop();
	    play_recording_signal();
        }, duration_ms);
    }, recording_signal_duration_ms + buffer * 1000);
    return () => {
	    if (recorded_sound === undefined) {
		throw new Error("recording still being processed")
	    } else {
		return recorded_sound;
	    }
    };
}

function process(data) {
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
    recorded_sound = 
        make_sound( t => {
            const index = t * FS
            const lowerIndex = Math.floor(index)
            const upperIndex = lowerIndex + 1
            const ratio = index - lowerIndex
            const upper = array[upperIndex] ? array[upperIndex] : 0
            const lower = array[lowerIndex] ? array[lowerIndex] : 0
            return lower * (1 - ratio) + upper * ratio
        }, duration);
}
