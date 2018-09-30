//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//
//  Code for adventure game
// 
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++

function display_message(str){
    display(str);
}

function create_viewport(name, x, y, horiz, vert, win){	
    var canvas              = document.createElement("canvas");
    canvas.width            = horiz;
    canvas.height           = vert;
    canvas.style.width      = horiz + "px";
    canvas.style.height     = vert + "px";
    canvas.style.position   = "absolute";
    canvas.style.left       = x + "px";
    canvas.style.top        = y + "px";
    canvas.style.border     = "black 1px solid";

	win.appendChild(canvas);
    return canvas;
}
function clear_frame(canvas, color){
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function draw_rect(canvas, x, y, w, h, color, fill){
    var ctx = canvas.getContext("2d");
    ctx.lineCap = "butt";
    ctx.lineWidth = 1;
    if(fill){
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }else{
        ctx.strokeStyle = color;
        ctx.strokeRect(x, y, w, h);
    }
}

function draw_circle(canvas, x, y, r, color, fill){
    var ctx = canvas.getContext("2d");
    ctx.lineCap = "butt";
    ctx.lineWidth = 1;
    ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    if(fill){
        ctx.fillStyle = color;
        ctx.fill();
    }else{
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}

function draw_line(canvas, x1, y1, x2, y2, color, width, cap){
    var ctx = canvas.getContext("2d");
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.lineCap = cap;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.moveTo(x2, y2);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.stroke();
}

function draw_text(canvas, text, x, y, color, fill, font){
    var ctx = canvas.getContext("2d");
    ctx.lineCap = "butt";
    ctx.lineWidth = 1;
    ctx.textAlign = "center";
    ctx.font = font;
    if(fill){
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    }else{
        ctx.strokeStyle = color;
        ctx.strokeText(text, x, y);
    }
}
  
function draw_up_arrow(canvas, x, y, length, color){
    var ctx = canvas.getContext("2d");
    ctx.lineCap = "butt";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y+length);
    ctx.lineTo(x+length, y);
    ctx.lineTo(x+(length/2), y);
    ctx.lineTo(x+length, y+(length/2));
    ctx.lineTo(x+length, y);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.stroke();
}

function draw_down_arrow(canvas, x, y, length, color){
    var ctx = canvas.getContext("2d");
    ctx.lineCap = "butt";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y+length);
    ctx.lineTo(x+(length/2), y+length);
    ctx.lineTo(x, y+(length/2));
    ctx.lineTo(x, y+length);
    ctx.lineTo(x+length, y);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.stroke();
}

function create_panel(name, x, y, horiz, vert, bgcolor, win){
    var panel                   = document.createElement("div");
    panel.style.width           = horiz + "px";
    panel.style.height          = vert + "px";
    panel.style.backgroundColor = bgcolor;
    panel.style.position        = "absolute";
    panel.style.left            = x + "px";
    panel.style.top             = y + "px";
    panel.style.border          = "black 1px solid";
	panel.style.color			= "black";
    win.appendChild(panel);
    return panel;
}

function ui_clear(panel){
    panel.innerHTML = "";
}

function ui_write(panel, text){
    panel.innerHTML = panel.innerHTML+"<br>"+text;
}

function make_button(name, parent, callback){
    var container = document.createElement("div");
    var newButt = document.createElement("input");
 
    newButt.setAttribute("type", "button");
    newButt.setAttribute("name", name);
    set_button_text(newButt, name);
    set_button_callback(newButt, callback);

    container.setAttribute("style", "text-align:center;");
    container.appendChild(newButt);
    parent.appendChild(container);
    
    return newButt;
}

function set_button_text(button, newText){
    button.setAttribute("value", newText);
}

function set_button_callback(button, newCallback){
    button.onclick = newCallback;

}

function create_window() {
	var d 					= document.createElement("div");
	d.style.width			= "100%";
	d.style.height			= "100%";
	d.style.position		= "fixed";
	d.style.left			= 0;
	d.style.top				= 0;
	d.style.backgroundColor = COL_WHITE;
	d.style["z-index"]		= 12000;
	window.document.body.appendChild(d);
	return d;
}

function kill_window(win) {
	document.body.removeChild(win);
}
