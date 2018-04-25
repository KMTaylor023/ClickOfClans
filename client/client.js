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
let animationFrame; // current animatino frame
let buyButton;      //click to buy a skin
let equipButton;    //click to equip a skin
let skinButton;     //click to go to skin select
let lobbyButton;    //click to go to the lobby
let closeButton;    //close the error popup


const client_showGame = () => {
  document.querySelector("#game").style.display = "block";
  document.querySelector("#lobby").style.display = "none";
    
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
        
//on click, check if a player was clicked
const doMouseDown = (e) => {
    //get location of mouse
    var mouse = getMouse(e);
    
    //make sure the player isnt clicking already
    if (!mouseClicked){
        //get the keys
        const keys = Object.keys(players);
        
        var myX =  players[myHash].x + playerHalfWidth;
        var myY =  players[myHash].y + playerHalfHeight;

        //check if the click was on any of the players
        for (var i = 0; i < keys.length; i++){
            var player = players[keys[i]];
            
            var posX = player.x;
            var posY = player.y;
            
            //if the click was in the square, send it to the server for points;
            if (mouse.x >= posX && mouse.x <= posX + player.width){
                if (mouse.y >= posY && mouse.y <= posY + player.height){
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
                }
            }
          
          if(myHash === player.hash) {
            for(var j = 0; j < 3; j++){
              const struct = player.structures[j];
              if(mouse.x >= struct.x && mouse.x <= struct.x + struct.width){
                 if (mouse.y >= struct.y && mouse.y <= struct.y + struct.height){
                   const type = struct.type;
                   
                   struct.onClick(mouse.x - struct.x, struct);
                   
                   if(struct.type !== type){
                     socket.emit(Messages.C_Purchase_Structure, {which: j, type: struct.type});
                   }
                 }
              }
            }
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
    
  //set event listeners
  lobbyButton.onclick = (e) => {
      document.querySelector("#roomSelection").style.display = "block";
      document.querySelector("#skins").style.display = "none";
  };
  skinButton.onclick = (e) => {
      document.querySelector("#roomSelection").style.display = "none";
      document.querySelector("#skins").style.display = "block";
  };
  buyButton.onclick = purchaseSkin;
  equipButton.onclick = equipSkin;
  closeButton.onclick = (e) => {
      document.querySelector("#unsuccessfulEquip").style.display = "none";
  };
    
  //position ad2 at bottom of the screen
  var adPosition = window.innerHeight - 140;
  document.querySelector("#ad2").style.top = adPosition + "px";
    
  socket = io.connect();
  setupSocket(socket);
};

window.onload = init;