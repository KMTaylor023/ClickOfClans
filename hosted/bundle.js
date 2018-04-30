"use strict";

//This is the clients socket
var socket = {};

var players = {}; //the players in the lobby the client is in
var users = {}; //a barebones representation of the users
var attacks = {}; //any attacks being sent
var canvas = void 0; //the canvas the game is on
var ctx = void 0; //the canvas context
var myHash = void 0;
var myHost = void 0;
var mouseClicked = false; //is the mouse currently clicked?
var animationFrame = void 0; // current animation frame
var buyButton = void 0; //click to buy a skin
var equipButton = void 0; //click to equip a skin
var skinButton = void 0; //click to go to skin select
var lobbyButton = void 0; //click to go to the lobby
var closeButton = void 0; //close the error popup
var skins = [];
var gameState = void 0; //current game state
var readyButton = {
    x: 302,
    y: 327,
    width: 100,
    height: 50,
    image: null
};
var leaveButton = {
    x: 302,
    y: 327,
    width: 100,
    height: 50,
    image: null
};

var selectedLotIndex = -1;
var playerImage = void 0;
var fieldBg = void 0;
var unbuiltStructureImage = void 0;
var shieldImage = void 0;
var farmImage = void 0;
var blacksmithImage = void 0;
var attackImage = void 0;
var emptyLotImage = void 0;
var pannelImage = void 0;
var pannelImage2 = void 0;
var winner = void 0; //hash of the player that won

var client_showGame = function client_showGame() {
    document.querySelector("#game").style.display = "block";
    document.querySelector("#lobby").style.display = "none";

    // Turn off the scrolling bg  
    var body = document.getElementsByTagName("BODY")[0];
    body.classList.remove("movingBG");
    body.classList.add("staticBG");

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
        //check game state
        if (gameState === GameStates.READY_UP) {
            //check if the player clicked the ready button
            if (mouse.x >= readyButton.x && mouse.x <= readyButton.x + readyButton.width) {
                if (mouse.y >= readyButton.y && mouse.y <= readyButton.y + readyButton.height) {
                    //emit ready up event
                    socket.emit(Messages.C_Ready);
                    readyButton.image = document.getElementById("readyPress");
                }
            }
        } else if (gameState === GameStates.GAME_OVER) {
            //check if the player clicked the leave button
            if (mouse.x >= leaveButton.x && mouse.x <= leaveButton.x + leaveButton.width) {
                if (mouse.y >= leaveButton.y && mouse.y <= leaveButton.y + leaveButton.height) {
                    //emit leave room event
                    socket.emit(Messages.S_Leave);
                    socket.isHost = false; //reset host status
                }
            }
        } else {
            //get the keys
            var keys = Object.keys(players);

            var myX = players[myHash].x + playerHalfWidth;
            var myY = players[myHash].y + playerHalfHeight;

            var validClick = false;

            //check if the click was on any of the players
            for (var i = 0; i < keys.length; i++) {
                //var validClick = false;
                var player = players[keys[i]];

                var posX = player.x;
                var posY = player.y;

                //if the click was in the square, send it to the server for points;
                if (mouse.x >= posX && mouse.x <= posX + player.width) {
                    if (mouse.y >= posY && mouse.y <= posY + player.height) {

                        validClick = true;
                        //check if player is you  
                        if (myHash === player.hash) {
                            //send a currency click event 
                            socket.emit(Messages.C_Currency_Click);
                        } else {
                            //send an attack click event  
                            socket.emit(Messages.C_Attack_Click, { originHash: myHash, targetHash: player.hash, x: myX,
                                y: myY, color: players[myHash].color });
                        }
                        selectedLotIndex = -1;
                    }
                }

                if (myHash === player.hash) {
                    for (var j = 0; j < 3; j++) {
                        var struct = player.structures[j];
                        if (mouse.x >= struct.x && mouse.x <= struct.x + struct.width) {
                            if (mouse.y >= struct.y && mouse.y <= struct.y + struct.height) {
                                var type = struct.type;
                                validClick = true;

                                if (struct.type === STRUCTURE_TYPES.PLACEHOLDER) {
                                    // If you've clicked on another lot or you've just started clicking a lot, set the selectedLotIndex to that lot
                                    if (selectedLotIndex < 0 || selectedLotIndex != j) {
                                        selectedLotIndex = j;
                                    } else if (selectedLotIndex === j) // If you've clicked on the same lot twice then you've purchased something
                                        {
                                            struct.onClick(mouse.x - struct.x, struct);
                                            socket.emit(Messages.C_Purchase_Structure, { hash: myHash, which: j, type: struct.type });
                                        }
                                } else {
                                    // if it's not a placeholder, reset the selectedLotIndex and run the onclick function
                                    selectedLotIndex = -1;
                                    struct.onClick(mouse.x - struct.x, struct);
                                }
                            }
                        }
                    }
                }
            }

            // Reset the selected lot index if we didn't click on ANYTHING
            if (!validClick) {
                selectedLotIndex = -1;
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

//send a message to the server to purchase the chosen skin
var purchaseSkin = function purchaseSkin() {
    //get the skin radio buttons
    var skins = document.getElementsByName("skin");

    //determine which one is selected
    var selectedSkin;
    var selectedSkinNumber;
    for (var i = 0; i < skins.length; i++) {
        if (skins[i].checked) {
            selectedSkin = skins[i].value;
            selectedSkinNumber = i;
        }
    }

    //send the selected skin to the server to purchase
    socket.emit(Messages.C_Buy_Skin, { skin: selectedSkin, number: selectedSkinNumber });
};

//send a message to the server to verify the selected skin is owned and then equip it
var equipSkin = function equipSkin() {
    //get the skin radio buttons
    var skins = document.getElementsByName("skin");

    //determine which one is selected
    var selectedSkin;
    var selectedSkinNumber;
    for (var i = 0; i < skins.length; i++) {
        if (skins[i].checked) {
            selectedSkin = skins[i].value;
            selectedSkinNumber = i;
        }
    }

    //send the selected skin to the server to purchase
    socket.emit(Messages.C_Equip_Skin, { skin: selectedSkin, number: selectedSkinNumber });
};

var init = function init() {
    initializeLobby(); //initialize lobby elements

    // set up canvas stuff
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext("2d");
    canvas.onmousedown = doMouseDown;
    canvas.onmouseup = doMouseUp;

    //get buttons
    lobbyButton = document.querySelector("#lobbyButton");
    skinButton = document.querySelector("#chooseSkinButton");
    buyButton = document.querySelector("#buyButton");
    equipButton = document.querySelector("#equipButton");
    closeButton = document.querySelector("#closeButton");

    //set event listeners
    lobbyButton.onclick = function (e) {
        document.querySelector("#roomSelection").style.display = "block";
        document.querySelector("#skins").style.display = "none";
    };
    skinButton.onclick = function (e) {
        document.querySelector("#roomSelection").style.display = "none";
        document.querySelector("#skins").style.display = "block";
    };
    buyButton.onclick = purchaseSkin;
    equipButton.onclick = equipSkin;
    closeButton.onclick = function (e) {
        document.querySelector("#unsuccessfulEquip").style.display = "none";
    };

    //load the skin images
    skins = document.getElementsByClassName("skin");

    //load the button images
    readyButton.image = document.getElementById("ready");
    leaveButton.image = document.getElementById("leave");

    //load the player images
    playerImage = document.getElementById("playerImage");
    emptyLotImage = document.getElementById("emptyLotImage");
    unbuiltStructureImage = document.getElementById("createStructImage");
    shieldImage = document.getElementById("shieldImage");
    farmImage = document.getElementById("farmImage");
    blacksmithImage = document.getElementById("attackImage");
    fieldBg = document.getElementById("field");
    attackImage = document.getElementById("attacks");
    pannelImage = document.getElementById("pannels");
    pannelImage2 = document.getElementById("pannels2");

    //position ad2 at bottom of the screen
    var adPosition = window.innerHeight - 140;

    //make sure ad isnt in the canvas
    if (adPosition < 704) {
        adPosition = 800;
    }

    //move the ad
    document.querySelector("#ad2").style.top = adPosition + "px";

    //initialize game state
    gameState = GameStates.READY_UP;

    socket = io.connect();
    setupSocket(socket);
};

window.onload = init;
"use strict";

//sizes of the images to cut out from the main image
var spriteSizes = {
    PLAYER_WIDTH: 96,
    PLAYER_HEIGHT: 96,
    STRUCTURE_WIDTH: 64,
    STRUCTURE_HEIGHT: 64,
    UNSPAWNED_STRUCTURE_WIDTH: 96,
    UNSPAWNED_STRUCTURE_HEIGHT: 96
};

var lerp = function lerp(v0, v1, alpha) {
    return (1 - alpha) * v0 + alpha * v1;
};

//redraw with requestAnimationFrame
var redraw = function redraw() {
    //clear screen
    ctx.clearRect(0, 0, 704, 704);
    ctx.drawImage(fieldBg, 0, 0, 704, 704, 0, 0, 704, 704);

    //draw players
    var keys = Object.keys(players);
    for (var i = 0; i < keys.length; i++) {
        var player = players[keys[i]];

        var halfWidth = playerHalfWidth;
        var halfHeight = playerHalfHeight;

        //draw player
        if (player.skin != null) {
            //!= null to avoid a false if skin1 is had since its stored as value 0 
            //get the skin url
            var skin = skins[player.skin];
            //draw the skin
            ctx.drawImage(skin, player.x, player.y, player.width, player.height);

            // draw their population count
            ctx.save();
            ctx.fillStyle = "black";
            ctx.font = "28px Do Hyeon";
            ctx.fillText(player.population, player.x + halfWidth, player.y + halfHeight + 10, 100);
            ctx.restore();
        } else {

            // If it's you, put a nice tab over your castle that labels you as you
            if (player.hash === myHash) {
                ctx.save();
                ctx.drawImage(pannelImage, 64 * player.playerNum, 0, 64, 32, player.x + 16, player.y - 16, 64, 32);
                ctx.textAlign = "center";
                ctx.fillStyle = "black";
                ctx.font = "15px Do Hyeon";
                ctx.fillText("YOU", player.x + 48, player.y - 4, 100);
                ctx.restore();
            }

            ctx.drawImage(playerImage, spriteSizes.PLAYER_WIDTH * i, 0, spriteSizes.PLAYER_WIDTH, spriteSizes.PLAYER_HEIGHT, player.x, player.y, player.width, player.height);

            // draw their population count
            ctx.save();
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            ctx.font = "28px Do Hyeon";
            ctx.fillText(player.population, player.x + halfWidth, player.y + halfHeight + 10, 100);
            ctx.restore();
        }

        for (var j = 0; j < 3; j++) {
            var str = player.structures[j];

            if (str.type != STRUCTURE_TYPES.PLACEHOLDER) {
                ctx.save();
                ctx.drawImage(pannelImage2, 48 * player.playerNum, 0, 48, 48, str.x + 8, str.y + 32, 48, 48);

                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                ctx.font = "12px Do Hyeon";
                ctx.fillText(str.health + "/" + str.maxhealth, str.x + 32, str.y + 76, 100);
                ctx.restore();
            }

            //check structure type
            if (str.type === STRUCTURE_TYPES.PLACEHOLDER) {
                ctx.drawImage(emptyLotImage, spriteSizes.STRUCTURE_WIDTH * i, 0, spriteSizes.STRUCTURE_WIDTH, spriteSizes.STRUCTURE_HEIGHT, str.x, str.y, str.width, str.height);

                if (selectedLotIndex === j && player.hash === myHash) {
                    ctx.drawImage(unbuiltStructureImage, spriteSizes.UNSPAWNED_STRUCTURE_WIDTH * i, 0, spriteSizes.UNSPAWNED_STRUCTURE_WIDTH, spriteSizes.UNSPAWNED_STRUCTURE_HEIGHT, str.x, str.y, str.width, str.height);
                }
            } else if (str.type === STRUCTURE_TYPES.FARM) {
                ctx.drawImage(farmImage, spriteSizes.STRUCTURE_WIDTH * i, 0, spriteSizes.STRUCTURE_WIDTH, spriteSizes.STRUCTURE_HEIGHT, str.x, str.y, str.width, str.height);
            } else if (str.type === STRUCTURE_TYPES.SHIELD) {
                ctx.drawImage(shieldImage, spriteSizes.STRUCTURE_WIDTH * i, 0, spriteSizes.STRUCTURE_WIDTH, spriteSizes.STRUCTURE_HEIGHT, str.x, str.y, str.width, str.height);
            } else {
                ctx.drawImage(blacksmithImage, spriteSizes.STRUCTURE_WIDTH * i, 0, spriteSizes.STRUCTURE_WIDTH, spriteSizes.STRUCTURE_HEIGHT, str.x, str.y, str.width, str.height);
            }
        }
    }

    //get attacks
    var attackKeys = Object.keys(attacks);

    //if an amount of keys, draw the attacks
    if (attackKeys.length > 0) {
        //draw attacks
        for (var _i = 0; _i < attackKeys.length; _i++) {
            var attack = attacks[attackKeys[_i]];

            if (attack.alpha < 1) attack.alpha += 0.05;

            //lerp
            attack.x = lerp(attack.prevX, attack.destX, attack.alpha);
            attack.y = lerp(attack.prevY, attack.destY, attack.alpha);

            //draw 
            ctx.drawImage(attackImage, 32 * players[attack.originHash].playerNum, 0, 32, 32, attack.x - attack.width / 2, attack.y - attack.height / 2, attack.width, attack.height);
        }
    }

    //if ready up, draw the readyup button
    if (gameState === GameStates.READY_UP) {
        ctx.drawImage(readyButton.image, readyButton.x, readyButton.y, readyButton.width, readyButton.height);
    } else if (gameState === GameStates.GAME_OVER) {
        //draw the winner
        var winnerNum = keys.indexOf(winner) + 1;
        ctx.save();
        ctx.fillStyle = "white";
        ctx.fillRect(300, 200, 100, 40);
        ctx.fillStyle = "black";
        ctx.font = "30px Do Hyeon";
        ctx.fillText("The winner is player " + winnerNum, 300, 230, 100);
        ctx.restore();

        //draw return to lobby button
        ctx.drawImage(leaveButton.image, leaveButton.x, leaveButton.y, leaveButton.width, leaveButton.height);
    }
};

var update = function update(time) {
    redraw();

    animationFrame = requestAnimationFrame(update);
};
"use strict";

var GameStates = Object.freeze({
    READY_UP: 1,
    GAME_PLAY: 2,
    GAME_OVER: 3
});
"use strict";

var updateAttack = function updateAttack() {
    var returnMe = {};

    var arOfHashes = Object.keys(attacks);
    for (var i = 0; i < arOfHashes.length; i++) {
        var at = attacks[arOfHashes[i]];
        var newX = at.destX + at.moveX;
        var newY = at.destY + at.moveY;
        var newTick = at.updateTick + 1;

        if (newTick >= 70 && newTick <= 75) {
            // Check to see if we can hit anything on the structure
            var destPlayer = players[at.targetHash];
            console.log(destPlayer);
            if (destPlayer.structures[at.lane].type !== STRUCTURE_TYPES.PLACEHOLDER) {
                socket.emit(Messages.H_Attack_Struct, { hash: arOfHashes[i], lane: at.lane, dest: at.targetHash });
                continue;
            }
        }

        if (newTick > 100) socket.emit(Messages.H_Attack_Hit, at);else returnMe[i] = { hash: arOfHashes[i], x: newX, y: newY, tick: newTick };
    }

    socket.emit(Messages.H_Attack_Update, returnMe);

    //determine number of dead players
    if (gameState === GameStates.GAME_PLAY) {
        var numDead = 0;
        var potentialWinner = void 0; //hash of the potential winner. won't change if only 1 player alive
        var keys = Object.keys(players);
        for (var _i = 0; _i < keys.length; _i++) {
            if (players[keys[_i]].dead) {
                numDead++;
            } else {
                potentialWinner = keys[_i];
            }
        }

        //if only 1 player lives, end the game
        if (numDead === keys.length - 1) {
            gameState = GameStates.GAME_OVER;
            socket.emit(Messages.H_State_Change, gameState);
            socket.emit(Messages.H_Winner, potentialWinner);
        }
    }
};

var onHosted = function onHosted() {
    document.querySelector("#debug").style.display = "block";
    setInterval(updateAttack, 100);

    socket.isHost = true;

    socket.on(Messages.H_Player_Joined, function (data) {
        // Add a new user 
        var player = new Player(data.hash, data.name, data.playerNum, data.skin);
        data.lastUpdate = player.lastUpdate;
        data.population = player.population;
        users[data.hash] = data;
        players[data.hash] = player;
        socket.emit(Messages.H_Room_Update, users);
        //make sure everyone has the same game state
        socket.emit(Messages.H_State_Change, gameState);
    });

    socket.on(Messages.H_Ready, function (data) {
        //ready that player
        players[data].ready = true;

        //check if all players are ready
        var keys = Object.keys(players);
        if (keys.length > 1) {
            //make sure the host doesnt start the game when alone
            for (var i = 0; i < keys.length; i++) {
                //if at least 1 player isnt ready, exit this method
                if (!players[keys[i]].ready) {
                    return;
                }
            }

            //all players are ready, update the game state
            gameState = GameStates.GAME_PLAY;
            socket.emit(Messages.H_State_Change, gameState);
        }
    });

    socket.on(Messages.H_Player_Left, function (data) {
        delete users[data.hash];
        delete players[data.hash];

        if (gameState === GameStates.READY_UP) {
            var keys = Object.keys(players);
            var ready = true;
            for (var i = 0; i < keys.length; i++) {
                //if at least 1 player isnt ready, exit this method
                if (!players[keys[i]].ready) {
                    ready = false;;
                }
            }

            if (ready) {
                gameState = GameStates.GAME_PLAY;
                socket.emit(Messages.H_State_Change, gameState);
            }
        }
    });

    socket.on(Messages.H_Currency_Click, function (hash) {
        users[hash].population += 1;
        users[hash].lastUpdate = new Date().getTime();
        socket.emit(Messages.H_Currency_Result, users[hash]);
    });

    socket.on(Messages.H_Attack_Click, function (at) {

        //make sure originplayer can afford to attack and the target isn't dead
        var originPlayer = players[at.originHash];
        var destPlayer = players[at.targetHash];
        if (originPlayer.population > 11 && !destPlayer.dead) {
            //make sure origin player cant spawn attacks that would bring them to negative population
            originPlayer.population -= 10;

            //store the attack
            attacks[at.hash] = at;

            // set the moveX and the moveY of the attack
            var oX = originPlayer.x + playerHalfWidth;
            var oY = originPlayer.y + playerHalfHeight;
            var destX = destPlayer.x + playerHalfWidth;
            var destY = destPlayer.y + playerHalfHeight;

            var moveX = (destX - oX) / 100;
            var moveY = (destY - oY) / 100;

            attacks[at.hash].moveX = moveX;
            attacks[at.hash].moveY = moveY;

            // now get the lane we're in
            if (moveX === 0) attacks[at.hash].lane = 2;else if (moveY === 0) attacks[at.hash].lane = 0;else attacks[at.hash].lane = 1;

            // emit
            socket.emit(Messages.H_Attack_Create, attacks[at.hash]);
        }
    });

    socket.on(Messages.H_Purchase_Structure, function (data) {
        socket.emit(Messages.H_Purchase_Structure_Result, data);
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

var lobby_showLobby = function lobby_showLobby() {
  document.querySelector("#game").style.display = "none";
  document.querySelector("#lobby").style.display = "block";

  // Turn off the scrolling bg  
  var body = document.getElementsByTagName("BODY")[0];
  body.classList.add("movingBG");
  body.classList.remove("staticBG");

  cancelAnimationFrame(animationFrame);
};

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
  C_Purchase_Structure: 'c_purchaseStructure', //buy a structure 
  C_Purchase_Structure_Result: 'c_purchaseStructureResult',
  C_Attack_Click: 'c_attackClick', //Im firing an attack
  C_Attack_Update: 'c_attackResult', //the host told me an attack fired
  C_Attack_Create: 'c_attackCreate', // the host told me an attack was created
  C_Attack_Hit: 'c_attackHit', //the host said an attack hit
  C_Attack_Struct: 'c_attackStruct', // the host said a structure was hit
  C_Room_Update: 'c_roomUpdate', //update users lsit with the list from host
  C_Player_Left: 'c_removePlayer', //a player left the server
  C_Host_Left: 'c_hostLeft', //a player left the server
  C_Get_Ads: 'c_ads', //dispaly some ads
  C_Buy_Skin: 'c_buy', //purchase a skin
  C_Equip_Skin: 'c_equip', //equip a skin
  C_State_Change: 'c_gameStateChange', //update your gamestate
  C_Ready: 'c_readyUp', //tell the host you are ready to start
  C_Winner: 'c_winner', //display the winner on the screen
  //Host messages
  H_Player_Joined: 'h_addPlayer', //a new player joined the server
  H_Player_Left: 'h_removePlayer', //a player left the server
  H_Currency_Click: 'h_currencyClick', //process a currency click
  H_Currency_Result: 'h_currencyResult', //results of a currency click
  H_Attack_Click: 'h_attackClick', //process an attack click
  H_Attack_Update: 'h_attackUpdate', //results of an attack click
  H_Attack_Create: 'h_attackCreate',
  H_Purchase_Structure: 'h_purchaseStructure',
  H_Purchase_Structure_Result: 'h_purchaseStructureResult',
  H_Attack_Struct: 'h_attackStruct', // when an attack hits a structure
  H_Attack_Hit: 'h_attackHit', //a fired attack hit a target
  H_Become_Host: 'h_isHost', //hey dude, thanks for hosting
  H_Room_Update: 'h_roomUpdate', //use to send the game room info to the clients
  H_State_Change: 'h_gameStateChange', //game state chenged hostside
  H_Ready: 'h_readyUp', //update a player's ready state
  H_Winner: 'h_winner', //send the clients the player that won
  //Server messages
  S_Create_Room: 's_createRoom', //server, make a room
  S_Disconnect: 'disconnect', //disconnect from server
  S_Join: 'join', //server, I'm joining a room 
  S_Leave: 'leave', //server, I'm leaving a room 
  S_SetUser: 's_setUser',
  S_Buy_Skin: 's_buy', //was it a successful purchase?
  S_Equip_Skin: 's_equip' //did you equip it?
});

if (typeof module !== 'undefined') module.exports = Messages;
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var positions = [{ x: 48, y: 48 }, { x: 560, y: 560 }, { x: 48, y: 560 }, { x: 560, y: 48 }];

var structure_positions = [[{ x: 192, y: 64 }, { x: 192, y: 192 }, { x: 64, y: 192 }], [{ x: 448, y: 576 }, { x: 448, y: 448 }, { x: 576, y: 448 }], [{ x: 64, y: 448 }, { x: 192, y: 448 }, { x: 192, y: 576 }], [{ x: 448, y: 64 }, { x: 448, y: 192 }, { x: 576, y: 192 }]];
var colors = ["red", "blue", "yellow", "green"];
var playerWidth = 96;
var playerHeight = 96;
var playerHalfWidth = playerWidth / 2;
var playerHalfHeight = playerHeight / 2;

var STRUCTURE_TYPES = {
  FARM: 'farm',
  BSMITH: 'blacksmith',
  SHIELD: 'shield',
  PLACEHOLDER: 'placeholder'
};

var INFO = {};

//the stats for the farm
INFO[STRUCTURE_TYPES.FARM] = {
  health: 50,
  maxhealth: 50,
  color: 'rgb(34,139,34)',
  popgen: 2,
  atkmult: 1,
  defmult: 1,
  onClick: function onClick() {}
};

//the stats for the blacksmith
INFO[STRUCTURE_TYPES.BSMITH] = {
  health: 100,
  maxhealth: 100,
  color: 'rgb(255,0,0)',
  popgen: 0,
  atkmult: 2,
  defmult: 1,
  onClick: function onClick() {}
};

//the stats for the shield
INFO[STRUCTURE_TYPES.SHIELD] = {
  health: 300,
  maxhealth: 300,
  color: 'rgb(169,169,169)',
  popgen: 0,
  atkmult: 1,
  defmult: 2,
  onClick: function onClick() {}
};

//the stats for the shield
INFO[STRUCTURE_TYPES.PLACEHOLDER] = {
  health: 0,
  maxhealth: 0,
  color: 'rgb(70,70,70)',
  popgen: 0,
  atkmult: 1,
  defmult: 1,
  onClick: function onClick(xPos, struct) {
    if (xPos < struct.width / 3) {
      struct.setup(STRUCTURE_TYPES.SHIELD);
    } else if (xPos > 2 * (struct.width / 3)) {
      struct.setup(STRUCTURE_TYPES.BSMITH);
    } else {
      struct.setup(STRUCTURE_TYPES.FARM);
    }
  }
};

// Structure class

var Structure = function () {
  function Structure(x, y, type) {
    _classCallCheck(this, Structure);

    this.x = x;
    this.y = y;

    this.width = 64;
    this.height = 64;

    this.setup(type);
  }

  _createClass(Structure, [{
    key: "setup",
    value: function setup(type) {
      this.type = type;

      var inf = INFO[type];

      this.color = inf.color;
      this.health = inf.health;
      this.maxhealth = inf.maxhealth;
      this.popgen = inf.popgen;
      this.atkmult = inf.atkmult;
      this.defmult = inf.defmult;
      this.destroyed = false;

      this.onClick = inf.onClick;
    }
  }, {
    key: "reset",
    value: function reset() {
      setup(STRUCTURE_TYPES.PLACEHOLDER);
    }

    //deals damage to structure

  }, {
    key: "takeDamage",
    value: function takeDamage(dmg, isBonus) {
      this.health -= dmg / this.defmult;
      if (this.health < 0) {
        this.health = 0;
        this.destroyed = true;
      }
    }
  }]);

  return Structure;
}();

;

// Character class

var Player = function Player(hash, name, playerNum, skin) {
  _classCallCheck(this, Player);

  this.hash = hash;
  this.name = name;
  this.population = 50;
  this.lastUpdate = new Date().getTime();
  // not sure if we are doing hardset x/ys on host side,
  // setting x and y after object exists, or if we want to pass the x and y values in
  // via constructor
  this.x = positions[playerNum].x; // x location on screen
  this.y = positions[playerNum].y; // y location on screen
  this.playerNum = playerNum;
  this.width = playerWidth;
  this.height = playerHeight;
  //this.color = `rgb(${Math.floor((Math.random() * 255) + 1)},${Math.floor((Math.random() * 255) + 1)},${Math.floor((Math.random() * 255) + 1)})`;
  this.color = colors[playerNum];
  // structures array: position 0 = horizontal lane, position 1 = diagonal lane,
  // position 3 = vertical lane
  this.structures = [];
  this.skin = skin; //has an int if the player equips a skin, otherwise null
  this.ready = false; //did the player ready up
  this.dead = false; //did the player die?

  var strPos = structure_positions[playerNum];

  for (var i = 0; i < 3; i++) {
    this.structures[i] = new Structure(strPos[i].x, strPos[i].y, STRUCTURE_TYPES.PLACEHOLDER);
  }
};
"use strict";

/* ++++++ socket setup Functions ++++++ */

//get ad info from the server
var onAds = function onAds(sock) {
    var socket = sock;

    socket.on(Messages.C_Get_Ads, function (data) {
        //get ad1 and ad2 elements
        var ad1 = document.querySelector("#ad1");
        var ad2 = document.querySelector("#ad2");

        ad1.src = "./assets/ads/" + data.ad1;
        ad2.src = "./assets/ads/" + data.ad2;
    });
};

//update skin info with info from the server
var onSkinUpdate = function onSkinUpdate(sock) {
    var socket = sock;

    //set up the socket's skin array
    var skinArray = [];
    var numSkins = document.getElementsByName("skin").length; //get the number of skins in the game

    //initialize the array
    for (var i = 0; i < numSkins; i++) {
        skinArray[i] = false;
    }

    socket.skinArray = skinArray;

    socket.on(Messages.S_Buy_Skin, function (data) {
        //determine if the skin was bought successfully
        if (data.bought) {
            //set the skin to true in the skin array
            socket.skinArray[data.number] = true;

            //give the owned class to the skin element
            var skinElement = document.getElementById(data.skin); //the section containing the bought skin
            skinElement.classList.add("owned");
        }
    });

    socket.on(Messages.S_Equip_Skin, function (data) {
        //determine if the skin was bought successfully
        if (data.success) {
            //remove prior equipped skin
            var prevEquipped = document.getElementsByClassName("equipped");
            if (prevEquipped) {
                for (var _i = 0; _i < prevEquipped.length; _i++) {
                    prevEquipped[_i].classList.remove("equipped");
                }
            }
            //set the skin to true in the skin array
            socket.skin = data.number;

            //give the owned class to the skin element
            var skinElement = document.getElementById(data.skin); //the section containing the bought skin
            skinElement.classList.add("equipped");

            console.dir('equipped ' + data.skin);
            console.log(skins[socket.skin]);
        } else {
            document.querySelector("#unsuccessfulEquip").style.display = "block";
        }
    });
};

var onLobby = function onLobby(sock) {
    var socket = sock;

    socket.on(Messages.C_Update_Lobby, function (data) {
        manageLobby(data);
    });
};

var setPlayers = function setPlayers() {
    var keys = Object.keys(users);

    for (var i = 0; i < keys.length; i++) {
        if (players[keys[i]]) continue;
        var user = users[keys[i]];
        players[keys[i]] = new Player(user.hash, user.name, user.playerNum, user.skin);
    }
};

//get the player data from the host
var onRoomUpdate = function onRoomUpdate(sock) {
    var socket = sock;

    socket.on(Messages.C_Room_Update, function (data) {
        users = data;
        setPlayers();
    });

    socket.on(Messages.H_Become_Host, function () {
        gameState = GameStates.READY_UP;
        onHosted();
    });

    socket.on(Messages.S_SetUser, function (hash, host) {
        myHash = hash;
        myHost = host;
    });

    socket.on(Messages.C_Player_Left, function (data) {
        delete users[data.hash];
        delete players[data.hash];

        var keys = Object.keys(attacks);
        for (var i = 0; i < keys.length; i++) {
            var atk = attacks[keys[i]];
            if (data.hash === atk.originHash || data.hash === atk.targetHash) delete attacks[keys[i]];
        }
    });

    socket.on(Messages.C_Host_Left, function () {
        users = {};
        players = {};
        attacks = {};

        lobby_showLobby();
        socket.emit(Messages.S_Leave, {});
    });
};

//get the game updates from the host
var onGameUpdate = function onGameUpdate(sock) {
    var socket = sock;

    //results of a state change
    socket.on(Messages.C_State_Change, function (data) {
        gameState = data;
    });

    //results of a currency click
    socket.on(Messages.C_Currency_Result, function (data) {
        //ignore old messages  
        if (players[data.hash].lastUpdate >= data.lastUpdate) {
            return;
        }

        //update the data
        users[data.hash] = data;
        players[data.hash].population = data.population;
    });

    //results of an attack click
    socket.on(Messages.C_Attack_Update, function (data) {
        // update each attack
        // console.log(data);     
        var attackData = data;
        var attackDataKeys = Object.keys(attackData);
        for (var i = 0; i < attackDataKeys.length; i++) {
            if (attacks[attackData[i].hash]) {
                attacks[attackData[i].hash].prevX = attacks[attackData[i].hash].x;
                attacks[attackData[i].hash].prevY = attacks[attackData[i].hash].y;
                attacks[attackData[i].hash].alpha = 0.05;
                attacks[attackData[i].hash].destX = attackData[i].x;
                attacks[attackData[i].hash].destY = attackData[i].y;
                attacks[attackData[i].hash].updateTick = attackData[i].tick;
            }
        }
    });

    socket.on(Messages.C_Purchase_Structure_Result, function (data) {
        players[data.hash].structures[data.which].setup(data.type);
    });

    socket.on(Messages.C_Attack_Create, function (data) {
        //only subtract pop if not the host
        if (!socket.isHost) {
            players[data.originHash].population -= 10;
        }
        users[data.originHash].population -= 10;
        attacks[data.hash] = data;
    });

    //an attack hit
    socket.on(Messages.C_Attack_Hit, function (data) {
        //remove the attack that hit from attacks somehow
        //do attack hitting effects
        var at = attacks[data.hash];
        players[at.targetHash].population -= 50;
        users[at.targetHash].population -= 50;

        //check if the player died
        if (players[at.targetHash].population <= 0) {
            players[at.targetHash].dead = true;
        }
        delete attacks[data.hash];
    });

    // a structure was hit
    socket.on(Messages.C_Attack_Struct, function (data) {

        players[data.dest].structures[data.lane].health -= 50;
        if (players[data.dest].structures[data.lane].health <= 0) {
            players[data.dest].structures[data.lane].type = STRUCTURE_TYPES.PLACEHOLDER;
        }
        delete attacks[data.hash];
    });

    //get the hash of the winner
    socket.on(Messages.C_Winner, function (data) {
        winner = data;
    });
};

/* ------ socket setup Functions ------ */

var setupSocket = function setupSocket(sock) {

    onAds(socket);
    onLobby(socket);
    onRoomUpdate(socket);
    onGameUpdate(socket);
    onSkinUpdate(socket);
    socket.isHost = false; //initially not a host
};
