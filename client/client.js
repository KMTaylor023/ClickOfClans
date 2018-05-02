//This is the clients socket
var socket = {};

let players = {};     //the players in the lobby the client is in
let users = {}; //a barebones representation of the users
let attacks = {};   //any attacks being sent
let canvas;         //the canvas the game is on
let ctx;           //the canvas context
let myHash;
let myHost;
let mouseClicked = false;   //is the mouse currently clicked?
let animationFrame; // current animation frame
let buyButton;      //click to buy a skin
let equipButton;    //click to equip a skin
let skinButton;     //click to go to skin select
let lobbyButton;    //click to go to the lobby
let closeButton;    //close the error popup
let instructionButton;  //open instructions
let returnButton;       //return to lobby from instructions
let skins = [];
let gameState;      //current game state
let readyButton = {
    x: 280,
    y: 304,
    width: 144,
    height: 96,
    image: null,
};
let leaveButton = {
    x: 302,
    y: 327,
    width: 100,
    height: 50,
    image: null,
};

let selectedLotIndex = -1;
let playerImage;
let fieldBg;
let unbuiltStructureImage;
let shieldImage;
let farmImage;
let blacksmithImage;
let attackImage;
let emptyLotImage;
let pannelImage;
let pannelImage2;
let crownImage;
let skullImage;
let winnersBG;
let winner;     //player number of the player that won

//show the canvas
const client_showGame = () => {
  document.querySelector("#game").style.display = "block";
  document.querySelector("#lobby").style.display = "none";
    
  // Turn off the scrolling bg  
  var body =   document.getElementsByTagName("BODY")[0];
  body.classList.remove("movingBG");
  body.classList.add("staticBG");    
    
  animationFrame = requestAnimationFrame(update);
}

// Function Name: getMouse()
// returns mouse position in local coordinate system of element
// Author: Tony Jefferson
// Last update: 3/1/2014
const getMouse = (e) => {
    var mouse = {}
    mouse.x = e.pageX - e.target.offsetLeft;
    mouse.y = e.pageY - e.target.offsetTop;
    return mouse;
}

//determine struct type to build
const getStructTypeBySelection = (pos) => {
    if(pos < 64 / 3) {
      return STRUCTURE_TYPES.SHIELD;
    } else if(pos > 2 * (64 / 3)) {
      return STRUCTURE_TYPES.BSMITH;
    } else {
      return STRUCTURE_TYPES.FARM;
    }
}
        
//on click, check if a player was clicked
const doMouseDown = (e) => {
    //get location of mouse
    var mouse = getMouse(e);
    //make sure the player isnt clicking already
    if (!mouseClicked){
        //check game state
        if (gameState === GameStates.READY_UP){
            //check if the player clicked the ready button
            if (mouse.x >= readyButton.x && mouse.x <= readyButton.x + readyButton.width){
                if (mouse.y >= readyButton.y && mouse.y <= readyButton.y + readyButton.height){
                    //emit ready up event
                    socket.emit(Messages.C_Ready);
                    readyButton.image = document.getElementById("readyPress");
                }
            }
        }
        else if (gameState === GameStates.GAME_OVER){
            //check if the player clicked the leave button
            if (mouse.x >= leaveButton.x && mouse.x <= leaveButton.x + leaveButton.width){
                if (mouse.y >= leaveButton.y && mouse.y <= leaveButton.y + leaveButton.height){
                    //emit leave room event
                    socket.emit(Messages.S_Leave);
                    socket.isHost = false;  //reset host status
                    lobby_showLobby();
                }
            }
        }
        else{
            //get the keys
            const keys = Object.keys(players);

            var myX =  players[myHash].x + playerHalfWidth;
            var myY =  players[myHash].y + playerHalfHeight;
            
            var  validClick = false;

            //check if the click was on any of the players
            for (var i = 0; i < keys.length; i++){ 
                var player = players[keys[i]];

                var posX = player.x;
                var posY = player.y;

                //if the click was in the square, send it to the server for points;
                if (mouse.x >= posX && mouse.x <= posX + player.width){
                    if (mouse.y >= posY && mouse.y <= posY + player.height){
                        
                        validClick = true;
                        //check if player is you  
                        if (myHash === player.hash){ 
                            //send a currency click event 
                            socket.emit(Messages.C_Currency_Click);
                        }
                        else{
                            
                            //send an attack click event  
                            socket.emit(Messages.C_Attack_Click, 
                            {originHash: myHash, targetHash: player.hash, x: myX, 
                             y: myY, color: players[myHash].color});
                        }
                        selectedLotIndex = -1;
                    }
                }

              if(myHash === player.hash) {
                for(var j = 0; j < 3; j++){
                  const struct = player.structures[j];
                  if(mouse.x >= struct.x && mouse.x <= struct.x + struct.width){
                     if (mouse.y >= struct.y && mouse.y <= struct.y + struct.height){
                       const type = struct.type;
                       validClick = true; 
                         
                       if(struct.type === STRUCTURE_TYPES.PLACEHOLDER)
                       { 
                           // If you've clicked on another lot or you've just started clicking a lot, set the selectedLotIndex to that lot
                           if(selectedLotIndex < 0 || selectedLotIndex != j){ 
                               selectedLotIndex = j; 
                           } else if(selectedLotIndex === j) // If you've clicked on the same lot twice then you've purchased something
                           {   
                                var type = getStructTypeBySelection(mouse.x - struct.x);
                               
                                // check to see if you can purchase it
                                if(INFO[type].cost <= players[myHash].population)
                                {
                                   struct.onClick(mouse.x - struct.x, struct); 
                                   socket.emit(Messages.C_Purchase_Structure, {
                                        hash: myHash, 
                                        which: j,
                                        cost: INFO[type].cost,
                                        type: struct.type}); 
                                }
                                
                            }
                       }else if(struct.type === STRUCTURE_TYPES.SHIELD) {
                           socket.emit(Messages.C_Fortify, {hash: myHash, which: j});
                       }
                     }
                  }
                }
              } 
            }
            
            // Reset the selected lot index if we didn't click on ANYTHING
            if(!validClick){ 
                selectedLotIndex = -1;
            }
        }
    }
    
    //disable additional clicks
    mouseClicked = true;
};

//allow player to click again once they lift their mouse
const doMouseUp = () => {
    mouseClicked = false;
};

//send a message to the server to purchase the chosen skin
const purchaseSkin = () => {
    //get the skin radio buttons
    var skins = document.getElementsByName("skin");
    
    //determine which one is selected
    var selectedSkin;
    var selectedSkinNumber;
    for(var i = 0; i < skins.length; i++) {
       if(skins[i].checked){
           selectedSkin = skins[i].value;
           selectedSkinNumber = i;
       }
    }
    
    //send the selected skin to the server to purchase
    socket.emit(Messages.C_Buy_Skin, { skin: selectedSkin, number: selectedSkinNumber });
};

//send a message to the server to verify the selected skin is owned and then equip it
const equipSkin = () => {
    //get the skin radio buttons
    var skins = document.getElementsByName("skin");
    
    //determine which one is selected
    var selectedSkin;
    var selectedSkinNumber;
    for(var i = 0; i < skins.length; i++) {
       if(skins[i].checked){
           selectedSkin = skins[i].value;
           selectedSkinNumber = i;
       }
    }
    
    //send the selected skin to the server to purchase
    socket.emit(Messages.C_Equip_Skin, { skin: selectedSkin, number: selectedSkinNumber });
};

const init = () => {
  initializeLobby();//initialize lobby elements
  
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
  instructionButton = document.querySelector("#instructionsButton")
  returnButton = document.querySelector("#returnButton")
    
  //set event listeners
  lobbyButton.onclick = (e) => {
      document.querySelector("#roomSelection").style.display = "block";
      document.querySelector("#skins").style.display = "none";
  };
  skinButton.onclick = (e) => {
      document.querySelector("#roomSelection").style.display = "none";
      document.querySelector("#skins").style.display = "block";
  };
  returnButton.onclick = (e) => {
      document.querySelector("#roomSelection").style.display = "block";
      document.querySelector("#instructions").style.display = "none";
  };
  instructionButton.onclick = (e) => {
      document.querySelector("#roomSelection").style.display = "none";
      document.querySelector("#instructions").style.display = "block";
  };
  buyButton.onclick = purchaseSkin;
  equipButton.onclick = equipSkin;
  closeButton.onclick = (e) => {
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
  crownImage = document.getElementById("crown");
  skullImage = document.getElementById("skull");
  winnersBG = document.getElementById("winnersPannel");
    
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