//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//
//  Code for adventure game
//
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++

window.LOOP_INTERVAL     = 300;
const SCALE_FACTOR      = 7;

const RM_SIZE           = 10*SCALE_FACTOR;
const OCC_SIZE          = 1*SCALE_FACTOR;
const OCC_FONT          = SCALE_FACTOR + "pt Courier New";

const INITOFFSETX       = RM_SIZE / 2;
const INITOFFSETY       = RM_SIZE / 2;
const MAIN_LABEL        = "Deathcube";
const MAIN_WIDTH        = RM_SIZE * 10;
const MAIN_HEIGHT       = RM_SIZE * 10;

const CAP_WALL          = "round"
const CAP_ACTION        = "round";

const CONTROLS_LABEL    = "Controls";
const CONTROLS_WIDTH    = 300;
const CONTROLS_HEIGHT   = 12*SCALE_FACTOR;    // doesn't work, windows have a min height of 100px

const SBOARD_LABEL      = "Scoreboard";
const SBOARD_WIDTH      = 300;
const SBOARD_HEIGHT     = MAIN_HEIGHT - CONTROLS_HEIGHT;

const MAIN_BG           = "#DCC8FF";         // 220 200 255

const REG_WIDTH         = 1;
const WALL_WIDTH        = 4;
const FIELD_WIDTH       = 4;
const ARROW_LENGTH      = 1*SCALE_FACTOR;

const CONT_MODE         = 0;
window.STEP_MODE        = 1;

const STATE_RUN         = 0;
const STATE_END         = 1;
const STATE_EXIT        = 2;

const WIN_POINTS        = 100;

var ROOM_OCC_OFFSETS    = [{x: SCALE_FACTOR * 5,   y: SCALE_FACTOR * 1},
                           {x: SCALE_FACTOR * 2.5, y: SCALE_FACTOR * 4},
                           {x: SCALE_FACTOR * 7.5, y: SCALE_FACTOR * 4},
                           {x: SCALE_FACTOR * 2.5, y: SCALE_FACTOR * 7},
                           {x: SCALE_FACTOR * 7.5, y: SCALE_FACTOR * 7}];

var ARROW_UP_OFFSET     =  {x: SCALE_FACTOR * 85/10, y: SCALE_FACTOR * 5/10};
var ARROW_DOWN_OFFSET   =  {x: SCALE_FACTOR * 5/10,  y: SCALE_FACTOR * 85/10};

function getRoomX(x, z){
  return INITOFFSETX + Math.floor(z / 2)*RM_SIZE*5 + x*RM_SIZE;
}

function getRoomY(y, z){
  return INITOFFSETY + (z % 2)*RM_SIZE*5 + y*RM_SIZE;
}

//-------------------------------------------------------------------------
function EndGame(condition, result){
  this.__condition    = condition;
  this.__result       = result;
}
//-------------------------------------------------------------------------
function Stats(name, cons){
  this.__name         = name;
  this.__cons         = cons;
  this.__points       = 0;
  this.__evacs        = 0;
  this.__kills        = 0;
  this.__wins         = 0;
  this.__isTraitor    = false;
}
//-------------------------------------------------------------------------
function StatsManager(){
  this.__statsHash    = {};
  this.__statsList    = [];
  this.__scoreBoard   = null;
}
StatsManager.__compareStats = function(a, b){
  if(a.__points > b.__points){
    return -1;
  }else if(a.__points < b.__points){
    return 1;
  }

  if(a.__wins > b.__wins){
    return -1;
  }else if(a.__wins < b.__wins){
    return 1;
  }

  if(a.__kills > b.__kills){
    return -1;
  }else if(a.__kills < b.__kills){
    return 1;
  }

  if(a.__evacs < b.__evacs){
    return -1;
  }else if(a.__evacs > b.__evacs){
    return 1;
  }

  return 0;
}
StatsManager.prototype.__registerNew = function(playerName, playerCons){
  this.__statsHash[playerName] = new Stats(playerName, playerCons);
  this.__statsList.push(this.__statsHash[playerName]);
  this.__updateScoreBoard();
}
StatsManager.prototype.__registerKill = function(playerName, score){
  this.__statsHash[playerName].__kills += 1;
  this.__statsHash[playerName].__points += score;
  this.__updateScoreBoard();
}
StatsManager.prototype.__registerDeath = function(playerName){
  this.__statsHash[playerName].__evacs += 1;
  this.__updateScoreBoard();
}
StatsManager.prototype.__registerWin = function(playerName){
  this.__statsHash[playerName].__wins += 1;
  this.__statsHash[playerName].__points += WIN_POINTS;
  this.__updateScoreBoard();
}
StatsManager.prototype.__registerTraitor = function(playerName){
  this.__statsHash[playerName].__isTraitor = true;
  this.__updateScoreBoard();
}
StatsManager.prototype.__getStats = function(playerName){
  if(this.__statsHash[playerName] != null){
    return this.__statsHash[playerName];
  }
  return null;
}
StatsManager.prototype.__getRank = function(playerName){
  var stats = this.__statsHash[playerName];
  if(stats == null){
    return Number.MAX_VALUE;
  }
  return (this.__statsList.indexOf(stats) + 1);
}
StatsManager.prototype.__sortStats = function(){
  this.__statsList.sort(StatsManager.__compareStats);
}
StatsManager.prototype.__getWinners = function(optimalNum){
  this.__sortStats();
  var winners = [];

  var idx = 0;
  while(this.__statsList.length > idx &&
        optimalNum > idx){
    winners.push(this.__statsList[idx].__cons.name);
    idx++;
  }
  while(this.__statsList.length > idx &&
        StatsManager.__compareStats(this.__statsList[optimalNum-1],
                                    this.__statsList[idx]) == 0){
    winners.push(this.__statsList[idx].__cons.name);
    idx++;
  }

  return winners;
}
StatsManager.prototype.__setScoreBoard = function(scoreBoard){
  this.__scoreBoard = scoreBoard;
}
StatsManager.prototype.__updateScoreBoard = function(){
  if(this.__scoreBoard == null){
    return;
  }
  this.__sortStats();
  ui_clear(this.__scoreBoard);
  for(var i = 0; i < this.__statsList.length; i++){
    var scoreTxt = this.__statsList[i].__name + " ";
    if(this.__statsList[i].__isTraitor){
      scoreTxt += "[TRAITOR]<br>";
    }else{
      scoreTxt += "<br>";
    }
    scoreTxt +=     " Points: " + this.__statsList[i].__points  + " " +
      " Wins: " + this.__statsList[i].__wins  + " " +
      " Kills: " + this.__statsList[i].__kills  + " " +
      " Evacs: " + this.__statsList[i].__evacs + " ";

    ui_write(this.__scoreBoard, scoreTxt);
  }
}
//-------------------------------------------------------------------------
function ActionManager(){
  this.__actions    = [];
}
ActionManager.prototype.__registerAction = function(newAction){
  if(newAction instanceof Action){
    this.__actions.push(newAction);
  }
}
ActionManager.prototype.__drawActions = function(viewport){
  for(var i = 0; i < this.__actions.length; i++){
    var action      = this.__actions[i];

    var fromX       = action.__getFromLoc().__getX();
    var fromY       = action.__getFromLoc().__getY();
    var fromZ       = action.__getFromLoc().__getZ();
    var fromPos     = action.__getFromPos();

    var fromDrawX   = getRoomX(fromX, fromZ);
    var fromDrawY   = getRoomY(fromY, fromZ);

    if(fromPos != ROOM_POS){
      fromDrawX += ROOM_OCC_OFFSETS[fromPos].x;
      fromDrawY += ROOM_OCC_OFFSETS[fromPos].y;
    }else{
      fromDrawX += RM_SIZE / 2;
      fromDrawY += RM_SIZE / 2;
    }

    var toX     = action.__getToLoc().__getX();
    var toY     = action.__getToLoc().__getY();
    var toZ     = action.__getToLoc().__getZ();
    var toPos   = action.__getToPos();

    var toDrawX = getRoomX(toX, toZ);
    var toDrawY = getRoomY(toY, toZ);

    if(toPos != ROOM_POS){
      toDrawX += ROOM_OCC_OFFSETS[toPos].x;
      toDrawY += ROOM_OCC_OFFSETS[toPos].y;
    }else{
      toDrawX += RM_SIZE / 2;
      toDrawY += RM_SIZE / 2;
    }

    if(action.__getStyle() == STYLE_LINE){
      draw_line(viewport,
                fromDrawX, fromDrawY,
                toDrawX, toDrawY,
                action.__getColor(), action.__getThickness(),
                CAP_ACTION);
    }else if(action.__getStyle() == STYLE_CIRCLE){
      draw_circle(viewport,
                  toDrawX,
                  toDrawY,
                  action.__getThickness() / 2,
                  action.__getColor(), true);
    }
    action.__tick();
  }
  for(var i = this.__actions.length-1; i > -1 ; i--){
    if(!this.__actions[i].__isAlive()){
      this.__actions.splice(i, 1);
    }
  }
}
//-------------------------------------------------------------------------
ActorManager.__statsMgrDelegate = null;
ActorManager.__errorDelegate = null;
function ActorManager(){
  this.__actors     = [];
  this.__current    = 0;
}
ActorManager.prototype.__registerActor = function(newActor){
  if(newActor != null && newActor.__act != undefined){
    this.__actors.push(newActor)
  }
}
ActorManager.prototype.__removeActor = function(actor){
  var actorIdx = this.__actors.indexOf(actor);
  if(actorIdx != -1){
    this.__actors.splice(actorIdx, 1);
    if(actorIdx < this.__current){
      this.__current--;
    }
  }

}
ActorManager.prototype.__act = function(){
  if(this.__actors.length == 0){
    return false;
  }
  if(this.__current < 0){
    this.__current = 0;
  }

  if(this.__current == 0){
    display_message("---Tick---");
    this.__sort();
  }

  var currentActor = this.__actors[this.__current];
  if(!currentActor.__isDead()){
    try {
      currentActor.__act();
    } catch (err) {
      if (ActorManager.__errorDelegate) {
        ActorManager.__errorDelegate(currentActor, err);
      }
    }
  }else{
    currentActor.__recover();
  }

  this.__current = (this.__current+1) % this.__actors.length;
  if(this.__current == 0){
    return true; // 1 round has passed
  }
  return false;
}

ActorManager.prototype.__getType = function(type){
  var registered = [];
  for(var i = 0; i < this.__actors.length; i++){
    if(this.__actors[i] instanceof type){
      registered.push(this.__actors[i]);
    }
  }
  return registered;
}
// concat by type has the potential issue of overlaps; not using __getType
ActorManager.prototype.__sort = function(){
  var rankDelegate = ActorManager.__statsMgrDelegate;
  var typeRanks = [Player, SecurityDrone, ServiceBot];
  var sorted = this.__actors.sort(function(a, b){
    var a_name = a.getName();
    var b_name = b.getName();
    for (var i = 0; i < typeRanks.length; ++i) {
      var a_is_type = a instanceof typeRanks[i];
      var b_is_type = b instanceof typeRanks[i];
      if (a_is_type && b_is_type)
        break;
      else if (a_is_type)
        return -1;
      else if (b_is_type)
        return 1;
    }
    // now both have same highest-ranked type
    if (a instanceof Player) {
      if(rankDelegate.__getRank(a_name) < rankDelegate.__getRank(b_name)){
        return -1;
      }else if(rankDelegate.__getRank(a_name) > rankDelegate.__getRank(b_name)){
        return 1;
      }
      return 0;
    } else {
      return (a_name < b_name ? -1 : (a_name == b_name ? 0 : 1));
    }
  });
  this.__actors = sorted;
}
//-------------------------------------------------------------------------
function DeathCubeEngine(mode, layout){
  this.__deathcube    = [];
  this.__ship         = null;
  this.__endGame      = [];
  this.__viewport     = null;
  this.__controlWin   = null;
  this.__scoreWin     = null;
  this.__ctrlBtn      = null;
  this.__exitBtn      = null;
  this.__timer        = null;
  this.__botCount     = 0;
  this.__actorMgr     = null;
  this.__actionMgr    = null;
  this.__statsMgr     = null;
  this.__state        = STATE_RUN;
  this.__mode         = mode;
  this.__stepsLeft    = 0;
  this.__roundsLeft   = 0;
	this.__win			= null;

  this.__initMgrs = function(){
    this.__actorMgr = new ActorManager();
    this.__actionMgr = new ActionManager();
    this.__statsMgr = new StatsManager();
    ActorManager.__statsMgrDelegate = this.__statsMgr;
    Keycard.__actorMgrDelegate = this.__actorMgr;
    ServiceBot.__actorMgrDelegate = this.__actorMgr;
    SecurityDrone.__actorMgrDelegate = this.__actorMgr;
    Person.__actionMgrDelegate = this.__actionMgr;
    Weapon.__actionMgrDelegate = this.__actionMgr;
    Weapon.__statsMgrDelegate = this.__statsMgr;
    Bomb.__actionMgrDelegate = this.__actionMgr;
    Bomb.__statsMgrDelegate = this.__statsMgr;
    ActorManager.__errorDelegate = function(actor, err) {display_message("Error from " + actor.getName() + ": " + err.message + " at " + err.fileName + ", line " + err.lineNumber);};
  }

  var minInertia  = CONF_MIN_INERTIA;
  var maxInertia  = CONF_MAX_INERTIA;
  var inertia     = minInertia;
  this.__makeRoom = function(roomData, x, y, z){
		var c = 0;
		var p = 1;
		var w = 2;
		var n	= 4;
		var d	= 8;
		var g	= 16;
		var s	= 32;
		var b	= 64;

    var newRoom = new (roomData&p ? ProtectedRoom : Room)("room-"+z+y+x, x, y, z);

    if(roomData&g){
      MakeAndInstallGenerator(newRoom);
    }
    if(roomData&s){
      this.__ship.__addEntryPoint(newRoom);
    }
    if(roomData&b){
      var newBot = MakeAndInstallBot("bot-"+this.__botCount, newRoom, inertia);
      this.__actorMgr.__registerActor(newBot);
      inertia = minInertia + ((inertia + 1 - minInertia) % (maxInertia - minInertia + 1));
      this.__botCount++;
    }
    return newRoom;
  }

  this.__connectRoom = function(roomData, x, y, z){
		var c = 0;
		var p = 1;
		var w = 2;
		var n	= 4;
		var d	= 8;
		var g	= 16;
		var s	= 32;
		var b	= 64;

    var room = this.__deathcube[z][y][x];
    if(roomData&w){
      if(x - 1 >= 0){
        room.__setExit("west", this.__deathcube[z][y][x-1]);
      }
    }
    if(roomData&n){
      if(y - 1 >= 0){
        room.__setExit("north", this.__deathcube[z][y-1][x]);
      }
    }
    if(roomData&d){
      if(z - 1 >= 0){
        room.__setExit("down", this.__deathcube[z-1][y][x]);
      }
    }
  }

  this.__initRooms = function(layout){
    this.__ship = new Ship("JFDI-Ship");
    Player.__evacLoc = this.__ship;

    // first pass, just create and populate rooms
    for(var z = 0; z < layout.length; z++){
      var newLevel = [];
      for(var y = 0; y < layout[z].length; y++){
        var newLine = [];
        for(var x = 0; x < layout[z][y].length; x++){
          var newRoom = this.__makeRoom(layout[z][y][x], x, y, z);
          newLine.push(newRoom);
        }
        newLevel.push(newLine);
      }
      this.__deathcube.push(newLevel);
    }
    // second pass, connect rooms to one another
    for(var z = 0; z < layout.length; z++){
      for(var y = 0; y < layout[z].length; y++){
        for(var x = 0; x < layout[z][y].length; x++){
          this.__connectRoom(layout[z][y][x], x, y, z);
        }
      }
    }
  }

  this.__initWin = function(){
		this.__win			= create_window();
    this.__viewport    = create_viewport(MAIN_LABEL, 0, 0, MAIN_WIDTH, MAIN_HEIGHT, this.__win);
    this.__controlWin  = create_panel(CONTROLS_LABEL, MAIN_WIDTH, 0,
                                      CONTROLS_WIDTH, CONTROLS_HEIGHT,
                                      MAIN_BG, this.__win);
    this.__scoreWin    = create_panel(SBOARD_LABEL, MAIN_WIDTH, CONTROLS_HEIGHT,
                                      SBOARD_WIDTH, SBOARD_HEIGHT,
                                      COL_WHITE, this.__win);
    this.__statsMgr.__setScoreBoard(this.__scoreWin);

    var engine = this;
    this.__ctrlBtn     = make_button("ctrlBtn", this.__controlWin, null);

    switch(this.__mode){
      case CONT_MODE:
        set_button_text(this.__ctrlBtn, "Suspend Mission");
        set_button_callback(this.__ctrlBtn, function(){ engine.__suspend(); });
        break;
      case window.STEP_MODE:
        set_button_text(this.__ctrlBtn, "Next Action");
        set_button_callback(this.__ctrlBtn, function(){ engine.__step(1); });
        break;
    }

    this.__exitBtn     = make_button("exitBtn",
                                     this.__controlWin,
                                     function(){ engine.__exit(); });
    set_button_text(this.__exitBtn, "Abort Mission");
  }

  this.__initMgrs();
  this.__initRooms(layout);
  this.__initWin();
}
DeathCubeEngine.prototype.__step = function(num){
  this.__stepsLeft += num;
}
DeathCubeEngine.prototype.__runRounds = function(num){
  this.__roundsLeft += num;
}
DeathCubeEngine.prototype.__suspend = function(){
  this.__stop();
  var engine = this;
  set_button_text(this.__ctrlBtn, "Resume Mission");
  set_button_callback(this.__ctrlBtn, function(){ engine.__resume(); });
}
DeathCubeEngine.prototype.__resume = function(){
  this.__start();
  var engine = this;
  set_button_text(this.__ctrlBtn, "Suspend Mission");
  set_button_callback(this.__ctrlBtn, function(){ engine.__suspend(); });
}
DeathCubeEngine.prototype.__start = function(){
  var engine = this;
  if(this.__state != STATE_RUN){
    return;
  }
  this.__timer = setInterval(function(){
    engine.__draw();

    if(engine.__mode == window.STEP_MODE &&
       engine.__roundsLeft == 0 && engine.__stepsLeft == 0){
      return;
    }

    var roundTick = engine.__update();

    if(engine.__mode == window.STEP_MODE){
      if(engine.__roundsLeft > 0 && roundTick){
        engine.__roundsLeft--;
      }else if(engine.__roundsLeft == 0 &&
               engine.__stepsLeft > 0){
        engine.__stepsLeft--;
      }
    }
  }, window.LOOP_INTERVAL);
}

DeathCubeEngine.prototype.__stop = function(){
  clearInterval(this.__timer);
  this.__timer = null;
}
DeathCubeEngine.prototype.__update = function(){
  this.__ship.__deploy();
  var roundTick = this.__actorMgr.__act();
  for(var i = 0; i < this.__endGame.length; i++){
    if(this.__endGame[i].__condition()){
      this.__state = STATE_END;
      this.__draw();
      this.__stop();
      this.__endGame[i].__result();
      break;
    }
  }
  return roundTick;
}
DeathCubeEngine.prototype.__draw = function(){
  clear_frame(this.__viewport, MAIN_BG);

  this.__drawRoomBG();
  var levels = this.__deathcube.length;
  for(var z = 0; z < levels; z++){
    var nsLength = this.__deathcube[z].length;
    for(var y = 0; y < nsLength; y++){
      var ewLength = this.__deathcube[z][y].length;
      for(var x = 0; x < ewLength; x++){
        var room = this.__deathcube[z][y][x];
        var roomX = getRoomX(x, z);
        var roomY = getRoomY(y, z);

        this.__drawRoom(room, x, y, roomX, roomY);
        this.__drawOccupants(room, x, y, roomX, roomY);
      }
    }
  }
  this.__actionMgr.__drawActions(this.__viewport);
}
DeathCubeEngine.prototype.__drawRoomBG = function(){
  var levels = this.__deathcube.length;
  for(var z = 0; z < levels; z++){
    var nsLength = this.__deathcube[z].length;
    for(var y = 0; y < nsLength; y++){
      var ewLength = this.__deathcube[z][y].length;
      for(var x = 0; x < ewLength; x++){
        var room = this.__deathcube[z][y][x];
        var roomX = getRoomX(x, z);
        var roomY = getRoomY(y, z);
        draw_rect(this.__viewport,
                  roomX, roomY,
                  RM_SIZE, RM_SIZE,
                  COL_WHITE, true);
      }
    }
  }
}
DeathCubeEngine.prototype.__drawRoom = function(room, x, y, roomX, roomY){
  // draw_rect(this.__viewport,
  //           roomX, roomY,
  //           RM_SIZE, RM_SIZE,
  //           COL_WHITE, true);
  // draw_rect(this.__viewport,
  //           roomX, roomY,
  //           RM_SIZE, RM_SIZE,
  //           COL_BLACK, false);

  var northBoundary   = (y === 0);
  var southBoundary   = (room.getExit("south") == false);
  var westBoundary    = (x === 0);
  var eastBoundary    = (room.getExit("east") == false);
  var pathUp          = (room.getExit("up") != false);
  var pathDown        = (room.getExit("down") != false);

  if(northBoundary){
    draw_line(this.__viewport,
              roomX, roomY,
              roomX + RM_SIZE,
              roomY,
              COL_BLACK, WALL_WIDTH,
              CAP_WALL);
  }
  if(westBoundary){
    draw_line(this.__viewport,
              roomX, roomY,
              roomX,
              roomY + RM_SIZE,
              COL_BLACK, WALL_WIDTH,
              CAP_WALL);
  }
  if(eastBoundary){
    draw_line(this.__viewport,
              roomX + RM_SIZE, roomY,
              roomX + RM_SIZE,
              roomY + RM_SIZE,
              COL_BLACK, WALL_WIDTH,
              CAP_WALL);
  }else if(room instanceof ProtectedRoom ||
           room.getExit("east") instanceof ProtectedRoom){
    draw_line(this.__viewport,
              roomX + RM_SIZE, roomY,
              roomX + RM_SIZE,
              roomY + RM_SIZE,
              COL_RED, WALL_WIDTH,
              CAP_WALL);
  }else{
    draw_line(this.__viewport,
              roomX + RM_SIZE, roomY,
              roomX + RM_SIZE,
              roomY + RM_SIZE,
              COL_BLACK, REG_WIDTH,
              CAP_WALL);
  }
  if(southBoundary){
    draw_line(this.__viewport,
              roomX, roomY + RM_SIZE,
              roomX + RM_SIZE,
              roomY + RM_SIZE,
              COL_BLACK, WALL_WIDTH,
              CAP_WALL);
  }else if(room instanceof ProtectedRoom ||
           room.getExit("south") instanceof ProtectedRoom){
    draw_line(this.__viewport,
              roomX, roomY + RM_SIZE,
              roomX + RM_SIZE,
              roomY + RM_SIZE,
              COL_RED, WALL_WIDTH,
              CAP_WALL);
  }else{
    draw_line(this.__viewport,
              roomX, roomY + RM_SIZE,
              roomX + RM_SIZE,
              roomY + RM_SIZE,
              COL_BLACK, REG_WIDTH,
              CAP_WALL);
  }

  if(pathUp){
    var col = COL_BLACK;
    if(room.getExit("up") instanceof ProtectedRoom){
      col = COL_RED;
    }
    draw_up_arrow(this.__viewport,
                  roomX + ARROW_UP_OFFSET.x,
                  roomY + ARROW_UP_OFFSET.y,
                  ARROW_LENGTH, col);
  }

  if(pathDown){
    var col = COL_BLACK;
    if(room.getExit("down") instanceof ProtectedRoom){
      col = COL_RED;
    }
    draw_down_arrow(this.__viewport,
                    roomX + ARROW_DOWN_OFFSET.x,
                    roomY + ARROW_DOWN_OFFSET.y,
                    ARROW_LENGTH, col);
  }
}
DeathCubeEngine.prototype.__drawOccupants = function(room, x, y, roomX, roomY){
  var occupants = room.getOccupants();
  var occCnt = length(occupants);
  for(var i = 0; i < occCnt; i++){
    var occupant = head(occupants);
    var occupantX = roomX + ROOM_OCC_OFFSETS[i].x - OCC_SIZE / 2;
    var occupantY = roomY + ROOM_OCC_OFFSETS[i].y - OCC_SIZE / 2;

    if(occupant instanceof ServiceBot||
       occupant instanceof SecurityDrone)
    {
      draw_rect(this.__viewport,
                occupantX,
                occupantY,
                OCC_SIZE, OCC_SIZE,
                COL_BLACK, false);
    }else if(occupant instanceof Player){
      draw_circle(this.__viewport,
                  occupantX + OCC_SIZE / 2,
                  occupantY + OCC_SIZE / 2,
                  OCC_SIZE / 2,
                  COL_BLACK, false);
    }

    draw_text(this.__viewport, occupant.getName(),
              occupantX + OCC_SIZE / 2,
              occupantY + 2*OCC_SIZE,
              COL_BLACK, true, OCC_FONT);
    occupants = tail(occupants);
  }
}
DeathCubeEngine.prototype.__addEndGame = function(newEnd){
  this.__endGame.push(newEnd);
}
DeathCubeEngine.prototype.__registerPlayer = function(newPlayer){
  this.__actorMgr.__registerActor(newPlayer);
  this.__statsMgr.__registerNew(newPlayer.getName(), newPlayer.constructor);
  newPlayer.__install(this.__ship);
}
DeathCubeEngine.prototype.__exit = function(){
  if(this.__state == STATE_RUN){
    alert("Aborting Mission...");
    this.__state = STATE_EXIT;
    this.__stop();
  }
	Room.__genRoom = null;
	kill_window(this.__win);
}
DeathCubeEngine.prototype.__getWinners = function(optimalNum){
  return this.__statsMgr.__getWinners(optimalNum);
}
