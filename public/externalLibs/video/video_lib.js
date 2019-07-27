function red_of(px){ // returns the red, green, blue values of px respectively
	return px[0];
}
function green_of(px){
	return px[1];
}
function blue_of(px){
	return px[2];
}
function set_rgb(px,r,g,b){ // assigns the r,g,b values to this px
	px[0] = r;
	px[1] = g;
	px[2] = b;
}
// sets the rgb values of dest to the same as src
function copy_pixel(src,dest){ 
	dest[0] = src[0];
	dest[1] = src[1];
	dest[2] = src[2];
}
// a filter which does not do anything
// every pixel in dest will be set to the same rgb values as its corresponding pixel in src
function copy_image(src, dest){
	for (var i=0; i<_WIDTH; i = i+1){
		for (var j=0; j<_HEIGHT; j = j+1){
			copy_pixel(src[i][j], dest[i][j]);
		}
	}
}
// constrains val such that 0 <= val <= 255
function constrain_color(val){
	return val > 255 ? 255 
			: val < 0 ? 0 : val;
}
// returns a new filter that will have the effect of applying filter1 first and then filter2
function compose_filter(filter1, filter2){
	function filters(src, dest){
		filter1(src, dest);
		copy_image(dest, src);
		filter2(src, dest);
	}
	return filters;
}

// returns true if the absolute difference in red( and green and blue) value of px1 and px2 
//     is smaller than the threshold value
function pixel_similar(p1,p2, threshold){
	return math_abs(p1[0] - p2[0]) < threshold && 
			math_abs(p1[1] - p2[1]) < threshold && 
			math_abs(p1[2] - p2[2]) < threshold;
}

// returns the number of milliseconds passed since (you know when) at the start of this frame
// for usage in time-dependent filters
// since each frame takes non-negligible milliseconds to compute
function currentFrameRuntime(){ return VD._timeInCurrentFrame; } 

// returns an array that can be used to store temporary values
// this array retains its values from frame to frame
function getTempArray(){ return VD._TEMP; }

var _WIDTH = 100;
var _HEIGHT = 75;
// returns the height of the video
// ie the number of pixels in the vertical direction
function getVideoHeight(){
	return _HEIGHT;
}
// returns the width of the video
// ie the number of pixels in the horizontal direction
function getVideoWidth(){
	return _WIDTH;
}

// changes the current filter to my_filter
// default filter is copy_image
function apply_filter(filter){ 
	VD._student_filter = filter;
}
/*
    make_distortion_filter(reverse_mapping)
    make_static_distortion_filter(reverse_mapping)
        distortion
            a rearrangement of the pixels in the original src
        reverse_mapping([x,y])
            this is a function that takes in [x,y], which are the coordinates of a pixel on dest
            and returns [u,v], the coordinates of a pixel on src
        These two functions will return a filter that will
            map every pixel - dest[x][y] for all x,y - to take the rgb values of src[u][v]
            if [u,v] exceeds the boundaries of src, a black pixel will be displayed instead
    
        make_static_distortion_filter
            for filters that will not change with time
            the pixel mappings are only calculated once
        make_distortion_filter
            for filters that will change with time
            the pixel mappings are recalculated in every frame
*/
function make_distortion_filter(reverse_mapping){
	function filter(src, dest){
		for (var i=0; i<_WIDTH; i = i + 1){
			for (var j=0; j<_HEIGHT; j = j + 1){
				var pt = reverse_mapping([i,j]);
				if (0 <= pt[0] && pt[0] < _WIDTH && 0 <= pt[1] && pt[1] < _HEIGHT){
					copy_pixel(src[pt[0]][pt[1]], dest[i][j]);
				} else {
					set_rgb(dest[i][j], 0,0,0);
				}
			}
		}
	}
	return filter;
}
function make_static_distortion_filter(reverse_mapping){
	var rev_map_grid = [];
	for (var i=0; i<_WIDTH; i = i + 1){
		rev_map_grid[i] = [];
		for (var j=0; j<_HEIGHT; j = j + 1){
			var pt = reverse_mapping([i,j]);
			if (0 <= pt[0] && pt[0] < _WIDTH && 0 <= pt[1] && pt[1] < _HEIGHT){
				rev_map_grid[i][j] = pt;
			} else {
				rev_map_grid[i][j] = null;
			}
			
		}
	}
	function filter(src, dest){
		for (var i=0; i<_WIDTH; i = i + 1){
			for (var j=0; j<_HEIGHT; j = j + 1){
				var pt = rev_map_grid[i][j];
				if (pt != null){
					copy_pixel(src[pt[0]][pt[1]], dest[i][j]);
				} else {
					set_rgb(dest[i][j], 0,0,0);
				}
			}
		}
	}
	return filter;
}
VD = {};
VD._SRCIMG = [];
VD._DESTIMG = [];
VD._TEMP = [];
VD._timeInCurrentFrame = 0;
VD._student_filter = copy_image;
VD._requestID = null;
VD._pixelData = null;
VD._video_playing = false;
VD._video = null;
VD._canvas = null;
VD._context = null;


VD._setup = function(){
	//create the two image arrays that will be used throughout 
	for (var i=0; i<_WIDTH; i = i+1){
		VD._SRCIMG[i] = [];
		VD._DESTIMG[i] = [];
		VD._TEMP[i] = [];
		for (var j=0; j<_HEIGHT; j = j+1){
			VD._SRCIMG[i][j] = [0,0,0];
			VD._DESTIMG[i][j] = [0,0,0];
			VD._TEMP[i][j] = [0,0,0];
		}
	}	
}

//load the data from the 1D array into the 2D array VD._SRCIMG
VD._make_image_abstraction = function(arr){
	for (var i=0; i<_WIDTH; i++){
		for (var j=0; j<_HEIGHT; j++){
			var pix = VD._SRCIMG[i][j];
			var red = (j * _WIDTH + i)*4;
			pix[0] = arr[red];
			pix[1] = arr[red + 1];
			pix[2] = arr[red + 2];
		}
	}
}
//load the data from the 2D array VD._DESTIMG into the 1D pixel array pixelData
VD._make_pixelData = function(pixelData){
	for (var i=0; i<_WIDTH; i++){
		for (var j=0; j<_HEIGHT; j++){
			var pix = VD._DESTIMG[i][j];
			var red = (j * _WIDTH + i)*4;
			pixelData.data[red] = pix[0];
			pixelData.data[red+1] = pix[1];
			pixelData.data[red+2] = pix[2];
			pixelData.data[red+3] = 255;
		}
	}
}

/**
 * The main loop
 */
VD._draw = function() {	
	VD._requestID = window.requestAnimationFrame(VD._draw);

	VD._timeInCurrentFrame = Date.now();

	VD._context.drawImage(VD._video, 0, 0, _WIDTH, _HEIGHT);
	VD._pixelData = VD._context.getImageData(0, 0, _WIDTH, _HEIGHT);
		
	VD._make_image_abstraction(VD._pixelData.data);//from 1D to 2D
	VD._student_filter(VD._SRCIMG, VD._DESTIMG);//process the image
	VD._make_pixelData(VD._pixelData); //from 2D to 1D
	VD._context.putImageData(VD._pixelData, 0, 0);
		
	// for debugging purposes
	// _frameNo++;	
    // var timeSpent = Date.now() - VD._timeInCurrentFrame;
	// _sumTime += timeSpent;
	// console.log("Average: " + (_sumTime/_frameNo).toFixed(2) + "    Current frame: " + timeSpent);
};
// var _frameNo = 0;
// var _sumTime = 0;

//stops the looping
VD._noLoop = function(){
	if (VD._video_playing){
		VD._video_playing = false;
		window.cancelAnimationFrame(VD._requestID);
	}
}
//starts the main loop
VD._loop = function(){
	if (!VD._video_playing){
		VD._video_playing = true;
		VD._requestID = window.requestAnimationFrame(VD._draw);
	}
}

VD.init = function($video, $canvas){ 
	VD._video = $video;
	VD._canvas = $canvas;
	VD._context = VD._canvas.getContext('2d');
	VD._setup();
}
VD.deinit = function(){ 
	VD._noLoop();
	VD._closeWebcam();
	VD._video = null;
	VD._canvas = null;
	VD._context = null;
}
VD._closeWebcam = function(){
	let stream = VD._video.srcObject;
	if (stream !== null){
		let tracks = stream.getTracks();
		tracks.forEach((track) => {
			track.stop();
		});
		VD._video.srcObject = null;
	}
}
VD.handleCloseVideo = function(){
	VD._noLoop();
	VD._closeWebcam();
	VD._requestID = window.requestAnimationFrame(() => {
		VD._context.clearRect(0, 0, VD._canvas.width, VD._canvas.height);
	});
}
VD.handleStartVideo = function(){
	if (!VD._video.srcObject){
		if (navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices.getUserMedia({ video: true })
				.then(function (stream) {
					VD._video.srcObject = stream;
					VD._loop();
				})
				.catch(function (error) {
					console.log('Hmm, something went wrong. (error code ' + error.code + ')');
				});
			} else {
				console.log('The browser you are using does not support getUserMedia');
		}
	} else {
		VD._loop();
	}
}
VD.handlePauseVideo = function(){
	VD._noLoop();
}
VD.handleUpdateDimensions = function(w, h){
	if (w === _WIDTH && h === _HEIGHT){ return; }
	const wasLooping = VD._video_playing;
	VD._noLoop();
	VD.handleResetFilter();
	_WIDTH = w;
	_HEIGHT = h;
	VD._video.width = w;
	VD._video.height = h;
	VD._canvas.width = w;
	VD._canvas.height = h;
	
	VD._setup();
	if (wasLooping) {
		VD._loop();
	}
}
VD.handleResetFilter = function(){
	VD._student_filter = copy_image;
}

/* run this in playground for testing

const WIDTH = getVideoWidth();
const HEIGHT = getVideoHeight();
function upside_down(src, dest){
    for (var x=0; x<WIDTH; x = x+1){
        for (var y=0; y<HEIGHT; y = y+1){
            copy_pixel(
                src[x][HEIGHT -1 - y], 
                dest[x][y]
                );
        }
    }
}

apply_filter(upside_down);


*/
