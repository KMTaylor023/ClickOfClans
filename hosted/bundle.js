"use strict";
'use strict';

//Holds all message names to and from server
//Meaning: C_: to client, H_: to host, S_: to server
var Messages = Object.freeze({
  //Client messages
  C_Update_Lobby: 'c_updateLobby',
  C_Error: 'c_err',
  C_Currency_Click: 'c_currencyClick',
  C_Attack_Click: 'c_attackClick',
  //Host messages
  H_Player_Joined: 'h_addPlayer',
  H_Player_Left: 'h_removePlayer',
  H_Currency_Click: 'h_currencyClick',
  H_Attack_Click: 'h_attackClick',
  H_Become_Host: 'h_isHost',
  //Server messages
  S_Create_Room: 's_createRoom',
  S_Disconnect: 'disconnect',
  S_Join: 'join'
});

if (typeof module !== 'undefined') module.exports = Messages;
"use strict";

//This is the clients socket
var socket = {};

var client_showGame = function client_showGame() {
  document.querySelector("#game").style.display = "block";
  document.querySelector("#lobby").style.display = "none";
};

var init = function init() {
  initializeLobby(); //initialize lobby elements


  socket = io.connect();

  setupSocket(socket);
};

window.onload = init;
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
"use strict";

/* ++++++ socket setup Functions ++++++ */

var onLobby = function onLobby(sock) {
  var socket = sock;

  socket.on(Messages.C_Update_Lobby, function (data) {
    manageLobby(data);
  });
};

/* ------ socket setup Functions ------ */

var setupSocket = function setupSocket(sock) {

  onLobby(socket);
};
