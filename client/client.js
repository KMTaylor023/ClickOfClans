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
        }
        
    }
    
    //disable additional clicks
    mouseClicked = true;
};

//allow player to click again once they lift their mouse
const doMouseUp = () => {
    mouseClicked = false;
};

const init = () => {
  initializeLobby();//initialize lobby elements
  
  // set up canvas stuff
  canvas = document.querySelector('canvas');
  ctx = canvas.getContext("2d");
  canvas.onmousedown = doMouseDown;
  canvas.onmouseup = doMouseUp;
    
  //position ad2 at bottom of the screen
  var adPosition = window.innerHeight - 140;
  document.querySelector("#ad2").style.top = adPosition + "px";
    
  socket = io.connect();
  setupSocket(socket);
};

window.onload = init;