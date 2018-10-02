//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//
//  Code for adventure game
// 
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//-------------------------------------------------------------------------
// NamedObject
//-------------------------------------------------------------------------
function NamedObject(name){
    this.__objName = name;
}
// For student use
NamedObject.prototype.getName = function(){
    return this.__objName;
}
// End of methods for student use
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------  
// Room
//-------------------------------------------------------------------------
function Room(name, x, y, z){
    const ROOM_MAX_CAP  = 5;

    this.__x            = x;
    this.__y            = y;
    this.__z            = z;
    this.__exits        = {};
    this.__things       = list();
    this.__occupants    = list();
    this.__maxCap       = ROOM_MAX_CAP;

    NamedObject.call(this, name);
}
Room.Inherits(NamedObject);
Room.__genRoom = null;
// For student use
Room.prototype.spaceLeft = function(){
    return this.__maxCap - length(this.__occupants);
}
Room.prototype.allowEntry = function(person){
    return (this.spaceLeft() > 0);
}
Room.prototype.getExit = function(dir){
    return this.__exits[dir] ? this.__exits[dir] : false;
}
Room.prototype.getExits = function() {
    var exitsList = [];
    for (var exit in this.__exits) {
        if (this.__exits[exit] instanceof Room)
            exitsList = pair(exit, exitsList);
    }
    return exitsList;
}
Room.prototype.getNeighbours = function() {
    var neighboursList = [];
    for (var exit in this.__exits) {
        if (this.__exits[exit] instanceof Room)
            neighboursList = pair(this.__exits[exit], neighboursList);
    }
    return neighboursList;
}
Room.prototype.getThings = function(){
    return this.__things;
}
Room.prototype.getOccupants = function(){
    return filter(function (occ) {return occ.getHealth() > 0}, this.__occupants);
}
// End of methods for student use
Room.prototype.__isConnected = function(room){
    return (!is_empty_list(member(room, this.getNeighbours())));
}
Room.prototype.__add = function(newEntity){
    if(newEntity instanceof Person){
        this.__addOccupant(newEntity);
    }else{
        this.__addThing(newEntity);
    }
}
Room.prototype.__addOccupant = function(newOccupant){
    if(!is_empty_list(member(newOccupant, this.__occupants))){
        display_message(newOccupant.getName() + " is already at " + this.getName());
    }else{
        this.__occupants = append(this.__occupants, list(newOccupant));
    }
}
Room.prototype.__addThing = function(newThing){
    if(!is_empty_list(member(newThing, this.__things))){
        display_message(newThing.getName() + " is already at " + this.getName());
    }else if(newThing instanceof Generator){
        if(Room.__genRoom == null){
            Room.__genRoom = this;
            this.__things = append(this.__things, list(newThing));
        }else{
            display_message("Generator room already exists at " + Room.__genRoom.getName());
        }
    }else{
        this.__things = append(this.__things, list(newThing));
    }
}
Room.prototype.__del = function(entity){
    if(entity instanceof Person){
        this.__delOccupant(entity);
    }else{
        this.__delThing(entity);
    }
}
Room.prototype.__delOccupant = function(occupant){
    if(is_empty_list(member(occupant, this.__occupants))){
        display_message(occupant.getName() + " is not at " + this.getName());
    }else{
        this.__occupants = remove(occupant, this.__occupants);
    }
}
Room.prototype.__delThing = function(thing){
    if(is_empty_list(member(thing, this.__things))){
        display_message(thing.getName() + " is not at " + this.getName());
    }else{
        this.__things = remove(thing, this.__things);
    }
}
Room.prototype.__getOccupantPos = function(occupant){
    var idx = 0;
    var occupants = this.getOccupants();
    while(!is_empty_list(occupants)){
        if(head(occupants) === occupant){
            return idx;
        }
        idx++;
        occupants = tail(occupants);
    }
    return -1;
}
Room.prototype.__resize = function(newCap){
    this.__maxCap = newCap;
}
Room.prototype.__setExit = function(dir, neighbour){
    var opp = OPPOSITE_DIR[dir];
    if(this.__exits[dir] instanceof Room){
        display_message(this.getName() + " already has a neighbour in the " + dir + " direction");
    }else if(neighbour.__exits[opp] instanceof Room){
        display_message(neighbour.getName() + " already has a neighbour in the " + opp + " direction");
    }else{
        this.__exits[dir] = neighbour;
        neighbour.__exits[opp] = this;
    }
}
Room.prototype.__getX = function(){
    return this.__x;
}
Room.prototype.__getY = function(){
    return this.__y;
}
Room.prototype.__getZ = function(){
    return this.__z;
}
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------
// ProtectedRoom
//-------------------------------------------------------------------------
function ProtectedRoom(name, x, y, z){
	Room.call(this, name, x, y, z);
}
ProtectedRoom.Inherits(Room);
// For student use
ProtectedRoom.prototype.allowEntry = function(person){
    var authorized = person.__hasKeycard();
    var hasSpace = Room.prototype.allowEntry.call(this, person);
    return (authorized && hasSpace);
}
// End of methods for student use
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------
// Ship
//-------------------------------------------------------------------------
function Ship(name){
    this.__entryPoints = [];
    this.__resize(Number.MAX_VALUE);
    Room.call(this, name, -1, -1, -1);
}
Ship.Inherits(Room);
Ship.prototype.__addEntryPoint = function(entryPoint){
    this.__entryPoints.push(entryPoint);
}
Ship.prototype.__deploy = function(){
    var occupants = this.getOccupants();
    while(!is_empty_list(occupants)){
        var occupant = head(occupants);
        if(occupant.__readyToDeploy()){
            var entryPoint = this.__getRandomEntryPoint(occupant);
            if(entryPoint !== null){
                occupant.__deploy(entryPoint);
            }else{
                break;
            }
        }
        occupants = tail(occupants);
    }
}
Ship.prototype.__getRandomEntryPoint = function(occupant){
    for(var i = 0; i < this.__entryPoints.length; i++){
        var randInd = Math.floor(Math.random()*this.__entryPoints.length);
        var temp = this.__entryPoints[i];
        this.__entryPoints[i] = this.__entryPoints[randInd];
        this.__entryPoints[randInd] = temp; 
    }
    for(var i = 0; i < this.__entryPoints.length; i++){
        if(this.__entryPoints[i].allowEntry(occupant)){
            return this.__entryPoints[i];
        }
    }    
    return null;
}
Ship.prototype.getOccupants = function() {
    return this.__occupants;
}
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------
// MobileObject
//-------------------------------------------------------------------------
function MobileObject(name, location){
    this.__location    = location;
    NamedObject.call(this, name);
}
MobileObject.Inherits(NamedObject);
// For student use
MobileObject.prototype.getLocation = function(){
    return this.__location;
}
// End of methods for student use
MobileObject.prototype.__setLocation = function(newLocation){
    this.__location = newLocation;
}
MobileObject.prototype.__install = function(newLocation){
    newLocation.__add(this);
    this.__setLocation(newLocation);
}
MobileObject.prototype.__remove = function(oldLocation){
    this.__setLocation(null);
    oldLocation.__del(this);
}
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------  
// Generator
//-------------------------------------------------------------------------
function Generator(initLoc){
    const GEN_NAME        = "generator";
    this.__destroyed    = false;
    MobileObject.call(this, GEN_NAME, initLoc);
}
Generator.Inherits(MobileObject);
Generator.prototype.__destroy = function(){
    display_message(this.getName() + " is destroyed!");
    this.__destroyed = true;
}
Generator.prototype.__isDestroyed = function(){
    return this.__destroyed;
}

function MakeAndInstallGenerator(initLoc){
    var newGen = new Generator(initLoc);
    newGen.__install(newGen.getLocation());
    return newGen;
}
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------  
// LivingThing
//-------------------------------------------------------------------------
function LivingThing(name, initLoc, health, regeneration){
    this.__health        = health;
    this.__maxHealth    = health;
    this.__regeneration    = regeneration;
    this.__deadFlag        = false;
    MobileObject.call(this, name, initLoc);
}
LivingThing.Inherits(MobileObject);
// For student use
LivingThing.prototype.getHealth = function(){
    return this.__health;
}
LivingThing.prototype.getMaxHealth = function(){
    return this.__maxHealth;
}
// End of methods for student use
LivingThing.prototype.__setHealth = function(newHealth){
    this.__health = newHealth;
}
LivingThing.prototype.__setMaxHealth = function(newMaxHealth){
    this.__maxHealth = newMaxHealth;
}
LivingThing.prototype.__setRegen = function(newRegen){
    this.__regeneration = newRegen;
}
LivingThing.prototype.__isDead = function(){
    return this.__deadFlag; 
}
LivingThing.prototype.__die = function(){
    this.__health = 0;
    this.__deadFlag = true; 
    display_message(this.getName() + " has been killed!");
}
LivingThing.prototype.__suffer = function(damage){
    damage = Math.floor(damage);
    if(damage === Number.MAX_VALUE){
        this.__die();
    }else if(damage > 0 && this.__health > 0){
        this.__health -= damage;
        display_message(this.getName() + " takes " + damage + " damage!");
        if(this.__health <= 0){
            this.__die();
        }
    }
}
LivingThing.prototype.__heal = function(amount){
    amount = Math.floor(amount);
    if(amount === Number.MAX_VALUE){
        this.__health = this.__maxHealth;
        display_message(this.getName() + " has been fully healed!");
    }else if(amount > 0){
        this.__health += amount;
        display_message(this.getName() + " recovers " + amount + " health!");
        if(this.__health >= this.__maxHealth){
            this.__health = this.__maxHealth;
        }
    }
}
LivingThing.prototype.__act = function(){
    if(0 < this.__health && this.__health < this.__maxHealth){
        var amount = this.__regeneration;
        this.__health += amount;
        display_message(this.getName() + " regenerates " + amount + " health!");
        if(this.__health >= this.__maxHealth){
            this.__health = this.__maxHealth;
        }
        display_message(this.getName() + " has " + this.__health + 
                        " out of " + this.__maxHealth + " health points");
    }
}
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------
// Person
//-------------------------------------------------------------------------
function Person(name, initLoc){
    const PERSON_HEALTH = 50;
    const PERSON_REGEN  = 1;
    this.__possessions  = list();
    this.__weaponCmds   = [];
    this.__extraCmds    = [];
    this.__prevLoc      = initLoc;
    this.__deployIn     = 0;
    this.__moveFlag     = true;

    LivingThing.call(this, name, initLoc, PERSON_HEALTH, PERSON_REGEN);
}
Person.Inherits(LivingThing);
Person.__actionMgrDelegate = null;
Person.__bounty = 5;
// For student use
Person.prototype.getPossessions = function(){
    return this.__possessions;
}
Person.prototype.say = function(stuff){
    if(stuff == null || stuff === ""){
        stuff = "Oh, nevermind.";
    }
    display_message("At " + this.getLocation().getName() + ": " + 
                    this.getName() + " says -- " + stuff);
}
Person.prototype.take = function(things){
    var canOwn      = [];
    var cannotOwn   = [];
    while(!is_empty_list(things)){
        var thing = head(things);
        if(thing instanceof Thing &&
           !(thing instanceof Generator) &&
           !thing.isOwned()){
            canOwn.push(thing);
        }else{
            cannotOwn.push(thing);
        }
        things = tail(things);
    }

    if(canOwn.length > 0){
        var takeMsg = "At " + this.getLocation().getName() + ": " + 
                      this.getName() + " takes: ( ";
        for(var i = 0; i < canOwn.length; i++){
            var thing = canOwn[i];
            this.__possessions = append(this.__possessions, list(thing));
            thing.__setOwner(this);
            thing.__remove(this.getLocation());
            takeMsg += thing.getName() + " ";
        }
        takeMsg += ")"
        display_message(takeMsg);
    }
    
    if(cannotOwn.length > 0){
        var cantTakeMsg = "(";
        for(var i = 0; i < cannotOwn.length; i++){
            var thing = cannotOwn[i];
            cantTakeMsg += thing.getName() + " ";
        }
        cantTakeMsg += " ) cannot be taken";
        display_message(cantTakeMsg);
    }
}
Person.prototype.drop = function(things){
    var owned       = [];
    var notOwned    = [];
    while(!is_empty_list(things)){
        var thing = head(things);
        if(thing instanceof Thing &&
           thing.getOwner() === this){
            owned.push(thing);
        }else{
            notOwned.push(thing);
        }
        things = tail(things);
    }

    if(owned.length > 0){
        var dropMsg = "At " + this.getLocation().getName() + ": " +
                      this.getName() + " drops: ( ";
        for(var i = 0; i < owned.length; i++){
            var thing = owned[i];
            this.__possessions = remove(thing, this.__possessions);
            thing.__setOwner(null);
            thing.__install(this.getLocation());
            dropMsg += thing.getName() + " ";
        }
        dropMsg += ")"
        display_message(dropMsg);
    }
    
    if(notOwned.length > 0){
        var cantDropMsg = "(";
        for(var i = 0; i < notOwned.length; i++){
            var thing = notOwned[i];
            cantDropMsg += thing.getName() + " ";
        }
        cantDropMsg += " ) cannot be dropped";
        display_message(cantDropMsg);
    }
}
Person.prototype.moveTo = function(newLoc){
    if(!this.__moveFlag){
        return false;
    }
    this.__moveFlag = false;
    
    var currLoc     = this.getLocation();
    if(currLoc === newLoc){
        display_message(this.getName() + " is already at " + 
                currLoc.getName());
        return false;
    }
    if(currLoc.__isConnected(newLoc) && 
       newLoc.allowEntry(this)){
        var fromPos = currLoc.__getOccupantPos(this);
        var fromLoc = currLoc;

        this.__prevLoc = currLoc;
        this.__remove(this.__prevLoc);
        this.__install(newLoc);

        var toPos   = newLoc.__getOccupantPos(this);
        var toLoc   = newLoc;

        var newAction = new Action(fromLoc, toLoc, fromPos, toPos, 
                                   MOVE_LIFETIME, MOVE_COL, MOVE_STYLE, MOVE_THICKNESS);
        Person.__actionMgrDelegate.__registerAction(newAction);

        display_message(this.getName() + " moves from " + 
                        currLoc.getName() + " to " + newLoc.getName());
        return true;
    }else{
        display_message(this.getName() + " can't move from " + 
                        currLoc.getName() + " to " + newLoc.getName());
        return false;
    }
}
Person.prototype.getPrevLoc = function(){
    return this.__prevLoc;
}
Person.prototype.go = function(direction){
    var currLoc = this.getLocation();
    var newLoc  = currLoc.getExit(direction);
    if(newLoc == false){
        display_message(this.getName() + " cannot go " + 
                        direction + " from " + currLoc.getName());
        return;
    }
    this.moveTo(newLoc);
}
Person.prototype.use = function(thing, args){
    if(thing instanceof Thing)
    {
        if(!(thing.__use instanceof Function)){
            display_message(this.getName() + " does not do anything!");
        }else if(thing.getOwner() != this){
            display_message(this.getName() + " does not own " + thing.getName() + "!");
        }else{
            thing.__use(args);
        }
    }
}
// End of methods for student use
Person.prototype.__act = function(){
    LivingThing.prototype.__act.call(this);
    this.__moveFlag = true;
    
    var possessions = this.getPossessions();
    while(!is_empty_list(possessions)){
        var possession = head(possessions);
        if(possession instanceof Weapon){
            possession.__act();
        }
        possessions = tail(possessions);
    }
}
Person.prototype.__recover = function(){
    if(this.__deployIn > 0){
        this.__deployIn--;
    }
    var possessions = this.getPossessions();
    while(!is_empty_list(possessions)){
        var possession = head(possessions);
        if(possession instanceof Weapon){
            possession.__act();
        }
        possessions = tail(possessions);
    }
}
Person.prototype.__readyToDeploy = function(){
    return (this.__deployIn == 0);
}
Person.prototype.__deploy = function(newLoc){
    var currLoc     = this.getLocation();
    if(this.__readyToDeploy() &&
       currLoc instanceof Ship && 
       newLoc.allowEntry(this))
    {
        this.__deadFlag    = false;
        this.__heal(Number.MAX_VALUE);
        this.__remove(currLoc);
        this.__prevLoc = currLoc;
        this.__install(newLoc);
        this.say("Entering enemy territory...");
        display_message(this.getName() + " moves from " + 
                        currLoc.getName() + " to " + newLoc.getName());
    }
}
Person.prototype.__evacuate = function(evacSite){    
    if(evacSite != null){
        this.say("I need help here!");
    }
    var toDrop = list();
    var possessions = this.getPossessions();
    var toDrop = filter(function (item) {return !(item instanceof Weapon);}, possessions);
    this.drop(toDrop);
    this.__prevLoc = this.getLocation();
    this.__remove(this.__prevLoc);
    if(evacSite != null){
        this.__deployIn = CONF_RECOVER_TIME;
        this.__install(evacSite);
    }
}
Person.prototype.__hasKeycard = function(){
    return (!is_empty_list(filter(function (item) {return item instanceof Keycard;}, this.getPossessions())));
}
Person.prototype.__isThief = function(){
    return this.__hasKeycard();
}
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------
// Player
//-------------------------------------------------------------------------
function Player(name){
    if(name != null && 
       name.length > Player.__nameLimit){
        name = name.substring(0,Player.__nameLimit);
    }
    Person.call(this, name, null);
}
Player.Inherits(Person);
Player.__evacLoc = null;
Player.__nameLimit = 4;
Player.prototype.__die = function(){
    Person.prototype.__die.call(this);
    this.__evacuate(Player.__evacLoc);
}

function RegisterPlayer(newPlayer, level, engine,
                        saberColor, laserColor, litColor, bombColor){
    engine.__registerPlayer(newPlayer);
    var playerLoc = newPlayer.getLocation();
    newPlayer.take(list(MakeAndInstallLightSaber(playerLoc, level, saberColor),
                        MakeAndInstallLightSaber(playerLoc, level, saberColor),
                        MakeAndInstallLaser(playerLoc, level, laserColor),
                        MakeAndInstallLightning(playerLoc, level, litColor),
                        MakeAndInstallLightning(playerLoc, level, litColor),
                        MakeAndInstallGenBomb(playerLoc, level, bombColor)));    
    return newPlayer;
}
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------
// ServiceBot
//-------------------------------------------------------------------------
function ServiceBot(name, initLoc, inertia){
    Person.call(this, name, initLoc);
    this.__inertia = inertia;
}
ServiceBot.Inherits(Person);
ServiceBot.__bounty = 10;
ServiceBot.__actorMgrDelegate = null;
ServiceBot.prototype.__act = function(){
    Person.prototype.__act.call(this);
    if(Math.floor(Math.random()*this.__inertia) == 0){
        var randomLoc = this.__pickRandomDir();
        if(!is_empty_list(randomLoc)){
            this.moveTo(head(randomLoc));
        }
    }
}
ServiceBot.prototype.__die = function(){
    Person.prototype.__die.call(this);
    this.__evacuate();
    ServiceBot.__actorMgrDelegate.__removeActor(this);
}
ServiceBot.prototype.__pickRandomDir = function(){
    var self = this;
    var accessible = filter(function (room) {return room.allowEntry(self);}, self.getLocation().getNeighbours());
    if(accessible.length > 0){
        return list(list_ref(accessible, random(length(accessible))));
    }
    return list();
}
ServiceBot.prototype.__evacuate = function(evacSite){
    this.say("ENERGY LEVELS CRITICAL. SHUTTING DOWN.");
    Person.prototype.__evacuate.call(this);
    if(CONF_DRONE_BOT){
        var newDrone = MakeAndInstallDrone(this.__prevLoc);
    }
}

function MakeAndInstallBot(name, initLoc, inertia){
    var newBot = new ServiceBot(name, initLoc, inertia);
    newBot.__install(newBot.getLocation());
    newBot.take(list(MakeAndInstallKeycard(newBot.getLocation())));
    ServiceBot.__actorMgrDelegate.__registerActor(newBot);
    return newBot;
}
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------
// SecurityDrone
//-------------------------------------------------------------------------
function SecurityDrone(initLoc){
    this.__visited = [];
    this.__spawnCycle = CONF_ALARM_CYCLE;
    this.__initLoc = initLoc;
    Person.call(this, "d-" + SecurityDrone.__droneCount.toString(16), initLoc);
    SecurityDrone.__droneCount++;
}
SecurityDrone.Inherits(Person);
SecurityDrone.__droneCount = 0;
SecurityDrone.__actorMgrDelegate = null;
SecurityDrone.prototype.__spawn = function(threshold){
    if(Math.floor(Math.random()*threshold) == 0){
        var newDrone = MakeAndInstallDrone(this.__initLoc);
    }
}
SecurityDrone.prototype.__act = function(){
    Person.prototype.__act.call(this);
    
    var self = this;
    var myLocation = self.getLocation();
    
    this.__spawnCycle--;
    if(this.__spawnCycle == 0){
        this.__spawnCycle = CONF_ALARM_CYCLE;
        if(this.__initLoc.spaceLeft() > 0){
            this.__spawn(length(this.__initLoc.getOccupants()));
        }
    }

    var thieves = filter(function(person) {return person instanceof Player && person.__isThief();}, self.getLocation().getOccupants());
    for_each(function (thief) {
        var readyWeapons = filter(function(item) {return item instanceof Weapon && !item.isCharging();}, self.getPossessions());
        if (!is_empty_list(readyWeapons)) {
            self.use(head(readyWeapons), list(thief));
        }
    }, thieves);
    
    var litter = myLocation.getThings();
    var keycards = filter(function (item) {return item instanceof Keycard;}, litter);

    if(length(keycards) > 0){
        this.take(keycards);
    }
    
    var adjacent = myLocation.getNeighbours();
    var adjNew = filter(function(loc) {return !self.__hasVisited(loc) && loc.allowEntry(self);}, adjacent);
    var randomDest = null;
    if(adjNew.length > 0){
        randomDest = list_ref(adjNew, random(length(adjNew)));
    }else{
        randomDest = list_ref(adjacent, random(length(adjacent)));
    }
    this.moveTo(randomDest);
}
SecurityDrone.prototype.__die = function(){
    Person.prototype.__die.call(this);
    this.__evacuate();
    SecurityDrone.__actorMgrDelegate.__removeActor(this);
}
SecurityDrone.prototype.__hasVisited = function(location){
    return (this.__visited.indexOf(location) != -1);
}
SecurityDrone.prototype.moveTo = function(newLoc){
    var success = Person.prototype.moveTo.call(this, newLoc);
    if(success && !this.__hasVisited(this.getLocation())){
        this.__visited.push(this.getLocation());
    }
    return success;
}
SecurityDrone.prototype.__evacuate = function(evacSite){
    this.say("ENERGY LEVELS CRITICAL. SHUTTING DOWN.");
    Person.prototype.__evacuate.call(this);
}

function MakeAndInstallDrone(initLoc){
    var activeDrones = SecurityDrone.__actorMgrDelegate.__getType(SecurityDrone);
    if(activeDrones.length > CONF_MAX_DRONES){
        return null;
    }
    var newDrone = new SecurityDrone(initLoc);
    newDrone.__install(newDrone.getLocation());
    newDrone.take(list(MakeAndInstallZapRay(newDrone.getLocation()),
                       MakeAndInstallKeycard(newDrone.getLocation())));
    SecurityDrone.__actorMgrDelegate.__registerActor(newDrone);
    return newDrone;
}
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------
// Thing
//-------------------------------------------------------------------------
function Thing(name, initLoc){
    this.__owner     = null;
    MobileObject.call(this, name, initLoc);
}
Thing.Inherits(MobileObject);
// For student use
Thing.prototype.getLocation = function(){
    if(this.isOwned()){
        return this.__owner.getLocation();
    }else{
        return MobileObject.prototype.getLocation.call(this);
    }
}
Thing.prototype.isOwned = function(){
    if(this.__owner == null){
        return false;
    }
    return true;
}
Thing.prototype.getOwner = function(){
    return this.__owner;
}
// End of methods for student use
Thing.prototype.__setOwner = function(newOwner){
    this.__owner = newOwner;
}
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------
// Weapon
//-------------------------------------------------------------------------
function Weapon(name, initLoc, cooldown, 
                atkColor, atkWidth, atkStyle, 
                minDmg, maxDmg, targetCheck, maxTarg, maxRange){
    this.__chargeCycle  = 0;
    this.__cooldown     = cooldown;
    this.__maxTarg      = maxTarg;
    this.__atkColor     = atkColor;
    this.__atkWidth     = atkWidth;
    this.__atkStyle     = atkStyle;
    this.__minDmg       = minDmg;
    this.__maxDmg       = maxDmg;
    this.__targetCheck  = targetCheck;
    this.__range        = maxRange;
    Thing.call(this, name, initLoc);
}
Weapon.Inherits(Thing);
Weapon.__actionMgrDelegate = null;
Weapon.__statsMgrDelegate = null;
// For student use
Weapon.prototype.isCharging = function(){
    return (this.__chargeCycle > 0);
}
Weapon.prototype.chargeCyclesLeft = function(){
    return this.__chargeCycle;
}
Weapon.prototype.getMinDmg = function(){
    return this.__minDmg;
}
Weapon.prototype.getMaxDmg = function(){
    return this.__maxDmg;
}
Weapon.prototype.getRange = function(){
    return this.__range;
}
// End of methods for student use
Weapon.prototype.__use = function(targets){
    var attacker = this.getOwner();

    if(this.isCharging()){
        display_message(attacker.getName() + " cannot use " + 
                this.getName() + " as it is still charging...");
        return;
    }

    var validTargets = [];
    var atkMsg = attacker.getName() + " uses " + this.getName() + 
            " to attack: ";
    while(!is_empty_list(targets)){
        var target = head(targets);
        if(this.__targetCheck(target) && target.getHealth() > 0 && validTargets.indexOf(target) == -1){
            validTargets.push(target);
            atkMsg += target.getName() + " ";
        }
        if(validTargets.length == this.__maxTarg){
            break;
        }
        targets = tail(targets);
    }

    if(validTargets.length > 0){
        display_message(atkMsg);
        for(var i = 0; i < validTargets.length; i++){
            var victim = validTargets[i];

            var fromPos     = attacker.getLocation().__getOccupantPos(attacker);
            var fromLoc     = attacker.getLocation();

            var toPos       = victim.getLocation().__getOccupantPos(victim);
            var toLoc       = victim.getLocation();

            var newAction = new Action(fromLoc, toLoc, fromPos, toPos, 
                                       ATK_LIFETIME, this.__atkColor, 
                                       this.__atkStyle, this.__atkWidth);
            Weapon.__actionMgrDelegate.__registerAction(newAction);

            victim.__suffer(this.__getRandomDmg());

            if(victim.__isDead()){
                if(attacker instanceof Player){
                    var points = 0;
                    if(victim instanceof ServiceBot){
                        points = ServiceBot.__bounty;
                    }else {
                        points = Person.__bounty;
                    }
                    Weapon.__statsMgrDelegate.__registerKill(attacker.getName(), points);
                }
                if(victim instanceof Player){
                    Weapon.__statsMgrDelegate.__registerDeath(victim.getName());
                }
            }
        }
        this.__chargeCycle = this.__cooldown;
        if (Weapon.__atkReview instanceof Function) {
            Weapon.__atkReview(attacker, validTargets, this);
        }
    }
}
Weapon.prototype.__getRandomDmg = function(){
    return (this.__minDmg + Math.round(Math.random()*(this.__maxDmg - this.__minDmg)));
}

Weapon.prototype.__rangeCheck = function(target){
    var wpnLoc = this.getLocation();
    var wpnRange = this.__range;
    var targetLoc = target.getLocation();

    var sameRoom = (wpnLoc === targetLoc);
    var inRange = sameRoom || !is_empty_list(filter(function (dir) {
            function helper(curRoom, range) {
                return curRoom && !(curRoom instanceof ProtectedRoom) && (range < 0 ? false : curRoom === targetLoc || helper(curRoom.getExit(dir), range - 1));
            }
            return helper(wpnLoc.getExit(dir), wpnRange - 1);
        }, wpnLoc.getExits()));

    if(!inRange){
        display_message(target.getName() + " is not within weapon range.");
    }
    return inRange;
}
Weapon.prototype.__act = function(){
    if(this.isCharging()){
        this.__chargeCycle--;
        if(this.isCharging()){
            display_message("Charging " + this.getName() + ": " +
                            this.chargeCyclesLeft() + " charge cycles remaining " +
                            "until weapon can be used...");
        }
    }
}
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------
// Melee Weapon
//-------------------------------------------------------------------------
function MeleeWeapon(name, initLoc, cooldown, 
                     atkColor, atkWidth, atkStyle, 
                     minDmg, maxDmg, targetCheck){

    const MELEE_TARGETS = 1;
    const MELEE_RANGE   = 0;
    var wpn = this;
    
    Weapon.call(this, name, initLoc, cooldown, 
                  atkColor, atkWidth, atkStyle, 
                  minDmg, maxDmg, 
                  function(target){ return targetCheck(target) && wpn.__rangeCheck(target); }, 
                  MELEE_TARGETS, MELEE_RANGE);
}
MeleeWeapon.Inherits(Weapon);
MeleeWeapon.prototype.__rangeCheck = function(target){
    inRange = (this.getLocation() === target.getLocation());
    if(!inRange){
        display_message(target.getName() + " is not within weapon range.");
    }
    return inRange;
}
// For student use
MeleeWeapon.prototype.swing = function(target){
    this.__use(list(target));
}
// End of methods for student use
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------
// Ranged Weapon
//-------------------------------------------------------------------------
function RangedWeapon(name, initLoc, range, cooldown, 
                      atkColor, atkWidth, atkStyle, 
                      minDmg, maxDmg, targetCheck){

    const RANGE_TARGETS = 1;
    var wpn = this;

    Weapon.call(this, name, initLoc, cooldown, 
                  atkColor, atkWidth, atkStyle, 
                  minDmg, maxDmg,
                  function(target){ return targetCheck(target) && wpn.__rangeCheck(target); },
                  RANGE_TARGETS, range);
}
RangedWeapon.Inherits(Weapon);
// For student use
RangedWeapon.prototype.shoot = function(target){
    this.__use(list(target));
}
// End of methods for student use
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------
// Spell Weapon
//-------------------------------------------------------------------------
function SpellWeapon(name, initLoc, range, cooldown, 
                     atkColor, atkWidth, atkStyle, 
                     minDmg, maxDmg, targetCheck){

    const SPELL_TARGETS = Number.MAX_VALUE;
    var wpn = this;

    Weapon.call(this, name, initLoc, cooldown, 
                  atkColor, atkWidth, atkStyle, 
                  minDmg, maxDmg,
                  function(target){ return targetCheck(target) && wpn.__rangeCheck(target); }, 
                  SPELL_TARGETS, range);
}
SpellWeapon.Inherits(Weapon);
SpellWeapon.prototype.__use = function(direction){
    this.cast(direction);
}
// For student use
SpellWeapon.prototype.cast = function(direction){
    var targets = list();
    var rngLeft = this.__range + 1;
    var roomInRange = this.getOwner().getLocation();
    while(rngLeft > 0){
        targets = append(targets, roomInRange.getOccupants());
        rngLeft--;
        roomInRange = roomInRange.getExit(direction);
        if(roomInRange === false ||
           roomInRange instanceof ProtectedRoom)
        {
            break;
        }
    }
    if(length(targets) == 0){
        display_message("Nothing is within range of " + this.getName() + ".");
        return;
    }
    Weapon.prototype.__use.call(this, targets);
}
// End of methods for student use
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------
// Bomb
//-------------------------------------------------------------------------
function Bomb(name, initLoc, range, countdown,
              atkColor, atkWidth, atkStyle, 
              minDmg, maxDmg, targetCheck){

    const BOMB_TARGETS  = Number.MAX_VALUE;
    this.__bombLoc      = null;
    this.__state        = Bomb.STATE_ACTIVE;
    var wpn = this;

    Weapon.call(this, name, initLoc, countdown, 
                  atkColor, atkWidth, atkStyle, 
                  minDmg, maxDmg, 
                  function(target){ return targetCheck(target) && wpn.__rangeCheck(target); }, 
                  BOMB_TARGETS, range);
}
Bomb.Inherits(Weapon);
Bomb.__actionMgrDelegate = null;
Bomb.__statsMgrDelegate = null;
Bomb.STATE_ACTIVE   = 0;
Bomb.STATE_ARMED    = 1;
Bomb.STATE_DEPLETED = 2;
Bomb.prototype.__use = function(){
    this.arm();
}
// For student use
Bomb.prototype.getLocation = function(){
    if(!this.canBeUsed()){
        return this.__bombLoc;
    }else{
        return Thing.prototype.getLocation.call(this);
    }
}
Bomb.prototype.getCountdown = function(){
    return this.__cooldown;
}
Bomb.prototype.arm = function(){
    if(!this.canBeUsed()){
        display_message(this.getName() + " has already been armed.");
        return;
    }

    this.__chargeCycle  = this.__cooldown;
    this.__bombLoc      = this.getOwner().getLocation();
    this.__state        = Bomb.STATE_ARMED;
}
Bomb.prototype.canBeUsed = function(){
    return (this.__state == Bomb.STATE_ACTIVE);
}
// End of methods for student use
Bomb.prototype.__detonate = function(){
    var directions = this.getLocation().getExits();
    var targets = this.__bombLoc.getOccupants();
    this.__state = Bomb.STATE_DEPLETED;

    var newAction = new Action(this.__bombLoc, this.__bombLoc, ROOM_POS, ROOM_POS, 
                               ATK_LIFETIME, this.__atkColor, 
                               this.__atkStyle, this.__atkWidth*2);
    Bomb.__actionMgrDelegate.__registerAction(newAction);
    
    while (!is_empty_list(directions)) {
        var direction = head(directions);
        directions = tail(directions);
        var rngLeft = this.__range;
        var roomInRange = this.__bombLoc.getExit(direction);
        while(rngLeft > 0){
            if(roomInRange == false ||
               roomInRange instanceof ProtectedRoom)
            {
                break;
            }
            targets = append(targets, roomInRange.getOccupants());
            newAction = new Action(roomInRange, roomInRange, ROOM_POS, ROOM_POS, 
                                   ATK_LIFETIME, this.__atkColor, 
                                   this.__atkStyle, this.__atkWidth*2);
            Bomb.__actionMgrDelegate.__registerAction(newAction);
            rngLeft--;
            roomInRange = roomInRange.getExit(direction);
        }
    }

    Weapon.prototype.__use.call(this, targets);
    
    var things = this.__bombLoc.getThings();
    for(var i = 0; i < things.length; i++){
        if(things[i] instanceof Generator){
            things[i].__destroy();
            Bomb.__statsMgrDelegate.__registerWin(this.getOwner().getName());
            break;
        }
    }
}
Bomb.prototype.__act = function(){
    if(this.__state != Bomb.STATE_ARMED){
        return;
    }

    if(this.__chargeCycle > 0){
        display_message("WARNING!  " + this.getName() +
            " will detonate at " + this.__bombLoc.getName() +
            " in " + this.chargeCyclesLeft()) + "...";

        this.__chargeCycle--;
        return;
    }

    this.__detonate();
}
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------
// Weapon Factories
//-------------------------------------------------------------------------
function MakeAndInstallZapRay(initLoc){
    const ZAPRAY_NAME   = "zapray";
    const ZAPRAY_CD     = 1;
    const ZAPRAY_COLOR  = COL_GOLD;
    const ZAPRAY_WIDTH  = 4;
    const ZAPRAY_STYLE  = STYLE_LINE;
    const ZAPRAY_MINDMG = 11;
    const ZAPRAY_MAXDMG = 30;

    var thiefCheck = function(target){
                         return target.__isThief();
                     }

    var newWpn = new MeleeWeapon(ZAPRAY_NAME, initLoc, ZAPRAY_CD, 
                                 ZAPRAY_COLOR, ZAPRAY_WIDTH, ZAPRAY_STYLE, 
                                 ZAPRAY_MINDMG, ZAPRAY_MAXDMG, thiefCheck);
    newWpn.__install(newWpn.getLocation());
    return newWpn;
}

function MakeAndInstallLightSaber(initLoc, lvl, saberColor){
    const LSABER_NAME   = "lightsaber";
    const LSABER_CD     = 1;
    const LSABER_WIDTH  = 4;
    const LSABER_STYLE  = STYLE_LINE;

    const LSABER_MINDMG = Math.floor(1/2 + 3/2*lvl);
    const LSABER_MAXDMG = Math.floor(1/2 + 9/5*lvl);
    
    var targetCheck = function(target){
                          if(target instanceof Person){
                              return true;
                          }
                          return false;  
                      }

    var newWpn = new MeleeWeapon(LSABER_NAME, initLoc, LSABER_CD, 
                                 saberColor, LSABER_WIDTH, LSABER_STYLE, 
                                 LSABER_MINDMG, LSABER_MAXDMG, targetCheck);
    newWpn.__install(newWpn.getLocation());
    return newWpn;
}

function MakeAndInstallLaser(initLoc, lvl, laserColor){
    const LASER_NAME    = "laser";
    const LASER_RANGE   = 3;
    const LASER_CD      = 4;
    const LASER_WIDTH   = 2;
    const LASER_STYLE   = STYLE_LINE;

    const LASER_MINDMG  = Math.floor(3/4*lvl);
    const LASER_MAXDMG  = Math.floor(3/2*lvl);
    
    var targetCheck = function(target){
                          if(target instanceof Person){
                              return true;
                          }
                          return false;  
                      }

    var newWpn = new RangedWeapon(LASER_NAME, initLoc, LASER_RANGE, LASER_CD,
                                  laserColor, LASER_WIDTH, LASER_STYLE, 
                                  LASER_MINDMG, LASER_MAXDMG, targetCheck);
    newWpn.__install(newWpn.getLocation());
    return newWpn;
}

function MakeAndInstallLightning(initLoc, lvl, litColor){
    const LIGHT_NAME    = "lightning";
    const LIGHT_RANGE   = 2;
    const LIGHT_CD      = 1;
    const LIGHT_WIDTH   = 2;
    const LIGHT_STYLE   = STYLE_LINE;

    const LIGHT_MINDMG  = Math.floor(lvl/4);
    const LIGHT_MAXDMG  = Math.floor(lvl/2);
    
    var targetCheck = function(target){
                          if(target instanceof ServiceBot ||
                             target instanceof SecurityDrone ){
                              return true;
                          }
                          return false;  
                      }

    var newWpn = new SpellWeapon(LIGHT_NAME, initLoc, LIGHT_RANGE, LIGHT_CD,
                                 litColor, LIGHT_WIDTH, LIGHT_STYLE, 
                                 LIGHT_MINDMG, LIGHT_MAXDMG, targetCheck);
    newWpn.__install(newWpn.getLocation());
    return newWpn;
}

function MakeAndInstallGenBomb(initLoc, lvl, bombColor){
    const GENBOMB_NAME      = "gen-bomb";
    const GENBOMB_RANGE     = 1;
    const GENBOMB_CD        = 3;
    const GENBOMB_WIDTH     = 20;
    const GENBOMB_STYLE     = STYLE_CIRCLE;

    const GENBOMB_MINDMG    = 1;
    const GENBOMB_MAXDMG    = Math.floor(lvl/2);
    
    var targetCheck = function(target){
                          if(target instanceof Person){
                              return true;
                          }
                          return false;  
                      }

    var newWpn = new Bomb(GENBOMB_NAME, initLoc, GENBOMB_RANGE, GENBOMB_CD,
                          bombColor, GENBOMB_WIDTH, GENBOMB_STYLE, 
                          GENBOMB_MINDMG, GENBOMB_MAXDMG, targetCheck);
    newWpn.__install(newWpn.getLocation());
    return newWpn;
}
//------------------------------------------------------------------------- 

//-------------------------------------------------------------------------
// Keycard
//-------------------------------------------------------------------------
function Keycard(initLoc){
    const KEYCARD_NAME = "keycard";
    Thing.call(this, KEYCARD_NAME, initLoc);
}
Keycard.Inherits(Thing);
Keycard.__alarmSounded = false;
Keycard.__actorMgrDelegate = null;
Keycard.prototype.__setOwner = function(newOwner){
    if( CONF_DRONE_CARD && 
        Room.__genRoom != null &&
        newOwner != null &&
        !(newOwner instanceof ServiceBot) &&
        !(newOwner instanceof SecurityDrone) &&
        !this.____alarmSounded &&
        Room.__genRoom.spaceLeft() > 0)
    {
        var newDrone = MakeAndInstallDrone(Room.__genRoom);;
        this.__alarmSounded = true;
    }
    Thing.prototype.__setOwner.call(this, newOwner);
}

function MakeAndInstallKeycard(initLoc){
    var newCard = new Keycard(initLoc);
    newCard.__install(newCard.getLocation());
    return newCard;
}

//-------------------------------------------------------------------------
// Action
//-------------------------------------------------------------------------
function Action(fromLoc, toLoc, fromPos, toPos, 
        lifetime, color, style, thickness){
    this.__fromLoc        = fromLoc;
    this.__toLoc        = toLoc;
    this.__fromPos        = fromPos;
    this.__toPos        = toPos;
    this.__color        = color;
    this.__style        = style;
    this.__thickness    = thickness;
    this.__lifetime        = lifetime;
}
Action.prototype.__tick = function(){
    this.__lifetime--;
}
Action.prototype.__isAlive = function(){
    return (this.__lifetime > 0);
}
Action.prototype.__getFromLoc = function(){
    return this.__fromLoc;
}
Action.prototype.__getToLoc = function(){
    return this.__toLoc;
}
Action.prototype.__getFromPos = function(){
    return this.__fromPos;
}
Action.prototype.__getToPos = function(){
    return this.__toPos;
}
Action.prototype.__getColor = function(){
    return this.__color;
}
Action.prototype.__getStyle = function(){
    return this.__style;
}
Action.prototype.__getThickness = function(){
    return this.__thickness;
}
//-------------------------------------------------------------------------

function createCustomPlayer(name) {
    function Me(name) {
      Player.call(this.name)
    }
    Me.Inherits(Player);  
    var me = new Me(name);
    return me;
}
 

  