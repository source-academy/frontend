//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//
//  Code for adventure game
// 
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// config

var CONF_MIN_INERTIA 	= 2;
var CONF_MAX_INERTIA 	= 4;
var CONF_DRONE_CARD	    = false;	
var CONF_DRONE_BOT	    = true;
var CONF_ALARM_CYCLE	= 5;
var CONF_MAX_DRONES	    = 30;
var CONF_RECOVER_TIME	= 3;

// constants

const OPPOSITE_DIR	    = {north: "south", south: "north", east: "west", west: "east", up: "down", down: "up"};

const COL_BLACK		    = "Black";
const COL_RED		    = "Red";
const COL_BLUE		    = "Blue";
const COL_WHITE		    = "White";
const COL_GOLD		    = "Gold";
const COL_GRAY		    = "Gray";
const COL_PURPLE	    = "Purple";
const COL_ORANGE	    = "Orange";

const STYLE_LINE	    = 0;
const STYLE_CIRCLE  	= 1;

const ROOM_POS		    = -1;

const MOVE_COL		    = COL_GRAY;
const MOVE_STYLE	    = STYLE_LINE;
const MOVE_THICKNESS	= 6;
const MOVE_LIFETIME	    = 2;
const ATK_LIFETIME	    = 3;

// legend for layout

// combining properties with OR: a protected room with a generator = p|g
// checking properties with AND: is room a protected room? room&p (common is just room === c)

// 	0: common 	    1: protected 	2: link west 	4: link north 
//	8: link down 	16: generator 	32: start 	    64: bot
/*
Commented out because it screws with minifier

const c = 0;
const p = 1;
const w = 2;
const n	= 4;
const d	= 8;
const g	= 16;
const s	= 32;
const b	= 64;
*/
