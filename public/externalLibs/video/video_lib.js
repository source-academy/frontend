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

var _timeInCurrentFrame = 0;
// returns the number of milliseconds passed since (you know when) at the start of this frame
// for usage in time-dependent filters
// since each frame takes non-negligible milliseconds to compute
function currentFrameRuntime(){ return _timeInCurrentFrame; } 

const _TEMP = [];
// returns an array that can be used to store temporary values
// this array retains its values from frame to frame
function getTempArray(){ return _TEMP; }

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

var _student_filter = copy_image;
// changes the current filter to my_filter
// default filter is copy_image
function apply_filter(filter){ 
	_student_filter = filter;
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
var _s = function( sketch ) {
	const SRCIMG = [];
	const DESTIMG = [];
	const IMAGE = sketch.createImage(_WIDTH, _HEIGHT);
	
	
	//load the data from the 1D array into the 2D array SRCIMG
	function make_image_abstraction(arr){
		for (var i=0; i<_WIDTH; i++){
			for (var j=0; j<_HEIGHT; j++){
				var pix = SRCIMG[i][j];
				var red = (j * _WIDTH + i)*4;
				pix[0] = arr[red];
				pix[1] = arr[red + 1];
				pix[2] = arr[red + 2];
			}
		}
	}
	//load the data from the 2D array DESTIMG into the 1D pixel array of IMAGE
	function make_p5js_image(){
		IMAGE.loadPixels();
		for (var i=0; i<_WIDTH; i++){
			for (var j=0; j<_HEIGHT; j++){
				var pix = DESTIMG[i][j];
				var red = (j * _WIDTH + i)*4;
				IMAGE.pixels[red] = pix[0];
				IMAGE.pixels[red+1] = pix[1];
				IMAGE.pixels[red+2] = pix[2];
				IMAGE.pixels[red+3] = 255;
			}
		}
		IMAGE.updatePixels();
	}
	
	sketch.preload = function(){
		if (capture === null){
			capture = sketch.createCapture(sketch.VIDEO);
			capture.size(_WIDTH,_HEIGHT);
			capture.hide(); //hide the live camera feed
		}
		
		//create the two image arrays that will be used throughout 
		for (var i=0; i<_WIDTH; i = i+1){
			SRCIMG[i] = [];
			DESTIMG[i] = [];
			_TEMP[i] = [];
			for (var j=0; j<_HEIGHT; j = j+1){
				SRCIMG[i][j] = [0,0,0];
				DESTIMG[i][j] = [0,0,0];
				_TEMP[i][j] = [0,0,0];
			}
		}		
	}

	sketch.setup = function() {
		video_canvas = sketch.createCanvas(_WIDTH, _HEIGHT);
		video_canvas.parent(canvas_parent);
		sketch.background(100);
		sketch.pixelDensity(1);
		_startTime = Date.now();
	};

	var frameNo = 0;
	var sumTime = 0;
	sketch.draw = function() {	
		_timeInCurrentFrame = Date.now();
		sketch.image(capture, 0, 0, _WIDTH,_HEIGHT);
		sketch.loadPixels();
		
		make_image_abstraction(sketch.pixels);//from 1D to 2D
		_student_filter(SRCIMG, DESTIMG);//process the image
		make_p5js_image(); //from 2D to 1D
		sketch.image(IMAGE,0,0,_WIDTH,_HEIGHT); //displays the image
		
		// for debugging purposes
		frameNo++;	
        var timeSpent = Date.now() - _timeInCurrentFrame;
		sumTime += timeSpent;
		// console.log("Average: " + (sumTime/frameNo).toFixed(2) + "    Current frame: " + timeSpent);

	};
	my_sketch = sketch;
};

var canvas_parent;
var video_canvas = null;
var capture = null;
var myp5 = null;
VideoDisplay = {};
var my_sketch;
VideoDisplay.init = function(parent){ 
	canvas_parent = parent;
	if (video_canvas != null){
		video_canvas.parent(canvas_parent);
	}
}
VideoDisplay.deinit = function(){ 
	if (myp5 !== null){
		my_sketch.noLoop();
	}
}
VideoDisplay.handleStartVideo = function(){
	if (myp5 === null){
		myp5 = new p5(_s);
	} else {
		my_sketch.loop();
	}
}
VideoDisplay.handlePauseVideo = function(){
	if (myp5 !== null){

		my_sketch.noLoop();
	}
}
VideoDisplay.handleUpdateDimensions = function(w, h){
	if (w === _WIDTH && h === _HEIGHT){ return; }
	if (myp5 !== null){
		my_sketch.noLoop();
		my_sketch.remove();
	}
	VideoDisplay.handleResetFilter();
	_WIDTH = w;
	_HEIGHT = h;
	if (myp5 !== null){
		myp5 = null;
		capture = null;
		VideoDisplay.handleStartVideo();
	}
}
VideoDisplay.handleResetFilter = function(){
	_student_filter = copy_image;
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
