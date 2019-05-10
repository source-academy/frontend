// // ---------------------------------------------
// // Microphone Functionality
// // ---------------------------------------------

// Get Microphone Input.
function init_record(){
	navigator.mediaDevices.getUserMedia({ audio: true }).then(attachEvents);
}

let mediaRecorder;
let sStream;

function attachEvents(sourceStream) {
    sStream = sourceStream;
}

function start_record() {
    mediaRecorder = record(sStream);
}

function stop_record() {
    mediaRecorder.stop();
}

function record_for(duration) {
    // Convert duration to seconds
    play(sine_sound(330, 0.5));
    setTimeout(() => {
        duration *= 1000;
        start_record();
        setTimeout(() => {
            stop_record();
            play(sine_sound(330, 0.5));
        }, duration);
    }, 500);
}

function record(sourceStream) {
    const mediaRecorder = new MediaRecorder(sourceStream);
    const data = [];
    
    mediaRecorder.ondataavailable = e => e.data.size && data.push(e.data);
    mediaRecorder.start();
    mediaRecorder.onstop = () => process(data);
    
    return mediaRecorder;
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


let recorded_sound;

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
