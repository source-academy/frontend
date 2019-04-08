// functions to modify, copy, get values from pixels
function red_of(px){
	return px[0];
}
function green_of(px){
	return px[1];
}
function blue_of(px){
	return px[2];
}
function set_red(px,r){
	px[0] = r;
}
function set_blue(px,g){
	px[1] = g;
}
function set_green(px,b){
	px[2] = b;
}
function set_rgb(px,r,g,b){
	px[0] = r;
	px[1] = g;
	px[2] = b;
}
function copy_pixel(src,dest){
	dest[0] = src[0];
	dest[1] = src[1];
	dest[2] = src[2];
}
function copy_image(src, dest){
	for (var i=0; i<_WIDTH; i = i+1){
		for (var j=0; j<_HEIGHT; j = j+1){
			copy_pixel(src[i][j], dest[i][j]);
		}
	}
}
function constrain_color(val){
	return val > 255 ? 255 
			: val < 0 ? 0 : val;
}
function compose_filter(filter1, filter2){
	function filters(src, dest){//not allowed to create new arrays 
		filter1(src, dest);
		copy_image(dest, src);
		filter2(src, dest);
	}
	return filters;
}
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
function pixel_equals(p1,p2){
	return p1[0] === p2[0] && 
			p1[1] === p2[1] && 
			p1[2] === p2[2];
}
function pixel_similar(p1,p2, threshold){
	return math_abs(p1[0] - p2[0]) < threshold && 
			math_abs(p1[1] - p2[1]) < threshold && 
			math_abs(p1[2] - p2[2]) < threshold;
}
var _startTime;
var _timeInCurrentFrame = 0;
function getTimeSinceStart(){ return _timeInCurrentFrame; } //time in milliseconds since the start of execution

function getTempArray(){ return _TEMP; }//returns a temp array that students can use to store data
const _TEMP = [];
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
	
	var capture;
	sketch.preload = function(){
		capture = sketch.createCapture(sketch.VIDEO);
		capture.size(_WIDTH,_HEIGHT);
		capture.hide(); //hide the live camera feed
		//maybe for graders, they can refer to this
		
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
		// videoCanvas.hide(); // TODO
		sketch.background(100);
		sketch.pixelDensity(1);
		_startTime = Date.now();
	};

	var frameNo = 0;
	var sumTime = 0;
	sketch.draw = function() {	
		frameNo++;	
		_timeInCurrentFrame = Date.now() - _startTime;
		sketch.image(capture, 0, 0, _WIDTH,_HEIGHT); 
		sketch.loadPixels();
		
		var timeBefore = Date.now();

		
		make_image_abstraction(sketch.pixels);//from 1D to 2D
		_student_filter(SRCIMG, DESTIMG);//process the image
		make_p5js_image(); //from 2D to 1D
		sketch.image(IMAGE,0,0,_WIDTH,_HEIGHT); //displays the image
		
		
		var timeAfter = Date.now();
		// for debugging purposes
		console.log(timeAfter - timeBefore);
		// sumTime += timeAfter - timeBefore;
		// console.log((sumTime/frameNo).toFixed(2) + "    " + (timeAfter - timeBefore));

	};
	
	removeVideo = sketch.remove;
};

var _WIDTH = 100;
var _HEIGHT = 75;
var video_canvas;
var myp5 = null;




var _student_filter = copy_image;
function apply_filter(filter){ 
	_student_filter = filter;
}
function setVideoDimensions(w,h){
	_WIDTH = w;
	_HEIGHT = h;
}
function getVideoHeight(){
	return _HEIGHT;
}
function getVideoWidth(){
	return _WIDTH;
}
// function start_video(){
// 	if (myp5 === null){
// 		myp5 = new p5(_s);
// 	}
// }
var removeVideo;
function stop_video(){ // bookmark TODO switch off webcam as well, I'm going to test, if we can switch to using html canvas instead of p5's canvas, we only need its draw fn
	if (myp5 !== null){
		removeVideo();
		myp5 = null;
	}
}
var canvas_parent;
VideoDisplay = {};
VideoDisplay.init = function(parent){
	canvas_parent = parent;
	if (myp5 === null){
		myp5 = new p5(_s);
	}
}
VideoDisplay.deinit = function(){
	stop_video();
}

/* run this in playground for testing


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

const WIDTH = 100;
const HEIGHT = 75;
setVideoDimensions(WIDTH, HEIGHT);
apply_filter(upside_down);


*/
