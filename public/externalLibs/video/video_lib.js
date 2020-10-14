/**
 * Returns the current height of the output video display in
 * pixels, i.e. the number of pixels in vertical direction
 * @returns {Number} height of output display (in pixels)
 */
function video_height() {
    return _HEIGHT;
}

/**
 * Returns the current width of the output video display in
 * pixels, i.e. the number of pixels in horizontal direction
 * @returns {Number} width of output display (in pixels)
 */
function video_width() {
    return _WIDTH;
}

/**
 * Returns the red component of a given Pixel <CODE>px</CODE>
 * @param {px} Pixel - given Pixel
 * @returns {Number} the red component as a number between 0 and 255
 */
function red_of(px) { // returns the red value of px respectively
    return px[0];
}

/**
 * Returns the green component of a given Pixel <CODE>px</CODE>
 * @param {px} Pixel - given Pixel
 * @returns {Number} the green component as a number between 0 and 255
 */
function green_of(px) { // returns the green value of px respectively
    return px[1];
}

/**
 * Returns the blue component of a given Pixel <CODE>px</CODE>
 * @param {px} Pixel - given Pixel
 * @returns {Number} the blue component as a number between 0 and 255
 */
function blue_of(px) { // returns the blue value of px respectively
    return px[2];
}

/**
 * Returns the alpha component of a given Pixel <CODE>px</CODE>
 * @param {px} Pixel - given Pixel
 * @returns {Number} the alpha component as a number between 0 and 255
 */
function alpha_of(px) {
    return px[3];
}

/**
 * Assigns the red, green, blue and alpha components of a pixel 
 * <CODE>px</CODE> to given values
 * @param {px} Pixel - given Pixel
 * @param {r} Number - the red component as a number between 0 and 255
 * @param {g} Number - the green component as a number between 0 and 255
 * @param {b} Number - the blue component as a number between 0 and 255
 * @param {a} Number - the alpha component as a number between 0 and 255
 * @param {px} Pixel - given Pixel
 * @returns {undefined} 
 */
function set_rgba(px,r,g,b,a) { // assigns the r,g,b values to this px
    px[0] = r;
    px[1] = g;
    px[2] = b;
    px[3] = a;
}

/**
 * Installs a given filter to be used to transform
 * the images that the camera captures into images
 * displayed on the screen. A filter is a function
 * that is applied to two two-dimensional arrays
 * of Pixels: the source image and the destination
 * image.
 * @param {f} filter - the filter to be installed
 * @returns {undefined} 
 */
function install_filter(filter) { 
    _VD.filter = filter;
    if (!_VD.isPlaying) {
        _VD.snapPicture();
    }
}

/**
 * Returns a new filter that is the result of applying both 
 * filter1 and filter 2 together 
 * @param {filter1} filter - the first filter 
 * @param {filter2} filter - the second filter
 * @returns {undefined} 
 */
function compose_filter(filter1, filter2) {
    return (src, dest) => {
        filter1(src, dest);
        copy_image(dest, src);
        filter2(src, dest);
    }
}

/**
 * Resets any filter applied on the video 
 * @returns {undefined} 
 */
function reset_filter() {
    install_filter(copy_image);
}

/**
 * The default filter that just copies the input 2D 
 * grid to output 
 * @param {src} pixel - 2D input src of pixels
 * @param {dest} pixel - 2D output src of pixels
 * @returns {undefined} 
 */
function copy_image(src, dest) {
    for (let i = 0; i < _HEIGHT; i++) {
        for (let j = 0; j < _WIDTH; j++) {
            dest[i][j] = src[i][j];
        }
    }
}

/*
 *
 * INTERNAL FUNCTIONS 
 * 
 */

//Frame Size 
var _WIDTH = 400;
var _HEIGHT = 300;

//FPS
var _FPS = 10;

//Object that preserves the state we need 
_VD = {};

_VD.startTime = null; 
_VD.requestID = null;
_VD.isPlaying = false;
_VD.filter = copy_image;
_VD.pixels = [];
_VD.temp = [];

// initializes our arrays which we use for drawing 
_VD.setupData = function() {
    for (let i = 0; i < _WIDTH; i++) {
        _VD.pixels[i] = [];
        _VD.temp[i] = [];
    }
}

// constructor that sets up initial state
_VD.init = function($video, $canvas, errLogger) { 
    _VD.video = $video;
    _VD.canvas = $canvas;
    _VD.context = _VD.canvas.getContext('2d');
    _VD.errLogger = errLogger;

    _VD.setupData();
    _VD.loadMedia();
}

// destructor that does necessary cleanup
_VD.deinit = function() {
    const stream = _VD.video.srcObject;
    if (!stream) {
        return;
    }
    stream.getTracks().forEach((track) => {
        track.stop();
    });
}

// connects to Webcam and starts video stream
_VD.loadMedia = function() {
    if (!navigator.mediaDevices.getUserMedia) {
        const errMsg = 'The browser you are using does not support getUserMedia';
        console.error(errMsg);
        _VD.errLogger(errMsg, false);
        return;
    }

    //video already part of state
    if (_VD.video.srcObject) {
        return;
    }
    
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then( stream => {
            _VD.video.srcObject = stream;
        })
        .catch( err => {
            const errMsg = err.name + ": " + err.message;
            console.error(errMsg);
            _VD.errLogger(errMsg, false)
        })
    
    _VD.startVideo();
}

// starts to draw video output onto frame
_VD.startVideo = function() {
    if (_VD.isPlaying) {
        return;
    }
    _VD.isPlaying = true;
    _VD.requestID = window.requestAnimationFrame(_VD.draw);
}

// stops the loop that is drawing on frame
_VD.stopVideo = function() {
    if (!_VD.isPlaying) {
        return;
    }

    _VD.isPlaying = false;
    window.cancelAnimationFrame(_VD.requestID);
}

// draws on frame at every (1s / _FPS) 
_VD.draw = function(timestamp) {
    _VD.requestID = window.requestAnimationFrame(_VD.draw);
    
    if (!_VD.startTime) {
        _VD.startTime = timestamp;
    }
    
    const elapsed = timestamp - _VD.startTime;
    if (elapsed > (1000 / _FPS)) {
        _VD.drawFrame();
        _VD.startTime = timestamp;
    }
}

// we translate from the buffer to 2D array 
_VD.readFromBuffer = function(pixelData, src) {
    for (let i = 0; i < _HEIGHT; i++) {
        for (let j = 0; j < _WIDTH; j++) {
            const p = (i * _WIDTH * 4) + j * 4;
            src[i][j] = [
                pixelData[p],
                pixelData[p + 1],
                pixelData[p + 2],
                pixelData[p + 3]
            ];
        }
    }
}

// we check if all values in the pixel are between 0 to 255 (or update to default)
_VD.isPixelFilled = function(pixel) {
    let ok = true;
    for (let i = 0; i < 4; i++) {
        if (pixel[i] >= 0 && pixel[i] <= 255) {
            continue;
        }
        ok = false;
        pixel[i] = 0;
    }
    return ok;
}

// we write back to the buffer (to draw on frame)
_VD.writeToBuffer = function(buffer, data) {
    let ok = true;

    for (let i = 0; i < _HEIGHT; i++) {
        for (let j = 0; j < _WIDTH; j++) {
            const p = (i * _WIDTH * 4) + j * 4;
            if (!_VD.isPixelFilled(data[i][j])) {
                ok = false;
            }
            
            buffer[p] = data[i][j][0]; 
            buffer[p + 1] = data[i][j][1]; 
            buffer[p + 2] = data[i][j][2]; 
            buffer[p + 3] = data[i][j][3];
        }
    }   

    if (!ok) {
        const warnMsg = "You have invalid values for some pixels! Reseting them to default (0)";
        console.warn(warnMsg);
        _VD.errLogger(warnMsg, false);
    }
}

// main function that applies filter on video and draws 
_VD.drawFrame = function() {
    _VD.context.drawImage(_VD.video, 0, 0, _WIDTH, _HEIGHT);
   
    const pixelObj = _VD.context.getImageData(0, 0, _WIDTH, _HEIGHT);
    _VD.readFromBuffer(pixelObj.data, _VD.pixels);
    
    //runtime check to guard against crashes 
    try {
        _VD.filter(_VD.pixels, _VD.temp);
        _VD.writeToBuffer(pixelObj.data, _VD.temp);
    } catch(e) {
        console.error(JSON.stringify(e))
        const errMsg = "There is an error with filter function, filter will be reset to default. " + e.name + ": " + e.message; 
        console.error(errMsg);
        
        if (!e.name) {
            _VD.errLogger("There is an error with filter function (error shown below). Filter will be reset back to the default. If you are facing an infinite loop error, you can consider increasing the timeout period (clock icon) at the top / reducing the video dimensions.")

            _VD.errLogger([e], true);
        } else {
            _VD.errLogger(errMsg, false)
        }

        _VD.filter = copy_image;
        _VD.filter(_VD.pixels, _VD.temp);
    }
  
    _VD.context.putImageData(pixelObj, 0, 0);
}

// just draws once on frame and stops video
_VD.snapPicture = function() {
    _VD.drawFrame();
    _VD.stopVideo();
}

_VD.updateFPS = function(fps) {
    //prevent too big of an increase
    if (fps < 2 || fps > 30) {
        return;
    }

    const status = _VD.isPlaying;
    _VD.stopVideo();

    _FPS = fps;
    _VD.setupData();

    if (!status) {
        setTimeout(() => _VD.snapPicture(), 50);
        return;
    }

    _VD.startVideo();
}

// update the frame dimensions
_VD.updateDimensions = function(w, h) {
    if (w === _WIDTH && h === _HEIGHT || w > 500 || h > 500) {
        return;
    }

    const status = _VD.isPlaying;
    _VD.stopVideo();

    _WIDTH = w;
    _HEIGHT = h;
    
    _VD.video.width = w;
    _VD.video.height = h;
    _VD.canvas.width = w;
    _VD.canvas.height = h;

    _VD.setupData();

    if (!status) {
        setTimeout(() => _VD.snapPicture(), 50);
        return;
    }

    _VD.startVideo();
}
