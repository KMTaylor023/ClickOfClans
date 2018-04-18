"use strict";

//This is the clients socket
var socket = {};

var users = {}; //the users in the lobby the client is in
var attacks = {}; //any attacks being sent
var canvas = void 0; //the canvas the game is on
var ctx = void 0; //the canvas context
var myHash = void 0;
var myHost = void 0;
var mouseClicked = false; //is the mouse currently clicked?
var animationFrame = void 0; // current animatino frame


var client_showGame = function client_showGame() {
    document.querySelector("#game").style.display = "block";
    document.querySelector("#lobby").style.display = "none";

    animationFrame = requestAnimationFrame(update);
};

// Function Name: getMouse()
// returns mouse position in local coordinate system of element
// Author: Tony Jefferson
// Last update: 3/1/2014
var getMouse = function getMouse(e) {
    var mouse = {};
    mouse.x = e.pageX - e.target.offsetLeft;
    mouse.y = e.pageY - e.target.offsetTop;
    return mouse;
};

//on click, check if a player was clicked
var doMouseDown = function doMouseDown(e) {
    //get location of mouse
    var mouse = getMouse(e);

    //make sure the player isnt clicking already
    if (!mouseClicked) {
        //get the keys
        var keys = Object.keys(users);

        //check if the click was on any of the players
        for (var i = 0; i < keys.length; i++) {
            var player = users[keys[i]];

            var posX = positions[player.playerNum].x - player.width / 2;
            var posY = positions[player.playerNum].y - player.height / 2;

            //if the click was in the square, send it to the server for points;
            if (mouse.x >= posX && mouse.x <= posX + player.width) {
                if (mouse.y >= posY && mouse.y <= posY + player.height) {
                    //check if player is you  
                    if (myHash === player.hash) {
                        //send a currency click event 
                        socket.emit(Messages.C_Currency_Click);
                    } else {
                        //send an attack click event 
                        socket.emit(Messages.C_Attack_Click, { originHash: myHash, targetHash: player.hash, x: posX,
                            y: posY, color: users[myHash].color });
                    }
                }
            }
        }
    }

    //disable additional clicks
    mouseClicked = true;
};

//allow player to click again once they lift their mouse
var doMouseUp = function doMouseUp() {
    mouseClicked = false;
};

var init = function init() {
    initializeLobby(); //initialize lobby elements

    // set up canvas stuff
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext("2d");
    canvas.onmousedown = doMouseDown;
    canvas.onmouseup = doMouseUp;

    socket = io.connect();

    setupSocket(socket);
};

window.onload = init;
"use strict";

var lerp = function lerp(v0, v1, alpha) {
  return (1 - alpha) * v0 + alpha * v1;
};

var positions = [{ x: 100, y: 100 }, { x: 600, y: 400 }, { x: 100, y: 400 }, { x: 600, y: 100 }];
var colors = ["red", "blue", "yellow", "green"];

//redraw with requestAnimationFrame
var redraw = function redraw() {
  //clear screen
  ctx.clearRect(0, 0, 700, 500);
  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, 700, 500);

  //draw players
  var keys = Object.keys(users);
  for (var i = 0; i < keys.length; i++) {
    var player = users[keys[i]];

    var halfWidth = player.width / 2;
    var halfHeight = player.height / 2;
    var posX = positions[player.playerNum].x - halfWidth;
    var posY = positions[player.playerNum].y - halfHeight;

    //draw outer box
    ctx.fillStyle = colors[player.playerNum];
    ctx.fillRect(posX, posY, player.width, player.height);

    // draw inner box
    ctx.fillStyle = "white";
    ctx.fillRect(posX + 5, posY + 5, player.width - 10, player.height - 10);

    // draw their population count
    ctx.fillStyle = "black";
    ctx.fillText(player.population, posX + halfWidth, posY + halfHeight, 100);
  }

  //get attacks
  var attackKeys = Object.keys(attacks);

  //if an amount of keys, draw the attacks
  if (attackKeys.length > 0) {
    //draw attacks
    for (var _i = 0; _i < attackKeys.length; _i++) {
      var attack = attacks[attackKeys[_i]];

      if (attack.alpha < 1) attack.alpha += 0.05;

      //consol
      //lerp
      //attack.x = lerp(attack.prevX, attack.destX, attack.alpha);
      //attack.y = lerp(attack.prevY, attack.destY, attack.alpha);

      //draw
      ctx.fillStyle = attack.color;
      ctx.fillRect(attack.x, attack.y, attack.width, attack.height);
    }
  }
};

var update = function update(time) {
  redraw();

  animationFrame = requestAnimationFrame(update);
};
"use strict";

var updateAttack = function updateAttack(hash) {

    var at = attacks[hash];
    var originPlayer = users[at.originHash];
    var oX = positions[originPlayer.playerNum].x;
    var oY = positions[originPlayer.playerNum].y;
    var destPlayer = users[at.targetHash];
    var destX = positions[destPlayer.playerNum].x;
    var destY = positions[destPlayer.playerNum].y;

    var moveX = (destX - oX) / 10;
    var moveY = (destY - oY) / 10;

    console.log(at);

    //at.x += moveX;
    //at.y += moveY;
    at.updateTick += 1;

    if (at.updateTick > 10) {
        console.log("ALL DONE");
    } else socket.emit(Messages.H_Attack_Update, attacks[hash]);
};

var onHosted = function onHosted() {
    document.querySelector("#debug").style.display = "block";

    socket.on(Messages.H_Player_Joined, function (data) {
        // Add a new user 
        users[data.hash] = data;
        socket.emit(Messages.H_Room_Update, users);
    });

    socket.on(Messages.H_Currency_Click, function (hash) {
        users[hash].population += 1;
        users[hash].lastUpdate = new Date().getTime();
        socket.emit(Messages.H_Currency_Result, users[hash]);
    });

    socket.on(Messages.H_Attack_Click, function (at) {
        console.log("SENDING NEW ATTACK");
        //const a = Object.assign({},at); 

        //console.log(a);
        var x = at.x;
        console.log(x);

        attacks[at.hash] = at;
        socket.emit(Messages.H_Attack_Update, attacks[at.hash]);
        setInterval(updateAttack, 5000, at.hash);
    });
};
'use strict';

var gamelist = {};

var OPEN = 0;
var FULL = 1;
var STARTED = 2;
var OVER = 3;
var roomStatus = [['room open!', 'room_open'], ['room full!', 'room_full'], ['game started!', 'room_started'], ['game over!', 'room_over']];

var lobbyList = {};

var joinRoom = function joinRoom(room) {
  if (!room) return;
  //TODO change game state
  socket.emit(Messages.S_Join, { room: room });
  client_showGame();
};

var sendCreateRoom = function sendCreateRoom(room) {
  socket.emit(Messages.S_Create_Room, { room: room });
  client_showGame();
};

//initializes everything required for the lobby
var initializeLobby = function initializeLobby() {
  lobbyList = document.querySelector("#lobby_list");

  var nameText = document.querySelector('#room_name_input');
  document.querySelector('#create_room_button').addEventListener('click', function (e) {
    e.preventDefault(true);
    if (nameText.value === '') {
      return false;
    }
    sendCreateRoom(nameText.value);
    nameText.value = "";
    return false;
  });
};

//initializes a room
var initRoom = function initRoom(name) {
  var li = document.createElement('li');

  var namep = document.createElement('p');
  namep.classList.add("room_name");

  var countp = document.createElement('p');
  countp.classList.add("room_count");

  var statusp = document.createElement('p');
  statusp.classList.add("room_status");

  li.appendChild(namep);
  li.appendChild(countp);
  li.appendChild(statusp);
  roomClick(li);

  return li;
};

//when the room li is clikced
var roomClick = function roomClick(roomli) {
  var li = roomli;

  li.addEventListener('click', function (e) {
    e.preventDefault();
    if (!li.classList.contains(roomStatus[OPEN][1])) {
      return false;
    }
    var room = li.querySelector('.room_name').innerHTML;
    joinRoom(room);
    return false;
  });
};

//sets up a room with the given data
var setupRoom = function setupRoom(roomli, name, count, status) {
  var li = roomli;
  li.querySelector('.room_name').innerHTML = name;
  li.querySelector('.room_count').innerHTML = 'Players: ' + count;
  li.querySelector('.room_status').innerHTML = roomStatus[status][0];

  for (var i = 0; i < roomStatus.length; i++) {
    li.classList.remove(roomStatus[i][1]);
  }
  li.classList.add(roomStatus[status][1]);
  li.id = 'lobby_room_' + name;
};

//updates the lobby, adds, removes, edits rooms
var manageLobby = function manageLobby(data) {
  var keys = Object.keys(data);

  if (keys.length === 0) {
    return;
  }

  var li = {};

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var room = data[key];
    //this room is gonna get updated
    if (room.players.length > 0) {
      //lets me know the li element reffereing to the room existed alreadt
      var existed = true;
      if (gamelist[key]) {

        //finds the li if it currently exists
        li = lobbyList.querySelector('#lobby_room_' + key);
        if (li == null) {
          //no li found, make a new one
          li = initRoom(gamelist[keys[i]]);
          existed = false;
        }
      } else {
        //make a new li
        li = initRoom(gamelist[keys[i]]);
        existed = false;
      }

      gamelist[key] = room;

      var status = OPEN;

      if (room.full) {
        status = FULL;
      } else if (room.started) {
        status = STARTED;
      } else if (room.over) {
        status = OVER;
      }

      setupRoom(li, key, room.players.length, status);

      if (!existed) lobbyList.appendChild(li);
    } else {
      //the room will be deleted
      var offender = lobbyList.querySelector('#lobby_room_' + key);
      if (offender) lobbyList.removeChild(offender);
      delete gamelist[key];
    }
  } //end of for loop

  lobbyList.style.display = 'block';

  //no open rooms
  if (Object.keys(gamelist).length === 0) {
    lobbyList.style.display = 'none';
  }
};
'use strict';

//Holds all message names to and from server
//Meaning: C_: to client, H_: to host, S_: to server
var Messages = Object.freeze({
  //Client messages
  C_Update_Lobby: 'c_updateLobby', //update the lobbylist
  C_Error: 'c_err', //oh dear. theres been an error
  C_Currency_Click: 'c_currencyClick', //I'm clicking for $$$$
  C_Currency_Result: 'c_currencyResult', //the host told me a currency click happened
  C_Attack_Click: 'c_attackClick', //Im firing an attack
  C_Attack_Update: 'c_attackResult', //the host told me an attack fired
  C_Attack_Hit: 'c_attackHit', //the host said an attack hit
  C_Room_Update: 'c_roomUpdate', //update users lsit with the list from host
  C_Player_Left: 'c_removePlayer', //a player left the server
  //Host messages
  H_Player_Joined: 'h_addPlayer', //a new player joined the server
  H_Player_Left: 'h_removePlayer', //a player left the server
  H_Currency_Click: 'h_currencyClick', //process a currency click
  H_Currency_Result: 'h_currencyResult', //results of a currency click
  H_Attack_Click: 'h_attackClick', //process an attack click
  H_Attack_Update: 'h_attackUpdate', //results of an attack click
  H_Attack_Hit: 'h_attackHit', //a fired attack hit a target
  H_Become_Host: 'h_isHost', //hey dude, thanks for hosting
  H_Room_Update: 'h_roomUpdate', //use to send the game room info to the clients
  //Server messages
  S_Create_Room: 's_createRoom', //server, make a room
  S_Disconnect: 'disconnect', //disconnect from server
  S_Join: 'join', //server, I'm joining a room 
  S_SetUser: 's_setUser'
});

if (typeof module !== 'undefined') module.exports = Messages;
"use strict";

/* ++++++ socket setup Functions ++++++ */

var onLobby = function onLobby(sock) {
  var socket = sock;

  socket.on(Messages.C_Update_Lobby, function (data) {
    manageLobby(data);
  });
};

//get the player data from the host
var onRoomUpdate = function onRoomUpdate(sock) {
  var socket = sock;

  socket.on(Messages.C_Room_Update, function (data) {
    users = data;
  });

  socket.on(Messages.H_Become_Host, function () {
    onHosted();
  });

  socket.on(Messages.S_SetUser, function (hash, host) {
    myHash = hash;
    myHost = host;
  });
};

//get the game updates from the host
var onGameUpdate = function onGameUpdate(sock) {
  var socket = sock;

  //results of a currency click
  socket.on(Messages.C_Currency_Result, function (data) {
    //ignore old messages 

    if (users[data.hash].lastUpdate >= data.lastUpdate) {
      console.log("old message recieved. discarding");
      return;
    }

    //update the data
    users[data.hash] = data;
  });

  //results of an attack click
  socket.on(Messages.C_Attack_Update, function (data) {
    // update each attack
    // console.log(data);
    attacks[data.hash] = data;
  });

  //an attack hit
  socket.on(Messages.C_Attack_Hit, function (data) {
    //remove the attack that hit from attacks somehow
    //do attack hitting effects
  });
};

/* ------ socket setup Functions ------ */

var setupSocket = function setupSocket(sock) {

  onLobby(socket);
  onRoomUpdate(socket);
  onGameUpdate(socket);
};
